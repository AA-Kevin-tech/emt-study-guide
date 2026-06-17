<script lang="ts">
  import { onMount } from 'svelte';
  import { dueCount } from '$lib/stores/due';
  import { db } from '$lib/db/schema';
  import { CHAPTERS } from '$lib/content';

  let recent = $state<{ id: string; title: string }[]>([]);

  onMount(async () => {
    await dueCount.refresh();
    const visits = await db().chapterVisits
      .orderBy('lastVisitedAt').reverse().limit(3).toArray();
    const byId = new Map(CHAPTERS.map(c => [c.id, c]));
    recent = visits.flatMap(v => {
      const c = byId.get(v.chapterId);
      return c ? [{ id: c.id, title: `Ch ${c.number} — ${c.title}` }] : [];
    });
  });
</script>

<svelte:head><title>Today · EMT Study</title></svelte:head>

<section class="hero">
  <div class="count">{$dueCount}</div>
  <div class="label">cards due</div>
  {#if $dueCount > 0}
    <a class="start" href="/review">Start review</a>
  {:else}
    <p class="empty">All caught up — pick a chapter to add new cards.</p>
    <a class="start" href="/browse">Browse chapters</a>
  {/if}
</section>

{#if recent.length}
  <section>
    <h2>Recent</h2>
    <ul>
      {#each recent as r (r.id)}
        <li><a href={`/chapter/${r.id}`}>{r.title}</a></li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .hero {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    text-align: center;
    margin-bottom: 24px;
  }
  .count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 56px;
    color: var(--cyan);
    line-height: 1;
  }
  .label {
    color: var(--text2);
    letter-spacing: 0.1em;
    font-size: 12px;
    margin-top: 6px;
    margin-bottom: 16px;
  }
  .start {
    display: inline-block;
    padding: 12px 18px;
    background: var(--cyan-bg);
    border: 1px solid var(--cyan-dim);
    border-radius: var(--radius);
    color: var(--cyan);
    min-height: var(--tap);
  }
  .empty { color: var(--text2); margin-bottom: 12px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  ul { display: flex; flex-direction: column; gap: 6px; }
  li a {
    display: block;
    padding: 12px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
</style>
