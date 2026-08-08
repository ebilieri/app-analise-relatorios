import { promises as fs } from "node:fs";
import path from "node:path";
import { dbSchema, type FundsDb } from "./funds-schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "fundos-db.json");

export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function dbFileExists(): Promise<boolean> {
  try {
    await fs.access(DB_PATH);
    return true;
  } catch {
    return false;
  }
}

export async function readDb(): Promise<FundsDb> {
  const raw = await fs.readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return dbSchema.parse(parsed);
}

export async function writeDbAtomic(payload: FundsDb): Promise<void> {
  await ensureDataDir();
  const tempPath = `${DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tempPath, DB_PATH);
}

export function getDbPath(): string {
  return DB_PATH;
}
