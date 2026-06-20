<script lang="ts">
  import { goto } from '$app/navigation';
  import { PARTS } from '$lib/content/parts';
  import { CHAPTERS } from '$lib/content';
  import { writeStudyChapterIds } from '$lib/content/study';

  const byId = new Map(CHAPTERS.map((c) => [c.id, c]));
  let selected = $state<Set<string>>(new Set());

  const selectedCount = $derived(selected.size);

  function toggleChapter(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }

  function selectAll() {
    selected = new Set(CHAPTERS.map((c) => c.id));
  }

  function selectNone() {
    selected = new Set();
  }

  function togglePart(chapterIds: string[]) {
    const allOn = chapterIds.every((id) => selected.has(id));
    const next = new Set(selected);
    chapterIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
    selected = next;
  }

  function startStudy() {
    if (selected.size === 0) return;
    writeStudyChapterIds([...selected]);
    goto('/study');
  }
</script>

<svelte:head><title>Browse · EMT Study</title></svelte:head>

<h1>Browse</h1>
<p class="hint">Pick one chapter or mix several — flashcards, notes, and quiz pull from everything you select.</p>

<div class="controls">
  <button class="sel-btn" onclick={selectAll}>All</button>
  <button class="sel-btn" onclick={selectNone}>None</button>
</div>

{#each PARTS as part (part.id)}
  <section>
    <div class="part-head">
      <h2>{part.label}</h2>
      <button class="part-sel" onclick={() => togglePart(part.chapterIds)}>select all</button>
    </div>
    <ul>
      {#each part.chapterIds as cid (cid)}
        {@const ch = byId.get(cid)}
        {#if ch}
          <li class="item">
            <button
              class="row"
              class:selected={selected.has(ch.id)}
              onclick={() => toggleChapter(ch.id)}
            >
              <span class="num">Ch {ch.number}</span>
              <span class="title">{ch.title}</span>
              <span class="check" aria-hidden="true"></span>
            </button>
            <a class="open" href={`/chapter/${ch.id}`} aria-label={`Open Ch ${ch.number}`}>→</a>
          </li>
        {/if}
      {/each}
    </ul>
  </section>
{/each}

{#if selectedCount > 0}
  <div class="study-bar">
    <button class="study-btn" onclick={startStudy}>
      Study {selectedCount} chapter{selectedCount === 1 ? '' : 's'} ▶
    </button>
  </div>
{/if}

<style>
  h1 { font-size: 20px; margin-bottom: 8px; letter-spacing: 0.05em; }
  .hint { color: var(--text2); font-size: 13px; margin-bottom: 16px; }
  .controls { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .sel-btn {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--bg3);
    color: var(--text2);
    min-height: var(--tap);
  }
  section { margin-bottom: 24px; }
  .part-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
  }
  .part-sel {
    font-size: 10px;
    color: var(--cyan-dim);
    background: none;
    border: none;
    font-family: 'JetBrains Mono', monospace;
    min-height: var(--tap);
    padding: 0 4px;
  }
  ul { display: flex; flex-direction: column; gap: 4px; }
  .item { display: flex; gap: 6px; align-items: stretch; }
  .row {
    flex: 1;
    display: flex;
    gap: 12px;
    width: 100%;
    padding: 12px 14px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
    align-items: center;
    text-align: left;
  }
  .row.selected {
    background: var(--cyan-bg);
    border-color: var(--cyan-dim);
  }
  .num {
    color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    min-width: 48px;
    flex-shrink: 0;
  }
  .row.selected .num { color: var(--cyan-dim); }
  .title { color: var(--text); font-size: 14px; flex: 1; }
  .row.selected .title { color: var(--cyan); }
  .check {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--border2);
    flex-shrink: 0;
  }
  .row.selected .check {
    background: var(--cyan);
    border-color: var(--cyan);
    position: relative;
  }
  .row.selected .check::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 3px;
    width: 5px;
    height: 3px;
    border-left: 1.5px solid #0d1117;
    border-bottom: 1.5px solid #0d1117;
    transform: rotate(-45deg);
  }
  .open {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--tap);
    padding: 0 12px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text2);
    font-size: 16px;
  }
  .study-bar {
    position: sticky;
    bottom: calc(var(--nav-h) + 8px);
    padding-top: 12px;
  }
  .study-btn {
    width: 100%;
    padding: 14px;
    background: var(--cyan);
    color: #0d1117;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    min-height: var(--tap);
  }
</style>
