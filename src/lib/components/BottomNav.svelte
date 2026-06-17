<script lang="ts">
  import { page } from '$app/state';

  const tabs = [
    { href: '/',       label: 'Today',  icon: 'calendar' },
    { href: '/browse', label: 'Browse', icon: 'book' },
    { href: '/stats',  label: 'Stats',  icon: 'chart' },
  ];

  function isActive(href: string): boolean {
    const path = page.url.pathname as string;
    if (href === '/') return path === '/' || path === '/review';
    return path.startsWith(href);
  }
</script>

<nav>
  {#each tabs as t (t.href)}
    <a href={t.href} class:active={isActive(t.href)}>
      <span class="icon">
        {#if t.icon === 'calendar'}📅{:else if t.icon === 'book'}📚{:else}📊{/if}
      </span>
      <span class="label">{t.label}</span>
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--nav-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--bg2);
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    z-index: 50;
  }
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--text2);
    text-decoration: none;
    min-height: var(--tap);
  }
  a:hover { text-decoration: none; }
  a.active { color: var(--cyan); }
  .icon { font-size: 20px; line-height: 1; }
  .label { font-size: 11px; letter-spacing: 0.05em; }
</style>
