import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from './schema';
import { recordQuizAttempt, getChapterQuizSummary } from './quiz';

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  _setDb(new StudyDB());
});

describe('quiz CRUD', () => {
  it('empty summary for unseen chapter', async () => {
    const s = await getChapterQuizSummary('ch-01');
    expect(s).toEqual({ attempts: 0, correct: 0, accuracy: 0, lastTakenAt: null });
  });

  it('accumulates attempts and accuracy', async () => {
    await recordQuizAttempt({ chapterId: 'ch-01', questionId: 'ch-01.q.01', selected: 1, correct: true,  takenAt: 100 });
    await recordQuizAttempt({ chapterId: 'ch-01', questionId: 'ch-01.q.02', selected: 0, correct: false, takenAt: 200 });
    const s = await getChapterQuizSummary('ch-01');
    expect(s.attempts).toBe(2);
    expect(s.correct).toBe(1);
    expect(s.accuracy).toBe(0.5);
    expect(s.lastTakenAt).toBe(200);
  });
});
