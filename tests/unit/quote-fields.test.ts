import { describe, expect, it } from "vitest";
import { dbSchema, fundRecordSchema } from "@/lib/funds-schema";

const baseRecord = {
  id: "1-etf-coin11",
  tipo: "ETF",
  papel: "COIN11",
  linkRaw: "https://statusinvest.com.br/etfs/coin11",
  linkUrl: "https://statusinvest.com.br/etfs/coin11",
  linkDisplay: "https://statusinvest.com.br/etfs/coin11",
  linkStatus: "valid" as const,
};

describe("fundRecordSchema quote fields", () => {
  it("preserves all six quote fields through parse (no strip)", () => {
    const parsed = fundRecordSchema.parse({
      ...baseRecord,
      quoteValorAtual: "38,50",
      quoteMin52Semanas: "36,80",
      quoteMax52Semanas: "76,39",
      quoteStatus: "updated",
      quoteUpdatedAt: "2026-08-07T12:00:00.000Z",
      quoteFailureReason: null,
    });

    expect(parsed.quoteValorAtual).toBe("38,50");
    expect(parsed.quoteMin52Semanas).toBe("36,80");
    expect(parsed.quoteMax52Semanas).toBe("76,39");
    expect(parsed.quoteStatus).toBe("updated");
    expect(parsed.quoteUpdatedAt).toBe("2026-08-07T12:00:00.000Z");
    expect(parsed.quoteFailureReason).toBeNull();
  });

  it("accepts a record with all quote fields null and applies defaults", () => {
    const parsed = fundRecordSchema.parse(baseRecord);

    expect(parsed.quoteValorAtual).toBeNull();
    expect(parsed.quoteMin52Semanas).toBeNull();
    expect(parsed.quoteMax52Semanas).toBeNull();
    expect(parsed.quoteStatus).toBe("not_collected");
    expect(parsed.quoteUpdatedAt).toBeNull();
    expect(parsed.quoteFailureReason).toBeNull();
  });

  it("rejects invalid quoteStatus enum values", () => {
    expect(() =>
      fundRecordSchema.parse({
        ...baseRecord,
        quoteStatus: "unknown",
      })
    ).toThrow();
  });

  it("accepts each of the three valid quoteStatus enum values", () => {
    for (const status of ["not_collected", "updated", "failed"] as const) {
      const parsed = fundRecordSchema.parse({ ...baseRecord, quoteStatus: status });
      expect(parsed.quoteStatus).toBe(status);
    }
  });

  it("preserves quote fields when parsing full dbSchema payload", () => {
    const payload = {
      version: 1,
      generatedAt: "2026-08-07T00:00:00.000Z",
      sourceFile: "fundos-para-analise.xlsx",
      rowCount: 1,
      discardedCount: 0,
      records: [
        {
          ...baseRecord,
          quoteValorAtual: "10,00",
          quoteMin52Semanas: "9,00",
          quoteMax52Semanas: "11,00",
          quoteStatus: "updated" as const,
          quoteUpdatedAt: "2026-08-07T12:00:00.000Z",
          quoteFailureReason: null,
        },
      ],
    };

    const parsed = dbSchema.parse(payload);
    expect(parsed.records[0].quoteValorAtual).toBe("10,00");
    expect(parsed.records[0].quoteMin52Semanas).toBe("9,00");
    expect(parsed.records[0].quoteMax52Semanas).toBe("11,00");
  });
});
