// src/lib/content/types.ts

export interface Flashcard {
  id: string;          // 'ch-01.fc.01'
  q: string;
  a: string;
}

export interface Note {
  id: string;          // 'ch-01.n.01'
  title: string;
  body: string;
  terms: string[];
}

export interface QuizQuestionVariant {
  q: string;
  opts: string[];      // prefixed "A. "/"B. "/...
  ans: number;         // 0-indexed correct option
}

export interface QuizQuestion {
  id: string;          // 'ch-01.q.01'
  q: string;           // medium (default)
  opts: string[];
  ans: number;
  exp: string;
  easy: QuizQuestionVariant;
  hard: QuizQuestionVariant;
}

export interface Chapter {
  id: string;          // 'ch-01'
  number: number;      // 1..46
  partId: string;      // 'part-01'
  title: string;
  cards: Flashcard[];
  notes: Note[];
  quiz: QuizQuestion[];
}

export interface Part {
  id: string;          // 'part-01'
  number: number;
  label: string;       // 'Part 1 — Preparatory'
  chapterIds: string[];
}
