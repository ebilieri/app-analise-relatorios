import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch globally before importing the module
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("quote-scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when all three fields are found via primary selectors", async () => {
    const html = `
      <html><body>
        <div class="info">VALOR ATUAL<strong class="value">38,50</strong></div>
        <div class="info">MIN. 52 SEMANAS<strong class="value">36,80</strong></div>
        <div class="info">MÁX. 52 SEMANAS<strong class="value">76,39</strong></div>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.valorAtual).toBeTruthy();
      expect(result.min52Semanas).toBeTruthy();
      expect(result.max52Semanas).toBeTruthy();
    }
  });

  it("returns success using fallback selector when primary returns empty", async () => {
    // Uses text-based :contains() selector as fallback for min/max
    const html = `
      <html><body>
        <div class="info">VALOR ATUAL<strong class="value">38,50</strong></div>
        <div class="info">MIN. 52<strong class="value">36,80</strong></div>
        <div class="info">MÁX. 52<strong class="value">76,39</strong></div>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(true);
  });

  it("returns failure with reason 'timeout' when fetch is aborted", async () => {
    mockFetch.mockImplementationOnce(() => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      return Promise.reject(error);
    });

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.failureReason).toBe("timeout");
    }
  });

  it("returns failure with reason 'erro_http' when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.failureReason).toMatch(/erro_http/);
    }
  });

  it("returns failure when no selectors find values", async () => {
    const html = `<html><body><p>Pagina sem estrutura esperada</p></body></html>`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.failureReason).toBe("seletor_nao_encontrado");
    }
  });

  it("normalizes extracted text by trimming whitespace", async () => {
    const html = `
      <html><body>
        <div class="info">VALOR ATUAL<strong class="value">  38,50  </strong></div>
        <div class="info">MIN. 52 SEMANAS<strong class="value"> 36,80 </strong></div>
        <div class="info">MÁX. 52 SEMANAS<strong class="value">  76,39  </strong></div>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.valorAtual).toBe("38,50");
      expect(result.min52Semanas).toBe("36,80");
      expect(result.max52Semanas).toBe("76,39");
    }
  });
});
