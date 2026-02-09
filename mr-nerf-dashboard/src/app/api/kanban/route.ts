import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

// GET all kanban items
export async function GET() {
  try {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("kanban_items")
      .select("*, team_members(name, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create a new kanban item
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();

    const { data, error } = await supabase
      .from("kanban_items")
      .insert({
        title: body.title,
        description: body.description || "",
        column: body.column || "ideas",
        assigned_to: body.assigned_to || null,
        due_date: body.due_date || null,
        format: body.format || "",
        notes: body.notes || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
