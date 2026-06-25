import { describe, it, expect } from 'vitest';
import { CHAPTERS, getChapter } from './index';
import { PARTS } from './parts';

describe('content', () => {
  it('has 46 chapters and 12 parts', () => {
    expect(CHAPTERS.length).toBe(46);
    expect(PARTS.length).toBe(12);
  });

  it('every chapter has at least one card, note, and quiz question', () => {
    for (const ch of CHAPTERS) {
      expect(ch.cards.length, `${ch.id} cards`).toBeGreaterThan(0);
      expect(ch.notes.length, `${ch.id} notes`).toBeGreaterThan(0);
      expect(ch.quiz.length, `${ch.id} quiz`).toBeGreaterThan(0);
    }
  });

  it('every flashcard, note, and quiz id is unique and follows the pattern', () => {
    const ids = new Set<string>();
    for (const ch of CHAPTERS) {
      for (const c of ch.cards) {
        expect(c.id).toMatch(/^ch-\d{2}\.fc\.\d{2}$/);
        expect(ids.has(c.id)).toBe(false);
        ids.add(c.id);
      }
      for (const n of ch.notes) {
        expect(n.id).toMatch(/^ch-\d{2}\.n\.\d{2}$/);
        ids.add(n.id);
      }
      for (const q of ch.quiz) {
        expect(q.id).toMatch(/^ch-\d{2}\.q\.\d{2}$/);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
        expect(q.level1, `${q.id} level1`).toBeDefined();
        expect(q.level1.opts.length, `${q.id} level1 opts`).toBe(2);
        expect(q.level1.q, `${q.id} level1 q`).not.toBe(q.q);
        expect(q.level1.ans, `${q.id} level1 ans`).toBeGreaterThanOrEqual(0);
        expect(q.level1.ans, `${q.id} level1 ans`).toBeLessThan(q.level1.opts.length);
        ids.add(q.id);
      }
    }
  });

  it('every part references existing chapters', () => {
    for (const p of PARTS) {
      for (const cid of p.chapterIds) {
        expect(getChapter(cid), `${p.id} -> ${cid}`).toBeDefined();
      }
    }
  });
});
