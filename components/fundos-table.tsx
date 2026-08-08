import React from "react";
import type { FundRecord } from "@/lib/funds-schema";

type FundosTableProps = {
  rows: FundRecord[];
};

export function FundosTable({ rows }: Readonly<FundosTableProps>) {
  return (
    <div className="table-wrap">
      <table className="funds-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Papel</th>
            <th>Link</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
