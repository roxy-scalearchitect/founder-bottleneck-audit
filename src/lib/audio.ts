// Web Audio bell / clapper for round start & end. Synthesized so there are no
// asset files to ship. Lazily creates a single AudioContext.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Resume the AudioContext from a user gesture (autoplay policies). */
export function warmUpAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') void c.resume();
}

/** A single resonant bell hit at a given frequency. */
function bellHit(freq: number, when: number, duration = 1.4, gain = 0.5): void {
  const c = getCtx();
  if (!c) return;
  // Two partials for a metallic bell timbre.
  [1, 2.4].forEach((mult, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const peak = gain * (i === 0 ? 1 : 0.35);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(g).connect(c.destination);
    osc.start(when);
    osc.stop(when + duration);
  });
}

/** Round-start bell — a bright double ding. */
export function playRoundStartBell(): void {
  const c = getCtx();
  if (!c) return;
  warmUpAudio();
  const now = c.currentTime;
  bellHit(880, now, 1.2, 0.5);
  bellHit(880, now + 0.28, 1.4, 0.5);
}

/** Round-end bell — a triple clang to signal "rest". */
export function playRoundEndBell(): void {
  const c = getCtx();
  if (!c) return;
  warmUpAudio();
  const now = c.currentTime;
  bellHit(660, now, 1.0, 0.5);
  bellHit(660, now + 0.22, 1.0, 0.5);
  bellHit(660, now + 0.44, 1.6, 0.55);
}

/** Short tick used for the final rest countdown (3-2-1). */
export function playCountTick(high = false): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.value = high ? 1320 : 760;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.35, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}
