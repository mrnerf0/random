"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { KanbanItem, KanbanColumn, TeamMember } from "@/types";

interface EditCardDialogProps {
  item: KanbanItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<KanbanItem> & { id?: string }) => void;
  onDelete: (id: string) => void;
  teamMembers: TeamMember[];
  defaultColumn?: KanbanColumn;
}

const COLUMN_OPTIONS = [
  { value: "ideas", label: "Ideas" },
  { value: "scripting", label: "Scripting" },
  { value: "filming", label: "Filming" },
  { value: "editing", label: "Editing" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

const FORMAT_OPTIONS = [
  { value: "", label: "No format" },
  { value: "review", label: "Review" },
  { value: "news", label: "News" },
  { value: "commentary", label: "Commentary" },
  { value: "tutorial", label: "Tutorial" },
];

export function EditCardDialog({
  item,
  open,
  onClose,
  onSave,
  onDelete,
  teamMembers,
  defaultColumn = "ideas",
}: EditCardDialogProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [column, setColumn] = useState<string>(item?.column || defaultColumn);
  const [assignedTo, setAssignedTo] = useState(item?.assigned_to || "");
  const [dueDate, setDueDate] = useState(item?.due_date || "");
  const [format, setFormat] = useState(item?.format || "");
  const [notes, setNotes] = useState(item?.notes || "");

  // Reset form when item changes
  useState(() => {
    setTitle(item?.title || "");
    setDescription(item?.description || "");
    setColumn(item?.column || defaultColumn);
    setAssignedTo(item?.assigned_to || "");
    setDueDate(item?.due_date || "");
    setFormat(item?.format || "");
    setNotes(item?.notes || "");
  });

  function handleSave() {
    if (!title.trim()) return;

    onSave({
      ...(item?.id ? { id: item.id } : {}),
      title: title.trim(),
      description,
      column: column as KanbanColumn,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      format,
      notes,
    });

    onClose();
  }

  const memberOptions = [
    { value: "", label: "Unassigned" },
    ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Card" : "New Card"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title or task name"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Column</label>
              <Select
                options={COLUMN_OPTIONS}
                value={column}
                onChange={(e) => setColumn(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Format</label>
              <Select
                options={FORMAT_OPTIONS}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Assigned To
              </label>
              <Select
                options={memberOptions}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {item && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim()}>
                {item ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
