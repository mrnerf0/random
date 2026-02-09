import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoKanbanItems } from "@/lib/demo-data";
import type { KanbanItem } from "@/types";

// In-memory store for kanban items when Supabase is not configured
let memoryItems: KanbanItem[] | null = null;

function getMemoryItems(): KanbanItem[] {
  if (!memoryItems) {
    memoryItems = [...demoKanbanItems];
  }
  return memoryItems;
}

function hasSupabase(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}

export async function GET() {
  if (hasSupabase()) {
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
      // Fall through
    }
  }

  return NextResponse.json({ data: getMemoryItems() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (hasSupabase()) {
    try {
      const supabase = createServerSupabase();
      const { data, error } = await supabase
        .from("kanban_items")
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data });
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const newItem: KanbanItem = {
    id: `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: body.title || "Untitled",
    description: body.description || "",
    column: body.column || "ideas",
    assigned_to: body.assigned_to || null,
    due_date: body.due_date || null,
    format: body.format || "commentary",
    notes: body.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  getMemoryItems().push(newItem);
  return NextResponse.json({ data: newItem });
}
