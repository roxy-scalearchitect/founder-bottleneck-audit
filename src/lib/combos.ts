import type { Combo } from '../types';

// Phase 1 combo source. The full biomechanically-valid generator with
// "flavors" lands in Phase 3; here we produce simple, readable combos of the
// level's chain length with a couple of light realism touches so they flow.

// Cognitive/associative stages drill from the core boxing + kick set
// (punches 1–6 plus kicks 7–8). Knees, teep and elbow enter in later phases.
const PHASE1_POOL = [1, 2, 3, 4, 5, 6, 7, 8];
const KICKS = new Set([7, 8]);

let comboCounter = 0;

function nextId(): string {
  comboCounter += 1;
  return `gen-${Date.now().toString(36)}-${comboCounter}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** A fresh generated combo of `length` strikes for the given level. */
export function generateCombo(level: number, length: number): Combo {
  const strikes: number[] = [];
  let consecutiveKicks = 0;

  for (let i = 0; i < length; i++) {
    let candidates = PHASE1_POOL;

    // Most combos open with a hand strike that sets up everything else.
    if (i === 0) candidates = candidates.filter((n) => !KICKS.has(n));

    // No more than 2 kicks in a row.
    if (consecutiveKicks >= 2) candidates = candidates.filter((n) => !KICKS.has(n));

    // Avoid throwing the exact same strike twice back-to-back.
    const prev = strikes[i - 1];
    if (prev !== undefined) {
      const filtered = candidates.filter((n) => n !== prev);
      if (filtered.length) candidates = filtered;
    }

    const chosen = pick(candidates);
    strikes.push(chosen);
    consecutiveKicks = KICKS.has(chosen) ? consecutiveKicks + 1 : 0;
  }

  return {
    id: nextId(),
    strikes,
    level,
    source: 'generated',
    timesSeen: 0,
    timesSuccess: 0,
    difficultyBucket: 2,
    lastSeen: Date.now(),
  };
}

/** Pretty label like "1 · 2 · 8" for on-screen display. */
export function comboLabel(strikes: number[]): string {
  return strikes.join(' · ');
}
