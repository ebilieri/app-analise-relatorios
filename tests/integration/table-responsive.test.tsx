import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FundosTable } from "@/components/fundos-table";

describe("table responsive basics", () => {
  it("renders fixed columns and rows", () => {
    render(
      <FundosTable
        rows={[
          {
            id: "1",
            tipo: "FII",
            papel: "HGLG11",
            linkRaw: "https://example.com",
            linkUrl: "https://example.com",
            linkDisplay: "Link",
            linkStatus: "valid",
            quoteValorAtual: null,
            quoteMin52Semanas: null,
            quoteMax52Semanas: null,
            quoteStatus: "not_collected",
            quoteUpdatedAt: null,
            quoteFailureReason: null
          }
        ]}
      />
    );

    expect(screen.getByRole("columnheader", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Papel" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Link" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://example.com" })).toBeInTheDocument();
  });

  it("renders fallback text without hyperlink for invalid links", () => {
    render(
      <FundosTable
        rows={[
          {
            id: "2",
            tipo: "FII",
            papel: "XPML11",
            linkRaw: "abc",
            linkUrl: null,
            linkDisplay: "Link indisponivel",
            linkStatus: "invalid",
            quoteValorAtual: null,
            quoteMin52Semanas: null,
            quoteMax52Semanas: null,
            quoteStatus: "not_collected",
            quoteUpdatedAt: null,
            quoteFailureReason: null
          }
        ]}
      />
    );

    expect(screen.getByText("Link indisponivel")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Link indisponivel" })).not.toBeInTheDocument();
  });

  it("keeps long urls visible in the link cell", () => {
    const longUrl = "https://example.com/fundos/imobiliarios/com-uma-url-bastante-longa/segmento/logistica/hglg11";

    render(
      <FundosTable
        rows={[
          {
            id: "3",
            tipo: "FII",
            papel: "HGLG11",
            linkRaw: longUrl,
            linkUrl: longUrl,
            linkDisplay: longUrl,
            linkStatus: "valid",
            quoteValorAtual: null,
            quoteMin52Semanas: null,
            quoteMax52Semanas: null,
            quoteStatus: "not_collected",
            quoteUpdatedAt: null,
            quoteFailureReason: null
          }
        ]}
      />
    );

    const link = screen.getByRole("link", { name: longUrl });
    expect(link).toBeInTheDocument();
    expect(link.closest("td")).toHaveClass("truncate-cell");
  });
});
