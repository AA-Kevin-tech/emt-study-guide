<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { onMount } from 'svelte';
  import { markNoteRead } from '$lib/db/chapter-visits';

  const id = $derived(page.params.id ?? '');
  const chapter = $derived(getChapter(id));

  onMount(() => {
    if (chapter) chapter.notes.forEach(n => markNoteRead(chapter.id, n.id));
  });
</script>

<svelte:head><title>Notes — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter}
  <h1>{chapter.title} — Notes</h1>

  {#each chapter.notes as n (n.id)}
    <article>
      <h2>{n.title}</h2>
      <p>{n.body}</p>
      {#if n.terms.length}
        <ul class="terms">
          {#each n.terms as t}<li>{t}</li>{/each}
        </ul>
      {/if}
    </article>
  {/each}
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  h1 { font-size: 18px; margin-bottom: 16px; }
  article {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
  }
  h2 { color: var(--cyan); font-size: 14px; margin-bottom: 8px; letter-spacing: 0.04em; }
  p { color: var(--text); font-size: 14px; }
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
</style>
