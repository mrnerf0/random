import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export async function POST() {
  try {
    const results = await runAllScrapers();
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
