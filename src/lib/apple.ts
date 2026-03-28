import { load } from "cheerio";
import pLimit from "p-limit";
import { AppError } from "@/lib/app-error";
import { AREAS, AREA_MAP, AREA_CURRENCY_MAP } from "@/lib/areas";
import { getCachedAppInfo, getCachedAppList, setCachedAppInfo, setCachedAppList } from "@/lib/cache";
import { convertToCny, keep2 } from "@/lib/exchange-rate";
import { addPopularWord } from "@/lib/popular-search";
import { singleFlight } from "@/lib/single-flight";
import type { AppInfoComparisonItem, AppInfoItem, AppListItem, InAppPurchaseItem, Money } from "@/lib/types";

const SEARCH_ENTITIES = ["iphone", "ipad", "mac", "tv"];
const fetchLimit = pLimit(6);

function parseSerializedServerData(html: string) {
  const $ = load(html);
  const raw = $("#serialized-server-data").html();
  if (!raw) return null;
  return JSON.parse(raw);
}

function normalizePriceText(rawText: string, thousandsSeparator: "," | ".") {
  let text = rawText.trim();
  if (!text) return 0;

  text = text.replaceAll(thousandsSeparator, "");
  if (thousandsSeparator === ".") {
    text = text.replaceAll(",", ".");
  }

  const matched = text.match(/\d+(\.\d+)?/);
  if (!matched) return 0;
  return Number.parseFloat(matched[0]);
}

async function toMoney(currencyCode: string, price: number): Promise<Money> {
  const area = AREA_CURRENCY_MAP.get(currencyCode);
  if (!area) {
    throw new Error(`不支持的币种: ${currencyCode}`);
  }

  return {
    area: area.code,
    areaName: area.name,
    currency: area.currency,
    currencyCode: area.currencyCode,
    locale: area.locale,
    price: keep2(price),
    cnyPrice: await convertToCny(keep2(price), area.currencyCode)
  };
}

function relevance(appName: string, query: string): number {
  const source = appName.toLowerCase();
  const q = query.toLowerCase();
  if (source === q) return 0;
  if (source.startsWith(q)) return 1;
  if ([...q].every((char) => source.includes(char))) return 2;
  return 3;
}

function safeGet(obj: unknown, path: string[]): unknown {
  let current = obj as Record<string, unknown> | undefined;
  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return undefined;
    current = current[key] as Record<string, unknown>;
  }
  return current;
}

export async function getAppList(areaCode: string, appName: string): Promise<AppListItem[]> {
  const area = AREA_MAP.get(areaCode);
  if (!area) {
    throw new AppError("不支持的地区代码");
  }

  const query = appName.trim();
  if (!query) {
    throw new AppError("appName can not be blank");
  }

  await addPopularWord(query);
  const cacheKey = `${areaCode}-${query}`;
  const cached = await getCachedAppList(cacheKey);
  if (cached) return cached;

  return singleFlight(cacheKey, async () => {
    const listFromEntities = await Promise.all(
      SEARCH_ENTITIES.map((entity) =>
        fetchLimit(async () => {
          const searchUrl = `https://apps.apple.com/${areaCode}/${entity}/search?term=${encodeURIComponent(query)}`;
          const response = await fetch(searchUrl, {
            method: "GET",
            headers: { "user-agent": "Mozilla/5.0" },
            cache: "no-store"
          });

          if (!response.ok) return [] as AppListItem[];

          const html = await response.text();
          const data = parseSerializedServerData(html);
          if (!data) return [] as AppListItem[];

          const items = safeGet(data, ["data", "0", "data", "shelves", "0", "items"]);
          if (!Array.isArray(items)) return [] as AppListItem[];

          return items
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const resultType = (item as { resultType?: string }).resultType;
              const lockup = (item as { lockup?: Record<string, unknown> }).lockup;
              if (!lockup || resultType === "bundle") return null;

              const appId = String((lockup as { adamId?: string | number }).adamId ?? "");
              if (!appId) return null;

              return {
                appId,
                appName: String((lockup as { title?: string }).title ?? ""),
                appImage: String((lockup as { icon?: { template?: string } }).icon?.template ?? ""),
                appDesc: String((lockup as { subtitle?: string }).subtitle ?? "")
              } satisfies AppListItem;
            })
            .filter((item): item is AppListItem => Boolean(item));
        })
      )
    );

    const dedupMap = new Map<string, AppListItem>();
    for (const item of listFromEntities.flat()) {
      if (!dedupMap.has(item.appId)) {
        dedupMap.set(item.appId, item);
      }
    }

    const result = [...dedupMap.values()].sort((a, b) => relevance(a.appName, query) - relevance(b.appName, query));
    await setCachedAppList(cacheKey, result);
    return result;
  });
}

