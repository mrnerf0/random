import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoTrends } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  try {
    const supabase = createServerSupabase();
    let query = supabase
      .from("content_trends")
      .select("*")
      .order("scraped_at", { ascending: false })
      .limit(50);

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({ data });
    }
  } catch {
    // Fall through to demo data
  }

  let data = demoTrends;
  if (source) {
    data = data.filter((t) => t.source === source);
  }
  return NextResponse.json({ data });
}
