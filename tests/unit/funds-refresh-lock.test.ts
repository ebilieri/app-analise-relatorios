import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/spreadsheet-reader", () => ({
  readSpreadsheetRows: () => ({
    rows: [{ Tipo: "FII", Papel: "HGLG11", Link: "https://example.com" }],
    missingColumns: []
  })
}));

vi.mock("@/lib/json-store", async () => {
  const original = await vi.importActual<typeof import("@/lib/json-store")>("@/lib/json-store");
  return {
    ...original,
    writeDbAtomic: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    })
  };
});

describe("refresh lock", () => {
  it("blocks concurrent refresh requests", async () => {
    const service = await import("@/lib/funds-service");
    const first = service.refreshFunds();
    const second = service.refreshFunds();
    const [a, b] = await Promise.all([first, second]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual(["blocked", "success"]);
  });
});
