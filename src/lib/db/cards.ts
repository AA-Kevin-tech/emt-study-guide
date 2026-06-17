import { db } from './schema';
import type { CardProgress } from './types';
import { review, INITIAL_STATE, type Rating } from '$lib/srs/sm2';

export async function getCardProgress(cardId: string): Promise<CardProgress | undefined> {
  return db().cardProgress.get(cardId);
}

export async function recordReview(cardId: string, rating: Rating, now: number = Date.now()): Promise<CardProgress> {
  const existing = await db().cardProgress.get(cardId);
  const prev = existing ?? { ...INITIAL_STATE, cardId, lastReviewedAt: 0, updatedAt: 0, version: 0, dueAt: 0 };

  const result = review(
    { ease: prev.ease, intervalDays: prev.intervalDays, reps: prev.reps, lapses: prev.lapses },
    rating,
    now,
  );

  const next: CardProgress = {
    cardId,
    ease: result.ease,
    intervalDays: result.intervalDays,
    reps: result.reps,
    lapses: result.lapses,
    dueAt: result.dueAt,
    lastReviewedAt: now,
    updatedAt: now,
    version: prev.version + 1,
  };

  await db().cardProgress.put(next);
  await db().reviewLog.add({
    id: crypto.randomUUID(),
    cardId,
    rating,
    reviewedAt: now,
  });

  return next;
}

export async function resetAllProgress(): Promise<void> {
  await db().transaction('rw', [db().cardProgress, db().reviewLog, db().quizAttempts, db().chapterVisits], async () => {
    await db().cardProgress.clear();
    await db().reviewLog.clear();
    await db().quizAttempts.clear();
    await db().chapterVisits.clear();
  });
}
