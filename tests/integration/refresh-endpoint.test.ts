import { describe, expect, it, vi } from "vitest";

const refreshFunds = vi.fn();

vi.mock("@/lib/funds-service", () => ({
  refreshFunds
}));

describe("POST /api/refresh", () => {
  it("returns blocked response", async () => {
    refreshFunds.mockResolvedValueOnce({ status: "blocked", message: "Atualizacao ja em andamento" });
    const { POST } = await import("@/app/api/refresh/route");
    const response = await POST();
    expect(response.status).toBe(409);
  });

  it("returns success response", async () => {
    refreshFunds.mockResolvedValueOnce({ status: "success", message: "JSON atualizado com sucesso", rowCount: 3, generatedAt: new Date().toISOString() });
    const { POST } = await import("@/app/api/refresh/route");
    const response = await POST();
    expect(response.status).toBe(200);
  });
});
