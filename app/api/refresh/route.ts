import { NextResponse } from "next/server";
import { blocked, failed } from "@/lib/api-response";
import { refreshFunds } from "@/lib/funds-service";

export async function POST() {
  const result = await refreshFunds();

  if (result.status === "blocked") {
    return NextResponse.json(blocked(result.message), { status: 409 });
  }

  if (result.status === "failed") {
    return NextResponse.json(failed(result.message), { status: 500 });
  }

  return NextResponse.json(result);
}
