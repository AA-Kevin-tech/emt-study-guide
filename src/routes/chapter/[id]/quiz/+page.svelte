<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { recordQuizAttempt } from '$lib/db/quiz';

  const id = $derived(page.params.id ?? '');
  const chapter = $derived(getChapter(id));

  let answers = $state<Record<string, number>>({});

  async function pick(qId: string, optIdx: number, correctIdx: number) {
    if (answers[qId] !== undefined) return;
    answers[qId] = optIdx;
    await recordQuizAttempt({
      chapterId: id,
      questionId: qId,
      selected: optIdx,
      correct: optIdx === correctIdx,
    });
  }

  const score = $derived(
    chapter
      ? chapter.quiz.reduce((acc, q) => acc + (answers[q.id] === q.ans ? 1 : 0), 0)
      : 0
  );
  const answered = $derived(Object.keys(answers).length);
</script>

<svelte:head><title>Quiz — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter}
  <h1>{chapter.title} — Quiz</h1>
  <p class="score">{score}/{answered}/{chapter.quiz.length}</p>

  {#each chapter.quiz as q (q.id)}
    {@const picked = answers[q.id]}
    <article>
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
          onclick={() => pick(q.id, i, q.ans)}
        >
          {opt}
        </button>
      {/each}
      {#if picked !== undefined}
        <p class="exp">{q.exp}</p>
      {/if}
    </article>
  {/each}
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  h1 { font-size: 18px; }
  .score { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 16px; }
  article {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
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
  .opt.wrong   { background: var(--red-bg);   border-color: var(--red-bd);   color: var(--red); }
  .opt:disabled { cursor: default; }
  .exp { color: var(--text2); font-size: 13px; margin-top: 8px; padding: 8px; background: var(--bg3); border-radius: 6px; }
</style>
