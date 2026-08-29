import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import type { CareArea } from "@/lib/data/types";
import { SanctuaryCard } from "./SanctuaryCard";

/** Shared shape for Medication and Supplements — both are a list of configured items. */
export function CareItemsSection({
  icon,
  title,
  accent,
  area,
  list,
  actionLabel,
  emptyHint,
}: {
  icon: LucideIcon;
  title: string;
  accent?: string;
  area: CareArea;
  list: "medications" | "supplements";
  actionLabel: string;
  emptyHint: string;
}) {
  const { data, logCare } = useAvora();
  const [tendedAt, setTendedAt] = useState(0);
  const items = data[list];

  function take(itemId?: string) {
    logCare(area, itemId ? { itemId } : undefined);
    setTendedAt(Date.now());
  }

  if (items.length === 0) {
    return (
      <SanctuaryCard icon={icon} title={title} accent={accent} tendedAt={0}>
        <p className="text-sm text-muted-foreground">
          {emptyHint}{" "}
          <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
            Set it up in Settings
          </Link>
          .
        </p>
      </SanctuaryCard>
    );
  }

  return (
    <SanctuaryCard icon={icon} title={title} accent={accent} tendedAt={tendedAt}>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{item.name}</span>
              {item.dose && (
                <span className="block text-xs text-muted-foreground">{item.dose}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => take(item.id)}
              className="shrink-0 rounded-full bg-primary/90 px-3.5 py-1.5 text-xs font-medium text-primary-foreground"
            >
              {actionLabel}
            </button>
          </div>
        ))}
      </div>
    </SanctuaryCard>
  );
}
