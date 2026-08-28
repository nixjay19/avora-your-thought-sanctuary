# Avora — V1 Plan

A private sanctuary app with three spaces: **Thoughts**, **Sanctuary**, and **World**. V1 is local-first (no account, no cloud), designed so accounts and sync can be added later without restructuring.

## Product shape

Three main routes plus settings, with a soft bottom navigation on mobile:

```text
/            Thoughts  — capture + stream of everything
/sanctuary   Care      — Nourish, Medication, Supplements, Move
/world       World     — the companion and its little place
/settings    Preferences, care setup, data export, reminders
```

## 1. Thoughts

Capture first, interpret later. The composer sits at the bottom, always focused-ready.

- **Type**: one field, no category picker. Enter saves.
- **Speak — two modes**:
  - *Hold to speak*: press and hold, live waveform, releases into one thought.
  - *Session*: tap once, ramble freely; on stop Avora splits the transcript into separate thoughts you can accept or merge.
- **Original words are never overwritten.** Interpretation (note / task / idea / reminder) is stored as a separate suggested layer with a quiet chip you can change or ignore.
- **Interpretation engine**: local heuristics first (verb phrasing, dates/times, "remind me", "what if", question marks). AI interpretation is optional, batched, and off by default — the app is fully usable without it.
- Stream view: reverse-chronological, gentle grouping by day, filter chips for the four kinds, plus search. Tasks get a soft checkbox; reminders with a parsed time get a time chip.
- Speed target: capture in under five seconds — app opens with the composer ready, no modal, no required choices.

## 2. Sanctuary

Four cards: **Nourish & Eat**, **Medication**, **Supplements**, **Move**. Each shows today's gentle state and one action.

- Actions use the requested language: "I ate", "I took it", "I took them", "I moved". After tapping: **"Tended with care ✨"**.
- No calories, weight, streaks, percentages, XP, guilt, or missed-goal warnings. Untended items simply stay quiet — never red, never nagging.
- **Meal ideas** come from a curated local library (~80–120 recipes) tagged by ingredients, effort level, warmth, and time of day. Suggestions filter against saved preferences: foods avoided, foods you don't eat, foods you like, preferred cooking effort. AI is an optional "surprise me" that only fires on explicit tap.
- **Configuration** (all in Settings, editable anytime):
  - Food: avoid list, don't-eat list, likes, preferred cooking effort.
  - Medication & Supplements: name, dose, reminder time, frequency, optional notes.
  - Move: preferred movement types, optional reminder, preferred time, frequency.
- **Reminders**: local notifications via the Notifications API plus a service worker, scheduled while the app is installed/open. Permission is requested in context with an honest explanation, and Settings shows exactly what will and won't fire.

## 3. World

A separate, immersive page — like opening a page in a storybook. One original fantasy creature in its own small environment. Not a game, not a pet to manage.

- **Creature**: original design — a small luminous, curious being with expressive eyes and a soft glow trail. Magical, warm, slightly mysterious; adorable without being childish. No mascot, Tamagotchi, or Pokémon-like framing.
- **Idle life**: breathing, blinking, looking around, stretching, dozing, small wandering — always running, independent of the user.
- **Emotional states**: curious, content, sleepy, excited, peaceful. Chosen from time of day plus the creature's own drift, softened by recent moments of connection.
- **Gentle reactions**: arriving in World, capturing a thought (it notices a new light or sound), completing a care ritual (the world warms briefly), moving (it turns playful). Evening settles it down.
- **Discoveries**: a slow, non-punishing trickle of small environmental additions — a firefly cluster, a new bloom, a stone, a distant glimmer. Revealed as surprises, never framed as rewards, never announced as points.
- **Interaction**: tap to get a response; one simple gesture (a gentle pat or wave). Nothing to feed, clean, refill, or maintain.
- **Explicitly absent**: hunger/health/energy meters, inventory, currency, XP, levels, streaks, timers, combat, quests, daily missions, punishments, and any "you haven't visited" message. Inactivity produces no negative state; the world was alive before you arrived and continues after you leave.

## Tone and language

Gentle, unhurried, first-person. No compliance dashboard, no metrics surfaced anywhere. Warm dark-leaning palette with soft light, generous spacing, restrained motion that respects reduced-motion preferences.

---

## Technical notes

- **Stack**: TanStack Start + React + Tailwind, client-rendered app surfaces.
- **Storage**: IndexedDB (via a thin typed repository layer) for thoughts, care config, care events, world/companion state, and preferences. Every entity gets a stable UUID, `createdAt`/`updatedAt`, and a `schemaVersion`, so a later sync layer can diff and upload without a migration of meaning.
- **Repository boundary**: all reads/writes go through `src/lib/data/*` repositories. Adding cloud sync later means adding a remote adapter behind that boundary, not rewriting features.
- **Voice**: Web Speech API where supported (instant, free, on-device). Fallback: record PCM → WAV and transcribe server-side through Lovable AI (`openai/gpt-4o-mini-transcribe`, streaming). The fallback is the one place a server call is involved; the app degrades to typing where neither is available.
- **World rendering**: layered CSS/SVG with keyframed and spring-ish animations — no game engine, no WebGL. Creature art produced as layered assets so limbs/eyes/glow animate independently.
- **World state**: a small deterministic model (`mood`, `affinity`, `discoveredItems[]`, `lastVisit`, `recentMoments[]`) advanced by a tick on visit — never a background loop, never decaying below a floor.
- **Notifications**: service worker + Notification API with time-based scheduling on app open; honest capability reporting in Settings.
- **Data control**: export/import JSON, and a clear "delete everything" action.

## Local-first limitations to accept in V1

- Data lives on one browser/device — clearing site data loses it. Mitigated by JSON export and an explicit warning on first run.
- No cross-device sync, no shared access, no server-side backup.
- Reminders only fire reliably when the app has been opened and permission granted; iOS Safari requires the app be installed to the home screen and still delivers less reliably than a native app. No guaranteed push while the app is fully closed.
- Voice fallback transcription needs the server route; pure offline voice depends on browser speech support.
- AI meal "surprise me" and AI interpretation need connectivity; both are optional.

## Would require a backend later

- Accounts, cloud sync, multi-device continuity, and backup/restore.
- Guaranteed push notifications for medication and supplement reminders.
- Sharing, companion continuity across devices, and any long-term analytics.

## Build order

1. Design system, shell, navigation, and local data layer with stable IDs.
2. Thoughts: typed capture, stream, local interpretation, filters, search.
3. Voice: hold-to-speak and session mode, with splitting and the transcription fallback.
4. Sanctuary: four cards, gentle actions, care config screens, curated meal library.
5. Reminders and permission handling.
6. World: creature art, idle animation system, moods, reactions, discoveries.
7. Export/import, polish, reduced-motion and accessibility pass.
