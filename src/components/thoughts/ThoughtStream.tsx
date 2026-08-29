import { useMemo, useRef, useState } from "react";
import { isToday, isYesterday, format } from "date-fns";
import { Search } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import type { ThoughtKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ThoughtCard } from "./ThoughtCard";

type FilterKind = "all" | ThoughtKind;

const filters: { value: FilterKind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "task", label: "Tasks" },
  { value: "idea", label: "Ideas" },
  { value: "reminder", label: "Reminders" },
];

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMMM");
}

export function ThoughtStream() {
  const { data } = useAvora();
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");

  const seenIds = useRef<Set<string> | null>(null);
  if (seenIds.current === null) {
    seenIds.current = new Set(data.thoughts.map((thought) => thought.id));
  }
  const newIds = new Set(data.thoughts.map((t) => t.id).filter((id) => !seenIds.current!.has(id)));
  for (const id of newIds) seenIds.current.add(id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.thoughts.filter((thought) => {
      if (filter !== "all" && thought.kind !== filter) return false;
      if (q && !thought.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.thoughts, filter, query]);

  const groups = useMemo(() => {
    const byDay = new Map<string, typeof filtered>();
    for (const thought of filtered) {
      const label = dayLabel(thought.createdAt);
      const existing = byDay.get(label);
      if (existing) existing.push(thought);
      else byDay.set(label, [thought]);
    }
    return [...byDay.entries()];
  }, [filtered]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-full border border-border/70 bg-card/40 p-1">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto flex-1 sm:flex-none">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.6}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search thoughts"
            aria-label="Search thoughts"
            className="w-full rounded-full border border-border/70 bg-card/40 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-48"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          {data.thoughts.length === 0
            ? "Nothing here yet. Whatever's on your mind, it can land above."
            : "Nothing matches, for now."}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([label, thoughts]) => (
            <div key={label}>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </h2>
              <div className="space-y-3">
                {thoughts.map((thought) => (
                  <ThoughtCard key={thought.id} thought={thought} settle={newIds.has(thought.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
