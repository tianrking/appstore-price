"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppInfoComparisonItem, AppInfoItem, AppListItem } from "@/lib/types";

type Locale = "en" | "zh-Hant" | "es";

interface AreaOption {
  code: string;
  name: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const TEXT: Record<Locale, Record<string, string>> = {
  en: {
    brandSubtitle: "Global App Cost Intelligence",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    heroKicker: "App Store Arbitrage Lens",
    heroTitle: "Find lower prices faster",
    heroCopy: "Search once, compare globally, and inspect in-app purchase tiers across markets.",
    regionsTracked: "regions tracked",
    hourlyArch: "Hourly-access architecture",
    nativeCompare: "Native in-app comparison",
    region: "Region",
    appQuery: "App Query",
    placeholder: "ChatGPT, Claude, CapCut ...",
    trending: "Trending Searches",
    scanning: "Scanning...",
    scanPrices: "Scan Prices",
    errorEmptyApp: "Please enter an app name",
    errorLongApp: "App name must be 20 characters or fewer",
    noResults: "No results. Try another keyword or region.",
    searchFailed: "Search failed",
    candidateApps: "Candidate Apps",
    expand: "Expand",
    collapse: "Collapse",
    appFallback: "App",
    collapsedHint: "Results hidden. Tap to expand.",
    loadingMatrix: "Building global price matrix...",
    priceMatrix: "Price Matrix",
    regionalLedger: "Regional Ledger",
    openInStore: "Open in App Store",
    baseApp: "Base App",
    free: "Free",
    openStorePage: "Open Store Page",
    item: "Item",
    local: "Local",
    cny: "CNY",
    noIap: "No in-app purchases",
    emptyGuide: "Start with an app name to generate your first price atlas.",
    top: "Top",
    language: "Language",
    failedDetails: "Failed to load details",
    noDetail: "No detailed result found for this app"
  },
  "zh-Hant": {
    brandSubtitle: "全球 App 價格情報",
    auto: "自動",
    light: "淺色",
    dark: "深色",
    heroKicker: "App Store 區域價差雷達",
    heroTitle: "更快找到更低價格",
    heroCopy: "一次搜尋，同步比較各區售價與內購層級，快速找到更划算方案。",
    regionsTracked: "個地區追蹤",
    hourlyArch: "即時匯率架構",
    nativeCompare: "內購對比",
    region: "地區",
    appQuery: "App 關鍵字",
    placeholder: "ChatGPT、Claude、CapCut ...",
    trending: "熱門搜尋",
    scanning: "掃描中...",
    scanPrices: "開始比價",
    errorEmptyApp: "請輸入 App 名稱",
    errorLongApp: "App 名稱最多 20 個字元",
    noResults: "找不到結果，請換關鍵字或地區",
    searchFailed: "搜尋失敗",
    candidateApps: "候選 App",
    expand: "展開",
    collapse: "收合",
    appFallback: "應用程式",
    collapsedHint: "結果已隱藏，點擊展開",
    loadingMatrix: "正在建立全球價格矩陣...",
    priceMatrix: "價格矩陣",
    regionalLedger: "分區明細",
    openInStore: "前往 App Store",
    baseApp: "軟體本體",
    free: "免費",
    openStorePage: "開啟商店頁面",
    item: "項目",
    local: "當地價格",
    cny: "人民幣",
    noIap: "沒有內購項目",
    emptyGuide: "輸入 App 名稱，開始建立你的第一份全球價格地圖。",
    top: "頂部",
    language: "語言",
    failedDetails: "載入詳情失敗",
    noDetail: "查無此 App 詳細資料"
  },
  es: {
    brandSubtitle: "Inteligencia Global de Precios",
    auto: "Auto",
    light: "Claro",
    dark: "Oscuro",
    heroKicker: "Radar de Arbitraje App Store",
    heroTitle: "Encuentra mejores precios",
    heroCopy: "Busca una vez, compara globalmente y revisa niveles de compras dentro de la app.",
    regionsTracked: "regiones monitoreadas",
    hourlyArch: "Arquitectura con tipo de cambio en tiempo real",
    nativeCompare: "Comparación de compras internas",
    region: "Región",
    appQuery: "Búsqueda de app",
    placeholder: "ChatGPT, Claude, CapCut ...",
    trending: "Búsquedas populares",
    scanning: "Escaneando...",
    scanPrices: "Comparar precios",
    errorEmptyApp: "Ingresa el nombre de una app",
    errorLongApp: "El nombre debe tener 20 caracteres o menos",
    noResults: "Sin resultados. Prueba otra palabra o región.",
    searchFailed: "Búsqueda fallida",
    candidateApps: "Apps candidatas",
    expand: "Expandir",
    collapse: "Contraer",
    appFallback: "Aplicación",
    collapsedHint: "Resultados ocultos. Toca para expandir.",
    loadingMatrix: "Construyendo matriz global de precios...",
    priceMatrix: "Matriz de precios",
    regionalLedger: "Detalle por región",
    openInStore: "Abrir en App Store",
    baseApp: "App base",
    free: "Gratis",
    openStorePage: "Abrir página de tienda",
    item: "Ítem",
    local: "Precio local",
    cny: "CNY",
    noIap: "Sin compras dentro de la app",
    emptyGuide: "Empieza con un nombre de app para generar tu primer atlas de precios.",
    top: "Arriba",
    language: "Idioma",
    failedDetails: "No se pudo cargar el detalle",
    noDetail: "No se encontró detalle para esta app"
  }
};

const AREA_NAME_MAP: Record<Locale, Record<string, string>> = {
  en: {
    us: "United States",
    cn: "China",
    tw: "Taiwan",
    hk: "Hong Kong",
    jp: "Japan",
    kr: "Korea",
    tr: "Turkey",
    ng: "Nigeria",
    in: "India",
    pk: "Pakistan",
    br: "Brazil",
    eg: "Egypt"
  },
  "zh-Hant": {
    us: "美國",
    cn: "中國",
    tw: "台灣",
    hk: "香港",
    jp: "日本",
    kr: "韓國",
    tr: "土耳其",
    ng: "奈及利亞",
    in: "印度",
    pk: "巴基斯坦",
    br: "巴西",
    eg: "埃及"
  },
  es: {
    us: "Estados Unidos",
    cn: "China",
    tw: "Taiwán",
    hk: "Hong Kong",
    jp: "Japón",
    kr: "Corea",
    tr: "Turquía",
    ng: "Nigeria",
    in: "India",
    pk: "Pakistán",
    br: "Brasil",
    eg: "Egipto"
  }
};

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("locale") as Locale | null;
  if (stored === "en" || stored === "zh-Hant" || stored === "es") return stored;

