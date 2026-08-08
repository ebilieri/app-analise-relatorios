import { buildFundRecord, dbSchema, type FundsDb, type FundRecord } from "./funds-schema";
import { dbFileExists, readDb, writeDbAtomic } from "./json-store";
import { readSpreadsheetRows } from "./spreadsheet-reader";

let refreshInProgress = false;

export type RefreshResult = {
  status: "success" | "failed" | "blocked";
  message: string;
  rowCount?: number;
  generatedAt?: string;
};

function buildMissingColumnsMessage(missingColumns: string[]): string {
  return `Colunas obrigatorias ausentes: ${missingColumns.join(", ")}`;
}

function buildDbFromRows(rows: Array<Record<string, unknown>>): {
  records: FundRecord[];
  discardedCount: number;
} {
  const records: FundRecord[] = [];
  let discardedCount = 0;

  rows.forEach((row, index) => {
    const record = buildFundRecord(row, index);
    if (!record) {
      discardedCount += 1;
      return;
    }
    records.push(record);
  });

  return { records, discardedCount };
}

export async function generateDbFromSpreadsheet(): Promise<FundsDb> {
  const { rows, missingColumns } = await readSpreadsheetRows();
  if (missingColumns.length > 0) {
    throw new Error(buildMissingColumnsMessage(missingColumns));
  }

  const { records, discardedCount } = buildDbFromRows(rows as Array<Record<string, unknown>>);

  const payload = dbSchema.parse({
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceFile: "fundos-para-analise.xlsx",
    rowCount: records.length,
    discardedCount,
    records
  });

  await writeDbAtomic(payload);
  return payload;
}

export async function ensureJsonReady(): Promise<FundsDb> {
  const exists = await dbFileExists();
  if (exists) {
    try {
      return await readDb();
    } catch {
      return generateDbFromSpreadsheet();
    }
  }

  return generateDbFromSpreadsheet();
}

export async function listFunds(): Promise<FundsDb> {
  return ensureJsonReady();
}

export async function refreshFunds(): Promise<RefreshResult> {
  if (refreshInProgress) {
    return { status: "blocked", message: "Atualizacao ja em andamento" };
  }

  refreshInProgress = true;
  try {
    const payload = await generateDbFromSpreadsheet();
    return {
      status: "success",
      message: "JSON atualizado com sucesso",
      rowCount: payload.rowCount,
      generatedAt: payload.generatedAt
    };
  } catch (error) {
    return {
      status: "failed",
      message: error instanceof Error ? error.message : "Falha ao atualizar JSON a partir da planilha"
    };
  } finally {
    refreshInProgress = false;
  }
}
