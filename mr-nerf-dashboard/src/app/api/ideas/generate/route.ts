import { NextResponse } from "next/server";
import { generateVideoIdeas } from "@/lib/claude";
import { createServerSupabase } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = createServerSupabase();

    // Fetch the latest trends to use as context
    const { data: trends, error: trendsError } = await supabase
      .from("content_trends")
      .select("*")
      .order("scraped_at", { ascending: false })
      .limit(10);

    if (trendsError) {
      return NextResponse.json({ error: trendsError.message }, { status: 500 });
    }

    if (!trends || trends.length === 0) {
      return NextResponse.json(
        { error: "No trends found. Run the scrapers first." },
        { status: 400 }
      );
    }

    const ideas = await generateVideoIdeas(trends);
    return NextResponse.json({ ideas, trends_used: trends.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
