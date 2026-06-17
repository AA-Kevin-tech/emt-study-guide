<script lang="ts">
  import { onMount } from 'svelte';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { getDueCards, type DueCard } from '$lib/srs/scheduler';
  import { recordReview } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';
  import type { Rating, SrsState } from '$lib/srs/sm2';

  let queue = $state<DueCard[]>([]);
  let idx = $state(0);
  let total = $state(0);
  let loaded = $state(false);

  const current = $derived(queue[idx]);

  onMount(async () => {
    queue = await getDueCards();
    total = queue.length;
    loaded = true;
  });

  function progressSrs(): SrsState {
    if (!current) return { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 };
    return {
      ease: current.progress.ease,
      intervalDays: current.progress.intervalDays,
      reps: current.progress.reps,
      lapses: current.progress.lapses,
    };
  }

  async function onRate(rating: Rating) {
    if (!current) return;
    await recordReview(current.card.id, rating);
    await dueCount.refresh();
    if (idx < queue.length - 1) idx += 1;
    else idx = queue.length;   // sentinel — done
  }
</script>

<svelte:head><title>Review · EMT Study</title></svelte:head>

{#if !loaded}
  <p>Loading…</p>
{:else if total === 0}
  <h1>Nothing due</h1>
  <p>Come back tomorrow, or <a href="/browse">study a chapter</a> to add cards to your queue.</p>
{:else if idx >= queue.length}
  <h1>Done!</h1>
  <p>Reviewed {total} card{total === 1 ? '' : 's'}.</p>
  <a class="cta" href="/">Back to Today</a>
{:else}
  <p class="pos">{idx + 1} / {total}</p>
  <Flashcard card={current.card} srs={progressSrs()} {onRate} />
{/if}

<style>
  h1 { font-size: 22px; margin-bottom: 8px; }
  .pos { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 12px; }
  .cta {
    display: inline-block;
    margin-top: 12px;
    padding: 10px 16px;
    background: var(--cyan-bg);
    border: 1px solid var(--cyan-dim);
    border-radius: var(--radius);
    color: var(--cyan);
  }
</style>
