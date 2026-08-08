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
            linkStatus: "valid"
          }
        ]}
      />
    );

    expect(screen.getByRole("columnheader", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Papel" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Link" })).toBeInTheDocument();
  });
});
