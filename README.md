# ♈ Aries — Shadowbox Trainer

> **Forged in fire.** An interactive shadowboxing trainer that calls out Muay Thai / boxing
> strikes by voice while you shadowbox in real time. Built for motor-skill acquisition —
> moving you through the *cognitive → associative → autonomous* stages of learning strike
> combinations.

This repo is being built **incrementally, phase by phase**. The brief lives in
`docs/`-style intent: numbered strikes, levels mapped to motor-learning stages, echo & react
call-out modes, spaced repetition, custom coach combos, and a Warrior identity.

---

## Status — Phase 1 (MVP) ✅

Phase 1 delivers a complete, voice-guided session end to end:

- **Strike vocabulary 1–12** with names + external-focus coaching cues.
- **Numbered voice call-outs** via the Web Speech API (`SpeechSynthesis`).
- **Echo mode** (teach → echo) for **levels 1–3**, **blocked practice** (repeat a combo
  before moving on).
- **Round timer + rest screen + bell sounds** (Web Audio): 3-min rounds / 1-min rest by
  default, fully configurable (~8 rounds ≈ 30+ min).
- **Immersive Live Round** screen: giant pulsing strike number inside a depleting timer ring,
  beat-synced flashes, combo label, rep counter.
- **Aries theme** — dark red, fire, the ram (♈): drifting embers, flame glow, forged-gold
  accents.
- **Personalization** — addresses the user as **Warrior Eftherens** with spoken + on-screen
  affirmations at session start, between rounds, and on completion. Voice can be muted.
- **Persistence** (localStorage): daily shadowbox minutes, daily-goal progress, and a
  consecutive-day **streak** survive reloads.

### Coming next

- **Phase 2** — React mode + tempo/BPM engine with audio click; levels 4–6; interleaved &
  random practice; self-report → spaced-repetition buckets.
- **Phase 3** — custom coach combos (builder + library), biomechanical combo generator with
  flavors, stats dashboard, editable affirmation bank, settings.
- **Phase 4** — Framer Motion polish, BPM-synced screen pulse, experimental motion/mic rep
  detection, JSON export/import.

---

## Tech stack

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling (custom `aries` fire palette)
- **Framer Motion** for animation
- **Web Speech API** for spoken call-outs & affirmations
- **Web Audio API** for synthesized bells / ticks
- **localStorage** for persistence — fully client-side, no backend

## Getting started

```bash
npm install
npm run dev        # start the dev server (Vite)
npm run build      # type-check + production build
npm run preview    # preview the production build
```

Open the printed local URL on a phone (or with your browser's device toolbar) — Aries is
mobile-first and meant to be propped up while you train. A browser that supports the Web
Speech API (Chrome/Edge/Safari) is recommended for voice call-outs.

## Project structure

```
src/
  data/        strikes, levels, affirmations
  lib/         speech, audio, storage, combo generation, session helpers
  hooks/       echo engine + pausable countdown
  components/  Home, SessionSetup, LiveRound, RestScreen, SessionComplete, visuals
  App.tsx      screen orchestration / session state machine
```
