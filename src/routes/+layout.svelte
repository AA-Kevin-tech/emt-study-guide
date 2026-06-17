<script lang="ts">
  import '$lib/styles/reset.css';
  import '$lib/styles/theme.css';
  import ECGHeader from '$lib/components/ECGHeader.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { isIndexedDBAvailable } from '$lib/db/availability';

  let { children } = $props();
  const idbOK = isIndexedDBAvailable();
</script>

<ECGHeader />

<main>
  {#if idbOK}
    {@render children()}
  {:else}
    <div class="idb-error">
      <h2>Storage unavailable</h2>
      <p>EMT Study Guide requires IndexedDB to remember your progress. Please exit private browsing or use a different browser.</p>
    </div>
  {/if}
</main>

<BottomNav />

<style>
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 16px;
  }
  .idb-error {
    padding: 24px;
    border: 1px solid var(--red-bd);
    background: var(--red-bg);
    border-radius: var(--radius);
  }
  .idb-error h2 { color: var(--red); margin-bottom: 8px; font-size: 18px; }
</style>
