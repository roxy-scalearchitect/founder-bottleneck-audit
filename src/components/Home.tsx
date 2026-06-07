import { motion } from 'framer-motion';
import AriesMark from './AriesMark';
import EmberField from './EmberField';
import { WARRIOR_NAME, WARRIOR_TITLE } from '../data/affirmations';
import { LEVELS, getLevel } from '../data/levels';
import {
  DAILY_GOAL_MIN,
  computeStreak,
  getMinutes,
  totalMinutes,
  type AriesStore,
} from '../lib/storage';
import { clampLevel } from '../lib/session';

interface HomeProps {
  store: AriesStore;
  quickLevel: number;
  onQuickLevel: (level: number) => void;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onStart: () => void;
  onCustomize: () => void;
}

export default function Home({
  store,
  quickLevel,
  onQuickLevel,
  voiceOn,
  onToggleVoice,
  onStart,
  onCustomize,
}: HomeProps) {
  const todayMin = getMinutes(store);
  const streak = computeStreak(store);
  const total = totalMinutes(store);
  const goalPct = Math.min(100, Math.round((todayMin / DAILY_GOAL_MIN) * 100));
  const level = getLevel(clampLevel(quickLevel));

  return (
    <div className="relative min-h-full flex flex-col items-center px-5 py-8">
      <EmberField />

      <header className="relative w-full max-w-md flex items-center justify-between">
        <span className="text-aries-muted text-xs font-semibold tracking-[0.25em] uppercase">
          Shadowbox Trainer
        </span>
        <button
          onClick={onToggleVoice}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-aries-border text-aries-muted hover:text-aries-text transition"
          aria-pressed={voiceOn}
        >
          {voiceOn ? '🔊 Voice On' : '🔇 Voice Off'}
        </button>
      </header>

      <motion.div
        className="relative mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AriesMark />
      </motion.div>

      <motion.p
        className="relative mt-6 text-center text-aries-text text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        Welcome back,{' '}
        <span className="text-aries-flame font-semibold">
          {WARRIOR_TITLE} {WARRIOR_NAME}
        </span>
        .
        <br />
        <span className="text-aries-muted text-sm">The fight is won in training.</span>
      </motion.p>

      {/* Knight's Record */}
      <section className="relative mt-8 w-full max-w-md rounded-2xl border border-aries-border bg-aries-surface/70 backdrop-blur p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-aries-muted">
            Warrior's Record
          </h2>
          <span className="text-xs text-aries-muted">Goal {DAILY_GOAL_MIN} min/day</span>
        </div>

        {/* Daily goal bar */}
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-aries-text font-medium">Today</span>
          <span className="text-aries-emberSoft font-numerals text-lg">
            {Math.round(todayMin)} / {DAILY_GOAL_MIN} min
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-aries-base overflow-hidden border border-aries-border">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg,#FF7A18,#FF3B30,#B91C1C)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${goalPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat label="Day Streak" value={`${streak} 🔥`} />
          <Stat label="Total Minutes" value={`${Math.round(total)}`} />
        </div>
      </section>

      {/* Quick level picker */}
      <section className="relative mt-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-aries-muted">
            Quick Level
          </h3>
          <span className="text-xs text-aries-muted">Echo · Blocked</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((l) => {
            const selected = l.level === level.level;
            return (
              <button
                key={l.level}
                onClick={() => onQuickLevel(l.level)}
                className={`rounded-xl border p-3 text-left transition ${
                  selected
                    ? 'border-aries-flame bg-aries-flame/10 animate-pulseGlow'
                    : 'border-aries-border bg-aries-surface/60 hover:border-aries-borderGlow'
                }`}
              >
                <div className="font-numerals text-3xl text-aries-text leading-none">
                  {l.level}
                </div>
                <div className="mt-1 text-[11px] text-aries-muted leading-tight">
                  {l.chainLength} strike{l.chainLength > 1 ? 's' : ''}
                  <br />
                  {l.stage}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="relative mt-8 w-full max-w-md space-y-3 pb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full rounded-2xl bg-gradient-to-r from-aries-ember via-aries-flame to-aries-flameDeep py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-aries-flame/30"
        >
          ⚔️ Start Training
        </motion.button>
        <button
          onClick={onCustomize}
          className="w-full rounded-2xl border border-aries-border bg-aries-surface/50 py-3 font-semibold text-aries-muted hover:text-aries-text transition"
        >
          Customize Session
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-aries-border bg-aries-base/50 p-3 text-center">
      <div className="font-numerals text-2xl text-aries-text">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-aries-muted mt-0.5">
        {label}
      </div>
    </div>
  );
}
