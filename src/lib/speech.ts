// Thin wrapper over the Web Speech API (SpeechSynthesis) for spoken strike
// call-outs and affirmations. Fire-and-forget; all calls are no-ops when
// speech is unsupported or muted.

let warmedUp = false;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Browsers gate speech synthesis behind a user gesture. Call this from a
 * click/tap (e.g. "Start Training") to unlock audio for the session.
 */
export function warmUpSpeech(): void {
  if (!speechSupported() || warmedUp) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    warmedUp = true;
  } catch {
    /* ignore */
  }
}

interface SpeakOpts {
  rate?: number; // 0.1–10, default ~1
  pitch?: number; // 0–2
  volume?: number; // 0–1
  enabled?: boolean; // when false, no-op (mute)
  interrupt?: boolean; // cancel anything currently speaking first
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  const { rate = 1, pitch = 1, volume = 1, enabled = true, interrupt = false } = opts;
  if (!enabled || !speechSupported() || !text) return;
  try {
    if (interrupt) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Speak a single strike number ("8" → "eight"). */
export function speakNumber(n: number, enabled = true): void {
  // Slightly lower pitch + brisk rate reads like a coach calling shots.
  speak(String(n), { enabled, rate: 1, pitch: 0.95 });
}

export function cancelSpeech(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
