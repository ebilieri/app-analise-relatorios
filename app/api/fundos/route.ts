import { NextResponse } from "next/server";
import { failed, success } from "@/lib/api-response";
import { listFunds } from "@/lib/funds-service";

export async function GET() {
  try {
    const payload = await listFunds();
    return NextResponse.json(
      success({
        generatedAt: payload.generatedAt,
        rowCount: payload.rowCount,
        discardedCount: payload.discardedCount,
        records: payload.records
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar dados";
    return NextResponse.json(failed(message), { status: 500 });
  }
}
