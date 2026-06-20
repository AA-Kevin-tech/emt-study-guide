import { describe, expect, it } from 'vitest';
import { buildStudyDeck, buildStudyNotes, buildStudyQuiz } from './study';

describe('study content builders', () => {
	it('merges cards from multiple chapters', () => {
		const deck = buildStudyDeck(['ch-01', 'ch-02']);
		expect(deck.length).toBeGreaterThan(0);
		const chapterIds = new Set(deck.map((c) => c.chapterId));
		expect(chapterIds.has('ch-01')).toBe(true);
		expect(chapterIds.has('ch-02')).toBe(true);
	});

	it('merges notes from multiple chapters', () => {
		const notes = buildStudyNotes(['ch-01', 'ch-02']);
		expect(notes.length).toBeGreaterThan(0);
		expect(notes.some((n) => n.chapterId === 'ch-01')).toBe(true);
		expect(notes.some((n) => n.chapterId === 'ch-02')).toBe(true);
	});

	it('caps quiz pool at 30 questions', () => {
		const quiz = buildStudyQuiz(
			['ch-01', 'ch-02', 'ch-03', 'ch-04', 'ch-05', 'ch-06'],
			30
		);
		expect(quiz.length).toBeLessThanOrEqual(30);
		expect(quiz.length).toBeGreaterThan(0);
	});
});
