import { db } from '$lib/db/schema';
import type { Flashcard } from '$lib/content/types';
import { getAllCards } from '$lib/content';
import type { CardProgress } from '$lib/db/types';

export interface DueCard {
  card: Flashcard;
  chapterId: string;
  progress: CardProgress;
}

export async function countDue(now: number = Date.now()): Promise<number> {
  return db().cardProgress.where('dueAt').belowOrEqual(now).count();
}

export async function getDueCards(now: number = Date.now(), limit?: number): Promise<DueCard[]> {
  const collection = db().cardProgress.where('dueAt').belowOrEqual(now);
  const rows = limit !== undefined
    ? await collection.limit(limit).toArray()
    : await collection.toArray();

  const idToCard = new Map<string, { card: Flashcard; chapterId: string }>();
  for (const { chapterId, card } of getAllCards()) idToCard.set(card.id, { card, chapterId });

  return rows.flatMap(p => {
    const c = idToCard.get(p.cardId);
    return c ? [{ card: c.card, chapterId: c.chapterId, progress: p }] : [];
  });
}

export async function getNewCardsForChapter(chapterId: string, limit: number): Promise<Flashcard[]> {
  const seenIds = new Set((await db().cardProgress.toArray()).map(p => p.cardId));
  const chapterCards = getAllCards().filter(c => c.chapterId === chapterId).map(c => c.card);
  const unseen = chapterCards.filter(c => !seenIds.has(c.id));
  return unseen.slice(0, limit);
}
