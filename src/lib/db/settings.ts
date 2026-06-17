import { db } from './schema';

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db().settings.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db().settings.put({ key, value });
}

export const DEFAULTS = {
  dailyNewCardBudget: 20,
} as const;
