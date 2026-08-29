import { useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from "react";
import { Mic, Send, X } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import { newId, type Thought } from "@/lib/data/types";
import { interpret, splitTranscript } from "@/lib/thoughts/interpret";
import { useVoiceCapture } from "@/lib/voice/useVoiceCapture";
import { cn } from "@/lib/utils";
import { VoiceOverlay } from "./VoiceOverlay";
import { VoiceSessionReview, type ReviewSegment } from "./VoiceSessionReview";

const HOLD_THRESHOLD_MS = 260;
const MAX_HEIGHT_PX = 200;

/**
 * The one place a thought enters Avora. No categories, no settings — type or
 * speak, and it lands. Interpretation happens afterwards, quietly.
 */
export function Composer() {
  const { addThought } = useAvora();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [reviewSegments, setReviewSegments] = useState<ReviewSegment[] | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);
  const suppressClick = useRef(false);

  function commitThought(rawText: string, source: Thought["source"]) {
    const text = rawText.trim();
    if (!text) return;
    const { kind, remindAt } = interpret(text);
    addThought({ text, source, kind, remindAt });
  }

  const voice = useVoiceCapture({
    onComplete: (transcript, mode) => {
      if (mode === "quick") {
        commitThought(transcript, "voice");
        return;
      }
      const segments = splitTranscript(transcript);
      if (segments.length > 0) {
        setReviewSegments(segments.map((text) => ({ id: newId(), text })));
      }
    },
  });

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
    resize(event.target);
  }

  function handleSubmit() {
    if (!value.trim()) return;
    commitThought(value, "typed");
    setValue("");
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleClear() {
    setValue("");
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.focus();
    }
  }

  function handleMicPointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    holdFired.current = false;
    holdTimer.current = setTimeout(() => {
      holdFired.current = true;
      void voice.start("quick");
    }, HOLD_THRESHOLD_MS);
  }

  function releaseHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdFired.current) {
      holdFired.current = false;
      suppressClick.current = true;
      void voice.stop();
    }
  }

  function handleMicClick() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (voice.state === "idle") {
      void voice.start("session");
    } else if (voice.state === "listening" && voice.mode === "session") {
      void voice.stop();
    }
  }

  function handleAcceptSegment(id: string) {
    setReviewSegments((current) => {
      if (!current) return current;
      const segment = current.find((item) => item.id === id);
      if (segment) commitThought(segment.text, "voice-session");
      const next = current.filter((item) => item.id !== id);
      return next.length ? next : null;
    });
  }

  function handleDiscardSegment(id: string) {
    setReviewSegments((current) => {
      if (!current) return current;
      const next = current.filter((item) => item.id !== id);
      return next.length ? next : null;
    });
  }

  function handleAcceptAll() {
    if (reviewSegments) {
      for (const segment of reviewSegments) commitThought(segment.text, "voice-session");
    }
    setReviewSegments(null);
  }

  const overlayOpen = voice.state !== "idle";

  return (
    <div className={cn("storybook-card p-4 transition-shadow sm:p-5", focused && "composer-glow")}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="What's floating around in your head?"
        rows={1}
        aria-label="Capture a thought"
        className="w-full resize-none border-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        style={{ minHeight: "2.75rem" }}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {!focused && value.length === 0 ? "You don't have to organize it first." : ""}
        </span>

        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear"
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" strokeWidth={1.6} />
            </button>
          )}

          <button
            type="button"
            onPointerDown={handleMicPointerDown}
            onPointerUp={releaseHold}
            onPointerLeave={releaseHold}
            onPointerCancel={releaseHold}
            onClick={handleMicClick}
            disabled={voice.state === "transcribing"}
            aria-label="Speak a thought — tap to ramble, hold to speak one"
            aria-pressed={voice.state === "listening"}
            className={cn(
              "rounded-full p-2.5 text-foreground transition-colors",
              voice.state === "listening"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Mic className="size-4" strokeWidth={1.6} />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            aria-label="Save thought"
            className="rounded-full bg-primary p-2.5 text-primary-foreground shadow disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="size-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {overlayOpen && (
        <VoiceOverlay
          mode={voice.mode}
          state={voice.state}
          transcript={voice.transcript}
          level={voice.level}
          error={voice.error}
          onStopSession={() => void voice.stop()}
          onCancel={voice.cancel}
        />
      )}

      {reviewSegments && (
        <VoiceSessionReview
          segments={reviewSegments}
          onEdit={(id, text) =>
            setReviewSegments((current) =>
              current
                ? current.map((item) => (item.id === id ? { ...item, text } : item))
                : current,
            )
          }
          onAccept={handleAcceptSegment}
          onAcceptAll={handleAcceptAll}
          onDiscard={handleDiscardSegment}
          onClose={() => setReviewSegments(null)}
        />
      )}
    </div>
  );
}
