<header>
  <div class="ecg-line">
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="0,10 60,10 70,2 80,18 90,4 100,10 200,10 260,10 270,2 280,18 290,4 300,10 400,10"
        fill="none" stroke="var(--cyan)" stroke-width="1.5" />
    </svg>
  </div>
  <div class="bar">
    <span class="brand">EMT STUDY GUIDE</span>
    <a class="cog" href="/settings" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    </a>
  </div>
</header>

<style>
  header {
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    padding-top: env(safe-area-inset-top);
  }
  .ecg-line {
    height: 12px;
    overflow: hidden;
  }
  .ecg-line svg {
    width: 200%;
    height: 100%;
    animation: ecg 3s linear infinite;
  }
  @keyframes ecg {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
  }
  .brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--cyan);
  }
  .cog {
    color: var(--text2);
    padding: 6px;
    min-width: var(--tap);
    min-height: var(--tap);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cog:hover { color: var(--text); }
</style>
