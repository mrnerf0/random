import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { demoKanbanItems } from "@/lib/demo-data";
import type { KanbanItem } from "@/types";

// Shared in-memory store (same reference as parent route in the same serverless instance)
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  if (hasSupabase()) {
    try {
      const supabase = createServerSupabase();
      const { data, error } = await supabase
        .from("kanban_items")
        .update(body)
        .eq("id", params.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data });
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const items = getMemoryItems();
  const idx = items.findIndex((i) => i.id === params.id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...body, updated_at: new Date().toISOString() };
    return NextResponse.json({ data: items[idx] });
  }
  return NextResponse.json({ error: "Item not found" }, { status: 404 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (hasSupabase()) {
    try {
      const supabase = createServerSupabase();
      const { error } = await supabase
        .from("kanban_items")
        .delete()
        .eq("id", params.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const items = getMemoryItems();
  const idx = items.findIndex((i) => i.id === params.id);
  if (idx >= 0) {
    items.splice(idx, 1);
  }
  return NextResponse.json({ success: true });
}
