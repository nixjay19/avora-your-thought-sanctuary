import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import type { CareItem, Frequency } from "@/lib/data/types";
import { frequencies, frequencyLabel } from "@/lib/data/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { SettingsSection } from "./SettingsSection";

type Draft = {
  name: string;
  dose: string;
  reminderTime: string;
  frequency: Frequency;
  notes: string;
  remindersOn: boolean;
};

const emptyDraft: Draft = {
  name: "",
  dose: "",
  reminderTime: "09:00",
  frequency: "daily",
  notes: "",
  remindersOn: false,
};

export function CareItemSettings({
  list,
  title,
  description,
  addLabel,
}: {
  list: "medications" | "supplements";
  title: string;
  description: string;
  addLabel: string;
}) {
  const { data, addCareItem, updateCareItem, removeCareItem } = useAvora();
  const items = data[list];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pendingDelete, setPendingDelete] = useState<CareItem | null>(null);

  function openAdd() {
    setEditingId(null);
    setDraft(emptyDraft);
    setOpen(true);
  }

  function openEdit(item: CareItem) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      dose: item.dose,
      reminderTime: item.reminderTime,
      frequency: item.frequency,
      notes: item.notes ?? "",
      remindersOn: item.remindersOn,
    });
    setOpen(true);
  }

  function save() {
    if (!draft.name.trim()) return;
    const payload = {
      name: draft.name.trim(),
      dose: draft.dose.trim(),
      reminderTime: draft.reminderTime,
      frequency: draft.frequency,
      notes: draft.notes.trim() || undefined,
      remindersOn: draft.remindersOn,
    };
    if (editingId) updateCareItem(list, editingId, payload);
    else addCareItem(list, payload);
    setOpen(false);
  }

  return (
    <SettingsSection title={title} description={description}>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{item.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[item.dose, frequencyLabel[item.frequency], item.reminderTime]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => openEdit(item)}
                aria-label={`Edit ${item.name}`}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(item)}
                aria-label={`Remove ${item.name}`}
                className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" strokeWidth={1.6} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing set up yet.</p>}
      </div>

      <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={openAdd}>
        <Plus className="size-3.5" strokeWidth={1.8} />
        {addLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : addLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Name</label>
              <Input
                value={draft.name}
                onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
                placeholder="e.g. Vitamin D"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Dose</label>
              <Input
                value={draft.dose}
                onChange={(event) => setDraft((d) => ({ ...d, dose: event.target.value }))}
                placeholder="e.g. 1000 IU"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Reminder time</label>
                <Input
                  type="time"
                  value={draft.reminderTime}
                  onChange={(event) =>
                    setDraft((d) => ({ ...d, reminderTime: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Frequency</label>
                <Select
                  value={draft.frequency}
                  onValueChange={(value) =>
                    setDraft((d) => ({ ...d, frequency: value as Frequency }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {frequencyLabel[frequency]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Notes (optional)</label>
              <Textarea
                value={draft.notes}
                onChange={(event) => setDraft((d) => ({ ...d, notes: event.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
              <span className="text-sm text-foreground">Remind me</span>
              <Switch
                checked={draft.remindersOn}
                onCheckedChange={(checked) => setDraft((d) => ({ ...d, remindersOn: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This only removes it from your list — nothing else is affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) removeCareItem(list, pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
