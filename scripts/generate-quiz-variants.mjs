// scripts/generate-quiz-variants.mjs
// Adds easy/hard quiz variants with distinct wording to every chapter file.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const chaptersDir = resolve(root, 'src/lib/content/chapters');

function pad2(n) {
	return String(n).padStart(2, '0');
}

function stripOpt(opt) {
	return opt.replace(/^[A-D]\.\s*/, '');
}

function labelOpts(texts) {
	return texts.map((text, i) => `${String.fromCharCode(65 + i)}. ${text}`);
}

function words(text) {
	return text
		.toLowerCase()
		.split(/\W+/)
		.filter((w) => w.length > 3);
}

function overlapScore(a, b) {
	const setB = new Set(words(b));
	return words(a).filter((w) => setB.has(w)).length;
}

function findRelatedFlashcard(question, cards) {
	const correct = stripOpt(question.opts[question.ans]);
	let best = null;
	let bestScore = 0;

	for (const card of cards) {
		const answerScore = overlapScore(correct, card.a) * 2;
		const questionScore = overlapScore(question.q, card.q);
		const score = answerScore + questionScore;
		if (score > bestScore) {
			bestScore = score;
			best = card;
		}
	}

	return bestScore >= 3 ? best : null;
}

function findRelatedNote(question, notes) {
	let best = null;
	let bestScore = 0;
	for (const note of notes) {
		const score = overlapScore(question.q, `${note.title} ${note.body}`);
		if (score > bestScore) {
			bestScore = score;
			best = note;
		}
	}
	return bestScore >= 2 ? best : null;
}

function pickEasyWrong(question) {
	const wrongs = question.opts.map(stripOpt).filter((_, i) => i !== question.ans);
	return wrongs.sort((a, b) => a.length - b.length)[0] ?? wrongs[0];
}

function toDirectRecallQuestion(questionText) {
	let q = questionText.trim();

	q = q
		.replace(/\bbest described as:\s*/i, '')
		.replace(/\bbest defined as:\s*/i, '')
		.replace(/\bmost applies to:\s*/i, '')
		.replace(/\bmost to:\s*/i, '')
		.replace(/\bincludes all of the following EXCEPT:\s*/i, 'does NOT include: ')
		.replace(/:$/, '')
		.trim();

	if (/^which\b/i.test(q)) return q.endsWith('?') ? q : `${q}?`;
	if (/^what\b/i.test(q)) return q.endsWith('?') ? q : `${q}?`;
	if (/^during\b/i.test(q)) return `In this situation, what would you expect? (${q})`;
	if (/^how\b/i.test(q)) return q.endsWith('?') ? q : `${q}?`;

	const topic = q.replace(/^(the|a|an)\s+/i, '');
	return `What is ${topic}?`;
}

function capitalize(text) {
	if (!text) return text;
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function rephraseForHard(questionText) {
	return questionText
		.replace(/\bbest described as:\s*/i, 'is MOST accurately defined as ')
		.replace(/\bbest defined as:\s*/i, 'is MOST accurately defined as ')
		.replace(/:$/, '')
		.trim();
}

function sentenceForEmbedding(text) {
	if (/^[A-Z]{2,}/.test(text)) return text;
	return text.charAt(0).toLowerCase() + text.slice(1);
}

function buildHardQuestionStem(question, exp, note) {
	const base = rephraseForHard(question.q);

	if (/^(during|while|you respond|you arrive|a patient|on scene)/i.test(base)) {
		return base.endsWith('?') ? base : `${base}?`;
	}

	const embedded = sentenceForEmbedding(base);

	if (note?.body) {
		const snippet = note.body.split(/[.—]/)[0].trim();
		if (snippet.length > 30) {
			return `Clinical context: ${snippet}. Based on this presentation, ${embedded}?`;
		}
	}

	if (/\b(license|protocol|QI|medical director|standing order|scope of practice|EMS system)\b/i.test(`${question.q} ${exp}`)) {
		return `During QA review of an EMS run, your supervisor asks: ${embedded}?`;
	}

	return `You arrive on scene and complete your primary assessment. ${capitalize(embedded)}?`;
}

function ensureDistinctQuestion(candidate, original, fallbackBuilder) {
	if (candidate.trim() !== original.trim()) return candidate;
	return fallbackBuilder();
}

function buildEasyVariant(question, cards) {
	const correct = stripOpt(question.opts[question.ans]);
	const wrong = pickEasyWrong(question);
	const card = findRelatedFlashcard(question, cards);

	let q;
	if (card) {
		q = card.q.endsWith('?') ? card.q : `${card.q}?`;
	} else if (/except/i.test(question.q)) {
		q = question.q.replace(/includes all of the following EXCEPT/i, 'does NOT include').replace(/:$/, '?');
	} else if (/^which\b/i.test(question.q)) {
		q = `Name the option that correctly answers: ${question.q.replace(/:$/, '')}`;
	} else {
		q = toDirectRecallQuestion(question.q);
	}

	q = ensureDistinctQuestion(q, question.q, () => `Quick recall: ${toDirectRecallQuestion(question.q)}`);

	return {
		q,
		opts: labelOpts([correct, wrong]),
		ans: 0
	};
}

function buildHardVariant(question, notes) {
	const note = findRelatedNote(question, notes);
	let q = buildHardQuestionStem(question, question.exp, note);
	q = ensureDistinctQuestion(q, question.q, () => `Apply your field knowledge: ${rephraseForHard(question.q)}?`);
	const opts = question.opts.map(stripOpt);

	// Prefer subtler distractors first (longer wrong answers often sound plausible).
	const correct = opts[question.ans];
	const wrongs = opts
		.filter((_, i) => i !== question.ans)
		.sort((a, b) => b.length - a.length);
	const hardOpts = labelOpts([wrongs[0], wrongs[1] ?? wrongs[0], correct, wrongs[2] ?? wrongs[0]]);

	return {
		q,
		opts: hardOpts,
		ans: hardOpts.findIndex((opt) => stripOpt(opt) === correct)
	};
}

function withVariants(question, cards, notes) {
	return {
		...question,
		easy: buildEasyVariant(question, cards),
		hard: buildHardVariant(question, notes)
	};
}

function parseChapterFile(filePath) {
	const src = readFileSync(filePath, 'utf8');
	const body = src.replace(/^[\s\S]*?export const ch\d+: Chapter = /, '').replace(/;\s*$/, '');
	return eval(`(${body})`);
}

function writeChapterFile(number, chapter) {
	const varName = `ch${pad2(number)}`;
	const ts = `// AUTO-GENERATED by scripts/migrate-content.mjs. Edit by hand thereafter.
import type { Chapter } from '../types';

export const ${varName}: Chapter = ${JSON.stringify(chapter, null, 2)};
`;
	writeFileSync(resolve(chaptersDir, `ch-${pad2(number)}.ts`), ts);
}

let total = 0;
for (let n = 1; n <= 46; n++) {
	const chapter = parseChapterFile(resolve(chaptersDir, `ch-${pad2(n)}.ts`));
	chapter.quiz = chapter.quiz.map((q) => withVariants(q, chapter.cards, chapter.notes));
	writeChapterFile(n, chapter);
	total += chapter.quiz.length;
}

console.log(`Wrote easy/hard variants for ${total} quiz questions across 46 chapters.`);
