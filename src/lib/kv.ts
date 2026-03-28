import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

function getRedis() {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

const memoryStore = new Map<string, string>();

export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) {
    const raw = memoryStore.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  return redis.get<T>(key);
}

export async function kvSetJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memoryStore.set(key, JSON.stringify(value));
    return;
  }

  if (ttlSeconds && ttlSeconds > 0) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }

  await redis.set(key, value);
}

export async function kvIncrBy(key: string, amount: number): Promise<number> {
  const redis = getRedis();
  if (!redis) {
    const current = Number(memoryStore.get(key) ?? "0");
    const next = current + amount;
    memoryStore.set(key, String(next));
    return next;
  }

  return redis.incrby(key, amount);
}

export async function kvTopCounter(prefix: string, limit: number): Promise<string[]> {
  const redis = getRedis();
  if (!redis) {
    return [...memoryStore.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => [key.slice(prefix.length), Number(value)] as const)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  const keys = await redis.keys(`${prefix}*`);
  if (!keys || keys.length === 0) return [];

  const values = await Promise.all(
    keys.map(async (key) => {
      const count = await redis.get<number>(key);
      return { word: key.slice(prefix.length), count: Number(count ?? 0) };
    })
  );

  return values
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => item.word);
}
