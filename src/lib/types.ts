export interface Area {
  code: string;
  name: string;
  currency: string;
  currencyCode: string;
  thousandsSeparator: "," | ".";
  inAppPurchaseLabel: string;
  locale: string;
}

export interface Money {
  area: string;
  areaName: string;
  currency: string;
  currencyCode: string;
  locale: string;
  price: number;
  cnyPrice: number;
}

export interface InAppPurchaseItem {
  object: string;
  price: Money;
}

export interface AppListItem {
  appId: string;
  appName: string;
  appImage: string;
  appDesc: string;
}

export interface AppInfoItem {
  appId: string;
  area: string;
  areaName: string;
  name: string;
  subtitle: string;
  developer: string;
  appStoreUrl: string;
  price: Money;
  inAppPurchaseList: InAppPurchaseItem[];
}

export interface AppInfoComparisonItem {
  object: string;
  priceList: Money[];
}

export interface ApiResponse<T> {
  code: 0 | 1;
  message: string;
  data: T;
}
