import type { QuizQuestion, QuizQuestionVariant } from './types';
import { shuffleInPlace } from './study';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

const OPT_LABEL = /^[A-D]\.\s*/;

export function stripOptionLabel(opt: string): string {
	return opt.replace(OPT_LABEL, '');
}

export function labelOptions(texts: string[]): string[] {
	return texts.map((text, i) => `${String.fromCharCode(65 + i)}. ${text}`);
}

export function shuffleOptions(question: QuizQuestionVariant): QuizQuestionVariant {
	const texts = question.opts.map(stripOptionLabel);
	const correctText = texts[question.ans];
	const shuffled = shuffleInPlace([...texts]);
	return {
		q: question.q,
		opts: labelOptions(shuffled),
		ans: shuffled.indexOf(correctText)
	};
}

function variantForDifficulty(question: QuizQuestion, difficulty: QuizDifficulty): QuizQuestionVariant {
	switch (difficulty) {
		case 'easy':
			return question.easy;
		case 'hard':
			return question.hard;
		default:
			return { q: question.q, opts: question.opts, ans: question.ans };
	}
}

export function adaptQuestion(question: QuizQuestion, difficulty: QuizDifficulty): QuizQuestion {
	const variant = variantForDifficulty(question, difficulty);
	const shuffled = shuffleOptions(variant);
	return {
		...question,
		q: shuffled.q,
		opts: shuffled.opts,
		ans: shuffled.ans
	};
}

export function prepareQuizQuestions(
	questions: QuizQuestion[],
	difficulty: QuizDifficulty
): QuizQuestion[] {
	return shuffleInPlace(questions.map((q) => adaptQuestion(q, difficulty)));
}

const DIFFICULTY_KEY = 'emt-quiz-difficulty';

export function readQuizDifficulty(): QuizDifficulty {
	if (typeof sessionStorage === 'undefined') return 'medium';
	const stored = sessionStorage.getItem(DIFFICULTY_KEY);
	if (stored === 'easy' || stored === 'medium' || stored === 'hard') return stored;
	return 'medium';
}

export function writeQuizDifficulty(difficulty: QuizDifficulty): void {
	sessionStorage.setItem(DIFFICULTY_KEY, difficulty);
}
