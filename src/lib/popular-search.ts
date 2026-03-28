import { kvIncrBy, kvTopCounter } from "@/lib/kv";

const POPULAR_PREFIX = "popular-word:";

const memoryCounter = new Map<string, number>();

export async function addPopularWord(word: string): Promise<void> {
  const normalized = word.trim();
  if (!normalized) return;
  memoryCounter.set(normalized, (memoryCounter.get(normalized) ?? 0) + 1);
  await kvIncrBy(`${POPULAR_PREFIX}${normalized}`, 1);
}

export async function getPopularWords(limit = 10): Promise<string[]> {
  const shared = await kvTopCounter(POPULAR_PREFIX, limit);
  if (shared.length > 0) return shared;

  return [...memoryCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
