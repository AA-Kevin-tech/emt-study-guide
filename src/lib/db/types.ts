export interface CardProgress {
  cardId: string;
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  dueAt: number;
  lastReviewedAt: number;
  updatedAt: number;
  version: number;
}

export interface QuizAttempt {
  id: string;
  chapterId: string;
  questionId: string;
  selected: number;
  correct: boolean;
  takenAt: number;
  updatedAt: number;
  version: number;
}

export interface ChapterVisit {
  chapterId: string;
  notesRead: string[];
  lastVisitedAt: number;
  updatedAt: number;
  version: number;
}

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  rating: 1 | 3 | 4 | 5;
  reviewedAt: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}
