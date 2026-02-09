import { NextRequest, NextResponse } from "next/server";
import { generateVideoIdeas } from "@/lib/claude";
import { getTrends } from "@/lib/get-trends";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const format = body.format || "both"; // "short-form", "long-form", or "both"
    const customInstructions = body.customInstructions || "";

    // Fetch real trends instead of using hardcoded demo data
    const trends = await getTrends();

    const ideas = await generateVideoIdeas(trends, format, customInstructions);
    return NextResponse.json({ ideas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate ideas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
