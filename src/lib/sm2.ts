import { SM2State, Questao } from '@/types';

export function calcSM2(card: Questao, quality: 0 | 1 | 3 | 5): SM2State {
  let interval = card.sm2?.interval ?? 0;
  let repetitions = card.sm2?.repetitions ?? 0;
  let easeFactor = card.sm2?.easeFactor ?? 2.5;

  if (quality < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    interval,
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    lastReview: Date.now(),
    nextReview: Date.now() + interval * 86400000,
    lastQuality: quality,
  };
}

export function isDue(sm2: SM2State | null | undefined): boolean {
  if (!sm2) return true;
  return Date.now() >= sm2.nextReview;
}

export function isNew(sm2: SM2State | null | undefined): boolean {
  if (!sm2) return true;
  return sm2.repetitions === 0;
}

export function formatNextReview(sm2: SM2State | null | undefined): string {
  if (!sm2 || isNew(sm2)) return 'Nova';
  if (isDue(sm2)) return 'Para revisar';
  const diff = sm2.nextReview - Date.now();
  const days = Math.round(diff / 86400000);
  if (days <= 1) return 'amanhã';
  if (days < 30) return `em ${days}d`;
  const months = Math.round(days / 30);
  return `em ${months}m`;
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
