/**
 * Avora data model.
 *
 * Every entity carries a stable UUID plus createdAt/updatedAt so a later
 * cloud-sync adapter can diff and upload records without changing meaning.
 * SCHEMA_VERSION is stamped on export payloads and on the root document.
 */

export const SCHEMA_VERSION = 1;

export type ThoughtKind = "note" | "task" | "idea" | "reminder";

export type Thought = {
  id: string;
  /** The user's original words. Never rewritten. */
  text: string;
  /** How it was captured. */
  source: "typed" | "voice" | "voice-session";
  /** Suggested interpretation — a separate layer over the original text. */
  kind: ThoughtKind;
  /** True once the person has confirmed or changed the interpretation. */
  kindConfirmed: boolean;
  /** Parsed time for reminders, ISO string. */
  remindAt?: string | undefined;
  done?: boolean | undefined;
  createdAt: string;
  updatedAt: string;
};

export type CookingEffort = "none" | "minimal" | "some" | "happy-to-cook";

export type FoodPreferences = {
  avoid: string[];
  dontEat: string[];
  likes: string[];
  effort: CookingEffort;
};

export type Frequency = "daily" | "twice-daily" | "weekdays" | "weekly" | "as-needed";

export type CareItem = {
  id: string;
  name: string;
  dose: string;
  reminderTime: string; // "08:30"
  frequency: Frequency;
  notes?: string | undefined;
  remindersOn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MovePreferences = {
  types: string[];
  reminderOn: boolean;
  preferredTime: string;
  frequency: Frequency;
};

export type CareArea = "nourish" | "medication" | "supplements" | "move";

export type CareEvent = {
  id: string;
  area: CareArea;
  /** Optional reference to the medication/supplement item. */
  itemId?: string | undefined;
  note?: string | undefined;
  at: string;
};

export type CreatureMood = "curious" | "content" | "sleepy" | "excited" | "peaceful";

export type Discovery = {
  id: string;
  key: string;
  foundAt: string;
};

export type WorldState = {
  /** Slow-growing richness of the environment. Never decreases. */
  richness: number;
  mood: CreatureMood;
  discoveries: Discovery[];
  lastVisit?: string | undefined;
  /** Recent moments of connection, newest first, capped. */
  recentMoments: { kind: string; at: string }[];
  /** Moments that happened outside the World, waiting to be acknowledged. */
  pendingMoments: { kind: string; at: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Preferences = {
  calmMotion: boolean;
  aiInterpretation: boolean;
  aiMealIdeas: boolean;
  seenWelcome: boolean;
  creatureName: string;
};

export type AvoraData = {
  schemaVersion: number;
  thoughts: Thought[];
  medications: CareItem[];
  supplements: CareItem[];
  food: FoodPreferences;
  move: MovePreferences;
  careEvents: CareEvent[];
  world: WorldState;
  preferences: Preferences;
};

const now = () => new Date().toISOString();

export function createEmptyData(): AvoraData {
  const stamp = now();
  return {
    schemaVersion: SCHEMA_VERSION,
    thoughts: [],
    medications: [],
    supplements: [],
    food: { avoid: [], dontEat: [], likes: [], effort: "minimal" },
    move: {
      types: [],
      reminderOn: false,
      preferredTime: "17:30",
      frequency: "daily",
    },
    careEvents: [],
    world: {
      richness: 0,
      mood: "curious",
      discoveries: [],
      recentMoments: [],
      pendingMoments: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
    preferences: {
      calmMotion: false,
      aiInterpretation: false,
      aiMealIdeas: false,
      seenWelcome: false,
      creatureName: "Lumen",
    },
  };
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function timestamp() {
  return now();
}
