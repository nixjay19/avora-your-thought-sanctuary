/**
 * World event bus.
 *
 * Feature code (Thoughts, Sanctuary) publishes gentle "moments" here.
 * The World renderer subscribes and reacts. Nothing scores, nothing decays:
 * events only ever add a moment of connection.
 *
 * Because the World is on its own route, moments that happen elsewhere are
 * also persisted as pending moments so the world can acknowledge them the
 * next time it is visited.
 */

export type WorldEventKind =
  | "thought-captured"
  | "nourished"
  | "medication-taken"
  | "supplements-taken"
  | "moved"
  | "visited"
  | "touched"
  | "discovery";

export type WorldEvent = {
  kind: WorldEventKind;
  at: number;
  detail?: string | undefined;
};

type Listener = (event: WorldEvent) => void;

const listeners = new Set<Listener>();

export function onWorldEvent(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitWorldEvent(kind: WorldEventKind, detail?: string) {
  const event: WorldEvent = { kind, at: Date.now(), detail };
  for (const listener of [...listeners]) {
    try {
      listener(event);
    } catch (error) {
      console.error("world event listener failed", error);
    }
  }
  return event;
}

/** How a moment colours the world when it arrives. */
export const momentTone: Record<
  WorldEventKind,
  { tone: "ripple" | "warmth" | "play" | "bloom"; label: string }
> = {
  "thought-captured": { tone: "ripple", label: "something crossed the water" },
  nourished: { tone: "warmth", label: "the world warmed a little" },
  "medication-taken": { tone: "warmth", label: "a steady light" },
  "supplements-taken": { tone: "warmth", label: "a steady light" },
  moved: { tone: "play", label: "the air quickened" },
  visited: { tone: "bloom", label: "you arrived" },
  touched: { tone: "play", label: "a soft hello" },
  discovery: { tone: "bloom", label: "something new" },
};
