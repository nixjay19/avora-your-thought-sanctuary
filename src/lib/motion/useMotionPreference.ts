import { useEffect, useState } from "react";

/**
 * True when the OS asks for reduced motion. Read after hydration so SSR and
 * the client agree on the first paint.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/** True once the client has hydrated — gate browser-only reads on this. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * A slow ambient ticker for the world. Pauses when the document is hidden or
 * the element is off-screen, so an unattended tab costs nothing.
 */
export function useAmbientLoop(
  onTick: (elapsedMs: number) => void,
  { intervalMs = 4000, enabled = true }: { intervalMs?: number; enabled?: boolean } = {},
) {
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    let stopped = false;

    const frame = (now: number) => {
      if (stopped) return;
      if (document.visibilityState === "visible" && now - last >= intervalMs) {
        onTick(now - last);
        last = now;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [onTick, intervalMs, enabled]);
}
