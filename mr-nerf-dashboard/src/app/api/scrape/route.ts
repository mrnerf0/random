import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export async function POST() {
  try {
    const results = await runAllScrapers();
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
