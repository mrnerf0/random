import { NextRequest, NextResponse } from "next/server";
import { generateHeadshotAdIdeas } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const competitorAds = body.competitorAds || [];
    const brandContext = body.brandContext || "";

    const ideas = await generateHeadshotAdIdeas(competitorAds, brandContext);
    return NextResponse.json({ ideas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate ad ideas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
