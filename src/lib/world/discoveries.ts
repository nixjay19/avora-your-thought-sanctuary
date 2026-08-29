import { newId, timestamp, type Discovery, type WorldState } from "../data/types";

/**
 * What can be found in the world, and the richness it takes to find it.
 * Deterministic and one-directional — richness only ever grows from real
 * moments (a thought captured, care logged), so nothing here is awarded or
 * randomised. It is simply there once you've been around enough.
 */
export type DiscoveryKey =
  "firefly-1" | "second-stone" | "bloom-patch" | "distant-glimmer" | "star-moss";

const MILESTONES: { key: DiscoveryKey; at: number }[] = [
  { key: "firefly-1", at: 3 },
  { key: "second-stone", at: 8 },
  { key: "bloom-patch", at: 15 },
  { key: "distant-glimmer", at: 25 },
  { key: "star-moss", at: 40 },
];

export function hasDiscovery(discoveries: Discovery[], key: DiscoveryKey) {
  return discoveries.some((discovery) => discovery.key === key);
}

/** Any discoveries `world` has earned but doesn't have recorded yet. */
export function pendingDiscoveries(
  world: Pick<WorldState, "richness" | "discoveries">,
): Discovery[] {
  const additions: Discovery[] = [];
  for (const milestone of MILESTONES) {
    if (world.richness >= milestone.at && !hasDiscovery(world.discoveries, milestone.key)) {
      additions.push({ id: newId(), key: milestone.key, foundAt: timestamp() });
    }
  }
  return additions;
}
