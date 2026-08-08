import { readDb, writeDbAtomic } from "./json-store";
import { scrapeQuote } from "./quote-scraper";
import { isWriteInProgress, setWriteInProgress } from "./write-lock";

export type QuoteFailure = {
  id: string;
  tipo: string;
  papel: string;
  reason: string;
};

export type ResultadoAtualizacaoCotacao = {
  status: "success" | "partial" | "failed" | "blocked";
  message: string;
  updatedCount: number;
  failedCount: number;
  skippedCount: number;
  failures: QuoteFailure[];
  startedAt: string;
  finishedAt: string;
};

const STATUS_MESSAGES: Record<"success" | "partial" | "failed", string> = {
  success: "Cotacoes atualizadas com sucesso",
  partial: "Cotacoes atualizadas com falhas parciais",
  failed: "Nenhuma cotacao pode ser atualizada",
};

export async function updateQuotes(): Promise<ResultadoAtualizacaoCotacao> {
  const startedAt = new Date().toISOString();

  if (isWriteInProgress()) {
    return {
      status: "blocked",
      message: "Atualizacao ja em andamento",
      updatedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      failures: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }

  setWriteInProgress(true);

  try {
    const db = await readDb();
    const records = db.records.map((r) => ({ ...r }));

    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const failures: QuoteFailure[] = [];

    for (const record of records) {
      // FR-013: silently skip rows without valid link
      if (record.linkStatus !== "valid" || !record.linkUrl) {
        skippedCount++;
        continue;
      }

      const result = await scrapeQuote(record.linkUrl);

      if (result.success) {
        // FR-004: store the three quote fields
        record.quoteValorAtual = result.valorAtual;
        record.quoteMin52Semanas = result.min52Semanas;
        record.quoteMax52Semanas = result.max52Semanas;
        record.quoteStatus = "updated";
        record.quoteUpdatedAt = new Date().toISOString();
        record.quoteFailureReason = null;
        updatedCount++;
      } else {
        // FR-006: zero value fields, preserve quoteUpdatedAt from last success
        record.quoteValorAtual = null;
        record.quoteMin52Semanas = null;
        record.quoteMax52Semanas = null;
        record.quoteStatus = "failed";
        record.quoteFailureReason = result.failureReason ?? "desconhecido";
        // quoteUpdatedAt intentionally NOT modified — preserves previous success timestamp
        failedCount++;
        failures.push({
          id: record.id,
          tipo: record.tipo,
          papel: record.papel,
          reason: result.failureReason ?? "desconhecido",
        });
      }
    }

    await writeDbAtomic({ ...db, records });

    const finishedAt = new Date().toISOString();

    let status: "success" | "partial" | "failed";
    if (failedCount === 0) {
      status = "success";
    } else if (updatedCount > 0) {
      status = "partial";
    } else {
      status = "failed";
    }

    const message = failedCount > 0 && status === "partial"
      ? `Cotacoes atualizadas com ${failedCount} falha(s)`
      : STATUS_MESSAGES[status];

    return { status, message, updatedCount, failedCount, skippedCount, failures, startedAt, finishedAt };

  } catch (error) {
    return {
      status: "failed",
      message: error instanceof Error ? error.message : "Falha ao executar atualizacao de cotacao",
      updatedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      failures: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } finally {
    setWriteInProgress(false);
  }
}
