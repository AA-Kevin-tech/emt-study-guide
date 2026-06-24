<script lang="ts">
  import { summarizeQuiz, type QuizAnswers } from '$lib/content/quiz-results';
  import type { QuizQuestion } from '$lib/content/types';

  let {
    questions,
    answers,
    chapterNums = {}
  }: {
    questions: QuizQuestion[];
    answers: QuizAnswers;
    chapterNums?: Record<string, number>;
  } = $props();

  const results = $derived(summarizeQuiz(questions, answers, chapterNums));
</script>

{#if results.complete}
  <section class="summary" aria-live="polite">
    <h2>Quiz complete</h2>
    <p class="percent" class:high={results.percent >= 80} class:mid={results.percent >= 60 && results.percent < 80} class:low={results.percent < 60}>
      {results.percent}%
    </p>
    <p class="detail">{results.correct} of {results.total} correct</p>

    {#if results.wrong.length > 0}
      <h3>Questions you missed ({results.wrong.length})</h3>
      <ul class="wrong-list">
        {#each results.wrong as item (item.question.id)}
          <li>
            {#if item.chapterNum}
              <p class="ch">Ch {item.chapterNum}</p>
            {/if}
            <p class="q">{item.question.q}</p>
            <p class="your-ans wrong-text">Your answer: {item.question.opts[item.selected]}</p>
            <p class="correct-ans">Correct: {item.question.opts[item.question.ans]}</p>
            <p class="exp">{item.question.exp}</p>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="perfect">Perfect score — all questions correct.</p>
    {/if}
  </section>
{/if}

<style>
  .summary {
    margin-top: 20px;
    padding: 20px 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  h2 {
    font-size: 16px;
    margin-bottom: 8px;
  }
  h3 {
    font-size: 13px;
    color: var(--text2);
    margin: 16px 0 10px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .percent {
    font-size: 40px;
    font-weight: 600;
    line-height: 1;
    margin-bottom: 4px;
  }
  .percent.high { color: var(--green); }
  .percent.mid { color: var(--yellow); }
  .percent.low { color: var(--red); }
  .detail {
    color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    margin-bottom: 4px;
  }
  .perfect {
    color: var(--green);
    font-size: 14px;
    margin-top: 12px;
  }
  .wrong-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .wrong-list li {
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .ch {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--text3);
    margin-bottom: 6px;
  }
  .q {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .your-ans,
  .correct-ans {
    font-size: 13px;
    margin-bottom: 4px;
  }
  .wrong-text { color: var(--red); }
  .correct-ans { color: var(--green); }
  .exp {
    color: var(--text2);
    font-size: 13px;
    margin-top: 8px;
    padding: 8px;
    background: var(--bg2);
    border-radius: 6px;
  }
</style>
