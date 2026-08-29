import type { CareItem, Frequency, MovePreferences } from "./data/types";

/**
 * Gentle reminders, honestly scoped.
 *
 * V1 is local-first: reminders are scheduled in the page while Avora is open
 * (or installed and running in the background). There is no server push, so
 * we tell the person exactly what will and won't fire rather than pretending.
 */

export type NotificationCapability = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  installed: boolean;
  /** Platform caveat worth surfacing in Settings. */
  caveat: string;
};

export function describeCapability(): NotificationCapability {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return {
      supported: false,
      permission: "unsupported",
      installed: false,
      caveat: "This browser can't show reminders.",
    };
  }

  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  const isIos = /iPad|iPhone|iPod/.test(window.navigator.userAgent);

  let caveat =
    "Reminders arrive while Avora is open or running in the background. They won't arrive if the browser is fully closed.";
  if (isIos && !installed) {
    caveat =
      "On iPhone and iPad, add Avora to your home screen first — reminders can't be delivered from a browser tab.";
  }

  return { supported: true, permission: Notification.permission, installed, caveat };
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function showGentleNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico", silent: false, tag: title });
  } catch (error) {
    console.warn("Avora: could not show reminder", error);
  }
}

function dueToday(frequency: Frequency, date: Date) {
  const day = date.getDay();
  switch (frequency) {
    case "daily":
    case "twice-daily":
      return true;
    case "weekdays":
      return day >= 1 && day <= 5;
    case "weekly":
      return day === 1;
    case "as-needed":
      return false;
  }
}

export type ScheduledReminder = {
  key: string;
  at: Date;
  title: string;
  body: string;
};

function parseTime(time: string, base: Date) {
  const [hours = "9", minutes = "0"] = time.split(":");
  const at = new Date(base);
  at.setHours(Number(hours), Number(minutes), 0, 0);
  return at;
}

/** Everything due between now and end of day. */
export function collectDueReminders(
  medications: CareItem[],
  supplements: CareItem[],
  move: MovePreferences,
  now = new Date(),
): ScheduledReminder[] {
  const reminders: ScheduledReminder[] = [];

  const push = (item: CareItem, kind: "medication" | "supplement") => {
    if (!item.remindersOn || !dueToday(item.frequency, now)) return;
    const at = parseTime(item.reminderTime, now);
    reminders.push({
      key: `${kind}:${item.id}:${at.toDateString()}`,
      at,
      title: kind === "medication" ? "A gentle nudge" : "Whenever suits you",
      body:
        kind === "medication"
          ? `${item.name}${item.dose ? ` · ${item.dose}` : ""} — whenever you're ready.`
          : `${item.name}${item.dose ? ` · ${item.dose}` : ""} is here when you want it.`,
    });
  };

  medications.forEach((item) => push(item, "medication"));
  supplements.forEach((item) => push(item, "supplement"));

  if (move.reminderOn && dueToday(move.frequency, now)) {
    const at = parseTime(move.preferredTime, now);
    reminders.push({
      key: `move:${at.toDateString()}`,
      at,
      title: "A little movement, if it appeals",
      body: move.types.length
        ? `Maybe ${move.types[0]}. Or not — the offer stands.`
        : "Even a slow stretch counts.",
    });
  }

  return reminders.filter((reminder) => reminder.at.getTime() > now.getTime());
}

const fired = new Set<string>();

/**
 * Arm timers for today's remaining reminders. Returns a disposer.
 * Safe to call repeatedly — keys are de-duplicated.
 */
export function armReminders(reminders: ScheduledReminder[]) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (const reminder of reminders) {
    if (fired.has(reminder.key)) continue;
    const delay = reminder.at.getTime() - Date.now();
    if (delay <= 0 || delay > 1000 * 60 * 60 * 12) continue;
    timers.push(
      setTimeout(() => {
        fired.add(reminder.key);
        showGentleNotification(reminder.title, reminder.body);
      }, delay),
    );
  }
  return () => timers.forEach(clearTimeout);
}
