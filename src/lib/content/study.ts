import { getChapter } from '$lib/content';
import { prepareQuizQuestions, type QuizDifficulty } from './quiz-difficulty';
import type { Flashcard, Note, QuizQuestion } from './types';

export const STUDY_CHAPTERS_KEY = 'emt-study-chapters';

export function shuffleInPlace<T>(items: T[]): T[] {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items;
}

export type StudyCard = Flashcard & { chapterId: string; chapterNum: number };
export type StudyNote = Note & { chapterId: string; chapterNum: number };
export type StudyQuizQuestion = QuizQuestion & { chapterId: string; chapterNum: number };

export function buildStudyDeck(chapterIds: string[]): StudyCard[] {
	const cards = chapterIds.flatMap((id) => {
		const ch = getChapter(id);
		if (!ch) return [];
		return ch.cards.map((card) => ({ ...card, chapterId: id, chapterNum: ch.number }));
	});
	return shuffleInPlace(cards);
}

export function buildStudyNotes(chapterIds: string[]): StudyNote[] {
	return chapterIds.flatMap((id) => {
		const ch = getChapter(id);
		if (!ch) return [];
		return ch.notes.map((note) => ({ ...note, chapterId: id, chapterNum: ch.number }));
	});
}

export function buildStudyQuiz(
	chapterIds: string[],
	difficulty: QuizDifficulty = 'level2',
	cap = 30
): StudyQuizQuestion[] {
	const questions = chapterIds.flatMap((id) => {
		const ch = getChapter(id);
		if (!ch) return [];
		return ch.quiz.map((q) => ({ ...q, chapterId: id, chapterNum: ch.number }));
	});
	return prepareQuizQuestions(questions, difficulty).slice(0, cap) as StudyQuizQuestion[];
}

export function readStudyChapterIds(): string[] {
	if (typeof sessionStorage === 'undefined') return [];
	try {
		const raw = sessionStorage.getItem(STUDY_CHAPTERS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((id): id is string => typeof id === 'string' && !!getChapter(id));
	} catch {
		return [];
	}
}

export function writeStudyChapterIds(chapterIds: string[]): void {
	sessionStorage.setItem(STUDY_CHAPTERS_KEY, JSON.stringify(chapterIds));
}
