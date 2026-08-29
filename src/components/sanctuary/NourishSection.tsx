import { useMemo, useState } from "react";
import { ChevronDown, Shuffle, Utensils } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import { useHydrated } from "@/lib/motion";
import { suggestMeals, effortLabel, type Meal } from "@/lib/meals/library";
import { cn } from "@/lib/utils";
import { SanctuaryCard } from "./SanctuaryCard";

export function NourishSection() {
  const { data, logCare } = useAvora();
  const hydrated = useHydrated();
  const [seed, setSeed] = useState(0);
  const [tendedAt, setTendedAt] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);

  // suggestMeals shuffles with Math.random — only compute it once hydrated,
  // so the server-rendered markup and the first client render still match.
  const suggestions = useMemo(
    () => (hydrated ? suggestMeals(data.food, { count: 3 }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.food, seed, hydrated],
  );

  function ate(meal?: Meal) {
    logCare("nourish", meal ? { note: meal.name } : undefined);
    setTendedAt(Date.now());
  }

  return (
    <SanctuaryCard icon={Utensils} title="Nourish & Eat" accent="var(--ember)" tendedAt={tendedAt}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => ate()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow"
        >
          I ate
        </button>
        <button
          type="button"
          onClick={() => setBrowsing((value) => !value)}
          aria-expanded={browsing}
          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          A few ideas
          <ChevronDown
            className={cn("size-3.5 transition-transform", browsing && "rotate-180")}
            strokeWidth={1.6}
          />
        </button>
      </div>

      {browsing && (
        <div className="mt-3.5 space-y-2">
          {!hydrated &&
            [0, 1, 2].map((index) => (
              <div
                key={index}
                aria-hidden
                className="h-[52px] rounded-xl border border-border/40 bg-card/25"
              />
            ))}
          {suggestions.map((meal) => {
            const open = expanded === meal.id;
            return (
              <div
                key={meal.id}
                className="rounded-xl border border-border/60 bg-card/40 px-3.5 py-3"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : meal.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={open}
                >
                  <span>
                    <span className="block text-sm text-foreground">{meal.name}</span>
                    <span className="block text-xs text-muted-foreground">{meal.note}</span>
                  </span>
                </button>
                {open && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {meal.ingredients.join(", ")} · {effortLabel[meal.effort]}
                    </p>
                    <button
                      type="button"
                      onClick={() => ate(meal)}
                      className="shrink-0 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      I ate this
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="size-3.5" strokeWidth={1.6} />
            Surprise me
          </button>
        </div>
      )}
    </SanctuaryCard>
  );
}
