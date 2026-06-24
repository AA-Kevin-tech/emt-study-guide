import type { QuizQuestion } from './types';

export type QuizAnswers = Record<string, number>;

export interface QuizQuestionResult {
  question: QuizQuestion;
  selected: number;
  chapterNum?: number;
}

export interface QuizResults {
  total: number;
  correct: number;
  percent: number;
  complete: boolean;
  wrong: QuizQuestionResult[];
}

export function summarizeQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers,
  chapterNums?: Record<string, number>
): QuizResults {
  const total = questions.length;
  const complete = total > 0 && questions.every((q) => answers[q.id] !== undefined);
  const correct = questions.filter((q) => answers[q.id] === q.ans).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = questions
    .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.ans)
    .map((question) => ({
      question,
      selected: answers[question.id],
      chapterNum: chapterNums?.[question.id]
    }));

  return { total, correct, percent, complete, wrong };
}
