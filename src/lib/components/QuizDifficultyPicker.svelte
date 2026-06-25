<script lang="ts">
  import type { QuizDifficulty } from '$lib/content/quiz-difficulty';

  let {
    difficulty,
    onchange
  }: {
    difficulty: QuizDifficulty;
    onchange: (d: QuizDifficulty) => void;
  } = $props();

  const levels: { id: QuizDifficulty; label: string; hint: string }[] = [
    { id: 'level1', label: 'Level 1', hint: '2 choices · recall wording' },
    { id: 'level2', label: 'Level 2', hint: '4 choices · standard' }
  ];
</script>

<div class="picker" role="group" aria-label="Quiz level">
  <span class="label">Level</span>
  <div class="opts">
    {#each levels as level (level.id)}
      <button
        class:active={difficulty === level.id}
        aria-pressed={difficulty === level.id}
        onclick={() => onchange(level.id)}
      >
        <span class="name">{level.label}</span>
        <span class="hint">{level.hint}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .picker { margin-bottom: 16px; }
  .label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .opts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  .opts button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text2);
    min-height: var(--tap);
    text-align: left;
  }
  .opts button.active {
    background: var(--cyan-bg);
    border-color: var(--cyan-dim);
    color: var(--cyan);
  }
  .name { font-size: 13px; font-weight: 600; }
  .hint { font-size: 10px; opacity: 0.85; line-height: 1.3; }
</style>
