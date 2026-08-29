import { useEffect, useId, useRef, useState } from "react";

import { useAmbientLoop } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CreatureMood } from "@/lib/data/types";

type Gesture = "idle" | "look-left" | "look-right" | "stretch" | "doze";

const moodGlow: Record<CreatureMood, string> = {
  curious: "var(--glow-soft)",
  content: "var(--glow-warm)",
  sleepy: "0 0 30px -8px color-mix(in oklab, var(--water) 40%, transparent)",
  excited: "0 0 55px -6px color-mix(in oklab, var(--lantern) 60%, transparent)",
  peaceful: "var(--glow-soft)",
};

/**
 * The one original creature Avora belongs to — layered SVG, CSS-driven idle
 * life. No game state: it breathes, blinks, glances around, and notices you.
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
          background: "color-mix(in oklab, var(--dusk) 60%, transparent)",
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

            {/* tufts */}
            <path
              d="M82,80 C74,66 68,55 64,44 C72,52 82,61 89,74 Z"
              fill="var(--lantern)"
              opacity={0.85}
            />
            <path
              d="M118,80 C126,66 132,55 136,44 C128,52 118,61 111,74 Z"
              fill="var(--lantern)"
              opacity={0.85}
            />
            <circle
              cx="64"
              cy="44"
              r="3"
              fill="var(--primary-glow)"
              style={{ animation: "glimmer 3.6s ease-in-out infinite" }}
            />
            <circle
              cx="136"
              cy="44"
              r="3"
              fill="var(--primary-glow)"
              style={{ animation: "glimmer 3.6s ease-in-out infinite", animationDelay: "1.1s" }}
            />

            {/* body */}
            <path
              d="M62,122 C60,92 76,68 100,67 C124,68 140,92 138,122 C136,152 120,170 100,170 C80,170 64,152 62,122 Z"
              fill={`url(#${gradientId})`}
            />

            {/* belly glow */}
            <ellipse cx="100" cy="142" rx="19" ry="13" fill="var(--mist)" opacity={0.22} />

            {/* mouth */}
            <path
              d="M92,128 Q100,132.5 108,128"
              stroke="var(--dusk)"
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
                cx="86"
                cy="114"
                rx="6"
                ry="8"
                fill="var(--dusk)"
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
                fill="var(--dusk)"
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
              <circle cx="88" cy="111" r="1.4" fill="var(--mist)" />
              <circle cx="116" cy="111" r="1.4" fill="var(--mist)" />

              {/* eyelids, for dozing */}
              <rect
                x="79"
                y="106"
                width="14"
                height="16"
                rx="7"
                fill="var(--card)"
                opacity={dozing ? 0.95 : 0}
                style={{ transition: "opacity 900ms var(--ease-drift)" }}
              />
              <rect
                x="107"
                y="106"
                width="14"
                height="16"
                rx="7"
                fill="var(--card)"
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
