import { useEffect } from "react";

import { useAvora } from "@/lib/data/store";

/**
 * Mirrors the in-app "calm motion" preference onto the document, so the same
 * CSS escape hatch used for prefers-reduced-motion applies app-wide.
 */
export function CalmMotion() {
  const { data } = useAvora();
  const calm = data.preferences.calmMotion;

  useEffect(() => {
    document.documentElement.classList.toggle("calm-motion", calm);
  }, [calm]);

  return null;
}
