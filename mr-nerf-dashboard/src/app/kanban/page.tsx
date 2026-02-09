"use client";

import { useEffect, useState, useCallback } from "react";
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
import { RefreshCw, Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import { KanbanColumnComponent } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { EditCardDialog } from "@/components/kanban/edit-card-dialog";
import type { KanbanItem, KanbanColumn, TeamMember } from "@/types";

const COLUMNS: KanbanColumn[] = [
  "ideas",
  "scripting",
  "filming",
  "editing",
  "scheduled",
  "published",
];

export default function KanbanPage() {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [editItem, setEditItem] = useState<KanbanItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState<KanbanColumn>("ideas");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterFormat, setFilterFormat] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, teamRes] = await Promise.all([
        fetch("/api/kanban"),
        fetch("/api/team"),
      ]);
      const [itemsJson, teamJson] = await Promise.all([
        itemsRes.json(),
        teamRes.json(),
      ]);
      setItems(itemsJson.data || []);
      setTeamMembers(teamJson.data || []);
    } catch (err) {
      console.error("Failed to fetch kanban data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDragStart(event: DragStartEvent) {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine the target column
    let targetColumn: KanbanColumn;

    if (COLUMNS.includes(overId as KanbanColumn)) {
      // Dropped directly on a column
      targetColumn = overId as KanbanColumn;
    } else {
      // Dropped on another card - find that card's column
      const overItem = items.find((i) => i.id === overId);
      if (!overItem) return;
      targetColumn = overItem.column;
    }

    const activeItemData = items.find((i) => i.id === activeId);
    if (!activeItemData || activeItemData.column === targetColumn) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, column: targetColumn } : i
      )
    );

    // Persist to server
    try {
      await fetch(`/api/kanban/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column: targetColumn }),
      });
    } catch (err) {
      console.error("Failed to update item:", err);
      fetchData(); // Revert on error
    }
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

  async function handleSave(data: Partial<KanbanItem> & { id?: string }) {
    try {
      if (data.id) {
        // Update existing
        const { id, ...updates } = data;
        await fetch(`/api/kanban/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } else {
        // Create new
        await fetch("/api/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      fetchData();
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/kanban/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterAssignee && item.assigned_to !== filterAssignee) return false;
    if (filterFormat && item.format !== filterFormat) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
