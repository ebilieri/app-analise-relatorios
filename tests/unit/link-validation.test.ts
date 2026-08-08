import { describe, expect, it } from "vitest";
import { buildFundRecord, isValidHttpUrl } from "@/lib/funds-schema";

describe("link validation", () => {
  it("accepts only http and https links", () => {
    expect(isValidHttpUrl("https://site.com")).toBe(true);
    expect(isValidHttpUrl("http://site.com")).toBe(true);
    expect(isValidHttpUrl("ftp://site.com")).toBe(false);
  });

  it("maps empty and invalid links to fallback status", () => {
    const empty = buildFundRecord({ Tipo: "FII", Papel: "ABCD11", Link: "" }, 0);
    const invalid = buildFundRecord({ Tipo: "FII", Papel: "ABCD11", Link: "abc" }, 1);
    expect(empty?.linkStatus).toBe("empty");
    expect(invalid?.linkStatus).toBe("invalid");
    expect(invalid?.linkDisplay).toBe("Link indisponivel");
  });

  it("uses the normalized url as visible text when link is valid", () => {
    const valid = buildFundRecord({ Tipo: "FII", Papel: "ABCD11", Link: "  https://site.com/fundo  " }, 2);
    expect(valid?.linkStatus).toBe("valid");
    expect(valid?.linkUrl).toBe("https://site.com/fundo");
    expect(valid?.linkDisplay).toBe("https://site.com/fundo");
  });
});
