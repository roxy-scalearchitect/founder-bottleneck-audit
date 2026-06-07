import type { Strike, Stance } from '../types';

// The numbered strike vocabulary. Numbers are the universal language of the
// app — combos read as chunks (e.g. "1-2-3-8").
export const STRIKES: Strike[] = [
  { id: 1, name: 'Jab', type: 'punch', side: 'lead', cue: 'Snap it to the chin.' },
  { id: 2, name: 'Cross', type: 'punch', side: 'rear', cue: 'Turn the rear hip over.' },
  { id: 3, name: 'Lead Hook', type: 'punch', side: 'lead', cue: 'Pivot the lead foot.' },
  { id: 4, name: 'Rear Hook', type: 'punch', side: 'rear', cue: 'Whip it short and tight.' },
  { id: 5, name: 'Lead Uppercut', type: 'punch', side: 'lead', cue: 'Drive up through the legs.' },
  { id: 6, name: 'Rear Uppercut', type: 'punch', side: 'rear', cue: 'Sit down, then launch.' },
  { id: 7, name: 'Lead Kick', type: 'kick', side: 'lead', cue: 'Turn the hip, point the toe.' },
  { id: 8, name: 'Rear Kick', type: 'kick', side: 'rear', cue: 'Swing through the target.' },
  { id: 9, name: 'Lead Knee', type: 'knee', side: 'lead', cue: 'Point of the knee, hips through.' },
  { id: 10, name: 'Rear Knee', type: 'knee', side: 'rear', cue: 'Pull down, drive up.' },
  { id: 11, name: 'Teep', type: 'teep', side: 'either', cue: 'Push from the hip, reset distance.' },
  { id: 12, name: 'Elbow', type: 'elbow', side: 'either', cue: 'Slash through, chin tucked.' },
];

export const STRIKE_BY_ID: Record<number, Strike> = Object.fromEntries(
  STRIKES.map((s) => [s.id, s]),
) as Record<number, Strike>;

export function getStrike(id: number): Strike | undefined {
  return STRIKE_BY_ID[id];
}

/**
 * Spoken cues stay number-based, but the on-screen "side" label flips with
 * stance so a southpaw sees the correct lead/rear mapping.
 */
export function sideLabel(strike: Strike, stance: Stance): string {
  if (strike.side === 'either') return 'either';
  if (stance === 'orthodox') return strike.side === 'lead' ? 'left lead' : 'right rear';
  // Southpaw: lead/rear hands & legs swap dominant side.
  return strike.side === 'lead' ? 'right lead' : 'left rear';
}
