import type { Area } from "@/lib/types";

export const AREAS: Area[] = [
  { code: "us", name: "美国", currency: "$", currencyCode: "USD", thousandsSeparator: ",", inAppPurchaseLabel: "In-App Purchases", locale: "en-US" },
  { code: "cn", name: "中国", currency: "¥", currencyCode: "CNY", thousandsSeparator: ",", inAppPurchaseLabel: "App内购买", locale: "zh-CN" },
  { code: "tw", name: "台湾", currency: "NT$", currencyCode: "TWD", thousandsSeparator: ",", inAppPurchaseLabel: "App內購買", locale: "zh-TW" },
  { code: "hk", name: "香港", currency: "HK$", currencyCode: "HKD", thousandsSeparator: ",", inAppPurchaseLabel: "App 內購買", locale: "zh-HK" },
  { code: "jp", name: "日本", currency: "¥", currencyCode: "JPY", thousandsSeparator: ",", inAppPurchaseLabel: "アプリ内課金", locale: "ja-JP" },
  { code: "kr", name: "韩国", currency: "₩", currencyCode: "KRW", thousandsSeparator: ",", inAppPurchaseLabel: "앱 내 구입", locale: "ko-KR" },
  { code: "tr", name: "土耳其", currency: "₺", currencyCode: "TRY", thousandsSeparator: ".", inAppPurchaseLabel: "In-App Purchases", locale: "tr-TR" },
  { code: "ng", name: "尼日利亚", currency: "₦", currencyCode: "NGN", thousandsSeparator: ",", inAppPurchaseLabel: "In-App Purchases", locale: "en-NG" },
  { code: "in", name: "印度", currency: "₹", currencyCode: "INR", thousandsSeparator: ",", inAppPurchaseLabel: "In-App Purchases", locale: "en-IN" },
  { code: "pk", name: "巴基斯坦", currency: "₨", currencyCode: "PKR", thousandsSeparator: ",", inAppPurchaseLabel: "In-App Purchases", locale: "en-PK" },
  { code: "br", name: "巴西", currency: "R$", currencyCode: "BRL", thousandsSeparator: ".", inAppPurchaseLabel: "Compras dentro do app", locale: "pt-BR" },
  { code: "eg", name: "埃及", currency: "E£", currencyCode: "EGP", thousandsSeparator: ",", inAppPurchaseLabel: "In-App Purchases", locale: "ar-EG-u-nu-latn" }
];

export const AREA_MAP = new Map(AREAS.map((item) => [item.code, item]));
export const AREA_CURRENCY_MAP = new Map(AREAS.map((item) => [item.currencyCode, item]));
