import { useEffect, useRef, useState } from 'react';

interface UseCountdownArgs {
  /** Total seconds to count down from. Resets the timer when it changes. */
  seconds: number;
  /** Count down only while true (false = paused). */
  running: boolean;
  onComplete?: () => void;
  /** Called each whole second with the remaining time. */
  onTick?: (remaining: number) => void;
}

/**
 * A pausable second-resolution countdown. Tracks remaining time on a ref and
 * decrements on an interval so pausing/resuming doesn't lose fractional time.
 */
export function useCountdown({ seconds, running, onComplete, onTick }: UseCountdownArgs) {
  const [remaining, setRemaining] = useState(seconds);
  const remainingRef = useRef(seconds);
  const completeRef = useRef(onComplete);
  const tickRef = useRef(onTick);
  completeRef.current = onComplete;
  tickRef.current = onTick;

  // Reset whenever the configured duration changes (new round/rest).
  useEffect(() => {
    remainingRef.current = seconds;
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      const r = remainingRef.current;
      setRemaining(r);
      tickRef.current?.(r);
      if (r <= 0) {
        window.clearInterval(id);
        completeRef.current?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return remaining;
}
