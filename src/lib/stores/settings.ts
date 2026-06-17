import { writable } from 'svelte/store';
import { getSetting, setSetting, DEFAULTS } from '$lib/db/settings';

function makeSettingsStore() {
  const { subscribe, set, update } = writable<{ dailyNewCardBudget: number }>({
    dailyNewCardBudget: DEFAULTS.dailyNewCardBudget,
  });

  async function load() {
    const budget = await getSetting('dailyNewCardBudget', DEFAULTS.dailyNewCardBudget);
    set({ dailyNewCardBudget: budget });
  }

  async function setBudget(n: number) {
    await setSetting('dailyNewCardBudget', n);
    update(s => ({ ...s, dailyNewCardBudget: n }));
  }

  return { subscribe, load, setBudget };
}

export const settings = makeSettingsStore();
