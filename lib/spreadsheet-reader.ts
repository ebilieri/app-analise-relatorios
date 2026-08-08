import { promises as fs } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type { RowInput } from "./funds-schema";

export type SpreadsheetReadResult = {
  rows: RowInput[];
  missingColumns: string[];
};

const REQUIRED_COLUMNS = ["Tipo", "Papel", "Link"];

export async function readSpreadsheetRows(fileName = "fundos-para-analise.xlsx"): Promise<SpreadsheetReadResult> {
  const workbookPath = path.join(process.cwd(), fileName);
  const fileBuffer = await fs.readFile(workbookPath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { rows: [], missingColumns: REQUIRED_COLUMNS };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RowInput>(worksheet, { defval: "" });

  const headers = Object.keys(rows[0] ?? {});
  const missingColumns = REQUIRED_COLUMNS.filter((name) => !headers.includes(name));

  return { rows, missingColumns };
}
