import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoYouTubeData, demoInstagramData } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "youtube";
  const days = parseInt(searchParams.get("days") || "180");

  try {
    const supabase = createServerSupabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("platform", platform)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({ data });
    }
  } catch {
    // Fall through to demo data
  }

  const demoData = platform === "youtube" ? demoYouTubeData : demoInstagramData;
  return NextResponse.json({ data: demoData });
}
