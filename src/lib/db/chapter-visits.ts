import { db } from './schema';
import type { ChapterVisit } from './types';

export async function recordChapterVisit(chapterId: string, now: number = Date.now()): Promise<void> {
  const existing = await db().chapterVisits.get(chapterId);
  await db().chapterVisits.put({
    chapterId,
    notesRead: existing?.notesRead ?? [],
    lastVisitedAt: now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  });
}

export async function markNoteRead(chapterId: string, noteId: string, now: number = Date.now()): Promise<void> {
  const existing = await db().chapterVisits.get(chapterId);
  const notesRead = new Set(existing?.notesRead ?? []);
  notesRead.add(noteId);
  await db().chapterVisits.put({
    chapterId,
    notesRead: [...notesRead],
    lastVisitedAt: now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  });
}

export async function getChapterVisit(chapterId: string): Promise<ChapterVisit | undefined> {
  return db().chapterVisits.get(chapterId);
}
