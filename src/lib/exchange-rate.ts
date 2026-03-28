import { getCachedFx, setCachedFx } from "@/lib/cache";

const OPEN_ER_API = "https://open.er-api.com/v6/latest";

async function fetchRates(baseCurrencyCode: string): Promise<Record<string, number>> {
  const cached = await getCachedFx(baseCurrencyCode);
  if (cached) return cached;

  const response = await fetch(`${OPEN_ER_API}/${baseCurrencyCode}`, {
    method: "GET",
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) {
    throw new Error(`汇率服务请求失败: ${response.status}`);
  }

  const result = (await response.json()) as { rates?: Record<string, number> };
  if (!result.rates) {
    throw new Error("汇率数据异常");
  }

  await setCachedFx(baseCurrencyCode, result.rates);
  return result.rates;
}

export async function convertToCny(amount: number, currencyCode: string): Promise<number> {
  if (currencyCode === "CNY") return keep2(amount);

  const cnyRates = await fetchRates("CNY");
  const rate = cnyRates[currencyCode];
  if (!rate || rate <= 0) return 0;

  return keep2(amount / rate);
}

export function keep2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
