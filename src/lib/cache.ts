import { LRUCache } from "lru-cache";
import type { AppInfoItem, AppListItem } from "@/lib/types";
import { kvGet, kvSetJson } from "@/lib/kv";

export const appListCache = new LRUCache<string, AppListItem[]>({
  max: 300,
  ttl: 1000 * 60 * 60 * 24
});

export const appInfoCache = new LRUCache<string, AppInfoItem[]>({
  max: 200,
  ttl: 1000 * 60 * 60 * 24
});

export const fxCache = new LRUCache<string, Record<string, number>>({
  max: 16,
  ttl: 1000 * 60 * 60 * 24
});

const DAY_SECONDS = 60 * 60 * 24;

export async function getCachedAppList(cacheKey: string): Promise<AppListItem[] | null> {
  const local = appListCache.get(cacheKey);
  if (local) return local;

  const shared = await kvGet<AppListItem[]>(`app-list:${cacheKey}`);
  if (shared) {
    appListCache.set(cacheKey, shared);
    return shared;
  }

  return null;
}

export async function setCachedAppList(cacheKey: string, list: AppListItem[]): Promise<void> {
  appListCache.set(cacheKey, list);
  await kvSetJson(`app-list:${cacheKey}`, list, DAY_SECONDS);
}

export async function getCachedAppInfo(appId: string): Promise<AppInfoItem[] | null> {
  const local = appInfoCache.get(appId);
  if (local) return local;

  const shared = await kvGet<AppInfoItem[]>(`app-info:${appId}`);
  if (shared) {
    appInfoCache.set(appId, shared);
    return shared;
  }

  return null;
}

export async function setCachedAppInfo(appId: string, list: AppInfoItem[]): Promise<void> {
  appInfoCache.set(appId, list);
  await kvSetJson(`app-info:${appId}`, list, DAY_SECONDS);
}

export async function getCachedFx(base: string): Promise<Record<string, number> | null> {
  const local = fxCache.get(base);
  if (local) return local;

  const shared = await kvGet<Record<string, number>>(`fx:${base}`);
  if (shared) {
    fxCache.set(base, shared);
    return shared;
  }

  return null;
}

export async function setCachedFx(base: string, rates: Record<string, number>): Promise<void> {
  fxCache.set(base, rates);
  await kvSetJson(`fx:${base}`, rates, DAY_SECONDS);
}
