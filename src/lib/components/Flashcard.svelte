<script lang="ts">
  import type { Flashcard } from '$lib/content/types';
  import type { SrsState, Rating } from '$lib/srs/sm2';
  import { nextIntervalPreview, INITIAL_STATE } from '$lib/srs/sm2';

  let { card, srs = INITIAL_STATE, onRate }: {
    card: Flashcard;
    srs?: SrsState;
    onRate: (rating: Rating) => void;
  } = $props();

  let revealed = $state(false);

  $effect(() => {
    void card;
    revealed = false;
  });

  function previewLabel(days: number): string {
    if (days < 1) return '<1d';
    if (days < 30) return `${days}d`;
    return `${Math.round(days / 30)}mo`;
  }

  const ratings: { value: Rating; label: string }[] = [
    { value: 1, label: 'Again' },
    { value: 3, label: 'Hard' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Easy' },
  ];
</script>

<div class="card">
  <p class="q">{card.q}</p>
  {#if revealed}
    <hr />
    <p class="a">{card.a}</p>
  {/if}
</div>

{#if !revealed}
  <button class="reveal" onclick={() => (revealed = true)}>Reveal</button>
{:else}
  <div class="ratings">
    {#each ratings as r (r.value)}
      <button class="rate r{r.value}" onclick={() => onRate(r.value)}>
        <span class="label">{r.label}</span>
        <span class="iv">{previewLabel(nextIntervalPreview(srs, r.value))}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .card {
    padding: 24px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    min-height: 200px;
    margin-bottom: 16px;
  }
  .q { font-size: 16px; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 16px 0; }
  .a { color: var(--text); font-size: 15px; }
  .reveal {
    display: block; width: 100%;
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .ratings { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .rate {
    padding: 10px 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    min-height: var(--tap);
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    background: var(--bg2);
    color: var(--text);
  }
  .label { font-size: 12px; }
  .iv { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text2); }
  .r1 { border-color: var(--red-bd); color: var(--red); }
  .r3 { border-color: var(--yellow); color: var(--yellow); }
  .r4 { border-color: var(--green-bd); color: var(--green); }
  .r5 { border-color: var(--cyan-dim); color: var(--cyan); }
</style>
