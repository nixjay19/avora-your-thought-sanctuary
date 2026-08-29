import { Link, useRouterState } from "@tanstack/react-router";
import { Feather, Leaf, Moon, Settings } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const spaces = [
  { to: "/", label: "Thoughts", icon: Feather },
  { to: "/sanctuary", label: "Sanctuary", icon: Leaf },
  { to: "/world", label: "World", icon: Moon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * The shell. Pages arrive with a page-turn: a soft blurred crossfade with a
 * little parallax drift, keyed on pathname so every move between spaces
 * feels like turning a page rather than swapping a screen.
 */
export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 0%, color-mix(in oklab, var(--dusk) 28%, transparent), transparent 70%), radial-gradient(50% 35% at 85% 10%, color-mix(in oklab, var(--water) 20%, transparent), transparent 70%)",
        }}
      />

      <main
        key={pathname}
        className={cn("page-enter flex-1", bleed ? "" : "mx-auto w-full max-w-2xl px-5 pt-8")}
        style={{ paddingBottom: bleed ? undefined : "var(--space-content-bottom)" }}
      >
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center pt-3"
        style={{ paddingBottom: "var(--nav-bottom-offset)" }}
      >
        <div
          className="flex items-center gap-1 rounded-full border border-border px-2 py-2"
          style={{
            backgroundColor: "color-mix(in oklab, var(--card) 82%, transparent)",
            backdropFilter: "blur(14px)",
            boxShadow: "var(--shadow-page)",
          }}
        >
          {spaces.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={cn(
                  "group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                style={{
                  transitionDuration: "var(--dur-touch)",
                  transitionTimingFunction: "var(--ease-drift)",
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "var(--gradient-lantern)",
                      boxShadow: "var(--glow-soft)",
                    }}
                  />
                )}
                <Icon className="relative size-4" strokeWidth={1.6} />
                <span className={cn("relative hidden sm:inline", active && "font-medium")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
