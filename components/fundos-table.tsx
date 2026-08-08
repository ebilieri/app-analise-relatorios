import React from "react";
import type { FundRecord } from "@/lib/funds-schema";

type FundosTableProps = {
  rows: FundRecord[];
};

function renderQuoteCell(value: string | null, status: FundRecord["quoteStatus"]) {
  if (status === "updated" && value) {
    return <span>{value}</span>;
  }
  return <span className="muted">-</span>;
}

export function FundosTable({ rows }: Readonly<FundosTableProps>) {
  return (
    <div className="table-wrap">
      <table className="funds-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Papel</th>
            <th>Link</th>
            <th>Valor Atual</th>
            <th>Min. 52 Semanas</th>
            <th>Max. 52 Semanas</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.tipo}</td>
              <td className="truncate-cell" title={row.papel}>{row.papel}</td>
              <td className="truncate-cell" title={row.linkRaw ?? "Link indisponivel"}>
                {row.linkStatus === "valid" && row.linkUrl ? (
                  <a href={row.linkUrl} target="_blank" rel="noreferrer">
                    {row.linkUrl}
                  </a>
                ) : (
                  <span className="muted">Link indisponivel</span>
                )}
              </td>
              <td>{renderQuoteCell(row.quoteValorAtual, row.quoteStatus)}</td>
              <td>{renderQuoteCell(row.quoteMin52Semanas, row.quoteStatus)}</td>
              <td>{renderQuoteCell(row.quoteMax52Semanas, row.quoteStatus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
