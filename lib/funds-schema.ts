import { z } from "zod";

export type LinkStatus = "valid" | "invalid" | "empty";

export const fundRecordSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  papel: z.string(),
  linkRaw: z.string().nullable(),
  linkUrl: z.string().url().nullable(),
  linkDisplay: z.string(),
  linkStatus: z.enum(["valid", "invalid", "empty"])
});

export type FundRecord = z.infer<typeof fundRecordSchema>;

export const dbSchema = z.object({
  version: z.number().int().positive(),
  generatedAt: z.string(),
  sourceFile: z.string(),
  rowCount: z.number().int().nonnegative(),
  discardedCount: z.number().int().nonnegative(),
  records: z.array(fundRecordSchema)
});

export type FundsDb = z.infer<typeof dbSchema>;

export type RowInput = {
  Tipo?: unknown;
  Papel?: unknown;
  Link?: unknown;
};

export function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

export function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildFundRecord(row: RowInput, index: number): FundRecord | null {
  const tipo = normalizeText(row.Tipo);
  const papel = normalizeText(row.Papel);
  const linkRawValue = normalizeText(row.Link);

  if (!tipo || !papel) {
    return null;
  }

  const linkRaw = linkRawValue || null;
  let linkStatus: LinkStatus = "empty";
  let linkUrl: string | null = null;

  if (linkRawValue) {
    if (isValidHttpUrl(linkRawValue)) {
      linkStatus = "valid";
      linkUrl = linkRawValue;
    } else {
      linkStatus = "invalid";
    }
  }

  const id = `${index + 1}-${tipo}-${papel}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  return fundRecordSchema.parse({
    id,
    tipo,
    papel,
    linkRaw,
    linkUrl,
    linkDisplay: linkStatus === "valid" ? linkRawValue : "Link indisponivel",
    linkStatus
  });
}
