import type { CallMode } from '../types';

export interface LevelDef {
  level: number;
  chainLength: number;
  stage: string;
  mode: CallMode;
  practice: string;
  tempo: string;
  /** Milliseconds each strike number is shown/spoken during echo "listen". */
  echoStepMs: number;
  /** Pause after the combo before the user's turn. */
  echoPromptMs: number;
  /** How long the user gets to perform, as a multiple of the listen time. */
  performFactor: number;
}

// Phase 1 ships levels 1–3 (echo, blocked / light interleave, cognitive →
// associative). Levels 4–6 are defined for later phases.
export const LEVELS: LevelDef[] = [
  {
    level: 1,
    chainLength: 1,
    stage: 'Cognitive',
    mode: 'echo',
    practice: 'Blocked',
    tempo: 'Slow',
    echoStepMs: 1100,
    echoPromptMs: 900,
    performFactor: 1.6,
  },
  {
    level: 2,
    chainLength: 2,
    stage: 'Cognitive',
    mode: 'echo',
    practice: 'Blocked',
    tempo: 'Slow',
    echoStepMs: 1000,
    echoPromptMs: 850,
    performFactor: 1.5,
  },
  {
    level: 3,
    chainLength: 3,
    stage: 'Associative',
    mode: 'echo',
    practice: 'Blocked → light interleave',
    tempo: 'Medium',
    echoStepMs: 850,
    echoPromptMs: 800,
    performFactor: 1.4,
  },
];

export const MAX_PHASE1_LEVEL = LEVELS.length;

export function getLevel(level: number): LevelDef {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}
