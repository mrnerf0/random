"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import { KanbanColumnComponent } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { EditCardDialog } from "@/components/kanban/edit-card-dialog";
import type { KanbanItem, KanbanColumn } from "@/types";
import { demoKanbanItems, demoTeamMembers } from "@/lib/demo-data";

const COLUMNS: KanbanColumn[] = [
  "ideas",
  "scripting",
  "filming",
  "editing",
  "scheduled",
  "published",
];

export default function KanbanPage() {
  const [items, setItems] = useState<KanbanItem[]>(demoKanbanItems);
  const [teamMembers] = useState(demoTeamMembers);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [editItem, setEditItem] = useState<KanbanItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState<KanbanColumn>("ideas");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterFormat, setFilterFormat] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetColumn: KanbanColumn;

    if (COLUMNS.includes(overId as KanbanColumn)) {
      targetColumn = overId as KanbanColumn;
    } else {
      const overItem = items.find((i) => i.id === overId);
      if (!overItem) return;
      targetColumn = overItem.column;
    }

    const activeItemData = items.find((i) => i.id === activeId);
    if (!activeItemData || activeItemData.column === targetColumn) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, column: targetColumn } : i
      )
    );
  }

  function handleAddItem(column: KanbanColumn) {
    setEditItem(null);
    setDefaultColumn(column);
    setDialogOpen(true);
  }

  function handleEditItem(item: KanbanItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleSave(data: Partial<KanbanItem> & { id?: string }) {
    if (data.id) {
      setItems((prev) =>
        prev.map((i) => (i.id === data.id ? { ...i, ...data } : i))
      );
    } else {
      const newItem: KanbanItem = {
        id: `k-${Date.now()}`,
        title: data.title || "Untitled",
        description: data.description || "",
        column: (data.column as KanbanColumn) || "ideas",
        assigned_to: data.assigned_to || null,
        due_date: data.due_date || null,
        format: data.format || "commentary",
        notes: data.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
    }
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filteredItems = items.filter((item) => {
    if (filterAssignee && item.assigned_to !== filterAssignee) return false;
    if (filterFormat && item.format !== filterFormat) return false;
    return true;
  });

  const memberFilterOptions = [
    { value: "", label: "All Members" },
    ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
  ];

  const formatFilterOptions = [
    { value: "", label: "All Formats" },
    { value: "review", label: "Review" },
    { value: "news", label: "News" },
    { value: "commentary", label: "Commentary" },
    { value: "tutorial", label: "Tutorial" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Board</h1>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            options={memberFilterOptions}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-36"
          />
          <Select
            options={formatFilterOptions}
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumnComponent
              key={col}
              column={col}
              items={filteredItems.filter((i) => i.column === col)}
              teamMembers={teamMembers}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <KanbanCard
              item={activeItem}
              onClick={() => {}}
              teamMembers={teamMembers}
            />
          )}
        </DragOverlay>
      </DndContext>

      <EditCardDialog
        item={editItem}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        teamMembers={teamMembers}
        defaultColumn={defaultColumn}
      />
    </div>
  );
}
