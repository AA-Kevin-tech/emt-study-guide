import { describe, it, expect } from 'vitest';
import { summarizeQuiz } from './quiz-results';
import type { QuizQuestion } from './types';

const questions: QuizQuestion[] = [
  { id: 'q1', q: 'Q1', opts: ['A', 'B', 'C', 'D'], ans: 1, exp: 'E1' },
  { id: 'q2', q: 'Q2', opts: ['A', 'B', 'C', 'D'], ans: 2, exp: 'E2' },
  { id: 'q3', q: 'Q3', opts: ['A', 'B', 'C', 'D'], ans: 0, exp: 'E3' }
];

describe('summarizeQuiz', () => {
  it('is incomplete until every question is answered', () => {
    const result = summarizeQuiz(questions, { q1: 1, q2: 0 });
    expect(result.complete).toBe(false);
    expect(result.percent).toBe(33);
  });

  it('scores percent and lists wrong answers when complete', () => {
    const result = summarizeQuiz(questions, { q1: 1, q2: 0, q3: 0 });
    expect(result.complete).toBe(true);
    expect(result.correct).toBe(2);
    expect(result.percent).toBe(67);
    expect(result.wrong).toHaveLength(1);
    expect(result.wrong[0].question.id).toBe('q2');
    expect(result.wrong[0].selected).toBe(0);
  });

  it('returns 100% with no wrong answers', () => {
    const result = summarizeQuiz(questions, { q1: 1, q2: 2, q3: 0 });
    expect(result.percent).toBe(100);
    expect(result.wrong).toHaveLength(0);
  });
});
