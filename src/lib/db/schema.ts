import Dexie, { type Table } from 'dexie';
import type {
  CardProgress, QuizAttempt, ChapterVisit, ReviewLogEntry, SettingRow,
} from './types';

export class StudyDB extends Dexie {
  cardProgress!: Table<CardProgress, string>;
  quizAttempts!: Table<QuizAttempt, string>;
  chapterVisits!: Table<ChapterVisit, string>;
  reviewLog!: Table<ReviewLogEntry, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super('emt-study');
    this.version(1).stores({
      cardProgress:  '&cardId, dueAt',
      quizAttempts:  '&id, chapterId, questionId, takenAt',
      chapterVisits: '&chapterId, lastVisitedAt',
      reviewLog:     '&id, reviewedAt, cardId',
      settings:      '&key',
    });
  }
}

let _db: StudyDB | null = null;

export function db(): StudyDB {
  if (!_db) _db = new StudyDB();
  return _db;
}

/** For tests: inject a clean DB. */
export function _setDb(d: StudyDB) { _db = d; }
