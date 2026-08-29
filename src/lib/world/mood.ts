import type { CreatureMood } from "../data/types";

/** Pure and deterministic: same hour and pending count always give the same mood. */
export function deriveMood(hour: number, pendingMomentCount: number): CreatureMood {
  if (hour >= 22 || hour < 6) return "sleepy";
  if (pendingMomentCount >= 3) return "excited";
  if (pendingMomentCount >= 1) return "curious";
  if ((hour >= 6 && hour < 9) || (hour >= 19 && hour < 22)) return "peaceful";
  return "content";
}
