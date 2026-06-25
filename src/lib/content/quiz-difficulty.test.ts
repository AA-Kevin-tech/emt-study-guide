import { describe, expect, it } from 'vitest';
import { ch01 } from './chapters/ch-01';
import { adaptQuestion, prepareQuizQuestions, shuffleOptions } from './quiz-difficulty';

const sample = ch01.quiz[0];

describe('quiz difficulty', () => {
	it('shuffleOptions keeps the correct answer', () => {
		const shuffled = shuffleOptions(sample.level1);
		expect(shuffled.opts).toHaveLength(2);
		expect(shuffled.opts[shuffled.ans]).toContain('physician medical director');
	});

	it('level 1 uses stored level1 variant wording', () => {
		const level1 = adaptQuestion(sample, 'level1');
		expect(level1.q).toBe(sample.level1.q);
		expect(level1.opts).toHaveLength(2);
		expect(level1.q).not.toBe(sample.q);
	});

	it('level 2 uses stored default wording', () => {
		const level2 = adaptQuestion(sample, 'level2');
		expect(level2.q).toBe(sample.q);
		expect(level2.opts).toHaveLength(4);
	});

	it('prepareQuizQuestions randomizes order', () => {
		const ordered = prepareQuizQuestions(ch01.quiz, 'level2');
		expect(ordered).toHaveLength(ch01.quiz.length);
		const sameOrder = ch01.quiz.every((q, i) => q.id === ordered[i]?.id);
		expect(sameOrder).toBe(false);
	});
});
