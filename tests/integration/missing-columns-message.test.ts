import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/funds-service", () => ({
  listFunds: async () => {
    throw new Error("Colunas obrigatorias ausentes: Tipo, Link");
  }
}));

describe("missing columns message", () => {
  it("returns clear message when required columns are missing", async () => {
    const { GET } = await import("@/app/api/fundos/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toContain("Colunas obrigatorias ausentes");
  });
});
