import { describe, expect, it } from "vitest";
import { buildFundRecord } from "@/lib/funds-schema";

describe("funds-schema", () => {
  it("creates a valid record when url is valid", () => {
    const record = buildFundRecord({ Tipo: "FII", Papel: "HGLG11", Link: "https://example.com" }, 0);
    expect(record).not.toBeNull();
    expect(record?.linkStatus).toBe("valid");
    expect(record?.linkUrl).toBe("https://example.com");
  });

  it("returns null when tipo or papel becomes empty", () => {
    const record = buildFundRecord({ Tipo: "  ", Papel: "XPML11", Link: "" }, 0);
    expect(record).toBeNull();
  });
});
