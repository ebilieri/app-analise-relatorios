import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FundosTable } from "@/components/fundos-table";
import type { FundRecord } from "@/lib/funds-schema";

function makeRecord(overrides: Partial<FundRecord> = {}): FundRecord {
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

describe("FundosTable quote columns", () => {
  it("renders the three quote column headers", () => {
    render(<FundosTable rows={[makeRecord()]} />);

    expect(screen.getByRole("columnheader", { name: "Valor Atual" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Min. 52 Semanas" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Max. 52 Semanas" })).toBeInTheDocument();
  });

  it("renders quote values when quoteStatus is 'updated'", () => {
    render(
      <FundosTable
        rows={[
          makeRecord({
            id: "u1",
            quoteValorAtual: "38,50",
            quoteMin52Semanas: "36,80",
            quoteMax52Semanas: "76,39",
            quoteStatus: "updated",
            quoteUpdatedAt: "2026-08-07T12:00:00.000Z",
          }),
        ]}
      />
    );

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getByText("38,50")).toBeInTheDocument();
    expect(within(row).getByText("36,80")).toBeInTheDocument();
    expect(within(row).getByText("76,39")).toBeInTheDocument();
  });

  it("renders unavailability indicator when quoteStatus is 'not_collected'", () => {
    render(<FundosTable rows={[makeRecord({ id: "nc1", quoteStatus: "not_collected" })]} />);

    const row = screen.getAllByRole("row")[1];
    const cells = within(row).getAllByRole("cell");
    // Last three cells are quote columns; each should not show a numeric value
    const quoteCells = cells.slice(-3);
    quoteCells.forEach((cell) => {
      expect(cell.textContent?.trim()).not.toMatch(/\d/);
    });
  });

  it("renders unavailability indicator when quoteStatus is 'failed'", () => {
    render(
      <FundosTable
        rows={[
          makeRecord({
            id: "f1",
            quoteStatus: "failed",
            quoteFailureReason: "timeout",
            quoteValorAtual: null,
            quoteMin52Semanas: null,
            quoteMax52Semanas: null,
          }),
        ]}
      />
    );

    const row = screen.getAllByRole("row")[1];
    const cells = within(row).getAllByRole("cell");
    const quoteCells = cells.slice(-3);
    quoteCells.forEach((cell) => {
      expect(cell.textContent?.trim()).not.toMatch(/^\d/);
    });
  });
});
