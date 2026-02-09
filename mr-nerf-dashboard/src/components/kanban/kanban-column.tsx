"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { KanbanItem, KanbanColumn as KanbanColumnType } from "@/types";
import { cn } from "@/lib/utils";

const COLUMN_LABELS: Record<KanbanColumnType, string> = {
  ideas: "Ideas",
  scripting: "Scripting",
  filming: "Filming",
  editing: "Editing",
  scheduled: "Scheduled",
  published: "Published",
};

const COLUMN_COLORS: Record<KanbanColumnType, string> = {
  ideas: "border-t-purple-500",
  scripting: "border-t-blue-500",
  filming: "border-t-yellow-500",
  editing: "border-t-orange-500",
  scheduled: "border-t-green-500",
  published: "border-t-emerald-500",
};

interface KanbanColumnProps {
  column: KanbanColumnType;
  items: KanbanItem[];
  teamMembers: { id: string; name: string }[];
  onAddItem: (column: KanbanColumnType) => void;
  onEditItem: (item: KanbanItem) => void;
}

export function KanbanColumnComponent({
  column,
  items,
  teamMembers,
  onAddItem,
  onEditItem,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] bg-card rounded-lg border border-t-4 p-3",
        COLUMN_COLORS[column],
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">
          {COLUMN_LABELS[column]}
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {items.length}
          </span>
        </h3>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onAddItem(column)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1 min-h-[100px]">
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onClick={() => onEditItem(item)}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
