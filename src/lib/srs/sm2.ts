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

const DAY_MS = 86_400_000;
const EASE_FLOOR = 1.3;

function clampEase(e: number): number {
  return Math.max(EASE_FLOOR, e);
}

function computeInterval(state: SrsState, rating: Rating): { intervalDays: number; ease: number; reps: number; lapses: number } {
  let { ease, intervalDays, reps, lapses } = state;

  if (rating === 1) {
    return { intervalDays: 0, ease: clampEase(ease - 0.2), reps: 0, lapses: lapses + 1 };
  }

  if (rating === 3) {
    ease = clampEase(ease - 0.15);
    intervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2));
    return { intervalDays, ease, reps: reps + 1, lapses };
  }

  if (rating === 4) {
    if (reps === 0) intervalDays = 1;
    else if (reps === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    return { intervalDays, ease, reps: reps + 1, lapses };
  }

  // rating === 5 (Easy)
  const newEase = clampEase(ease + 0.15);
  if (reps === 0) intervalDays = 1;
  else if (reps === 1) intervalDays = 6;
  else intervalDays = Math.round(intervalDays * ease * 1.3);
  return { intervalDays, ease: newEase, reps: reps + 1, lapses };
}

export function review(state: SrsState, rating: Rating, now: number): ReviewResult {
  const next = computeInterval(state, rating);
  return { ...next, dueAt: now + next.intervalDays * DAY_MS };
}

export function nextIntervalPreview(state: SrsState, rating: Rating): number {
  return computeInterval(state, rating).intervalDays;
}
