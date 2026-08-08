import { NextResponse } from "next/server";
import { updateQuotes } from "@/lib/quote-service";

export async function POST() {
  const result = await updateQuotes();

  if (result.status === "blocked") {
    return NextResponse.json(result, { status: 409 });
  }

  if (result.status === "failed") {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
