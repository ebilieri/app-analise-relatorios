import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("quote-scraper failure cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("timeout: returns failureReason 'timeout' and all fields null", async () => {
    mockFetch.mockImplementationOnce(() => {
      const err = new Error("Aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("timeout");
    expect(result.valorAtual).toBeNull();
    expect(result.min52Semanas).toBeNull();
    expect(result.max52Semanas).toBeNull();
  });

  it("selector not found: returns failureReason 'seletor_nao_encontrado' and all fields null", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "<html><body><p>Nothing here</p></body></html>",
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("seletor_nao_encontrado");
    expect(result.valorAtual).toBeNull();
    expect(result.min52Semanas).toBeNull();
    expect(result.max52Semanas).toBeNull();
  });

  it("HTTP error: returns failureReason matching 'erro_http' and all fields null", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const { scrapeQuote } = await import("@/lib/quote-scraper");
    const result = await scrapeQuote("https://statusinvest.com.br/etfs/coin11");

    expect(result.success).toBe(false);
    expect(result.failureReason).toMatch(/erro_http/);
    expect(result.valorAtual).toBeNull();
    expect(result.min52Semanas).toBeNull();
    expect(result.max52Semanas).toBeNull();
  });

  it("previous quoteUpdatedAt is preserved when record fails in updateQuotes", async () => {
    const { setWriteInProgress } = await import("@/lib/write-lock");
    setWriteInProgress(false);

    const previousUpdatedAt = "2026-08-01T10:00:00.000Z";
    const recordWithPreviousSuccess = {
      id: "1-etf-coin11",
      tipo: "ETF",
      papel: "COIN11",
      linkRaw: "https://statusinvest.com.br/etfs/coin11",
      linkUrl: "https://statusinvest.com.br/etfs/coin11",
      linkDisplay: "https://statusinvest.com.br/etfs/coin11",
      linkStatus: "valid" as const,
      quoteValorAtual: "38,50",
      quoteMin52Semanas: "36,80",
      quoteMax52Semanas: "76,39",
      quoteStatus: "updated" as const,
      quoteUpdatedAt: previousUpdatedAt,
      quoteFailureReason: null,
    };

    const db = {
      version: 1,
      generatedAt: "2026-08-07T00:00:00.000Z",
      sourceFile: "fundos-para-analise.xlsx",
      rowCount: 1,
      discardedCount: 0,
      records: [recordWithPreviousSuccess],
    };

    const readDbMock = vi.fn().mockResolvedValue(db);
    const writeDbAtomicMock = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/json-store", async () => {
      const original = await vi.importActual<typeof import("@/lib/json-store")>("@/lib/json-store");
      return { ...original, readDb: readDbMock, writeDbAtomic: writeDbAtomicMock };
    });

    vi.doMock("@/lib/quote-scraper", () => ({
      scrapeQuote: vi.fn().mockResolvedValue({
        success: false,
        valorAtual: null,
        min52Semanas: null,
        max52Semanas: null,
        failureReason: "timeout",
      }),
    }));

    const { updateQuotes } = await import("@/lib/quote-service");
    const result = await updateQuotes();

    expect(result.status).toBe("failed");
    expect(result.failedCount).toBe(1);

    const savedDb = writeDbAtomicMock.mock.calls[0]?.[0] as typeof db;
    const savedRecord = savedDb?.records[0];
    expect(savedRecord?.quoteUpdatedAt).toBe(previousUpdatedAt);
    expect(savedRecord?.quoteValorAtual).toBeNull();
    expect(savedRecord?.quoteMin52Semanas).toBeNull();
    expect(savedRecord?.quoteMax52Semanas).toBeNull();
    expect(savedRecord?.quoteStatus).toBe("failed");
    expect(savedRecord?.quoteFailureReason).toBe("timeout");

    vi.doUnmock("@/lib/json-store");
    vi.doUnmock("@/lib/quote-scraper");
  });
});
