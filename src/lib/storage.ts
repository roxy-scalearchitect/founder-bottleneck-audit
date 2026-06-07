import type { SessionConfig } from '../types';

// All persistence is client-side localStorage. Phase 1 stores daily minutes,
// streak inputs, the voice toggle and the last-used session config.

const KEY = 'aries.store.v1';

export const DAILY_GOAL_MIN = 30;

export interface AriesStore {
  /** date (YYYY-MM-DD, local) -> shadowbox minutes that day */
  days: Record<string, number>;
  voiceOn: boolean;
  lastConfig: Partial<SessionConfig>;
}

const DEFAULT_STORE: AriesStore = {
  days: {},
  voiceOn: true,
  lastConfig: {},
};

export function todayKey(d: Date = new Date()): string {
  // Local date, not UTC, so "today" matches the user's day.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadStore(): AriesStore {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<AriesStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      days: parsed.days ?? {},
      lastConfig: parsed.lastConfig ?? {},
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveStore(store: AriesStore): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

/** Add minutes (can be fractional) to today's tally and persist. Returns the new store. */
export function addMinutesToday(min: number): AriesStore {
  const store = loadStore();
  const key = todayKey();
  store.days[key] = (store.days[key] ?? 0) + min;
  saveStore(store);
  return store;
}

export function getMinutes(store: AriesStore, date: Date = new Date()): number {
  return store.days[todayKey(date)] ?? 0;
}

/**
 * Current streak = consecutive days (ending today, or yesterday if today
 * hasn't hit the goal yet) where minutes >= goal. Computed from the day map
 * so it can't drift out of sync.
 */
export function computeStreak(store: AriesStore, goal = DAILY_GOAL_MIN): number {
  let streak = 0;
  const cursor = new Date();

  // If today hasn't met the goal yet, the streak can still be "alive" from
  // yesterday — start counting there so today's incomplete session doesn't
  // read as a broken streak.
  if ((store.days[todayKey(cursor)] ?? 0) < goal) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while ((store.days[todayKey(cursor)] ?? 0) >= goal) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Total minutes across all recorded days. */
export function totalMinutes(store: AriesStore): number {
  return Object.values(store.days).reduce((a, b) => a + b, 0);
}

export function setVoiceOn(on: boolean): AriesStore {
  const store = loadStore();
  store.voiceOn = on;
  saveStore(store);
  return store;
}

export function setLastConfig(config: SessionConfig): AriesStore {
  const store = loadStore();
  store.lastConfig = config;
  saveStore(store);
  return store;
}
