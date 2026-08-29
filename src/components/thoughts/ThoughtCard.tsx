import { format } from "date-fns";
import { Clock, X } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import type { Thought, ThoughtKind } from "@/lib/data/types";
import { kindLabel } from "@/lib/thoughts/interpret";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const kinds: ThoughtKind[] = ["note", "task", "idea", "reminder"];

export function ThoughtCard({ thought, settle }: { thought: Thought; settle: boolean }) {
  const { setThoughtKind, toggleThoughtDone, removeThought } = useAvora();
  const isTask = thought.kind === "task";

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-card/60 p-4 transition-colors",
        settle && "settle",
      )}
    >
      <button
        type="button"
        onClick={() => removeThought(thought.id)}
        aria-label="Remove thought"
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
      >
        <X className="size-3.5" strokeWidth={1.6} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        {isTask && (
          <Checkbox
            checked={Boolean(thought.done)}
            onCheckedChange={() => toggleThoughtDone(thought.id)}
            aria-label={thought.done ? "Mark task not done" : "Mark task done"}
            className="mt-1"
          />
        )}
        <p
          className={cn(
            "whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground",
            isTask && thought.done && "text-muted-foreground line-through decoration-1",
          )}
        >
          {thought.text}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 pl-0">
        <Select
          value={thought.kind}
          onValueChange={(value) => setThoughtKind(thought.id, value as ThoughtKind)}
        >
          <SelectTrigger
            aria-label="Change category"
            className="h-6 w-auto gap-1 border-none bg-transparent px-0 text-xs text-muted-foreground shadow-none hover:text-foreground focus:ring-0"
          >
            <SelectValue>
              <span className="inline-flex items-center gap-1">
                {!thought.kindConfirmed && (
                  <span
                    aria-hidden
                    className="size-1 rounded-full bg-primary/60"
                    title="Avora's guess"
                  />
                )}
                {kindLabel[thought.kind]}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {kinds.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {kindLabel[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {thought.kind === "reminder" && thought.remindAt && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" strokeWidth={1.6} />
            {format(new Date(thought.remindAt), "EEE d MMM · h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}
