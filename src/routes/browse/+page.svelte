<script lang="ts">
  import { PARTS } from '$lib/content/parts';
  import { CHAPTERS } from '$lib/content';

  const byId = new Map(CHAPTERS.map(c => [c.id, c]));
</script>

<svelte:head><title>Browse · EMT Study</title></svelte:head>

<h1>Browse</h1>

{#each PARTS as part (part.id)}
  <section>
    <h2>{part.label}</h2>
    <ul>
      {#each part.chapterIds as cid (cid)}
        {@const ch = byId.get(cid)}
        {#if ch}
          <li>
            <a href={`/chapter/${ch.id}`}>
              <span class="num">Ch {ch.number}</span>
              <span class="title">{ch.title}</span>
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </section>
{/each}

<style>
  h1 { font-size: 20px; margin-bottom: 16px; letter-spacing: 0.05em; }
  section { margin-bottom: 24px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  ul { display: flex; flex-direction: column; gap: 4px; }
  li a {
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
    align-items: center;
  }
  .num { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 48px; }
  .title { color: var(--text); font-size: 14px; }
</style>
