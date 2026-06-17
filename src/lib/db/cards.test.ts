import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from './schema';
import { getCardProgress, recordReview } from './cards';

let fresh: StudyDB;

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  fresh = new StudyDB();
  _setDb(fresh);
});

describe('card progress CRUD', () => {
  it('returns undefined for unseen card', async () => {
    expect(await getCardProgress('ch-01.fc.01')).toBeUndefined();
  });

  it('recordReview with Good creates progress at interval 1', async () => {
    const now = 1_700_000_000_000;
    const r = await recordReview('ch-01.fc.01', 4, now);
    expect(r.intervalDays).toBe(1);
    expect(r.reps).toBe(1);
    expect(r.dueAt).toBe(now + 86_400_000);
    expect(r.version).toBe(1);
  });

  it('subsequent Good advances interval and version', async () => {
    const t0 = 1_700_000_000_000;
    await recordReview('ch-01.fc.01', 4, t0);
    const r2 = await recordReview('ch-01.fc.01', 4, t0 + 86_400_000);
    expect(r2.reps).toBe(2);
    expect(r2.intervalDays).toBe(6);
    expect(r2.version).toBe(2);
  });

  it('records a row per review in reviewLog', async () => {
    await recordReview('ch-01.fc.01', 4, 1);
    await recordReview('ch-01.fc.01', 4, 2);
    const log = await fresh.reviewLog.toArray();
    expect(log.length).toBe(2);
    expect(log.every(e => e.cardId === 'ch-01.fc.01')).toBe(true);
  });
});
