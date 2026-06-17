import { writable } from 'svelte/store';
import { countDue } from '$lib/srs/scheduler';

function makeDueStore() {
  const { subscribe, set } = writable<number>(0);

  async function refresh() {
    set(await countDue());
  }

  return { subscribe, refresh };
}

export const dueCount = makeDueStore();
