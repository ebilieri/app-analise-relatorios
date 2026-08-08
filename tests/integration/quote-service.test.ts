import { beforeEach, describe, expect, it, vi } from "vitest";

// ── shared mocks — must be at module level so vitest hoisting works ───────────
const scrapeQuoteMock = vi.fn();
vi.mock("@/lib/quote-scraper", () => ({ scrapeQuote: scrapeQuoteMock }));

const readDbMock = vi.fn();
const writeDbAtomicMock = vi.fn();
vi.mock("@/lib/json-store", async () => {
  const original = await vi.importActual<typeof import("@/lib/json-store")>("@/lib/json-store");
  return { ...original, readDb: readDbMock, writeDbAtomic: writeDbAtomicMock };
});

// Helper: build a minimal FundRecord with valid link
function makeRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "1-etf-coin11",
    tipo: "ETF",
    papel: "COIN11",
    linkRaw: "https://statusinvest.com.br/etfs/coin11",
    linkUrl: "https://statusinvest.com.br/etfs/coin11",
    linkDisplay: "https://statusinvest.com.br/etfs/coin11",
    linkStatus: "valid",
    quoteValorAtual: null,
    quoteMin52Semanas: null,
    quoteMax52Semanas: null,
    quoteStatus: "not_collected",
    quoteUpdatedAt: null,
    quoteFailureReason: null,
    ...overrides,
  };
}

function makeDb(records: ReturnType<typeof makeRecord>[]) {
  return {
    version: 1,
    generatedAt: "2026-08-07T00:00:00.000Z",
    sourceFile: "fundos-para-analise.xlsx",
    rowCount: records.length,
    discardedCount: 0,
    records,
  };
}

describe("quote-service", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    writeDbAtomicMock.mockResolvedValue(undefined);
    // Reset shared write lock between tests
    const { setWriteInProgress } = await import("@/lib/write-lock");
    setWriteInProgress(false);
  });

  it("returns status 'success' when all valid links are scraped successfully", async () => {
    readDbMock.mockResolvedValue(makeDb([makeRecord()]));
    scrapeQuoteMock.mockResolvedValue({
      success: true,
      valorAtual: "38,50",
      min52Semanas: "36,80",
      max52Semanas: "76,39",
      failureReason: null,
    });

    const { updateQuotes } = await import("@/lib/quote-service");
    const result = await updateQuotes();

    expect(result.status).toBe("success");
    expect(result.updatedCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(writeDbAtomicMock).toHaveBeenCalledOnce();
  });

  it("returns status 'blocked' when write lock is active", async () => {
    const { setWriteInProgress } = await import("@/lib/write-lock");
    setWriteInProgress(true);

    const { updateQuotes } = await import("@/lib/quote-service");
    const result = await updateQuotes();

    expect(result.status).toBe("blocked");
    expect(scrapeQuoteMock).not.toHaveBeenCalled();
    expect(readDbMock).not.toHaveBeenCalled();
  });

  it("returns status 'partial' when some links fail and some succeed", async () => {
    const records = [
      makeRecord({ id: "1-etf-a", papel: "COIN11" }),
      makeRecord({ id: "2-etf-b", papel: "BOVA11", linkUrl: "https://statusinvest.com.br/etfs/bova11" }),
    ];
    readDbMock.mockResolvedValue(makeDb(records));
    scrapeQuoteMock
      .mockResolvedValueOnce({ success: true, valorAtual: "38,50", min52Semanas: "36,80", max52Semanas: "76,39", failureReason: null })
      .mockResolvedValueOnce({ success: false, valorAtual: null, min52Semanas: null, max52Semanas: null, failureReason: "timeout" });

    const { updateQuotes } = await import("@/lib/quote-service");
    const result = await updateQuotes();

    expect(result.status).toBe("partial");
    expect(result.updatedCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].reason).toBe("timeout");
  });

  it("counts skipped records (no valid link) in skippedCount without adding to failures", async () => {
    const invalidRecord = makeRecord({ id: "3-etf-novalid", linkStatus: "invalid", linkUrl: null });
    readDbMock.mockResolvedValue(makeDb([invalidRecord]));

    const { updateQuotes } = await import("@/lib/quote-service");
    const result = await updateQuotes();

    expect(result.skippedCount).toBe(1);
    expect(result.failures).toHaveLength(0);
    expect(scrapeQuoteMock).not.toHaveBeenCalled();
  });
});
