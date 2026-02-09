import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoKanbanItems } from "@/lib/demo-data";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("kanban_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({ data });
    }
  } catch {
    // Fall through to demo data
  }

  return NextResponse.json({ data: demoKanbanItems });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("kanban_items")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
