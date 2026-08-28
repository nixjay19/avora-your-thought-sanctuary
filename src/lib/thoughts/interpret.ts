import type { ThoughtKind } from "../data/types";

/**
 * Local interpretation. No network, no cost, runs in under a millisecond.
 *
 * This never changes the person's words — it only suggests a kind, which the
 * UI shows as a quiet chip they can change or ignore.
 */

const TASK_STARTERS = [
  "call",
  "email",
  "text",
  "book",
  "buy",
  "pay",
  "send",
  "finish",
  "fix",
  "clean",
  "return",
  "renew",
  "cancel",
  "print",
  "pack",
  "reply",
  "submit",
  "order",
  "schedule",
  "collect",
  "check",
];

const IDEA_MARKERS = [
  "what if",
  "wouldn't it",
  "would it be",
  "imagine",
  "idea:",
  "maybe we could",
  "it might be cool",
  "concept",
  "i wonder if we",
];

const REMINDER_MARKERS = [
  "remind me",
  "don't forget",
  "dont forget",
  "remember to",
  "at ",
  "tomorrow",
  "tonight",
  "later today",
  "this evening",
  "next week",
  "on monday",
  "on tuesday",
  "on wednesday",
  "on thursday",
  "on friday",
  "on saturday",
  "on sunday",
];

const TIME_PATTERN =
  /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\bat\s+(\d{1,2}):(\d{2})\b/i;

export type Interpretation = {
  kind: ThoughtKind;
  remindAt?: string | undefined;
  /** Rough confidence, used only to decide how quietly to show the chip. */
  confidence: number;
};

/** Parse a friendly time reference into an ISO timestamp, when one is clear. */
export function parseRemindAt(text: string, from = new Date()): string | undefined {
  const lower = text.toLowerCase();
  const match = TIME_PATTERN.exec(lower);
  const base = new Date(from);

  let hours: number | null = null;
  let minutes = 0;

  if (match) {
    if (match[1]) {
      hours = Number(match[1]);
      minutes = match[2] ? Number(match[2]) : 0;
      const meridiem = match[3]?.toLowerCase();
      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
    } else if (match[4]) {
      hours = Number(match[4]);
      minutes = Number(match[5] ?? 0);
    }
  }

  const dayOffsets: [RegExp, number][] = [
    [/\btomorrow\b/, 1],
    [/\bnext week\b/, 7];
  ];
  let dayOffset = 0;
  for (const [pattern, offset] of dayOffsets) {
    if (pattern.test(lower)) dayOffset = offset;
  }

  if (/\btonight\b|\bthis evening\b/.test(lower) && hours === null) hours = 20;
  if (/\bthis morning\b/.test(lower) && hours === null) hours = 9;

  if (hours === null && dayOffset === 0) return undefined;

  base.setDate(base.getDate() + dayOffset);
  base.setHours(hours ?? 9, minutes, 0, 0);
  if (base.getTime() < from.getTime()) base.setDate(base.getDate() + 1);
  return base.toISOString();
}

export function interpret(text: string, from = new Date()): Interpretation {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const firstWord = lower.split(/\s+/)[0] ?? "";

  if (IDEA_MARKERS.some((marker) => lower.includes(marker))) {
    return { kind: "idea", confidence: 0.75 };
  }

  const hasReminderMarker = REMINDER_MARKERS.some((marker) => lower.includes(marker));
  const remindAt = parseRemindAt(trimmed, from);
  if (hasReminderMarker && remindAt) {
    return { kind: "reminder", remindAt, confidence: 0.85 };
  }
  if (lower.startsWith("remind me") || lower.includes("don't forget")) {
    return { kind: "reminder", remindAt, confidence: 0.7 };
  }

  if (TASK_STARTERS.includes(firstWord) || /^i (need|have) to\b/.test(lower)) {
    return { kind: "task", remindAt, confidence: 0.8 };
  }

  if (trimmed.endsWith("?")) return { kind: "idea", confidence: 0.4 };

  return { kind: "note", confidence: 0.5 };
}

/**
 * Split a spoken ramble into separate thoughts. Sentence boundaries plus the
 * connectors people actually use out loud ("and also", "oh and", "another thing").
 */
export function splitTranscript(transcript: string): string[] {
  const normalised = transcript
    .replace(/\s+/g, " ")
    .replace(/\b(?:oh(?:,)? and|and also|also,|another thing|next thing|plus,)\b/gi, "|")
    .trim();

  return normalised
    .split(/\|+|(?<=[.!?])\s+/)
    .map((part) => part.trim().replace(/^[,;:-]\s*/, ""))
    .filter((part) => part.split(/\s+/).length > 1);
}

export const kindLabel: Record<ThoughtKind, string> = {
  note: "note",
  task: "task",
  idea: "idea",
  reminder: "reminder",
};
