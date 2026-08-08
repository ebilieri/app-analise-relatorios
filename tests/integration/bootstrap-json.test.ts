import { beforeEach, describe, expect, it, vi } from "vitest";

const writeDbAtomic = vi.fn(async () => undefined);
const readDb = vi.fn();
const dbFileExists = vi.fn();

vi.mock("@/lib/json-store", () => ({
  writeDbAtomic,
  readDb,
  dbFileExists
}));

vi.mock("@/lib/spreadsheet-reader", () => ({
  readSpreadsheetRows: () => ({
    rows: [{ Tipo: "FII", Papel: "HGLG11", Link: "https://example.com" }],
    missingColumns: []
  })
}));

describe("bootstrap json", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads existing json when file exists", async () => {
    dbFileExists.mockResolvedValue(true);
    readDb.mockResolvedValue({ generatedAt: "x", rowCount: 1, records: [], version: 1, sourceFile: "f", discardedCount: 0 });

    const { ensureJsonReady } = await import("@/lib/funds-service");
    const result = await ensureJsonReady();

    expect(result.rowCount).toBe(1);
    expect(writeDbAtomic).not.toHaveBeenCalled();
  });

  it("generates json when file does not exist", async () => {
    dbFileExists.mockResolvedValue(false);

    const { ensureJsonReady } = await import("@/lib/funds-service");
    const result = await ensureJsonReady();

    expect(result.rowCount).toBe(1);
    expect(writeDbAtomic).toHaveBeenCalled();
  });
});
