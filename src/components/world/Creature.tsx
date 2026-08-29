import { useEffect, useId, useRef, useState } from "react";

import { useAmbientLoop } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CreatureMood } from "@/lib/data/types";

type Gesture = "idle" | "look-left" | "look-right" | "stretch" | "doze";

const moodGlow: Record<CreatureMood, string> = {
  curious: "var(--glow-soft)",
  content: "var(--glow-warm)",
  sleepy: "0 0 30px -8px color-mix(in oklab, var(--world-plum) 50%, transparent)",
  excited: "0 0 55px -6px color-mix(in oklab, var(--lantern) 60%, transparent)",
  peaceful: "var(--glow-soft)",
};

/**
 * Lumen — an original, small magical being with no obvious species. Soft,
 * asymmetric, and limbless like a wisp of living light, not a mascot with
 * antennae. Layered SVG, CSS-driven idle life; no game state, just breath,
 * blinks, glances, and a quiet way of noticing you.
 */
export function Creature({
  mood,
  name,
  reactSignal,
  reduced,
  onTouch,
}: {
  mood: CreatureMood;
  name: string;
  reactSignal: { tone: "ripple" | "warmth" | "play" | "bloom"; key: number } | null;
  reduced: boolean;
  onTouch: () => void;
}) {
  const gradientId = useId();
  const [gesture, setGesture] = useState<Gesture>("idle");
  const gestureTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function hold(next: Gesture, ms: number) {
    if (gestureTimeout.current) clearTimeout(gestureTimeout.current);
    setGesture(next);
    gestureTimeout.current = setTimeout(() => setGesture("idle"), ms);
  }

  useAmbientLoop(
    () => {
      const roll = Math.random();
      if (roll < 0.16) hold("look-left", 1400);
      else if (roll < 0.32) hold("look-right", 1400);
      else if (roll < 0.42) hold("stretch", 900);
      else if (roll < 0.5)
        hold(mood === "sleepy" ? "doze" : "look-left", mood === "sleepy" ? 4200 : 1200);
    },
    { intervalMs: 5200, enabled: !reduced },
  );

  useEffect(() => {
    if (!reactSignal || reduced) return;
    if (reactSignal.tone === "play") hold("stretch", 1100);
    else hold("look-left", 1300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactSignal?.key, reduced]);

  useEffect(
    () => () => {
      if (gestureTimeout.current) clearTimeout(gestureTimeout.current);
    },
    [],
  );

  const eyesTransform =
    gesture === "look-left"
      ? "translateX(-2.4px)"
      : gesture === "look-right"
        ? "translateX(2.4px)"
        : "translateX(0)";

  const bodyTransform = gesture === "stretch" ? "scale(1.045, 0.965)" : "scale(1, 1)";
  const dozing = gesture === "doze";

  return (
    <button
      type="button"
      onClick={onTouch}
      aria-label={`Say hello to ${name}`}
      className="group relative flex items-center justify-center bg-transparent p-0"
      style={{
        animation: reduced ? undefined : "wander var(--dur-drift) var(--ease-breath) infinite",
      }}
    >
      {/* contact shadow — stays put while the body breathes above it, so it reads as grounded */}
      <span
        aria-hidden
        className="absolute bottom-3 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full"
        style={{
          background: "color-mix(in oklab, var(--world-plum) 65%, transparent)",
          filter: "blur(4px)",
        }}
      />

      <div className={cn(!reduced && "breathing")}>
        <div
          style={{
            transform: bodyTransform,
            transition: "transform 520ms var(--ease-drift)",
          }}
        >
          <svg
            width="152"
            height="152"
            viewBox="0 0 200 200"
            fill="none"
            style={{ filter: `drop-shadow(${moodGlow[mood]})` }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="60"
                y1="60"
                x2="140"
                y2="170"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="var(--primary-glow)" />
                <stop offset="100%" stopColor="var(--lantern)" />
              </linearGradient>
            </defs>

            {/* tail wisp, tucked behind the body */}
            <path
              d="M112,150 C130,158 144,166 150,180"
              stroke="var(--lantern)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
            <circle
              cx="150"
              cy="180"
              r="2.6"
              fill="var(--primary-glow)"
              style={{ animation: "glimmer 4.2s ease-in-out infinite", animationDelay: "0.6s" }}
            />

            {/* a single curling wisp, off-centre, like a flicker of candle-smoke */}
            <path
              d="M92,74 C84,60 88,44 78,32 C93,36 103,49 100,65 C99,70 95,73 92,74 Z"
              fill="var(--lantern)"
              opacity={0.85}
            />
            <circle
              cx="78"
              cy="32"
              r="3"
              fill="var(--world-honey)"
              style={{ animation: "glimmer 3.6s ease-in-out infinite" }}
            />

            {/* a small curled petal, tucked low on the other side for balance */}
            <path
              d="M123,88 C133,82 142,85 144,93 C138,98 127,97 121,91 Z"
              fill="var(--lantern)"
              opacity={0.55}
            />

            {/* body — slightly irregular outline, like a hand-drawn illustration */}
            <path
              d="M59,124 C56,94 74,67 101,66 C126,68 142,90 139,121 C137,151 122,171 99,170 C79,169 61,152 59,124 Z"
              fill={`url(#${gradientId})`}
            />

            {/* belly glow */}
            <ellipse cx="100" cy="142" rx="19" ry="13" fill="var(--world-cream)" opacity={0.2} />

            {/* mouth */}
            <path
              d="M92,128 Q100,132.5 108,128"
              stroke="var(--world-plum)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity={0.5}
            />

            {/* eyes */}
            <g
              style={{
                transform: eyesTransform,
                transition: "transform 700ms var(--ease-drift)",
              }}
            >
              <ellipse
                cx="85"
                cy="114"
                rx="6.5"
                ry="8.5"
                fill="var(--world-plum)"
                style={
                  reduced
                    ? undefined
                    : {
                        animation: "blink 6.4s ease-in-out infinite",
                        transformBox: "fill-box",
                        transformOrigin: "50% 50%",
                      }
                }
              />
              <ellipse
                cx="114"
                cy="114"
                rx="6"
                ry="8"
                fill="var(--world-plum)"
                style={
                  reduced
                    ? undefined
                    : {
                        animation: "blink 6.4s ease-in-out infinite",
                        animationDelay: "0.06s",
                        transformBox: "fill-box",
                        transformOrigin: "50% 50%",
                      }
                }
              />
              <circle cx="87.5" cy="111" r="1.6" fill="var(--world-cream)" />
              <circle cx="82.5" cy="116" r="0.8" fill="var(--world-cream)" opacity={0.7} />
              <circle cx="116.5" cy="111" r="1.6" fill="var(--world-cream)" />
              <circle cx="111.5" cy="116" r="0.8" fill="var(--world-cream)" opacity={0.7} />

              {/* eyelids, for dozing */}
              <rect
                x="78.5"
                y="106"
                width="14"
                height="16"
                rx="7"
                fill="var(--world-cream)"
                opacity={dozing ? 0.95 : 0}
                style={{ transition: "opacity 900ms var(--ease-drift)" }}
              />
              <rect
                x="107"
                y="106"
                width="14"
                height="16"
                rx="7"
                fill="var(--world-cream)"
                opacity={dozing ? 0.95 : 0}
                style={{ transition: "opacity 900ms var(--ease-drift)" }}
              />
            </g>
          </svg>
        </div>
      </div>
    </button>
  );
}
