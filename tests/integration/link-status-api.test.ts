import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/funds-service", () => ({
  listFunds: async () => ({
    generatedAt: new Date().toISOString(),
    rowCount: 2,
    discardedCount: 0,
    records: [
      {
        id: "1",
        tipo: "FII",
        papel: "HGLG11",
        linkRaw: "https://example.com",
        linkUrl: "https://example.com",
        linkDisplay: "Link",
        linkStatus: "valid"
      },
      {
        id: "2",
        tipo: "FII",
        papel: "XPML11",
        linkRaw: "abc",
        linkUrl: null,
        linkDisplay: "Link indisponivel",
        linkStatus: "invalid"
      }
    ]
  })
}));

describe("GET /api/fundos", () => {
  it("returns link fields with valid and fallback states", async () => {
    const { GET } = await import("@/app/api/fundos/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.records[0].linkStatus).toBe("valid");
    expect(body.records[1].linkDisplay).toBe("Link indisponivel");
  });
});
