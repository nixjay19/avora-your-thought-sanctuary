import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

import { useAvora } from "@/lib/data/store";
import { useReducedMotion, onWorldEvent, emitWorldEvent, momentTone } from "@/lib/motion";
import type { CreatureMood } from "@/lib/data/types";
import { pendingDiscoveries } from "@/lib/world/discoveries";
import { deriveMood } from "@/lib/world/mood";
import { Creature } from "./Creature";
import { WorldEnvironment } from "./WorldEnvironment";

type Tone = "ripple" | "warmth" | "play" | "bloom";

const moodCaption: Record<CreatureMood, (name: string) => string> = {
  curious: (name) => `${name} tilts its head, curious about you.`,
  content: (name) => `${name} seems content here.`,
  sleepy: (name) => `${name} is dozing softly.`,
  excited: (name) => `${name} is a little bit bouncy today.`,
  peaceful: (name) => `${name} rests easy in the moss.`,
};

export function WorldPage() {
  const { data, ready, updateWorld } = useAvora();
  const reducedOS = useReducedMotion();
  const reduced = reducedOS || data.preferences.calmMotion;

  const [rippleKey, setRippleKey] = useState(0);
  const [warmKey, setWarmKey] = useState(0);
  const [bloomKey, setBloomKey] = useState(0);
  const [reactSignal, setReactSignal] = useState<{ tone: Tone; key: number } | null>(null);

  const mountRan = useRef(false);

  const applyTone = useCallback((tone: Tone) => {
    const key = Date.now() + Math.random();
    if (tone === "ripple") setRippleKey(key);
    else if (tone === "warmth") setWarmKey(key);
    else if (tone === "bloom") setBloomKey(key);
    setReactSignal({ tone, key });
  }, []);

  // Arrival: acknowledge time away, settle discoveries, greet gently. Once.
  useEffect(() => {
    if (!ready || mountRan.current) return;
    mountRan.current = true;

    const world = data.world;
    const now = new Date();
    const previousVisit = world.lastVisit ? new Date(world.lastVisit) : null;
    const hoursAway = previousVisit
      ? (now.getTime() - previousVisit.getTime()) / 3_600_000
      : Number.POSITIVE_INFINITY;

    const nextMood = deriveMood(now.getHours(), world.pendingMoments.length);
    const newDiscoveries = pendingDiscoveries(world);

    updateWorld({
      lastVisit: now.toISOString(),
      mood: nextMood,
      discoveries: newDiscoveries.length
        ? [...world.discoveries, ...newDiscoveries]
        : world.discoveries,
      pendingMoments: [],
    });

    emitWorldEvent("visited");
    setBloomKey(Date.now());

    const scheduled: ReturnType<typeof setTimeout>[] = [];
    if (hoursAway > 6) {
      scheduled.push(setTimeout(() => applyTone("bloom"), 400));
    }
    world.pendingMoments.slice(0, 4).forEach((moment, index) => {
      const tone = momentTone[moment.kind as keyof typeof momentTone]?.tone ?? "ripple";
      scheduled.push(setTimeout(() => applyTone(tone), 700 + index * 650));
    });

    return () => {
      scheduled.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Live reactions — mainly the creature noticing a direct touch.
  useEffect(() => {
    const unsubscribe = onWorldEvent((event) => applyTone(momentTone[event.kind].tone));
    return () => {
      unsubscribe();
    };
  }, [applyTone]);

  const name = data.preferences.creatureName || "your creature";
  const recent = data.world.recentMoments[0];

  return (
    <div>
      <h1 className="text-2xl text-foreground">World</h1>
      <p className="mt-1 text-sm text-muted-foreground">A page that keeps living without you.</p>

      <div
        className="storybook-card relative mt-6 overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        <WorldEnvironment
          discoveries={data.world.discoveries}
          rippleKey={rippleKey}
          warmKey={warmKey}
          bloomKey={bloomKey}
        >
          <div className="absolute inset-0 flex items-end justify-center pb-8">
            <Creature
              mood={data.world.mood}
              name={name}
              reactSignal={reactSignal}
              reduced={reduced}
              onTouch={() => emitWorldEvent("touched")}
            />
          </div>
        </WorldEnvironment>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {moodCaption[data.world.mood](name)}
      </p>
      {recent && (
        <p className="mt-1 text-center text-xs text-muted-foreground/70">
          {momentTone[recent.kind as keyof typeof momentTone]?.label ?? "something happened"} ·{" "}
          {formatDistanceToNowStrict(new Date(recent.at), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
