import { load } from "cheerio";
import { QUOTE_SELECTORS, type SelectorList } from "./quote-selectors";

const TIMEOUT_MS = 10_000;

export type CotacaoAtualizada = {
  success: boolean;
  valorAtual: string | null;
  min52Semanas: string | null;
  max52Semanas: string | null;
  failureReason: string | null;
};

/**
 * Try each CSS selector in the list in order.
 * Returns the first non-empty text value found, or null.
 */
function extractField($: ReturnType<typeof load>, selectors: SelectorList): string | null {
  for (const selector of selectors) {
    try {
      const el = $(selector).first();
      if (el.length > 0) {
        const raw = el.text().trim();
        // Remove "R$" prefix and normalize whitespace
        const cleaned = raw.replace(/R\$\s*/g, "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    } catch {
      // Skip selectors that are syntactically invalid in this context
    }
  }
  return null;
}

export async function scrapeQuote(url: string): Promise<CotacaoAtualizada> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { controller.abort(); }, TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; investment-analyzer/1.0; +https://github.com/ebilieri/app-analise-relatorios)"
      }
    });

    if (!response.ok) {
      return { success: false, valorAtual: null, min52Semanas: null, max52Semanas: null, failureReason: `erro_http_${response.status}` };
    }

    const html = await response.text();
    const $ = load(html);

    const valorAtual = extractField($, QUOTE_SELECTORS.valorAtual);
    const min52Semanas = extractField($, QUOTE_SELECTORS.min52Semanas);
    const max52Semanas = extractField($, QUOTE_SELECTORS.max52Semanas);

    if (!valorAtual || !min52Semanas || !max52Semanas) {
      return { success: false, valorAtual: null, min52Semanas: null, max52Semanas: null, failureReason: "seletor_nao_encontrado" };
    }

    return { success: true, valorAtual, min52Semanas, max52Semanas, failureReason: null };

  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, valorAtual: null, min52Semanas: null, max52Semanas: null, failureReason: "timeout" };
    }
    const reason = error instanceof Error ? error.message.slice(0, 100) : "erro_inesperado";
    return { success: false, valorAtual: null, min52Semanas: null, max52Semanas: null, failureReason: reason };
  } finally {
    clearTimeout(timeoutId);
  }
}
