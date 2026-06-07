import { useCallback, useMemo, useRef, useState } from 'react';
import Home from './components/Home';
import SessionSetup from './components/SessionSetup';
import LiveRound from './components/LiveRound';
import RestScreen from './components/RestScreen';
import SessionComplete from './components/SessionComplete';
import type { SessionConfig } from './types';
import { mergeConfig } from './lib/session';
import { pickAffirmation } from './data/affirmations';
import {
  addMinutesToday,
  loadStore,
  setLastConfig,
  setVoiceOn as persistVoiceOn,
  type AriesStore,
} from './lib/storage';
import { cancelSpeech, speak, warmUpSpeech } from './lib/speech';
import { warmUpAudio } from './lib/audio';

type Screen = 'home' | 'setup' | 'live' | 'rest' | 'complete';

export default function App() {
  const [store, setStore] = useState<AriesStore>(() => loadStore());
  const [screen, setScreen] = useState<Screen>('home');
  const [quickLevel, setQuickLevel] = useState<number>(store.lastConfig.level ?? 1);
  const [voiceOn, setVoiceOn] = useState<boolean>(store.voiceOn);

  const [config, setConfig] = useState<SessionConfig>(() =>
    mergeConfig(store.lastConfig, { voiceOn: store.voiceOn }),
  );
  const [round, setRound] = useState(1); // 1-based current round
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [restAffirmation, setRestAffirmation] = useState('');
  const [completeAffirmation, setCompleteAffirmation] = useState('');
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Avoid repeating the same between-rounds affirmation twice in a row.
  const lastRestIdx = useRef<number>(-1);

  // Unlock audio/speech from the user gesture that starts a session.
  const primeAudio = useCallback(() => {
    warmUpSpeech();
    warmUpAudio();
  }, []);

  const beginSession = useCallback(
    (cfg: SessionConfig) => {
      primeAudio();
      setConfig(cfg);
      setStore(setLastConfig(cfg));
      setRound(1);
      setSessionMinutes(0);
      setRoundsCompleted(0);
      // Session-start affirmation; LiveRound's lead-in gives it room to speak.
      const { text } = pickAffirmation('start');
      speak(text, { enabled: cfg.voiceOn, rate: 0.98, interrupt: true });
      setScreen('live');
    },
    [primeAudio],
  );

  const handleQuickStart = useCallback(() => {
    beginSession(mergeConfig(store.lastConfig, { level: quickLevel, voiceOn }));
  }, [beginSession, store.lastConfig, quickLevel, voiceOn]);

  const handleToggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      const next = !v;
      setStore(persistVoiceOn(next));
      if (!next) cancelSpeech();
      return next;
    });
  }, []);

  const accrueRoundMinutes = useCallback((sec: number) => {
    const min = sec / 60;
    setSessionMinutes((m) => m + min);
    setStore(addMinutesToday(min));
  }, []);

  const finishSession = useCallback(
    (completed: number) => {
      cancelSpeech();
      setRoundsCompleted(completed);
      const { text } = pickAffirmation('complete');
      setCompleteAffirmation(text);
      setScreen('complete');
    },
    [],
  );

  const handleRoundComplete = useCallback(() => {
    // A full round elapsed.
    accrueRoundMinutes(config.roundLengthSec);
    const completedSoFar = round;
    if (round >= config.totalRounds) {
      finishSession(completedSoFar);
    } else {
      const { text, index } = pickAffirmation('betweenRounds', lastRestIdx.current);
      lastRestIdx.current = index;
      setRestAffirmation(text);
      setScreen('rest');
    }
  }, [accrueRoundMinutes, config.roundLengthSec, config.totalRounds, round, finishSession]);

  const handleRestComplete = useCallback(() => {
    setRound((r) => r + 1);
    setScreen('live');
  }, []);

  const handleQuit = useCallback(
    (elapsedSec: number) => {
      // Credit the partial round, then end on the complete screen.
      accrueRoundMinutes(elapsedSec);
      finishSession(round - 1);
    },
    [accrueRoundMinutes, finishSession, round],
  );

  const goHome = useCallback(() => {
    cancelSpeech();
    setStore(loadStore());
    setScreen('home');
  }, []);

  const setupInitial = useMemo(
    () => mergeConfig(store.lastConfig, { level: quickLevel, voiceOn }),
    [store.lastConfig, quickLevel, voiceOn],
  );

  return (
    <div className="min-h-full text-aries-text no-scrollbar">
      {screen === 'home' && (
        <Home
          store={store}
          quickLevel={quickLevel}
          onQuickLevel={setQuickLevel}
          voiceOn={voiceOn}
          onToggleVoice={handleToggleVoice}
          onStart={handleQuickStart}
          onCustomize={() => setScreen('setup')}
        />
      )}

      {screen === 'setup' && (
        <SessionSetup
          initial={setupInitial}
          onStart={(cfg) => {
            setQuickLevel(cfg.level);
            setVoiceOn(cfg.voiceOn);
            setStore(persistVoiceOn(cfg.voiceOn));
            beginSession(cfg);
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'live' && (
        <LiveRound
          key={`round-${round}`}
          config={config}
          roundIndex={round}
          totalRounds={config.totalRounds}
          leadInMs={round === 1 ? 3600 : 1500}
          onRoundComplete={handleRoundComplete}
          onQuit={handleQuit}
        />
      )}

      {screen === 'rest' && (
        <RestScreen
          restLengthSec={config.restLengthSec}
          affirmation={restAffirmation}
          nextRoundIndex={round + 1}
          totalRounds={config.totalRounds}
          nextLevel={config.level}
          voiceOn={voiceOn}
          onRestComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      )}

      {screen === 'complete' && (
        <SessionComplete
          store={store}
          roundsCompleted={roundsCompleted}
          sessionMinutes={sessionMinutes}
          affirmation={completeAffirmation}
          voiceOn={voiceOn}
          onHome={goHome}
        />
      )}
    </div>
  );
}
