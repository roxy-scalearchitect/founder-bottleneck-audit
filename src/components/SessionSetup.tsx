import { useState } from 'react';
import { motion } from 'framer-motion';
import EmberField from './EmberField';
import { LEVELS, getLevel } from '../data/levels';
import type { SessionConfig, Stance } from '../types';
import { clampLevel, estimatedMinutes } from '../lib/session';
import { mmss } from '../lib/format';

interface SessionSetupProps {
  initial: SessionConfig;
  onStart: (config: SessionConfig) => void;
  onBack: () => void;
}

const ROUND_LENGTHS = [60, 120, 180, 300];
const REST_LENGTHS = [30, 60, 90];

export default function SessionSetup({ initial, onStart, onBack }: SessionSetupProps) {
  const [config, setConfig] = useState<SessionConfig>({
    ...initial,
    level: clampLevel(initial.level),
    mode: 'echo', // Phase 1 ships echo only
  });

  const set = <K extends keyof SessionConfig>(key: K, value: SessionConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const lvl = getLevel(config.level);
  const estMin = estimatedMinutes(config);

  return (
    <div className="relative min-h-full px-5 py-6">
      <EmberField count={10} />

      <header className="relative flex items-center justify-between max-w-md mx-auto">
        <button onClick={onBack} className="text-aries-muted hover:text-aries-text text-sm">
          ← Back
        </button>
        <h2 className="font-display text-2xl tracking-wide text-aries-text">SESSION SETUP</h2>
        <span className="w-10" />
      </header>

      <div className="relative max-w-md mx-auto mt-6 space-y-6 pb-28">
        {/* Level */}
        <Field label="Level" hint={`${lvl.stage} · ${lvl.practice} · ${lvl.tempo}`}>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => {
              const sel = l.level === config.level;
              return (
                <button
                  key={l.level}
                  onClick={() => set('level', l.level)}
                  className={`rounded-xl border p-3 transition ${
                    sel
                      ? 'border-aries-flame bg-aries-flame/10'
                      : 'border-aries-border bg-aries-surface/60 hover:border-aries-borderGlow'
                  }`}
                >
                  <div className="font-numerals text-3xl text-aries-text leading-none">
                    {l.level}
                  </div>
                  <div className="text-[11px] text-aries-muted mt-1">
                    {l.chainLength} strike{l.chainLength > 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Mode */}
        <Field label="Mode" hint="React mode arrives in Phase 2">
          <div className="grid grid-cols-2 gap-3">
            <ModeButton active label="Echo" sub="Teach & repeat" />
            <ModeButton active={false} label="React" sub="Coming soon" disabled />
          </div>
        </Field>

        {/* Stance */}
        <Field label="Stance">
          <div className="grid grid-cols-2 gap-3">
            {(['orthodox', 'southpaw'] as Stance[]).map((s) => (
              <button
                key={s}
                onClick={() => set('stance', s)}
                className={`rounded-xl border py-3 font-semibold capitalize transition ${
                  config.stance === s
                    ? 'border-aries-flame bg-aries-flame/10 text-aries-text'
                    : 'border-aries-border bg-aries-surface/60 text-aries-muted hover:text-aries-text'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Round length */}
        <Field label="Round Length">
          <Chips
            options={ROUND_LENGTHS.map((v) => ({ value: v, label: mmss(v) }))}
            value={config.roundLengthSec}
            onChange={(v) => set('roundLengthSec', v)}
          />
        </Field>

        {/* Rest length */}
        <Field label="Rest Between Rounds">
          <Chips
            options={REST_LENGTHS.map((v) => ({ value: v, label: mmss(v) }))}
            value={config.restLengthSec}
            onChange={(v) => set('restLengthSec', v)}
          />
        </Field>

        {/* Rounds */}
        <Field label="Rounds" hint={`≈ ${estMin} min of shadowboxing`}>
          <Stepper
            value={config.totalRounds}
            min={1}
            max={15}
            onChange={(v) => set('totalRounds', v)}
          />
        </Field>

        {/* Reps per combo */}
        <Field label="Reps per Combo" hint="Blocked practice — repeat before moving on">
          <Stepper
            value={config.repsPerCombo}
            min={2}
            max={8}
            onChange={(v) => set('repsPerCombo', v)}
          />
        </Field>

        {/* Voice */}
        <Field label="Voice Call-outs">
          <Toggle on={config.voiceOn} onChange={(v) => set('voiceOn', v)} />
        </Field>
      </div>

      {/* Sticky start */}
      <div className="fixed inset-x-0 bottom-0 p-4 bg-gradient-to-t from-aries-base to-transparent">
        <div className="max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onStart(config)}
            className="w-full rounded-2xl bg-gradient-to-r from-aries-ember via-aries-flame to-aries-flameDeep py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-aries-flame/30"
          >
            ⚔️ Begin · {config.totalRounds} rounds
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold tracking-[0.2em] uppercase text-aries-muted">
          {label}
        </label>
        {hint && <span className="text-[11px] text-aries-muted/80">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ModeButton({
  active,
  label,
  sub,
  disabled,
}: {
  active: boolean;
  label: string;
  sub: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border py-3 px-4 text-center ${
        active
          ? 'border-aries-flame bg-aries-flame/10'
          : 'border-aries-border bg-aries-surface/40 opacity-60'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <div className="font-semibold text-aries-text">{label}</div>
      <div className="text-[11px] text-aries-muted">{sub}</div>
    </div>
  );
}

function Chips<T extends number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-4 py-2 font-numerals text-lg transition ${
            o.value === value
              ? 'border-aries-flame bg-aries-flame/10 text-aries-text'
              : 'border-aries-border bg-aries-surface/60 text-aries-muted hover:text-aries-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <StepBtn label="−" onClick={() => onChange(Math.max(min, value - 1))} />
      <div className="font-numerals text-3xl text-aries-text w-12 text-center">{value}</div>
      <StepBtn label="+" onClick={() => onChange(Math.min(max, value + 1))} />
    </div>
  );
}

function StepBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-11 w-11 rounded-full border border-aries-border bg-aries-surface/60 text-2xl text-aries-text hover:border-aries-flame transition"
    >
      {label}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`flex items-center gap-3 rounded-full border px-1 py-1 w-20 transition ${
        on ? 'border-aries-flame bg-aries-flame/15' : 'border-aries-border bg-aries-surface/60'
      }`}
      aria-pressed={on}
    >
      <span
        className={`h-8 w-8 rounded-full transition-transform ${
          on ? 'translate-x-10 bg-aries-flame' : 'translate-x-0 bg-aries-muted'
        }`}
      />
    </button>
  );
}
