<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getChapter } from '$lib/content';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { getCardProgress, recordReview } from '$lib/db/cards';
  import { recordQuizAttempt } from '$lib/db/quiz';
  import { markNoteRead } from '$lib/db/chapter-visits';
  import { dueCount } from '$lib/stores/due';
  import {
    buildStudyDeck,
    buildStudyNotes,
    buildStudyQuiz,
    readStudyChapterIds,
    type StudyCard,
    type StudyQuizQuestion
  } from '$lib/content/study';
  import {
    readQuizDifficulty,
    writeQuizDifficulty,
    type QuizDifficulty
  } from '$lib/content/quiz-difficulty';
  import QuizDifficultyPicker from '$lib/components/QuizDifficultyPicker.svelte';
  import { INITIAL_STATE, type Rating, type SrsState } from '$lib/srs/sm2';
  import QuizSummary from '$lib/components/QuizSummary.svelte';

  type Mode = 'fc' | 'notes' | 'quiz';

  let ready = $state(false);
  let chapterIds = $state<string[]>([]);
  let mode = $state<Mode>('fc');
  let deck = $state<StudyCard[]>([]);
  let notes = $state<ReturnType<typeof buildStudyNotes>>([]);
  let quiz = $state<StudyQuizQuestion[]>([]);
  let quizDifficulty = $state<QuizDifficulty>('level2');

  let fcIdx = $state(0);
  let srs = $state<SrsState>(INITIAL_STATE);
  let answers = $state<Record<string, number>>({});

  const card = $derived(deck[fcIdx]);
  const headerBadge = $derived(
    chapterIds.length === 1 ? `Ch ${getChapter(chapterIds[0])?.number ?? ''}` : `${chapterIds.length} Chapters`
  );
  const headerTitle = $derived(
    chapterIds.length === 1
      ? (getChapter(chapterIds[0])?.title ?? '')
      : chapterIds
          .map((id) => {
            const ch = getChapter(id);
            return ch ? `Ch ${ch.number}` : '';
          })
          .filter(Boolean)
          .join(', ')
  );
  const quizScore = $derived(quiz.reduce((acc, q) => acc + (answers[q.id] === q.ans ? 1 : 0), 0));
  const quizAnswered = $derived(Object.keys(answers).length);
  const quizChapterNums = $derived(Object.fromEntries(quiz.map((q) => [q.id, q.chapterNum])));

  onMount(() => {
    chapterIds = readStudyChapterIds();
    if (chapterIds.length === 0) {
      goto('/browse');
      return;
    }
    deck = buildStudyDeck(chapterIds);
    notes = buildStudyNotes(chapterIds);
    quizDifficulty = readQuizDifficulty();
    quiz = buildStudyQuiz(chapterIds, quizDifficulty);
    notes.forEach((n) => markNoteRead(n.chapterId, n.id));
    ready = true;
  });

  function setQuizDifficulty(d: QuizDifficulty) {
    quizDifficulty = d;
    writeQuizDifficulty(d);
    quiz = buildStudyQuiz(chapterIds, d);
    answers = {};
  }

  $effect(() => {
    if (!card) return;
    getCardProgress(card.id).then((p) => {
      srs = p ?? INITIAL_STATE;
    });
  });

  async function rate(rating: Rating) {
    if (!card) return;
    await recordReview(card.id, rating);
    await dueCount.refresh();
    if (fcIdx < deck.length - 1) fcIdx += 1;
  }

  function prevCard() {
    if (fcIdx > 0) fcIdx -= 1;
  }

  function nextCard() {
    if (fcIdx < deck.length - 1) fcIdx += 1;
  }

  async function pick(q: StudyQuizQuestion, optIdx: number) {
    if (answers[q.id] !== undefined) return;
    answers[q.id] = optIdx;
    await recordQuizAttempt({
      chapterId: q.chapterId,
      questionId: q.id,
      selected: optIdx,
      correct: optIdx === q.ans
    });
  }
</script>

