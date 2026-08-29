import { Mic, X } from "lucide-react";

import type { VoiceMode, VoiceState } from "@/lib/voice/useVoiceCapture";
import { cn } from "@/lib/utils";

/**
 * "I'm listening" — not a recording studio. One breathing circle, the words
 * as they arrive, and a way out. Session mode adds a tap-to-stop affordance;
 * hold mode just waits for the finger to lift.
 */
export function VoiceOverlay({
  mode,
  state,
  transcript,
  level,
  error,
  onStopSession,
  onCancel,
}: {
  mode: VoiceMode;
  state: VoiceState;
  transcript: string;
  level: number;
  error: string | null;
  onStopSession: () => void;
  onCancel: () => void;
}) {
  const listening = state === "listening";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{
        backgroundColor: "color-mix(in oklab, var(--background) 88%, transparent)",
        backdropFilter: "blur(18px)",
      }}
      role="dialog"
      aria-label="Voice capture"
    >
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel"
        className="absolute right-5 top-6 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-5" strokeWidth={1.6} />
      </button>

      <div className="relative flex size-28 items-center justify-center">
        {listening && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid color-mix(in oklab, var(--lantern) 55%, transparent)",
              animation: "pulse-ring 2.4s var(--ease-breath) infinite",
            }}
          />
        )}
        <span
          aria-hidden
          className="absolute inset-3 rounded-full"
          style={{
            background: "var(--gradient-lantern)",
            boxShadow: "var(--glow-soft)",
            transform: `scale(${1 + level * 0.22})`,
            transition: "transform 140ms ease-out",
          }}
        />
        <Mic className="relative size-7 text-primary-foreground" strokeWidth={1.6} />
      </div>

      <p className="mt-8 text-center font-[var(--font-display)] text-lg text-foreground">
        {state === "transcribing"
          ? "Making sense of that…"
          : state === "error"
            ? "Something interrupted"
            : "I'm listening."}
      </p>

      {listening && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "quick" ? "Release to save it." : "Ramble as long as you need. Tap to stop."}
        </p>
      )}

      {(transcript || listening) && (
        <p
          key={transcript.length}
          className="mt-6 max-w-md text-center text-base leading-relaxed text-foreground/90"
          style={{ animation: "word-in var(--dur-touch) var(--ease-drift) both" }}
        >
          {transcript || "…"}
        </p>
      )}

      {error && <p className="mt-6 max-w-sm text-center text-sm text-destructive">{error}</p>}

      {state === "error" ? (
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "mt-8 rounded-full px-5 py-2 text-sm text-foreground",
            "border border-border/70 bg-card/60 hover:bg-card",
          )}
        >
          Okay
        </button>
      ) : (
        mode === "session" &&
        listening && (
          <button
            type="button"
            onClick={onStopSession}
            className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow"
          >
            Stop
          </button>
        )
      )}
    </div>
  );
}
