import { db } from './schema';
import type { QuizAttempt } from './types';

export async function recordQuizAttempt(args: {
  chapterId: string;
  questionId: string;
  selected: number;
  correct: boolean;
  takenAt?: number;
}): Promise<QuizAttempt> {
  const now = args.takenAt ?? Date.now();
  const row: QuizAttempt = {
    id: crypto.randomUUID(),
    chapterId: args.chapterId,
    questionId: args.questionId,
    selected: args.selected,
    correct: args.correct,
    takenAt: now,
    updatedAt: now,
    version: 1,
  };
  await db().quizAttempts.add(row);
  return row;
}

export async function getQuizAttemptsForChapter(chapterId: string): Promise<QuizAttempt[]> {
  return db().quizAttempts.where('chapterId').equals(chapterId).toArray();
}

export interface ChapterQuizSummary {
  attempts: number;
  correct: number;
  accuracy: number;
  lastTakenAt: number | null;
}

export async function getChapterQuizSummary(chapterId: string): Promise<ChapterQuizSummary> {
  const all = await getQuizAttemptsForChapter(chapterId);
  if (all.length === 0) return { attempts: 0, correct: 0, accuracy: 0, lastTakenAt: null };
  const correct = all.filter(a => a.correct).length;
  return {
    attempts: all.length,
    correct,
    accuracy: correct / all.length,
    lastTakenAt: Math.max(...all.map(a => a.takenAt)),
  };
}
