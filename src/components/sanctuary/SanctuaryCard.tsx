import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared shell for a care area. Completion is a warm wash across the card and
 * a message that fades in and drifts away — never a bounce, never a badge.
 * `tendedAt` is a counter from the caller; bumping it re-triggers the motion.
 */
export function SanctuaryCard({
  icon: Icon,
  title,
  description,
  accent = "var(--lantern)",
  tendedAt,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** A design-token color reference (e.g. "var(--water)") tinting this area's icon. */
  accent?: string | undefined;
  tendedAt: number;
  children: ReactNode;
}) {
  return (
    <section className="storybook-card relative overflow-hidden p-5">
      {tendedAt > 0 && (
        <div
          key={tendedAt}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--ember) 45%, transparent), transparent 65%)",
            animation: "warm-wash var(--dur-atmos) var(--ease-breath) both",
          }}
        />
      )}

      <div className="relative flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `color-mix(in oklab, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          <Icon className="size-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <div className="relative mt-3.5">{children}</div>

      {tendedAt > 0 && (
        <p
          key={`msg-${tendedAt}`}
          className="relative mt-3 text-sm text-primary"
          style={{ animation: "lift-away 2.6s var(--ease-drift) both" }}
        >
          Tended with care ✨
        </p>
      )}
    </section>
  );
}
