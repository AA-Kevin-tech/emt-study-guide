export type Rating = 1 | 3 | 4 | 5;  // Again | Hard | Good | Easy

export interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

export interface ReviewResult extends SrsState {
  dueAt: number;
}

export const INITIAL_STATE: SrsState = {
  ease: 2.5,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
};

export function review(_state: SrsState, _rating: Rating, _now: number): ReviewResult {
  throw new Error('not implemented');
}

export function nextIntervalPreview(_state: SrsState, _rating: Rating): number {
  throw new Error('not implemented');
}
