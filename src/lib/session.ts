import type { SessionConfig } from '../types';
import { MAX_PHASE1_LEVEL } from '../data/levels';

export const DEFAULT_CONFIG: SessionConfig = {
  level: 1,
  mode: 'echo',
  stance: 'orthodox',
  roundLengthSec: 180, // 3-minute rounds
  restLengthSec: 60, // 1-minute rest
  totalRounds: 8, // ~30+ minutes of pure shadowboxing
  repsPerCombo: 4, // blocked practice
  voiceOn: true,
};

/** Clamp a level into the range shipped in Phase 1. */
export function clampLevel(level: number): number {
  return Math.max(1, Math.min(MAX_PHASE1_LEVEL, Math.round(level)));
}

/** Approx total shadowbox minutes a config represents (rounds only). */
export function estimatedMinutes(c: SessionConfig): number {
  return Math.round((c.totalRounds * c.roundLengthSec) / 60);
}

export function mergeConfig(
  base: Partial<SessionConfig>,
  override: Partial<SessionConfig> = {},
): SessionConfig {
  return { ...DEFAULT_CONFIG, ...base, ...override };
}
