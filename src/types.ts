// Core data models for Aries.
// Phase 1 implements a subset (echo mode, levels 1–3, blocked practice),
// but the shapes are defined ahead so later phases slot in cleanly.

export type StrikeType = 'punch' | 'kick' | 'knee' | 'elbow' | 'teep';

export type Stance = 'orthodox' | 'southpaw';

export interface Strike {
  id: number; // 1–12
  name: string;
  type: StrikeType;
  side: 'lead' | 'rear' | 'either';
  cue?: string; // external-focus coaching cue
}

export type CallMode = 'echo' | 'react';

export interface Combo {
  id: string;
  strikes: number[]; // e.g. [1,2,3,8]
  level: number; // chain length 1–6
  source: 'preset' | 'custom' | 'generated';
  label?: string;
  // Spaced-repetition tracking (used from Phase 2 onward).
  timesSeen: number;
  timesSuccess: number;
  difficultyBucket: 0 | 1 | 2 | 3; // 0 = mastered, 3 = leech
  lastSeen: number;
}

export interface SessionConfig {
  level: number; // 1–3 in Phase 1
  mode: CallMode; // 'echo' only in Phase 1
  stance: Stance;
  roundLengthSec: number;
  restLengthSec: number;
  totalRounds: number;
  repsPerCombo: number; // blocked practice: same combo repeated this many times
  voiceOn: boolean;
}

export interface SessionLog {
  date: string;
  durationSec: number;
  rounds: number;
  combosDrilled: number;
  level: number;
  mode: CallMode;
}
