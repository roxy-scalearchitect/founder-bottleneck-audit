import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import EmberField from './EmberField';
import AriesMark from './AriesMark';
import { speak } from '../lib/speech';
import { DAILY_GOAL_MIN, computeStreak, getMinutes, type AriesStore } from '../lib/storage';

interface SessionCompleteProps {
  store: AriesStore;
  roundsCompleted: number;
  sessionMinutes: number;
  affirmation: string;
  voiceOn: boolean;
  onHome: () => void;
}

export default function SessionComplete({
  store,
  roundsCompleted,
  sessionMinutes,
  affirmation,
  voiceOn,
  onHome,
}: SessionCompleteProps) {
  const spoken = useRef(false);
  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    speak(affirmation, { enabled: voiceOn, rate: 0.98, interrupt: true });
  }, [affirmation, voiceOn]);

  const todayMin = getMinutes(store);
  const streak = computeStreak(store);
  const hitGoal = todayMin >= DAILY_GOAL_MIN;

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-5 py-10">
      <EmberField count={22} />

      <motion.div
        className="relative text-6xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        {hitGoal ? '🏆' : '🔥'}
      </motion.div>

      <div className="relative mt-6">
        <AriesMark size="sm" />
      </div>

      <h2 className="relative mt-4 font-display text-4xl tracking-wide text-aries-text text-flame-glow">
        SESSION COMPLETE
      </h2>

      <motion.p
        className="relative mt-3 max-w-sm text-center text-aries-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        “{affirmation}”
      </motion.p>

      <div className="relative mt-8 grid grid-cols-3 gap-3 w-full max-w-md">
        <Stat label="Rounds" value={`${roundsCompleted}`} />
        <Stat label="Minutes" value={`${Math.round(sessionMinutes)}`} />
        <Stat label="Streak" value={`${streak} 🔥`} />
      </div>

      <div className="relative mt-6 w-full max-w-md rounded-2xl border border-aries-border bg-aries-surface/70 p-4 text-center">
        <div className="text-sm text-aries-muted">Today's total</div>
        <div className="font-numerals text-3xl text-aries-emberSoft mt-1">
          {Math.round(todayMin)} / {DAILY_GOAL_MIN} min
        </div>
        <div className="text-sm mt-1">
          {hitGoal ? (
            <span className="text-aries-success">Daily goal reached, Warrior. 🔥</span>
          ) : (
            <span className="text-aries-muted">
              {Math.max(0, Math.ceil(DAILY_GOAL_MIN - todayMin))} min to today's goal
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onHome}
        className="relative mt-8 w-full max-w-md rounded-2xl bg-gradient-to-r from-aries-ember via-aries-flame to-aries-flameDeep py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-aries-flame/30"
      >
        Return Home
      </button>
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
