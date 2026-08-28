import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { clearDocument, readDocument, writeDocument } from "./idb";
import {
  createEmptyData,
  newId,
  timestamp,
  SCHEMA_VERSION,
  type AvoraData,
  type CareArea,
  type CareEvent,
  type CareItem,
  type FoodPreferences,
  type MovePreferences,
  type Preferences,
  type Thought,
  type ThoughtKind,
  type WorldState,
} from "./types";
import { emitWorldEvent, type WorldEventKind } from "../motion/world-events";

type CareItemDraft = Omit<CareItem, "id" | "createdAt" | "updatedAt">;

type Store = {
  ready: boolean;
  data: AvoraData;
  addThought: (input: {
    text: string;
    source: Thought["source"];
    kind: ThoughtKind;
    remindAt?: string | undefined;
  }) => Thought;
  setThoughtKind: (id: string, kind: ThoughtKind) => void;
  toggleThoughtDone: (id: string) => void;
  removeThought: (id: string) => void;
  logCare: (area: CareArea, options?: { itemId?: string; note?: string }) => void;
  addCareItem: (list: "medications" | "supplements", draft: CareItemDraft) => void;
  updateCareItem: (
    list: "medications" | "supplements",
    id: string,
    patch: Partial<CareItemDraft>,
  ) => void;
  removeCareItem: (list: "medications" | "supplements", id: string) => void;
  setFood: (patch: Partial<FoodPreferences>) => void;
  setMove: (patch: Partial<MovePreferences>) => void;
  setPreferences: (patch: Partial<Preferences>) => void;
  updateWorld: (patch: Partial<WorldState>) => void;
  exportJson: () => string;
  importJson: (raw: string) => { ok: boolean; error?: string };
  eraseEverything: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

const MOMENT_CAP = 12;

const careEventKind: Record<CareArea, WorldEventKind> = {
  nourish: "nourished",
  medication: "medication-taken",
  supplements: "supplements-taken",
  move: "moved",
};

function migrate(input: unknown): AvoraData {
  const empty = createEmptyData();
  if (!input || typeof input !== "object") return empty;
  const stored = input as Partial<AvoraData>;
  return {
    ...empty,
    ...stored,
    schemaVersion: SCHEMA_VERSION,
    food: { ...empty.food, ...stored.food },
    move: { ...empty.move, ...stored.move },
    world: { ...empty.world, ...stored.world },
    preferences: { ...empty.preferences, ...stored.preferences },
    thoughts: stored.thoughts ?? [],
    medications: stored.medications ?? [],
    supplements: stored.supplements ?? [],
    careEvents: stored.careEvents ?? [],
  };
}

export function AvoraProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AvoraData>(() => createEmptyData());
  const [ready, setReady] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    readDocument<AvoraData>()
      .then((stored) => {
        if (cancelled) return;
        if (stored) setData(migrate(stored));
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !dirty.current) return;
    void writeDocument(data);
  }, [data, ready]);

  const mutate = useCallback((updater: (current: AvoraData) => AvoraData) => {
    dirty.current = true;
    setData((current) => updater(current));
  }, []);

  const recordMoment = useCallback(
    (current: AvoraData, kind: string): AvoraData => {
      const at = timestamp();
      const world = current.world;
      return {
        ...current,
        world: {
          ...world,
          richness: Math.min(100, world.richness + 1),
          recentMoments: [{ kind, at }, ...world.recentMoments].slice(0, MOMENT_CAP),
          pendingMoments: [{ kind, at }, ...world.pendingMoments].slice(0, MOMENT_CAP),
          updatedAt: at,
        },
      };
    },
    [],
  );

  const addThought = useCallback<Store["addThought"]>(
    ({ text, source, kind, remindAt }) => {
      const at = timestamp();
      const thought: Thought = {
        id: newId(),
        text,
        source,
        kind,
        kindConfirmed: false,
        remindAt,
        done: false,
        createdAt: at,
        updatedAt: at,
      };
      mutate((current) =>
        recordMoment({ ...current, thoughts: [thought, ...current.thoughts] }, "thought-captured"),
      );
      emitWorldEvent("thought-captured");
      return thought;
    },
    [mutate, recordMoment],
  );

  const setThoughtKind = useCallback<Store["setThoughtKind"]>(
    (id, kind) => {
      mutate((current) => ({
        ...current,
        thoughts: current.thoughts.map((thought) =>
          thought.id === id
            ? { ...thought, kind, kindConfirmed: true, updatedAt: timestamp() }
            : thought,
        ),
      }));
    },
    [mutate],
  );

  const toggleThoughtDone = useCallback<Store["toggleThoughtDone"]>(
    (id) => {
      mutate((current) => ({
        ...current,
        thoughts: current.thoughts.map((thought) =>
          thought.id === id
            ? { ...thought, done: !thought.done, updatedAt: timestamp() }
            : thought,
        ),
      }));
    },
    [mutate],
  );

  const removeThought = useCallback<Store["removeThought"]>(
    (id) => {
      mutate((current) => ({
        ...current,
        thoughts: current.thoughts.filter((thought) => thought.id !== id),
      }));
    },
    [mutate],
  );

  const logCare = useCallback<Store["logCare"]>(
    (area, options) => {
      const event: CareEvent = {
        id: newId(),
        area,
        itemId: options?.itemId,
        note: options?.note,
        at: timestamp(),
      };
      mutate((current) =>
        recordMoment(
          { ...current, careEvents: [event, ...current.careEvents] },
          careEventKind[area],
        ),
      );
      emitWorldEvent(careEventKind[area]);
    },
    [mutate, recordMoment],
  );

  const addCareItem = useCallback<Store["addCareItem"]>(
    (list, draft) => {
      const at = timestamp();
      const item: CareItem = { ...draft, id: newId(), createdAt: at, updatedAt: at };
      mutate((current) => ({ ...current, [list]: [...current[list], item] }));
    },
    [mutate],
  );

  const updateCareItem = useCallback<Store["updateCareItem"]>(
    (list, id, patch) => {
      mutate((current) => ({
        ...current,
        [list]: current[list].map((item) =>
          item.id === id ? { ...item, ...patch, updatedAt: timestamp() } : item,
        ),
      }));
    },
    [mutate],
  );

  const removeCareItem = useCallback<Store["removeCareItem"]>(
    (list, id) => {
      mutate((current) => ({
        ...current,
        [list]: current[list].filter((item) => item.id !== id),
      }));
    },
    [mutate],
  );

  const setFood = useCallback<Store["setFood"]>(
    (patch) => mutate((current) => ({ ...current, food: { ...current.food, ...patch } })),
    [mutate],
  );

  const setMove = useCallback<Store["setMove"]>(
    (patch) => mutate((current) => ({ ...current, move: { ...current.move, ...patch } })),
    [mutate],
  );

  const setPreferences = useCallback<Store["setPreferences"]>(
    (patch) =>
      mutate((current) => ({
        ...current,
        preferences: { ...current.preferences, ...patch },
      })),
    [mutate],
  );

  const updateWorld = useCallback<Store["updateWorld"]>(
    (patch) =>
      mutate((current) => ({
        ...current,
        world: { ...current.world, ...patch, updatedAt: timestamp() },
      })),
    [mutate],
  );

  const exportJson = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importJson = useCallback<Store["importJson"]>(
    (raw) => {
      try {
        const parsed = JSON.parse(raw);
        mutate(() => migrate(parsed));
        return { ok: true };
      } catch {
        return { ok: false, error: "That file didn't look like an Avora export." };
      }
    },
    [mutate],
  );

  const eraseEverything = useCallback(async () => {
    await clearDocument();
    dirty.current = false;
    setData(createEmptyData());
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      data,
      addThought,
      setThoughtKind,
      toggleThoughtDone,
      removeThought,
      logCare,
      addCareItem,
      updateCareItem,
      removeCareItem,
      setFood,
      setMove,
      setPreferences,
      updateWorld,
      exportJson,
      importJson,
      eraseEverything,
    }),
    [
      ready,
      data,
      addThought,
      setThoughtKind,
      toggleThoughtDone,
      removeThought,
      logCare,
      addCareItem,
      updateCareItem,
      removeCareItem,
      setFood,
      setMove,
      setPreferences,
      updateWorld,
      exportJson,
      importJson,
      eraseEverything,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAvora() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAvora must be used inside AvoraProvider");
  return store;
}
