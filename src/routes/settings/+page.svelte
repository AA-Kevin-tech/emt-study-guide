<script lang="ts">
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { db } from '$lib/db/schema';
  import { resetAllProgress } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';

  let budgetInput = $state(20);
  let status = $state<string | null>(null);

  onMount(async () => {
    await settings.load();
  });

  $effect(() => {
    budgetInput = $settings.dailyNewCardBudget;
  });

  async function saveBudget() {
    await settings.setBudget(budgetInput);
    status = 'Saved.';
    setTimeout(() => (status = null), 1500);
  }

  async function exportData() {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      cardProgress:  await db().cardProgress.toArray(),
      quizAttempts:  await db().quizAttempts.toArray(),
      chapterVisits: await db().chapterVisits.toArray(),
      reviewLog:     await db().reviewLog.toArray(),
      settings:      await db().settings.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emt-study-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version !== 1) { status = 'Unknown export version.'; return; }
    await db().transaction('rw',
      [db().cardProgress, db().quizAttempts, db().chapterVisits, db().reviewLog, db().settings],
      async () => {
        await db().cardProgress.clear();
        await db().quizAttempts.clear();
        await db().chapterVisits.clear();
        await db().reviewLog.clear();
        await db().settings.clear();
        await db().cardProgress.bulkAdd(data.cardProgress  ?? []);
        await db().quizAttempts.bulkAdd(data.quizAttempts  ?? []);
        await db().chapterVisits.bulkAdd(data.chapterVisits ?? []);
        await db().reviewLog.bulkAdd(data.reviewLog        ?? []);
        await db().settings.bulkAdd(data.settings          ?? []);
      });
    await dueCount.refresh();
    status = 'Imported.';
  }

  async function reset() {
    if (!confirm('Erase all progress, quiz history, and review log? This cannot be undone.')) return;
    await resetAllProgress();
    await dueCount.refresh();
    status = 'Progress reset.';
  }
</script>

<svelte:head><title>Settings · EMT Study</title></svelte:head>

<h1>Settings</h1>

<section>
  <h2>Daily new-card budget</h2>
  <p class="help">How many never-seen cards to introduce per day. Lower it if reviews pile up.</p>
  <div class="row">
    <input type="number" min="0" max="200" bind:value={budgetInput} />
    <button onclick={saveBudget}>Save</button>
  </div>
</section>

<section>
  <h2>Backup & restore</h2>
  <p class="help">Export your progress as JSON; import on a new device to migrate.</p>
  <div class="row">
    <button onclick={exportData}>Export JSON</button>
    <label class="file">
      Import JSON
      <input type="file" accept="application/json" onchange={importData} />
    </label>
  </div>
</section>

<section>
  <h2 class="danger">Reset</h2>
  <p class="help">Erases progress, quiz history, and review log. Content is unaffected.</p>
  <button class="danger-btn" onclick={reset}>Reset all progress</button>
</section>

{#if status}<p class="status">{status}</p>{/if}

<style>
  h1 { font-size: 20px; margin-bottom: 16px; }
  section {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    margin-bottom: 12px;
  }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  h2.danger { color: var(--red); }
  .help { color: var(--text2); font-size: 13px; margin-bottom: 10px; }
  .row { display: flex; gap: 8px; align-items: center; }
  input[type=number] {
    flex: 1;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
    color: var(--text);
    min-height: var(--tap);
  }
  button, .file {
    padding: 10px 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    min-height: var(--tap);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }
  .file input { display: none; }
  .danger-btn { background: var(--red-bg); border-color: var(--red-bd); color: var(--red); }
  .status {
    margin-top: 12px;
    padding: 10px;
    background: var(--green-bg);
    border: 1px solid var(--green-bd);
    color: var(--green);
    border-radius: 6px;
    text-align: center;
  }
</style>
