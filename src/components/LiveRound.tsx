import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressRing from './ProgressRing';
import type { SessionConfig } from '../types';
import { getLevel } from '../data/levels';
import { useEchoEngine } from '../hooks/useEchoEngine';
import { useCountdown } from '../hooks/useCountdown';
import { playRoundEndBell, playRoundStartBell, warmUpAudio } from '../lib/audio';
import { cancelSpeech } from '../lib/speech';
import { comboLabel } from '../lib/combos';
import { mmss } from '../lib/format';
import { getStrike } from '../data/strikes';

interface LiveRoundProps {
  config: SessionConfig;
  roundIndex: number; // 1-based
  totalRounds: number;
  /** Optional "get ready" lead-in before the round timer & call-outs begin. */
  leadInMs?: number;
  onRoundComplete: () => void;
  onQuit: (elapsedSec: number) => void;
}

export default function LiveRound({
  config,
  roundIndex,
  totalRounds,
  leadInMs = 0,
  onRoundComplete,
  onQuit,
}: LiveRoundProps) {
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [started, setStarted] = useState(leadInMs <= 0);
  const levelDef = getLevel(config.level);

  const remaining = useCountdown({
    seconds: config.roundLengthSec,
    running: started && !paused && !ended,
    onComplete: () => {
      setEnded(true);
      cancelSpeech();
      playRoundEndBell();
      // Brief beat so the bell is heard before transitioning.
      window.setTimeout(onRoundComplete, 700);
    },
  });

  const echo = useEchoEngine({
    level: config.level,
    levelDef,
    repsPerCombo: config.repsPerCombo,
    voiceOn: config.voiceOn,
    active: started && !paused && !ended,
  });

  // Lead-in: hold the round, then ring the start bell and begin.
  useEffect(() => {
    warmUpAudio();
    if (leadInMs <= 0) {
      playRoundStartBell();
      return;
    }
    const id = window.setTimeout(() => {
      playRoundStartBell();
      setStarted(true);
    }, leadInMs);
    return () => window.clearTimeout(id);
  }, [roundIndex, leadInMs]);

  const elapsed = config.roundLengthSec - remaining;
  const progress = remaining / config.roundLengthSec;
  const strike = echo.displayStrike != null ? getStrike(echo.displayStrike) : undefined;

  return (
    <div className="relative min-h-full flex flex-col items-center justify-between px-5 py-6 overflow-hidden">
      {/* Beat pulse backdrop */}
      <AnimatePresence>
        {echo.phase === 'listen' && (
          <motion.div
            key={`pulse-${echo.stepIndex}-${echo.displayStrike}`}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background:
                'radial-gradient(600px 600px at 50% 45%, rgba(255,59,48,0.22), transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative w-full max-w-md flex items-center justify-between">
        <div className="text-aries-muted text-sm">
          Round{' '}
          <span className="font-numerals text-xl text-aries-text">
            {roundIndex}
          </span>
          <span className="text-aries-muted"> / {totalRounds}</span>
        </div>
        <div className="text-aries-muted text-xs uppercase tracking-[0.2em]">
          Lvl {config.level} · Echo
        </div>
        <button
          onClick={() => setPaused(true)}
          className="h-9 w-9 rounded-full border border-aries-border text-aries-text hover:border-aries-flame transition"
          aria-label="Pause"
        >
          ❚❚
        </button>
      </div>

      {/* Center: timer ring + giant strike */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <ProgressRing progress={progress} size={300} stroke={14}>
          <div className="flex flex-col items-center justify-center text-center px-6">
            <AnimatePresence mode="wait">
              {echo.phase === 'listen' && strike ? (
                <motion.div
                  key={`s-${echo.stepIndex}-${echo.displayStrike}`}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.25, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <span className="font-numerals text-[10rem] leading-none text-aries-flame text-flame-glow">
                    {echo.displayStrike}
                  </span>
                  <span className="mt-1 text-aries-text font-semibold tracking-wide">
                    {strike.name}
                  </span>
                  {strike.cue && (
                    <span className="mt-1 text-aries-muted text-xs max-w-[12rem]">
                      {strike.cue}
                    </span>
                  )}
                </motion.div>
              ) : echo.phase === 'prompt' ? (
                <motion.div
                  key="prompt"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-5xl">🔥</div>
                  <div className="mt-2 font-display text-4xl tracking-wide text-aries-gold text-flame-glow">
                    YOUR TURN
                  </div>
                </motion.div>
              ) : echo.phase === 'perform' ? (
                <motion.div
                  key="perform"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    className="font-numerals text-7xl text-aries-flame text-flame-glow"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    {comboLabel(echo.combo)}
                  </motion.div>
                  <div className="mt-2 text-aries-muted text-sm">Throw it — full power</div>
                </motion.div>
              ) : (
                <motion.div key="idle" className="text-aries-muted text-sm">
                  Get ready…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ProgressRing>

        {/* Combo + rep info */}
        <div className="mt-6 text-center">
          <div className="font-numerals text-2xl text-aries-text tracking-wider">
            {echo.combo.length ? comboLabel(echo.combo) : '—'}
          </div>
          <div className="text-aries-muted text-xs mt-1">
            Combo rep {Math.min(echo.rep, echo.reps)} / {echo.reps} · Blocked practice
          </div>
        </div>
      </div>

      {/* Bottom: time + goal */}
      <div className="relative w-full max-w-md flex items-center justify-between text-aries-muted text-sm">
        <span>
          Elapsed{' '}
          <span className="font-numerals text-aries-text text-base">{mmss(elapsed)}</span>
        </span>
        <span>
          Left{' '}
          <span className="font-numerals text-aries-text text-base">{mmss(remaining)}</span>
        </span>
      </div>

      {/* Lead-in "get ready" overlay */}
      <AnimatePresence>
        {!started && !paused && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-aries-base/80 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ♈
            </motion.div>
            <h3 className="font-display text-4xl text-aries-text tracking-wide text-flame-glow">
              GET READY
            </h3>
            <p className="text-aries-muted text-sm">Round {roundIndex} — hands up, Warrior.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {paused && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-aries-base/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-5xl">⏸️</div>
            <h3 className="font-display text-3xl text-aries-text tracking-wide">PAUSED</h3>
            <p className="text-aries-muted text-sm">The fire still burns, Warrior.</p>
            <button
              onClick={() => setPaused(false)}
              className="mt-2 w-56 rounded-2xl bg-gradient-to-r from-aries-ember via-aries-flame to-aries-flameDeep py-3 font-bold text-white"
            >
              Resume
            </button>
            <button
              onClick={() => onQuit(elapsed)}
              className="w-56 rounded-2xl border border-aries-border py-3 font-semibold text-aries-muted hover:text-aries-text"
            >
              End Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
