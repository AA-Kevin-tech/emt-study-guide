import { describe, it, expect } from 'vitest';
import { review, nextIntervalPreview, INITIAL_STATE } from './sm2';

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;

describe('SM-2 review()', () => {
  it('new card + Good graduates to 1 day', () => {
    const r = review(INITIAL_STATE, 4, NOW);
    expect(r.intervalDays).toBe(1);
    expect(r.reps).toBe(1);
    expect(r.ease).toBe(2.5);
    expect(r.dueAt).toBe(NOW + 1 * DAY);
  });

  it('reps=1 + Good moves to 6 days', () => {
    const s = { ease: 2.5, intervalDays: 1, reps: 1, lapses: 0 };
    const r = review(s, 4, NOW);
    expect(r.intervalDays).toBe(6);
    expect(r.reps).toBe(2);
  });

  it('reps>=2 + Good multiplies by ease', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    const r = review(s, 4, NOW);
    expect(r.intervalDays).toBe(15);   // round(6 * 2.5)
    expect(r.reps).toBe(3);
    expect(r.ease).toBe(2.5);
  });

  it('Easy adds 0.15 to ease and 30% to interval', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    const r = review(s, 5, NOW);
    expect(r.ease).toBeCloseTo(2.65, 5);
    expect(r.intervalDays).toBe(20);   // round(6 * 2.5 * 1.3)
  });

  it('Hard subtracts 0.15 from ease, interval *1.2', () => {
    const s = { ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 };
    const r = review(s, 3, NOW);
    expect(r.ease).toBeCloseTo(2.35, 5);
    expect(r.intervalDays).toBe(12);
    expect(r.reps).toBe(4);
  });

  it('Again resets reps and interval, increments lapses, lowers ease', () => {
    const s = { ease: 2.5, intervalDays: 20, reps: 4, lapses: 0 };
    const r = review(s, 1, NOW);
    expect(r.reps).toBe(0);
    expect(r.intervalDays).toBe(0);
    expect(r.lapses).toBe(1);
    expect(r.ease).toBeCloseTo(2.3, 5);
    expect(r.dueAt).toBe(NOW);
  });

  it('ease floors at 1.3', () => {
    const s = { ease: 1.35, intervalDays: 10, reps: 3, lapses: 0 };
    const r = review(s, 1, NOW);
    expect(r.ease).toBe(1.3);
  });

  it('Hard never reduces interval below 1', () => {
    const s = { ...INITIAL_STATE };
    const r = review(s, 3, NOW);
    expect(r.intervalDays).toBeGreaterThanOrEqual(1);
  });
});

describe('SM-2 nextIntervalPreview()', () => {
  it('returns interval that review() would set for each rating', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    for (const rating of [1, 3, 4, 5] as const) {
      expect(nextIntervalPreview(s, rating)).toBe(review(s, rating, NOW).intervalDays);
    }
  });
});
