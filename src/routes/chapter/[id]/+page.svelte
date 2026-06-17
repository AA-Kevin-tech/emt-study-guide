<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { onMount } from 'svelte';
  import { recordChapterVisit } from '$lib/db/chapter-visits';

  const id = $derived(page.params.id ?? '');
  const chapter = $derived(getChapter(id));

  onMount(() => {
    if (chapter) recordChapterVisit(chapter.id);
  });
</script>

<svelte:head><title>{chapter?.title ?? 'Chapter'} · EMT Study</title></svelte:head>

{#if !chapter}
  <p>Chapter not found.</p>
{:else}
  <div class="head">
    <div class="num">Ch {chapter.number}</div>
    <h1>{chapter.title}</h1>
  </div>

  <div class="modes">
    <a href={`/chapter/${chapter.id}/flashcards`}>
      <span class="m">Flashcards</span>
      <span class="c">{chapter.cards.length}</span>
    </a>
    <a href={`/chapter/${chapter.id}/notes`}>
      <span class="m">Notes</span>
      <span class="c">{chapter.notes.length}</span>
    </a>
    <a href={`/chapter/${chapter.id}/quiz`}>
      <span class="m">Quiz</span>
      <span class="c">{chapter.quiz.length}</span>
    </a>
  </div>
{/if}

<style>
  .head { margin-bottom: 24px; }
  .num { font-family: 'JetBrains Mono', monospace; color: var(--cyan); font-size: 12px; letter-spacing: 0.1em; }
  h1 { font-size: 22px; margin-top: 6px; }
  .modes { display: grid; grid-template-columns: 1fr; gap: 8px; }
  .modes a {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .modes a:hover { border-color: var(--cyan-dim); text-decoration: none; }
  .m { font-size: 15px; }
  .c { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
</style>