function getInAppArray(pageData: Record<string, unknown>, iapLabel: string): unknown[] {
  const infoItems = safeGet(pageData, ["shelfMapping", "information", "items"]);
  if (!Array.isArray(infoItems)) return [];

  const target = infoItems.find((item) => {
    if (!item || typeof item !== "object") return false;
    return (item as { title?: string }).title === iapLabel;
  }) as { items?: unknown[] } | undefined;

  const textPairs = target?.items?.[0];
  if (!textPairs || typeof textPairs !== "object") return [];

  const pairs = (textPairs as { textPairs?: unknown[] }).textPairs;
  return Array.isArray(pairs) ? pairs : [];
}

async function buildAppInfoForArea(appId: string, areaCode: string): Promise<AppInfoItem | null> {
  const area = AREA_MAP.get(areaCode);
  if (!area) return null;

  const appStoreUrl = `https://apps.apple.com/${area.code}/app/id${appId}`;
  const response = await fetch(appStoreUrl, {
    method: "GET",
    headers: { "user-agent": "Mozilla/5.0" },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const data = parseSerializedServerData(html);
  if (!data) return null;

  const pageData = safeGet(data, ["data", "0", "data"]);
  if (!pageData || typeof pageData !== "object") return null;

  const title = String((pageData as { title?: string }).title ?? "");
  const lockup = (pageData as { lockup?: Record<string, unknown> }).lockup ?? {};
  const developerAction = (pageData as { developerAction?: Record<string, unknown> }).developerAction ?? {};

  const rawPrice = String(
    (lockup as { offerDisplayProperties?: { priceFormatted?: string } }).offerDisplayProperties?.priceFormatted ?? ""
  );

  const parsedPrice = normalizePriceText(rawPrice, area.thousandsSeparator);
  const appPrice = await toMoney(area.currencyCode, parsedPrice);

  const inAppPurchaseArray = getInAppArray(pageData as Record<string, unknown>, area.inAppPurchaseLabel);

  const inAppPurchaseList: InAppPurchaseItem[] = [];
  for (const item of inAppPurchaseArray) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const objectName = String(item[0] ?? "").trim();
    const priceText = String(item[1] ?? "");
    const amount = normalizePriceText(priceText, area.thousandsSeparator);

    inAppPurchaseList.push({
      object: objectName,
      price: await toMoney(area.currencyCode, amount)
    });
  }

  return {
    appId,
    area: area.code,
    areaName: area.name,
    name: title,
    subtitle: String((lockup as { subtitle?: string }).subtitle ?? ""),
    developer: String((developerAction as { title?: string }).title ?? ""),
    appStoreUrl,
    price: appPrice,
    inAppPurchaseList
  };
}

export async function getAppInfo(appId: string): Promise<AppInfoItem[]> {
  const cleanId = appId.trim().replace(/^id/i, "");
  if (!cleanId) {
    throw new AppError("appId can not be blank");
  }

  const cached = await getCachedAppInfo(cleanId);
  if (cached) return cached;

  return singleFlight(`appInfo-${cleanId}`, async () => {
    const list = (
      await Promise.all(
        AREAS.map((area) => fetchLimit(() => buildAppInfoForArea(cleanId, area.code)))
      )
    ).filter((item): item is AppInfoItem => Boolean(item));

    list.sort((a, b) => {
      const aIapMin = a.inAppPurchaseList.reduce((min, item) => Math.min(min, item.price.cnyPrice), Number.POSITIVE_INFINITY);
      const bIapMin = b.inAppPurchaseList.reduce((min, item) => Math.min(min, item.price.cnyPrice), Number.POSITIVE_INFINITY);
      if (aIapMin !== bIapMin) return aIapMin - bIapMin;
      return a.price.cnyPrice - b.price.cnyPrice;
    });

    await setCachedAppInfo(cleanId, list);
    return list;
  });
}

export async function getAppInfoComparison(appId: string): Promise<AppInfoComparisonItem[]> {
  const appInfoList = await getAppInfo(appId);
  if (appInfoList.length === 0) return [];

  const comparisonMap = new Map<string, Money[]>();
  comparisonMap.set("软件本体", appInfoList.map((item) => item.price));

  for (const appInfo of appInfoList) {
    const sortedPurchase = [...appInfo.inAppPurchaseList].sort((a, b) => a.price.cnyPrice - b.price.cnyPrice);
    const localCount = new Map<string, number>();

    for (const purchase of sortedPurchase) {
      const count = (localCount.get(purchase.object) ?? 0) + 1;
      localCount.set(purchase.object, count);
      const key = count > 1 ? `${purchase.object} #${count}` : purchase.object;
      if (!comparisonMap.has(key)) comparisonMap.set(key, []);
      comparisonMap.get(key)?.push(purchase.price);
    }
  }

  return [...comparisonMap.entries()]
    .map(([object, priceList]) => ({
      object,
      priceList: [...priceList].sort((a, b) => a.cnyPrice - b.cnyPrice)
    }))
    .sort((a, b) => b.priceList.length - a.priceList.length);
}
