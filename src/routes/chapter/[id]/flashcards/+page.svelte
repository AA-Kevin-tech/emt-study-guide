<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { getCardProgress, recordReview } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';
  import { INITIAL_STATE, type Rating, type SrsState } from '$lib/srs/sm2';

  const id = $derived(page.params.id ?? '');
  const chapter = $derived(getChapter(id));

  let idx = $state(0);
  let srs = $state<SrsState>(INITIAL_STATE);

  const card = $derived(chapter?.cards[idx]);

  $effect(() => {
    if (!card) return;
    getCardProgress(card.id).then(p => {
      srs = p ?? INITIAL_STATE;
    });
  });

  async function rate(rating: Rating) {
    if (!card) return;
    await recordReview(card.id, rating);
    await dueCount.refresh();
    if (chapter && idx < chapter.cards.length - 1) idx += 1;
  }

  function prev() { if (idx > 0) idx -= 1; }
  function next() { if (chapter && idx < chapter.cards.length - 1) idx += 1; }
</script>

<svelte:head><title>Flashcards — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter && card}
  <p class="pos">{idx + 1} / {chapter.cards.length}</p>
  <Flashcard {card} {srs} onRate={rate} />
  <div class="nav">
    <button onclick={prev} disabled={idx === 0}>Prev</button>
    <button onclick={next} disabled={idx === chapter.cards.length - 1}>Skip →</button>
  </div>
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  .pos { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 12px; }
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
</style>
