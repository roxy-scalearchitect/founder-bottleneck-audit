import { useEffect } from 'react';
import { motion } from 'framer-motion';
import EmberField from './EmberField';
import ProgressRing from './ProgressRing';
import { useCountdown } from '../hooks/useCountdown';
import { playCountTick } from '../lib/audio';
import { speak } from '../lib/speech';
import { getLevel } from '../data/levels';
import { mmss } from '../lib/format';

interface RestScreenProps {
  restLengthSec: number;
  affirmation: string;
  nextRoundIndex: number;
  totalRounds: number;
  nextLevel: number;
  voiceOn: boolean;
  onRestComplete: () => void;
  onSkip: () => void;
}

export default function RestScreen({
  restLengthSec,
  affirmation,
  nextRoundIndex,
  totalRounds,
  nextLevel,
  voiceOn,
  onRestComplete,
  onSkip,
}: RestScreenProps) {
  // Speak the affirmation once when the rest screen appears.
  useEffect(() => {
    speak(affirmation, { enabled: voiceOn, rate: 0.98, pitch: 1, interrupt: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = useCountdown({
    seconds: restLengthSec,
    running: true,
    onComplete: onRestComplete,
    onTick: (r) => {
      if (r <= 3 && r > 0) playCountTick(r === 1);
    },
  });

  const lvl = getLevel(nextLevel);
  const progress = remaining / restLengthSec;

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-5 py-8">
      <EmberField count={12} />

      <span className="relative text-aries-muted text-xs font-semibold tracking-[0.3em] uppercase">
        Rest
      </span>

      <div className="relative mt-6">
        <ProgressRing progress={progress} size={240} stroke={12}>
          <div className="text-center">
            <div className="font-numerals text-7xl text-aries-text text-flame-glow">
              {mmss(remaining)}
            </div>
            <div className="text-aries-muted text-xs mt-1 uppercase tracking-widest">
              Recover
            </div>
          </div>
        </ProgressRing>
      </div>

      <motion.p
        key={affirmation}
        className="relative mt-8 max-w-sm text-center text-lg text-aries-text"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        “{affirmation}”
      </motion.p>

      {/* Next round preview */}
      <div className="relative mt-8 w-full max-w-xs rounded-2xl border border-aries-border bg-aries-surface/70 backdrop-blur p-4 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-aries-muted">Up Next</div>
        <div className="mt-1 font-display text-2xl text-aries-text tracking-wide">
          Round {nextRoundIndex} / {totalRounds}
        </div>
        <div className="text-sm text-aries-muted mt-1">
          Level {lvl.level} · {lvl.chainLength} strike{lvl.chainLength > 1 ? 's' : ''} ·{' '}
          {lvl.stage}
        </div>
      </div>

      <button
        onClick={onSkip}
        className="relative mt-8 rounded-full border border-aries-border px-6 py-2 text-sm font-semibold text-aries-muted hover:text-aries-text transition"
      >
        Skip Rest →
      </button>
    </div>
  );
}
