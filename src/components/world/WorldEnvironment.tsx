import type { CSSProperties, ReactNode } from "react";

import type { Discovery } from "@/lib/data/types";
import { hasDiscovery } from "@/lib/world/discoveries";

const FIREFLIES = [
  { left: "16%", bottom: "34%", delay: "-1s", duration: "7.5s" },
  { left: "64%", bottom: "46%", delay: "-4s", duration: "9s" },
  { left: "42%", bottom: "28%", delay: "-6.5s", duration: "8s" },
  { left: "80%", bottom: "38%", delay: "-2.5s", duration: "10s" },
];

const PLANTS = [
  { left: "12%", height: 46, delay: "0s" },
  { left: "24%", height: 30, delay: "-1.4s" },
  { left: "72%", height: 38, delay: "-2.8s" },
  { left: "86%", height: 26, delay: "-0.7s" },
];

/**
 * Everything behind the creature: mist, moss, stones, plants, light. Mostly
 * always-on ambient loops (CSS keyframes already collapse under reduced
 * motion / Calm Motion), plus a few elements that only appear once found.
 */
export function WorldEnvironment({
  discoveries,
  children,
  rippleKey,
  warmKey,
  bloomKey,
}: {
  discoveries: Discovery[];
  children: ReactNode;
  rippleKey: number;
  warmKey: number;
  bloomKey: number;
}) {
  const fireflies = hasDiscovery(discoveries, "firefly-1");
  const secondStone = hasDiscovery(discoveries, "second-stone");
  const bloomPatch = hasDiscovery(discoveries, "bloom-patch");
  const distantGlimmer = hasDiscovery(discoveries, "distant-glimmer");
  const starMoss = hasDiscovery(discoveries, "star-moss");

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--gradient-world)" }}
    >
      {/* light shafts */}
      <div
        aria-hidden
        className="absolute -top-6 left-[20%] h-2/3 w-16 rotate-6"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--mist) 30%, transparent), transparent)",
          animation: "glimmer 7s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-4 left-[62%] h-1/2 w-10 -rotate-6"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--mist) 24%, transparent), transparent)",
          animation: "glimmer 8.5s ease-in-out infinite",
          animationDelay: "-2.5s",
        }}
      />

      {distantGlimmer && (
        <div
          aria-hidden
          className="absolute right-[10%] top-[22%] size-2 rounded-full"
          style={{
            background: "var(--water)",
            boxShadow: "0 0 16px 4px color-mix(in oklab, var(--water) 60%, transparent)",
            animation: "glimmer 5s ease-in-out infinite",
          }}
        />
      )}

      {/* distant water / mist */}
      <div
        aria-hidden
        className="absolute inset-x-[-10%] bottom-[8%] h-16 rounded-[100%]"
        style={{
          background: "color-mix(in oklab, var(--water) 30%, transparent)",
          filter: "blur(10px)",
        }}
      />

      {/* a hazy midground ridge, for depth between the sky and the moss */}
      <div
        aria-hidden
        className="absolute inset-x-[-15%] bottom-[30%] h-1/3 rounded-t-[100%]"
        style={{
          background:
            "linear-gradient(180deg, transparent, color-mix(in oklab, var(--dusk) 35%, transparent))",
          filter: "blur(6px)",
        }}
      />

      {/* moss mound */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[46%] rounded-t-[50%]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--moss) 55%, transparent), color-mix(in oklab, var(--moss) 30%, var(--background)))",
        }}
      >
        {starMoss && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(2px 2px at 20% 30%, var(--mist), transparent), radial-gradient(2px 2px at 70% 50%, var(--mist), transparent), radial-gradient(1.5px 1.5px at 45% 70%, var(--mist), transparent)",
              animation: "glimmer 6s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* fireflies, hovering above the moss rather than lost behind it */}
      {fireflies &&
        FIREFLIES.map((fly, index) => (
          <span
            key={index}
            aria-hidden
            className="absolute size-1 rounded-full"
            style={
              {
                left: fly.left,
                bottom: fly.bottom,
                background: "var(--primary-glow)",
                boxShadow: "0 0 6px 1.5px color-mix(in oklab, var(--lantern) 55%, transparent)",
                "--particle-x": index % 2 === 0 ? "12px" : "-12px",
                "--particle-opacity": 0.65,
                animation: `drift-up ${fly.duration} ease-in-out infinite`,
                animationDelay: fly.delay,
              } as unknown as CSSProperties
            }
          />
        ))}

      {/* stones */}
      <div
        aria-hidden
        className="absolute bottom-[20%] left-[22%] h-4 w-8 rounded-full"
        style={{ background: "color-mix(in oklab, var(--dusk) 55%, var(--card))" }}
      />
      {secondStone && (
        <div
          aria-hidden
          className="absolute bottom-[24%] left-[34%] h-3 w-5 rounded-full"
          style={{ background: "color-mix(in oklab, var(--dusk) 45%, var(--card))" }}
        />
      )}

      {/* plants */}
      {PLANTS.map((plant, index) => (
        <div
          key={index}
          aria-hidden
          className="absolute bottom-[18%] w-1 origin-bottom rounded-full"
          style={{
            left: plant.left,
            height: plant.height,
            background: "color-mix(in oklab, var(--moss) 80%, var(--foreground))",
            animation: "sway 6.5s ease-in-out infinite",
            animationDelay: plant.delay,
          }}
        />
      ))}

      {bloomPatch && (
        <div className="absolute bottom-[19%] left-[54%] flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              aria-hidden
              className="size-2 rounded-full"
              style={{
                background: "var(--ember)",
                animation: "sway 5s ease-in-out infinite",
                animationDelay: `${index * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {children}

      {rippleKey > 0 && (
        <span
          key={rippleKey}
          aria-hidden
          className="absolute inset-x-[-10%] bottom-[10%] h-16 rounded-[100%] border"
          style={{
            borderColor: "color-mix(in oklab, var(--water) 60%, transparent)",
            animation: "ripple-out var(--dur-atmos) var(--ease-drift) both",
          }}
        />
      )}

      {warmKey > 0 && (
        <div
          key={warmKey}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 100%, color-mix(in oklab, var(--ember) 40%, transparent), transparent 65%)",
            animation: "warm-wash var(--dur-atmos) var(--ease-breath) both",
          }}
        />
      )}

      {bloomKey > 0 && (
        <div
          key={bloomKey}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 55%, color-mix(in oklab, var(--primary-glow) 35%, transparent), transparent 70%)",
            animation: "bloom 1.8s var(--ease-drift) both",
          }}
        />
      )}
    </div>
  );
}
