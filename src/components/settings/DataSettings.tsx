import { useRef, useState, type ChangeEvent } from "react";
import { Download, Trash2, Upload } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
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

export function DataSettings() {
  const { exportJson, importJson, eraseEverything } = useAvora();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);

  function handleExport() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avora-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    const result = importJson(text);
    setMessage(result.ok ? "Import complete." : (result.error ?? "That import didn't work."));
  }

  return (
    <SettingsSection title="Data" description="Everything stays on this device.">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="size-3.5" strokeWidth={1.8} />
          Export data
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleImportClick}>
          <Upload className="size-3.5" strokeWidth={1.8} />
          Import data
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => setConfirmErase(true)}
        >
          <Trash2 className="size-3.5" strokeWidth={1.8} />
          Delete everything
        </Button>
      </div>
      {message && <p className="mt-3 text-xs text-muted-foreground">{message}</p>}

      <AlertDialog open={confirmErase} onOpenChange={setConfirmErase}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete everything?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears every thought, preference, and care record from this device. It can't be
              undone — export first if you'd like to keep a copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void eraseEverything()}
            >
              Delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
