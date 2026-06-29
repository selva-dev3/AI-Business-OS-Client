"use client";

import * as React from "react";
import { useNotes } from "@/hooks/useEmployeeTabData";
import { useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useEmployeeMutations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  StickyNote,
  AlertTriangle,
  RefreshCw,
  Plus,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeNoteItem } from "@/types/hrms";
import { toast } from "sonner";

const CATEGORIES = ["GENERAL", "PERFORMANCE", "DISCIPLINARY", "TRAINING", "APPRAISAL", "OTHER"];
const VISIBILITY_OPTIONS = [
  { value: "hr_only", label: "HR Only" },
  { value: "admin_only", label: "Admin Only" },
  { value: "hr_and_admin", label: "HR & Admin" },
];

export default function NotesTab({ employeeId }: { employeeId: string }) {
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [editNote, setEditNote] = React.useState<EmployeeNoteItem | null>(null);
  const [deleteNoteId, setDeleteNoteId] = React.useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useNotes(
    employeeId,
    { category: categoryFilter !== "all" ? categoryFilter : undefined },
    true
  );

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const records: EmployeeNoteItem[] = data?.data ?? [];

  // Form state
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [visibility, setVisibility] = React.useState("hr_and_admin");
  const [isPinned, setIsPinned] = React.useState(false);

  const resetForm = () => {
    setContent(""); setCategory("General"); setVisibility("hr_and_admin"); setIsPinned(false);
  };

  const openCreate = () => {
    resetForm();
    setEditNote(null);
    setNoteOpen(true);
  };

  const openEdit = (note: EmployeeNoteItem) => {
    setEditNote(note);
    setContent(note.content);
    setCategory(note.category);
    setVisibility(note.visibility);
    setIsPinned(note.isPinned);
    setNoteOpen(true);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    try {
      if (editNote) {
        await updateMutation.mutateAsync({
          id: employeeId,
          noteId: editNote.id,
          data: { content, category, visibility, isPinned },
        });
      } else {
        await createMutation.mutateAsync({
          id: employeeId,
          data: { content, category, visibility, isPinned },
        });
      }
      setNoteOpen(false);
      resetForm();
    } catch {
      // handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteNoteId) return;
    try {
      await deleteMutation.mutateAsync({ id: employeeId, noteId: deleteNoteId });
      setDeleteNoteId(null);
    } catch {
      // handled by mutation
    }
  };

  const pinned = records.filter((n) => n.isPinned);
  const unpinned = records.filter((n) => !n.isPinned);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-500">{(error as any)?.message || "Failed to load notes"}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Note
        </Button>
      </div>

      {/* Note Cards */}
      {records.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <StickyNote className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No notes found</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Pin className="h-3 w-3" /> Pinned ({pinned.length})
              </p>
              {pinned.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={() => openEdit(note)} onDelete={() => setDeleteNoteId(note.id)} />
              ))}
            </div>
          )}
          <div className="space-y-2">
            {unpinned.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={() => openEdit(note)} onDelete={() => setDeleteNoteId(note.id)} />
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editNote ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isPinned} onCheckedChange={setIsPinned} id="pinned" />
              <Label htmlFor="pinned">Pin this note</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNoteOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editNote ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action can be undone by an admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: EmployeeNoteItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visColors: Record<string, string> = {
    hr_only: "bg-purple-100 text-purple-700",
    admin_only: "bg-rose-100 text-rose-700",
    hr_and_admin: "bg-blue-100 text-blue-700",
  };
  const visLabels: Record<string, string> = {
    hr_only: "HR Only",
    admin_only: "Admin Only",
    hr_and_admin: "HR & Admin",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {note.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
              <Badge variant="outline" className="text-[10px]">{note.category}</Badge>
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", visColors[note.visibility] || "bg-slate-100 text-slate-600")}>
                {visLabels[note.visibility] || note.visibility}
              </span>
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(note.createdAt).toLocaleString()}
              </span>
              {note.createdBy && typeof note.createdBy === "object" && (
                <span>by {note.createdBy.firstName} {note.createdBy.lastName}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
