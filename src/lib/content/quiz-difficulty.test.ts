import { describe, expect, it } from 'vitest';
import { ch01 } from './chapters/ch-01';
import { adaptQuestion, prepareQuizQuestions, shuffleOptions } from './quiz-difficulty';

const sample = ch01.quiz[0];

describe('quiz difficulty', () => {
	it('shuffleOptions keeps the correct answer', () => {
		const shuffled = shuffleOptions(sample.easy);
		expect(shuffled.opts).toHaveLength(2);
		expect(shuffled.opts[shuffled.ans]).toContain('physician medical director');
	});

	it('easy mode uses stored easy variant wording', () => {
		const easy = adaptQuestion(sample, 'easy');
		expect(easy.q).toBe(sample.easy.q);
		expect(easy.opts).toHaveLength(2);
		expect(easy.q).not.toBe(sample.q);
	});

	it('medium mode uses stored medium wording', () => {
		const medium = adaptQuestion(sample, 'medium');
		expect(medium.q).toBe(sample.q);
		expect(medium.opts).toHaveLength(4);
	});

	it('hard mode uses stored hard variant wording', () => {
		const hard = adaptQuestion(sample, 'hard');
		expect(hard.q).toBe(sample.hard.q);
		expect(hard.opts).toHaveLength(4);
		expect(hard.q).not.toBe(sample.q);
	});

	it('prepareQuizQuestions randomizes order', () => {
		const ordered = prepareQuizQuestions(ch01.quiz, 'medium');
		expect(ordered).toHaveLength(ch01.quiz.length);
		const sameOrder = ch01.quiz.every((q, i) => q.id === ordered[i]?.id);
		expect(sameOrder).toBe(false);
	});
});