<svelte:head><title>Study · EMT Study</title></svelte:head>

<a class="back" href="/browse">← Back to chapters</a>

{#if !ready}
  <p>Loading…</p>
{:else}
  <header class="hero">
    <div class="badge">{headerBadge}</div>
    <h1>{headerTitle}</h1>
  </header>

  <div class="tabs">
    <button class:active={mode === 'fc'} onclick={() => (mode = 'fc')}>Flashcards</button>
    <button class:active={mode === 'notes'} onclick={() => (mode = 'notes')}>Notes</button>
    <button class:active={mode === 'quiz'} onclick={() => (mode = 'quiz')}>Quiz</button>
  </div>

  {#if mode === 'fc' && card}
    <p class="meta">Ch {card.chapterNum} · {fcIdx + 1} / {deck.length}</p>
    <Flashcard {card} {srs} onRate={rate} />
    <div class="nav">
      <button onclick={prevCard} disabled={fcIdx === 0}>Prev</button>
      <button onclick={nextCard} disabled={fcIdx === deck.length - 1}>Skip →</button>
    </div>
  {:else if mode === 'notes'}
    {#each notes as n (n.id)}
      <article>
        <p class="ch">Ch {n.chapterNum}</p>
        <h2>{n.title}</h2>
        <p>{n.body}</p>
        {#if n.terms.length}
          <ul class="terms">
            {#each n.terms as t}<li>{t}</li>{/each}
          </ul>
        {/if}
      </article>
    {/each}
  {:else if mode === 'quiz'}
    <QuizDifficultyPicker difficulty={quizDifficulty} onchange={setQuizDifficulty} />
    <p class="meta">{quizScore}/{quizAnswered}/{quiz.length}</p>
    {#each quiz as q (q.id)}
      {@const picked = answers[q.id]}
      <article>
        <p class="ch">Ch {q.chapterNum}</p>
        <p class="q">{q.q}</p>
        {#each q.opts as opt, i}
          {@const isPicked = picked === i}
          {@const isCorrect = i === q.ans}
          <button
            class="opt"
            class:picked={isPicked}
            class:correct={picked !== undefined && isCorrect}
            class:wrong={isPicked && !isCorrect}
            disabled={picked !== undefined}
            onclick={() => pick(q, i)}
          >
            {opt}
          </button>
        {/each}
        {#if picked !== undefined}
          <p class="exp">{q.exp}</p>
        {/if}
      </article>
    {/each}
    <QuizSummary questions={quiz} {answers} chapterNums={quizChapterNums} />
  {/if}
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  .hero {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: 16px;
  }
  .badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--cyan);
    margin-bottom: 4px;
  }
  h1 { font-size: 18px; }
  .tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 16px;
  }
  .tabs button {
    padding: 10px 8px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text2);
    font-size: 12px;
    min-height: var(--tap);
  }
  .tabs button.active {
    background: var(--cyan-bg);
    border-color: var(--cyan-dim);
    color: var(--cyan);
  }
  .meta {
    color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    margin-bottom: 12px;
  }
  .nav { display: flex; justify-content: space-between; margin-top: 12px; }
  .nav button {
    padding: 10px 14px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .nav button:disabled { color: var(--text3); }
  article {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
  }
  .ch {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--text3);
    margin-bottom: 6px;
  }
  h2 { color: var(--cyan); font-size: 14px; margin-bottom: 8px; }
  .terms { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .terms li {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text2);
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
  }
  .q { font-size: 14px; margin-bottom: 12px; }
  .opt {
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px;
    margin-bottom: 6px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 13px;
    min-height: var(--tap);
  }
  .opt.correct { background: var(--green-bg); border-color: var(--green-bd); color: var(--green); }
  .opt.wrong { background: var(--red-bg); border-color: var(--red-bd); color: var(--red); }
  .opt:disabled { cursor: default; }
  .exp { color: var(--text2); font-size: 13px; margin-top: 8px; padding: 8px; background: var(--bg3); border-radius: 6px; }
</style>
