import { Check, X } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

export type ReviewSegment = { id: string; text: string };

/**
 * After a rambled session, Avora split the transcript into separate thoughts.
 * Nothing is saved yet — this is a quiet moment to accept, tidy the wording,
 * merge two lines by editing one and discarding the other, or let one go.
 */
export function VoiceSessionReview({
  segments,
  onEdit,
  onAccept,
  onAcceptAll,
  onDiscard,
  onClose,
}: {
  segments: ReviewSegment[];
  onEdit: (id: string, text: string) => void;
  onAccept: (id: string) => void;
  onAcceptAll: () => void;
  onDiscard: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{
        backgroundColor: "color-mix(in oklab, var(--background) 82%, transparent)",
        backdropFilter: "blur(14px)",
      }}
      role="dialog"
      aria-label="Review captured thoughts"
    >
      <div
        className="storybook-card settle w-full max-w-lg p-5 sm:mb-0"
        style={{ marginBottom: "5.5rem" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base text-foreground">
            {segments.length === 1 ? "One thought caught" : `${segments.length} thoughts caught`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review"
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.6} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit anything, or fold two together by copying one into the other.
        </p>

        <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-start gap-2">
              <Textarea
                value={segment.text}
                onChange={(event) => onEdit(segment.id, event.target.value)}
                rows={2}
                className="flex-1 resize-none rounded-xl border-border/70 bg-card/50 text-sm"
              />
              <div className="flex flex-col gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => onAccept(segment.id)}
                  disabled={!segment.text.trim()}
                  aria-label="Add this thought"
                  className="rounded-full bg-primary/90 p-1.5 text-primary-foreground disabled:opacity-40"
                >
                  <Check className="size-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => onDiscard(segment.id)}
                  aria-label="Discard this thought"
                  className="rounded-full border border-border/70 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Discard all
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
          >
            Add all
          </button>
        </div>
      </div>
    </div>
  );
}
