import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("content_trends")
      .select("*")
      .order("scraped_at", { ascending: false })
      .limit(limit);

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
