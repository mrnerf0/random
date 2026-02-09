import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoTeamMembers } from "@/lib/demo-data";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.from("team_members").select("*");

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({ data });
    }
  } catch {
    // Fall through to demo data
  }

  return NextResponse.json({ data: demoTeamMembers });
}
