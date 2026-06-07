// Warrior identity, Aries-flavored (fire, the ram, the forge).
// Confident and grounded — never cheesy. The user is addressed as the
// Warrior, Eftherens. Editable affirmation bank arrives in Phase 3.

export const WARRIOR_NAME = 'Eftherens';
export const WARRIOR_TITLE = 'Warrior';

export const AFFIRMATIONS = {
  start: [
    `Welcome back, ${WARRIOR_TITLE} ${WARRIOR_NAME}. The fire is lit.`,
    `The forge is hot, ${WARRIOR_NAME}. The fight is won in training.`,
    `Step in, ${WARRIOR_TITLE}. Today we sharpen the blade.`,
  ],
  betweenRounds: [
    `Your hands are getting faster every round, ${WARRIOR_NAME}.`,
    `You are forged in fire. Sharp, calm, dangerous.`,
    `Every rep stokes the flame. Keep burning, ${WARRIOR_TITLE}.`,
    `Breathe. Reset. You own this round.`,
    `The combinations are becoming instinct. Trust your training.`,
    `Stronger than yesterday, ${WARRIOR_NAME}. The ram charges forward.`,
  ],
  complete: [
    `The work is done, ${WARRIOR_TITLE} ${WARRIOR_NAME}. The fire remembers.`,
    `Another day forged. You showed up — that is the warrior's way.`,
    `Rest now, ${WARRIOR_NAME}. You earned it in fire.`,
  ],
} as const;

export type AffirmationBank = keyof typeof AFFIRMATIONS;

export function pickAffirmation(bank: AffirmationBank, avoidIndex?: number): {
  text: string;
  index: number;
} {
  const list: readonly string[] = AFFIRMATIONS[bank];
  if (list.length <= 1) return { text: list[0], index: 0 };
  let index = Math.floor(Math.random() * list.length);
  if (avoidIndex !== undefined && index === avoidIndex) {
    index = (index + 1) % list.length;
  }
  return { text: list[index], index };
}
