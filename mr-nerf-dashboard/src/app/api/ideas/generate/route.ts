import { NextRequest, NextResponse } from "next/server";
import { generateVideoIdeas } from "@/lib/claude";
import { demoTrends } from "@/lib/demo-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const format = body.format || "both"; // "short-form", "long-form", or "both"
    const customInstructions = body.customInstructions || "";

    const ideas = await generateVideoIdeas(demoTrends, format, customInstructions);
    return NextResponse.json({ ideas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate ideas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