  const lang = window.navigator.language.toLowerCase();
  if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk") || lang.includes("hant")) return "zh-Hant";
  if (lang.startsWith("es")) return "es";
  return "en";
}

async function postJSON<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return response.json();
}

function formatPrice(price: number, locale = "zh-CN") {
  return Number(price).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toFlagEmoji(countryCode: string) {
  if (countryCode.length !== 2) return "🏳";
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function AppStoreClient() {
  const [locale, setLocale] = useState<Locale>("en");
  const [appName, setAppName] = useState("ChatGPT");
  const [areaCode, setAreaCode] = useState("us");
  const [areaList, setAreaList] = useState<AreaOption[]>([{ code: "us", name: "United States" }]);

  const [appList, setAppList] = useState<AppListItem[]>([]);
  const [loadingAppList, setLoadingAppList] = useState(false);
  const [errorAppList, setErrorAppList] = useState("");

  const [popularWords, setPopularWords] = useState<string[]>([]);
  const [showPopularWords, setShowPopularWords] = useState(false);

  const [selectedAppImage, setSelectedAppImage] = useState("");

  const [results, setResults] = useState<AppInfoItem[]>([]);
  const [comparisonResults, setComparisonResults] = useState<AppInfoComparisonItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [searched, setSearched] = useState(false);

  const [appListCollapsed, setAppListCollapsed] = useState(false);
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState<"comparison" | "list">("comparison");

  const [colorMode, setColorMode] = useState<"light" | "dark" | "system">("system");
  const [showTopButton, setShowTopButton] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const t = TEXT[locale];

  const displayAreaName = useMemo(() => {
    return (code: string, fallback: string) => AREA_NAME_MAP[locale][code] ?? fallback;
  }, [locale]);

  useEffect(() => {
    setLocale(detectLocale());

    void (async () => {
      const [areasRes, popularRes] = await Promise.all([
        postJSON<AreaOption[]>("/app/getAreaList", {}),
        postJSON<string[]>("/app/getPopularSearchWordList", {})
      ]);

      if (areasRes.code === 0 && areasRes.data.length > 0) {
        setAreaList(areasRes.data);
      }
      if (popularRes.code === 0) {
        setPopularWords(popularRes.data ?? []);
      }
    })();

    const stored = localStorage.getItem("colorMode") as "light" | "dark" | "system" | null;
    setColorMode(stored ?? "system");
  }, []);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  useEffect(() => {
    const titleMap: Record<Locale, string> = {
      en: "Price Atlas",
      "zh-Hant": "Price Atlas｜全球價格地圖",
      es: "Price Atlas | Mapa global de precios"
    };
    document.title = titleMap[locale];
  }, [locale]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      colorMode === "dark" ||
      (colorMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
    localStorage.setItem("colorMode", colorMode);
  }, [colorMode]);

  useEffect(() => {
    function onScroll() {
      setShowTopButton(window.scrollY > 500);
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentApp = useMemo(() => {
    if (results.length === 0) return null;
    return results.find((item) => item.area.toLowerCase() === areaCode.toLowerCase()) ?? results[0];
  }, [results, areaCode]);

  async function fetchPopularWords() {
    const response = await postJSON<string[]>("/app/getPopularSearchWordList", {});
    if (response.code === 0) {
      setPopularWords(response.data ?? []);
    }
  }

  async function searchAppList() {
    const trimmed = appName.trim();
    if (!trimmed) {
      setErrorAppList(t.errorEmptyApp);
      return;
    }
    if (trimmed.length > 20) {
      setErrorAppList(t.errorLongApp);
      return;
    }

    setLoadingAppList(true);
    setErrorAppList("");
    setAppList([]);
    setResults([]);
    setComparisonResults([]);
    setErrorDetail("");
    setSearched(false);
    setAppListCollapsed(false);

    const response = await postJSON<AppListItem[]>("/app/getAppList", {
      appName: trimmed,
      areaCode
    });

    if (response.code === 0) {
      const list = response.data ?? [];
      setAppList(list);
      if (list.length === 0) {
        setErrorAppList(t.noResults);
      }
    } else {
      setErrorAppList(response.message || t.searchFailed);
    }

    setLoadingAppList(false);
    await fetchPopularWords();
  }

  async function selectApp(app: AppListItem) {
    setSelectedAppImage(app.appImage);
    setResults([]);
    setComparisonResults([]);
    setErrorDetail("");
    setCurrentTab("comparison");
    setAppListCollapsed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    await searchApp(app.appId);
  }

  async function searchApp(id: string) {
    const cleanId = id.trim().replace(/^id/i, "");
    if (!cleanId) return;

    setLoadingDetail(true);
    setErrorDetail("");

    const infoRes = await postJSON<AppInfoItem[]>("/app/getAppInfo", { appId: cleanId });
    if (infoRes.code !== 0) {
      setErrorDetail(infoRes.message || t.failedDetails);
      setLoadingDetail(false);
      return;
    }

    const detail = infoRes.data ?? [];
    setResults(detail);
    setSearched(true);
    if (detail.length === 0) {
      setErrorDetail(t.noDetail);
      setLoadingDetail(false);
      return;
    }

    const compareRes = await postJSON<AppInfoComparisonItem[]>("/app/getAppInfoComparison", { appId: cleanId });
    if (compareRes.code === 0) {
      setComparisonResults(compareRes.data ?? []);
      setSelectedComparisonIndex(0);
    }

    setLoadingDetail(false);
  }

  return (
    <div className="nova-shell">
      <div className="nova-bg-orb nova-bg-orb-a" />
      <div className="nova-bg-orb nova-bg-orb-b" />

      <header className="nova-topbar">
        <div className="nova-wrap nova-topbar-inner">
          <div className="nova-brand">
            <Image src="/image.png" alt="logo" width={30} height={30} className="nova-brand-logo" />
            <div>
              <div className="nova-brand-title">Price Atlas</div>
              <div className="nova-brand-sub">{t.brandSubtitle}</div>
            </div>
          </div>

          <div className="nova-controls">
            <div className="nova-theme-switch">
              <button
                className={colorMode === "system" ? "nova-theme-btn active" : "nova-theme-btn"}
                onClick={() => setColorMode("system")}
              >
                {t.auto}
              </button>
              <button
                className={colorMode === "light" ? "nova-theme-btn active" : "nova-theme-btn"}
                onClick={() => setColorMode("light")}
              >
                {t.light}
              </button>
              <button
                className={colorMode === "dark" ? "nova-theme-btn active" : "nova-theme-btn"}
                onClick={() => setColorMode("dark")}
              >
                {t.dark}
              </button>
            </div>

            <select className="nova-locale" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              <option value="en">EN</option>
              <option value="zh-Hant">繁中</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
      </header>

      <main className="nova-wrap nova-main">
        <section className="nova-hero-panel">
          <p className="nova-kicker">{t.heroKicker}</p>
          <h1>{t.heroTitle}</h1>
          <p className="nova-hero-copy">{t.heroCopy}</p>
          <div className="nova-stat-row">
            <span className="nova-stat-pill">{areaList.length} {t.regionsTracked}</span>
            <span className="nova-stat-pill">{t.hourlyArch}</span>
            <span className="nova-stat-pill">{t.nativeCompare}</span>
          </div>
        </section>

        <section className="nova-search-panel">
          <div className="nova-search-grid">
            <label className="nova-field">
              <span>{t.region}</span>
              <select
                className="nova-control"
                value={areaCode}
                onChange={(event) => setAreaCode(event.target.value)}
                disabled={loadingAppList || loadingDetail}
              >
                {areaList.map((area) => (
                  <option key={area.code} value={area.code}>
                    {displayAreaName(area.code, area.name)} ({area.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </label>

            <label className="nova-field nova-field-grow">
              <span>{t.appQuery}</span>
              <div className="nova-input-wrap">
                <input
                  ref={inputRef}
                  className="nova-control"
                  value={appName}
                  maxLength={20}
                  placeholder={t.placeholder}
                  onChange={(event) => setAppName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void searchAppList();
                    }
                  }}
                  onFocus={() => {
                    if (blurTimeoutRef.current) {
                      window.clearTimeout(blurTimeoutRef.current);
                      blurTimeoutRef.current = null;
                    }
                    setShowPopularWords(true);
                    void fetchPopularWords();
                  }}
                  onBlur={() => {
                    blurTimeoutRef.current = window.setTimeout(() => {
                      setShowPopularWords(false);
                    }, 200);
                  }}
                />

                {showPopularWords && popularWords.length > 0 ? (
                  <div className="nova-popover" onMouseDown={(event) => event.preventDefault()}>
                    <p className="nova-popover-title">{t.trending}</p>
                    <div className="nova-chip-row">
                      {popularWords.map((word) => (
                        <button
                          key={word}
                          className="nova-chip"
                          onClick={() => {
                            setAppName(word);
                            setShowPopularWords(false);
                            void searchAppList();
                          }}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </label>

            <button className="nova-search-btn" onClick={() => void searchAppList()} disabled={loadingAppList || loadingDetail}>
              {loadingAppList ? t.scanning : t.scanPrices}
            </button>
          </div>

          {errorAppList ? <p className="nova-error">{errorAppList}</p> : null}
        </section>

        {appList.length > 0 && !loadingAppList ? (
          <section className="nova-results-panel">
            <div className="nova-panel-head">
              <h2>{t.candidateApps} · {appList.length}</h2>
              <button className="nova-text-btn" onClick={() => setAppListCollapsed((value) => !value)}>
                {appListCollapsed ? t.expand : t.collapse}
              </button>
            </div>

            {!appListCollapsed ? (
              <div className="nova-card-grid">
                {appList.map((app) => (
                  <button key={app.appId} className="nova-app-card" onClick={() => void selectApp(app)}>
                    <img
                      src={app.appImage}
                      alt={app.appName}
                      className="nova-app-icon"
                      onError={(event) => {
                        event.currentTarget.src = "/image.png";
                      }}
                    />
                    <div className="nova-app-meta">
                      <p className="nova-app-name">{app.appName}</p>
                      <p className="nova-app-desc">{app.appDesc || t.appFallback}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="nova-collapsed">{t.collapsedHint}</div>
            )}
          </section>
        ) : null}

        {loadingDetail ? <section className="nova-status">{t.loadingMatrix}</section> : null}
        {errorDetail ? <section className="nova-error-panel">{errorDetail}</section> : null}

        {(results.length > 0 || comparisonResults.length > 0) && !loadingDetail && appListCollapsed ? (
          <section className="nova-analysis-panel">
            <div className="nova-tab-row">
              <button
                className={currentTab === "comparison" ? "nova-tab active" : "nova-tab"}
                onClick={() => setCurrentTab("comparison")}
              >
                {t.priceMatrix}
              </button>
              <button
                className={currentTab === "list" ? "nova-tab active" : "nova-tab"}
                onClick={() => setCurrentTab("list")}
              >
                {t.regionalLedger}
              </button>
            </div>

            {currentTab === "comparison" ? (
              <>
                {currentApp ? (
                  <article className="nova-focus-card">
                    <img
                      src={selectedAppImage}
                      alt={currentApp.name}
                      className="nova-focus-icon"
                      onError={(event) => {
                        event.currentTarget.src = "/image.png";
                      }}
                    />
                    <div>
                      <h3>{currentApp.name || appName}</h3>
                      <p>{currentApp.subtitle}</p>
                      <p className="nova-muted">{currentApp.developer}</p>
                      <a href={currentApp.appStoreUrl} target="_blank" rel="noreferrer" className="nova-link">
                        {t.openInStore}
                      </a>
                    </div>
                  </article>
                ) : null}

                {comparisonResults.length > 0 ? (
                  <>
                    <div className="nova-object-tabs">
                      {comparisonResults.map((item, index) => {
                        const label = item.object === "软件本体" ? t.baseApp : item.object;
                        return (
                          <button
                            key={`${item.object}-${index}`}
                            className={index === selectedComparisonIndex ? "nova-object-tab active" : "nova-object-tab"}
                            onClick={() => setSelectedComparisonIndex(index)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="nova-price-grid">
                      {comparisonResults[selectedComparisonIndex]?.priceList.map((price, index) => (
                        <div key={`${price.area}-${index}`} className="nova-price-tile">
                          <p className="nova-price-area">
                            {toFlagEmoji(price.area)} {displayAreaName(price.area, price.areaName)}
                          </p>
                          <p className="nova-price-main">¥ {formatPrice(price.cnyPrice, "zh-CN")}</p>
                          <p className="nova-price-sub">
                            {price.currency} {price.price === 0 ? t.free : formatPrice(price.price, price.locale)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <div className="nova-ledger-list">
                {results.map((app) => (
                  <article key={app.area} className="nova-ledger-card">
                    <div className="nova-ledger-head">
                      <img
                        src={selectedAppImage}
                        alt={app.name}
                        className="nova-focus-icon"
                        onError={(event) => {
                          event.currentTarget.src = "/image.png";
                        }}
                      />
                      <div>
                        <h3>{app.name}</h3>
                        <p>{app.subtitle}</p>
                        <p className="nova-muted">{app.developer}</p>
                        <p className="nova-muted">
                          {toFlagEmoji(app.area)} {displayAreaName(app.area, app.areaName)}
                        </p>
                        <p className="nova-ledger-price">
                          {app.price.currency} {app.price.price === 0 ? t.free : formatPrice(app.price.price, app.price.locale)}
                          {app.price.price > 0 ? `  ·  ≈ ¥${formatPrice(app.price.cnyPrice, "zh-CN")}` : ""}
                        </p>
                        <a href={app.appStoreUrl} target="_blank" rel="noreferrer" className="nova-link">
                          {t.openStorePage}
                        </a>
                      </div>
                    </div>

                    <div className="nova-iap-table">
                      <div className="nova-iap-head">
                        <span>{t.item}</span>
                        <span>{t.local}</span>
                        <span>{t.cny}</span>
                      </div>

                      {app.inAppPurchaseList.length === 0 ? (
                        <div className="nova-iap-empty">{t.noIap}</div>
                      ) : (
                        app.inAppPurchaseList.map((item, index) => (
                          <div key={`${item.object}-${index}`} className="nova-iap-row">
                            <span>{item.object}</span>
                            <span>
                              {item.price.price === 0
                                ? t.free
                                : `${item.price.currency} ${formatPrice(item.price.price, item.price.locale)}`}
                            </span>
                            <span>{item.price.price > 0 ? `¥ ${formatPrice(item.price.cnyPrice, "zh-CN")}` : "-"}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {!loadingAppList && !loadingDetail && !errorAppList && !errorDetail && appList.length === 0 && !searched ? (
          <section className="nova-empty">{t.emptyGuide}</section>
        ) : null}
      </main>

      {showTopButton ? (
        <button className="nova-float" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          {t.top}
        </button>
      ) : null}
    </div>
  );
}
