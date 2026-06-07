import { useCallback, useEffect, useRef, useState } from 'react';
import type { LevelDef } from '../data/levels';
import { generateCombo } from '../lib/combos';
import { cancelSpeech, speak, speakNumber } from '../lib/speech';

export type EchoPhase = 'idle' | 'listen' | 'prompt' | 'perform';

interface EchoState {
  phase: EchoPhase;
  /** The strike number currently being shown (during 'listen'), else null. */
  displayStrike: number | null;
  /** Index within the combo of the strike being shown. */
  stepIndex: number;
  combo: number[];
  /** 1-based rep of this combo / total reps (blocked practice). */
  rep: number;
  reps: number;
  /** Total combos drilled so far this round (for stats). */
  combosDrilled: number;
}

interface UseEchoEngineArgs {
  level: number;
  levelDef: LevelDef;
  repsPerCombo: number;
  voiceOn: boolean;
  /** True while the round is running and not paused. */
  active: boolean;
}

const INITIAL: EchoState = {
  phase: 'idle',
  displayStrike: null,
  stepIndex: 0,
  combo: [],
  rep: 0,
  reps: 1,
  combosDrilled: 0,
};

/**
 * Drives the echo-mode call-out loop: speak the whole combo slowly while
 * showing each number, pause, prompt "your turn", give a performance window,
 * then repeat (blocked practice) before generating a new combo.
 *
 * The loop is a chain of timeouts guarded by a generation counter so stopping
 * (pause / unmount / round end) cancels everything cleanly. Pausing and
 * resuming restarts the current combo rep from the top.
 */
export function useEchoEngine({
  level,
  levelDef,
  repsPerCombo,
  voiceOn,
  active,
}: UseEchoEngineArgs) {
  const [state, setState] = useState<EchoState>({ ...INITIAL, reps: repsPerCombo });

  const genRef = useRef(0);
  const timers = useRef<number[]>([]);
  const comboRef = useRef<number[]>([]);
  const repsDoneRef = useRef(0); // completed reps of the current combo
  const drilledRef = useRef(0);
  const voiceRef = useRef(voiceOn);
  voiceRef.current = voiceOn;

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const gen = genRef.current;
    const id = window.setTimeout(() => {
      if (gen !== genRef.current) return; // invalidated by stop()
      fn();
    }, ms);
    timers.current.push(id);
  }, []);

  const stop = useCallback(() => {
    genRef.current += 1; // invalidate any pending callbacks
    clearTimers();
    cancelSpeech();
  }, [clearTimers]);

  const start = useCallback(() => {
    stop(); // ensure a clean slate, take a fresh generation
    const stepMs = levelDef.echoStepMs;
    const promptMs = levelDef.echoPromptMs;
    const performMs = Math.max(
      1400,
      Math.round(levelDef.chainLength * stepMs * levelDef.performFactor),
    );

    const beginCycle = () => {
      // New combo when none exists or the blocked reps are exhausted.
      if (comboRef.current.length === 0 || repsDoneRef.current >= repsPerCombo) {
        comboRef.current = generateCombo(level, levelDef.chainLength).strikes;
        repsDoneRef.current = 0;
        drilledRef.current += 1;
      }
      listen(0);
    };

    const listen = (i: number) => {
      const combo = comboRef.current;
      if (i < combo.length) {
        setState((s) => ({
          ...s,
          phase: 'listen',
          displayStrike: combo[i],
          stepIndex: i,
          combo,
          rep: repsDoneRef.current + 1,
          reps: repsPerCombo,
          combosDrilled: drilledRef.current,
        }));
        speakNumber(combo[i], voiceRef.current);
        schedule(() => listen(i + 1), stepMs);
      } else {
        prompt();
      }
    };

    const prompt = () => {
      setState((s) => ({ ...s, phase: 'prompt', displayStrike: null }));
      speak('Your turn, Warrior.', { enabled: voiceRef.current, rate: 1, pitch: 1 });
      schedule(perform, promptMs);
    };

    const perform = () => {
      setState((s) => ({ ...s, phase: 'perform', displayStrike: null }));
      schedule(() => {
        repsDoneRef.current += 1;
        beginCycle();
      }, performMs);
    };

    beginCycle();
  }, [level, levelDef, repsPerCombo, schedule, stop]);

  // Start/stop with `active`. On resume the current combo rep restarts.
  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
      setState((s) => ({ ...s, phase: 'idle', displayStrike: null }));
    }
    return () => stop();
  }, [active, start, stop]);

  return state;
}
