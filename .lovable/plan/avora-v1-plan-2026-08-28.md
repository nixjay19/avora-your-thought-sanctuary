# Avora — V1 Plan

A private sanctuary app with three spaces: **Thoughts**, **Sanctuary**, and **World**. V1 is local-first (no account, no cloud), designed so accounts and sync can be added later without restructuring.

Avora is not a productivity, fitness, nutrition, medication, or habit-tracking app. These are individual ways a person can care for themselves. The product's purpose is to help people externalise what's in their head, notice what they need, and gently care for themselves without turning care into performance.

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

Gentle, unhurried, first-person. No compliance dashboard, no metrics surfaced anywhere. Warm dark-leaning palette with soft light, generous spacing.

## Motion direction (core, not polish)

Avora should read as a living illustrated storybook world. Motion is built alongside each feature, not added afterwards — every screen below ships with its motion behaviour defined.

**Motion language**: slow, organic, soft, atmospheric. Tactile and slightly magical. Closer to turning a page, breathing, drifting, glowing and rippling than to bouncing cards or standard app micro-interactions. Long easings (600–1200ms for atmosphere, 200–400ms for touch feedback), no springs that overshoot, no snap.

**Emotional rule — Avora notices, it does not judge.** No confetti, achievement explosions, streak celebrations, XP, punishment or shame states, aggressive progress mechanics, or excessive bounce. The creature communicates personality through visual behaviour, not constant text or chat dialogue.

**Ambient world layer** (always running on the World page, independent of the user):

- Creature: breathing loop, blinking, glancing around, stretching, dozing, small drifting wander — several loops at different speeds so it never reads as a single repeating cycle.
- Environment: drifting particles, fireflies, slow-moving light shafts, mist, water shimmer, swaying foliage — each on its own slow cycle with randomised offsets.
- Lighting: a slow tint/brightness drift tied to time of day, transitioning over long crossfades rather than switching.

**Reactive moments** (the world responding to presence, never scoring it):

- Arriving in World: a soft bloom of light, the creature turning toward you, environment easing into focus.
- Capturing a thought: a subtle ripple crosses the world and the creature notices — a glance, an ear-turn, a brief glimmer.
- Completing a care action: warmth and light flow inward; the palette shifts a touch warmer for a while.
- Moving: the creature becomes playful — bouncier idles, faster particles, brighter glow.
- Returning after time away: a welcoming brightening and a small discovery, never a reproach. Absence produces no visual decay.

**UI motion across the app**:

- Page transitions: page-turn-like crossfade with a slight parallax drift between spaces.
- Thought capture: the composer breathes as you type; saving sends the thought upward as a soft dissolve into the stream, which settles rather than pops.
- Voice: a slow organic pulse ring that responds to input level; session mode shows a drifting waveform, not a jittery meter. Transcription arrives as words fading in.
- Care actions: the tap fills the card with warm light; "Tended with care ✨" fades in and drifts away quietly.
- Confirmations and notifications: fade-and-drift, never toast-slam.
- Discoveries: revealed by a slow fade with a faint shimmer — found, not awarded.

**Performance and cost**: CSS animations and transforms first, with `requestAnimationFrame` only where genuinely needed; layered SVG/CSS illustrations rather than sprite sheets or 3D. No WebGL, no Three.js, no heavy animation library. Animate `transform`/`opacity`/`filter` only, cap concurrent particles, and pause the ambient loop when the World page isn't visible.

**Reduced motion**: `prefers-reduced-motion` is honoured everywhere — ambient loops stop, reactions become gentle opacity/colour changes, transitions become instant crossfades. The world still feels warm, just still. An in-app "calm motion" toggle mirrors this for users who want it regardless of OS setting.

**Future headroom**: all motion lives behind a small `src/lib/motion` layer (tokens for durations/easings, a `useAmbientLoop` hook, a world-event bus that reactions subscribe to). Richer creature animation later — more states, richer art, or a canvas renderer — swaps the renderer behind that boundary without touching feature code.

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

1. Design system, motion tokens (`src/lib/motion`), world-event bus, shell, navigation, and local data layer with stable IDs.
2. Thoughts: typed capture, stream, local interpretation, filters, search — with their motion behaviour built in.
3. Voice: hold-to-speak and session mode, organic pulse/waveform, splitting, transcription fallback.
4. Sanctuary: four cards, gentle light-fill actions, care config screens, curated meal library.
5. Reminders and permission handling.
6. World: creature art, ambient idle system, environmental life, moods, reactive moments, discoveries.
7. Export/import, reduced-motion and accessibility pass, performance tuning.