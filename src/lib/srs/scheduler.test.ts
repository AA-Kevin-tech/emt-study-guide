import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from '$lib/db/schema';
import { recordReview } from '$lib/db/cards';
import { countDue, getDueCards, getNewCardsForChapter } from './scheduler';

const T0 = 1_700_000_000_000;
const DAY = 86_400_000;

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  _setDb(new StudyDB());
});

describe('scheduler', () => {
  it('countDue is 0 when no cards have progress', async () => {
    expect(await countDue(T0)).toBe(0);
  });

  it('counts cards whose dueAt <= now', async () => {
    await recordReview('ch-01.fc.01', 4, T0);   // due T0 + 1d
    await recordReview('ch-01.fc.02', 1, T0);   // due T0 (Again)
    expect(await countDue(T0)).toBe(1);
    expect(await countDue(T0 + 2 * DAY)).toBe(2);
  });

  it('getDueCards joins to content', async () => {
    await recordReview('ch-01.fc.01', 1, T0);
    const due = await getDueCards(T0);
    expect(due.length).toBe(1);
    expect(due[0].card.id).toBe('ch-01.fc.01');
    expect(due[0].chapterId).toBe('ch-01');
  });

  it('getNewCardsForChapter excludes seen cards', async () => {
    await recordReview('ch-01.fc.01', 4, T0);
    const newCards = await getNewCardsForChapter('ch-01', 100);
    expect(newCards.find(c => c.id === 'ch-01.fc.01')).toBeUndefined();
    expect(newCards.length).toBeGreaterThan(0);
  });
});
