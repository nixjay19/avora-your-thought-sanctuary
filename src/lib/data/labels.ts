import type { Frequency } from "./types";

export const frequencyLabel: Record<Frequency, string> = {
  daily: "Daily",
  "twice-daily": "Twice daily",
  weekdays: "Weekdays",
  weekly: "Weekly",
  "as-needed": "As needed",
};

export const frequencies: Frequency[] = ["daily", "twice-daily", "weekdays", "weekly", "as-needed"];
