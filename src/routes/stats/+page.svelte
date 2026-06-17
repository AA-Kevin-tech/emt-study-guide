<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db/schema';

  let reviewsToday = $state(0);
  let total = $state(0);
  let mastered = $state(0);
  let learning = $state(0);
  let last30 = $state<{ date: string; count: number }[]>([]);

  function dayKey(ts: number): string {
    return new Date(ts).toISOString().slice(0, 10);
  }

  onMount(async () => {
    const now = Date.now();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);

    const allLog = await db().reviewLog.toArray();
    reviewsToday = allLog.filter(r => r.reviewedAt >= startOfDay.getTime()).length;

    const cardProgress = await db().cardProgress.toArray();
    total = cardProgress.length;
    mastered = cardProgress.filter(p => p.intervalDays > 21).length;
    learning = total - mastered;

    const counts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      counts.set(dayKey(d.getTime()), 0);
    }
    for (const r of allLog) {
      const k = dayKey(r.reviewedAt);
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    last30 = [...counts.entries()].map(([date, count]) => ({ date, count }));
  });

  function shade(c: number): string {
    if (c === 0) return 'var(--bg3)';
    if (c < 5) return 'var(--cyan-dim)';
    return 'var(--cyan)';
  }
</script>

<svelte:head><title>Stats · EMT Study</title></svelte:head>

<h1>Stats</h1>

<div class="grid">
  <div class="stat"><div class="n">{reviewsToday}</div><div class="l">reviewed today</div></div>
  <div class="stat"><div class="n">{mastered}</div><div class="l">mastered (&gt;21d)</div></div>
  <div class="stat"><div class="n">{learning}</div><div class="l">learning</div></div>
  <div class="stat"><div class="n">{total}</div><div class="l">cards started</div></div>
</div>

<h2>Last 30 days</h2>
<div class="heat">
  {#each last30 as d (d.date)}
    <div class="cell" title={`${d.date}: ${d.count} reviews`} style={`background:${shade(d.count)}`}></div>
  {/each}
</div>

<style>
  h1 { font-size: 20px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .stat {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 14px; text-align: center;
  }
  .n { font-family: 'JetBrains Mono', monospace; font-size: 28px; color: var(--cyan); }
  .l { font-size: 11px; color: var(--text2); letter-spacing: 0.05em; margin-top: 4px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: var(--cyan); letter-spacing: 0.08em; margin-bottom: 8px;
  }
  .heat {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    gap: 4px;
  }
  .cell { aspect-ratio: 1; border-radius: 3px; }
</style>
