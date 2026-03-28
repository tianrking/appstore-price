"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppInfoComparisonItem, AppInfoItem, AppListItem } from "@/lib/types";

interface AreaOption {
  code: string;
  name: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
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
  if (price === 0) return "免费";
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
  const [appName, setAppName] = useState("ChatGPT");
  const [areaCode, setAreaCode] = useState("us");
  const [areaList, setAreaList] = useState<AreaOption[]>([{ code: "us", name: "美国" }]);

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

  useEffect(() => {
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
    const root = document.documentElement;
    const isDark =
      colorMode === "dark" ||
      (colorMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
    localStorage.setItem("colorMode", colorMode);
  }, [colorMode]);

  useEffect(() => {
    function onScroll() {
      setShowTopButton(window.scrollY > 480);
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
      setErrorAppList("请输入应用名称");
      return;
    }
    if (trimmed.length > 20) {
      setErrorAppList("应用名称长度不能超过20个字符");
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
        setErrorAppList("未找到相关应用，请尝试更换关键词或地区");
      }
    } else {
      setErrorAppList(response.message || "搜索失败");
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
      setErrorDetail(infoRes.message || "查询详情失败");
      setLoadingDetail(false);
      return;
    }

    const detail = infoRes.data ?? [];
    setResults(detail);
    setSearched(true);
    if (detail.length === 0) {
      setErrorDetail("未找到该应用的详细信息");
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
    <div className="page-shell">
      <header className="top-nav">
        <div className="container nav-inner">
          <div className="brand">
            <Image src="/image.png" alt="logo" width={28} height={28} className="logo" />
            <span>App Store Price</span>
          </div>
          <div className="toolbar">
            <button className="theme-btn" onClick={() => setColorMode("system")}>系统</button>
            <button className="theme-btn" onClick={() => setColorMode("light")}>浅色</button>
            <button className="theme-btn" onClick={() => setColorMode("dark")}>深色</button>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <section className="hero">
          <h1>探索全球应用定价</h1>
          <p>对比 App Store 各区价格与内购项目</p>
        </section>

        <section className="search-card">
          <div className="search-row">
            <select
              className="control"
              value={areaCode}
              onChange={(event) => setAreaCode(event.target.value)}
              disabled={loadingAppList || loadingDetail}
            >
              {areaList.map((area) => (
                <option key={area.code} value={area.code}>
                  {area.name} {area.code.toUpperCase()}
                </option>
              ))}
            </select>

            <div className="input-wrap">
              <input
                ref={inputRef}
                className="control"
                value={appName}
                maxLength={20}
                placeholder="搜索应用、游戏..."
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
                <div className="popular-panel" onMouseDown={(event) => event.preventDefault()}>
                  <div className="popular-title">热门搜索</div>
                  <div className="popular-list">
                    {popularWords.map((word) => (
                      <button
                        key={word}
                        className="popular-chip"
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

            <button className="search-btn" onClick={() => void searchAppList()} disabled={loadingAppList || loadingDetail}>
              {loadingAppList ? "搜索中..." : "搜索"}
            </button>
          </div>
          {errorAppList ? <p className="error-text">{errorAppList}</p> : null}
        </section>

        {appList.length > 0 && !loadingAppList ? (
          <section className="block">
            <div className="block-head">
              <h2>搜索结果</h2>
              <button className="link-btn" onClick={() => setAppListCollapsed((value) => !value)}>
                {appListCollapsed ? "展开全部" : "收起"}
              </button>
            </div>

            {!appListCollapsed ? (
              <div className="result-grid">
                {appList.map((app) => (
                  <button key={app.appId} className="app-item" onClick={() => void selectApp(app)}>
                    <img src={app.appImage} alt={app.appName} className="app-icon" />
                    <div className="app-item-main">
                      <div className="app-name">{app.appName}</div>
                      <div className="app-desc">{app.appDesc || "应用"}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="collapsed-hint" onClick={() => setAppListCollapsed(false)}>
                已折叠搜索结果，点击查看
              </div>
            )}
          </section>
        ) : null}

        {loadingDetail ? <div className="loading-state">正在获取全球定价数据...</div> : null}
        {errorDetail ? <div className="error-state">{errorDetail}</div> : null}

        {(results.length > 0 || comparisonResults.length > 0) && !loadingDetail && appListCollapsed ? (
          <section className="block">
            <div className="tab-row">
              <button
                className={currentTab === "comparison" ? "tab-btn active" : "tab-btn"}
                onClick={() => setCurrentTab("comparison")}
              >
                全球比价
              </button>
              <button
                className={currentTab === "list" ? "tab-btn active" : "tab-btn"}
                onClick={() => setCurrentTab("list")}
              >
                分地区详情
              </button>
            </div>

            {currentTab === "comparison" ? (
              <div className="detail-wrap">
                {currentApp ? (
                  <div className="hero-card">
                    <img src={currentApp.appStoreUrl ? selectedAppImage : selectedAppImage} alt={currentApp.name} className="hero-icon" />
                    <div>
                      <h3>{currentApp.name || appName}</h3>
                      <p>{currentApp.subtitle}</p>
                      <p className="muted">{currentApp.developer}</p>
                      <a href={currentApp.appStoreUrl} target="_blank" rel="noreferrer" className="store-link">
                        在 App Store 查看
                      </a>
                    </div>
                  </div>
                ) : null}

                {comparisonResults.length > 0 ? (
                  <>
                    <div className="tag-row">
                      {comparisonResults.map((item, index) => (
                        <button
                          key={`${item.object}-${index}`}
                          className={index === selectedComparisonIndex ? "tag active" : "tag"}
                          onClick={() => setSelectedComparisonIndex(index)}
                        >
                          {item.object}
                        </button>
                      ))}
                    </div>
                    <div className="price-grid">
                      {comparisonResults[selectedComparisonIndex]?.priceList.map((price, index) => (
                        <div key={`${price.area}-${index}`} className="price-card">
                          <div className="price-area">
                            <span>{toFlagEmoji(price.area)}</span> {price.areaName}
                          </div>
                          <div className="price-cny">¥ {formatPrice(price.cnyPrice, "zh-CN")}</div>
                          <div className="price-origin">
                            {price.currency} {price.price === 0 ? "免费" : formatPrice(price.price, price.locale)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="detail-list">
                {results.map((app) => (
                  <article key={app.area} className="app-card">
                    <div className="app-card-head">
                      <img src={selectedAppImage} alt={app.name} className="hero-icon" />
                      <div>
                        <h3>{app.name}</h3>
                        <p>{app.subtitle}</p>
                        <p className="muted">{app.developer}</p>
                        <p className="muted">
                          {toFlagEmoji(app.area)} {app.areaName}
                        </p>
                        <p className="price-line">
                          {app.price.currency} {app.price.price === 0 ? "免费" : formatPrice(app.price.price, app.price.locale)}
                          {app.price.price > 0 ? ` (≈ ¥${formatPrice(app.price.cnyPrice, "zh-CN")})` : ""}
                        </p>
                        <a href={app.appStoreUrl} target="_blank" rel="noreferrer" className="store-link">
                          跳转 App Store
                        </a>
                      </div>
                    </div>
                    <div className="iap-table">
                      <div className="iap-head">
                        <span>项目</span>
                        <span>价格</span>
                        <span>约合人民币</span>
                      </div>
                      {app.inAppPurchaseList.length === 0 ? (
                        <div className="iap-empty">无内购项目</div>
                      ) : (
                        app.inAppPurchaseList.map((item, index) => (
                          <div key={`${item.object}-${index}`} className="iap-row">
                            <span>{item.object}</span>
                            <span>
                              {item.price.price === 0
                                ? "免费"
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
          <section className="empty-block">输入应用名称，开始探索全球价格</section>
        ) : null}
      </main>

      {showTopButton ? (
        <button className="top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          返回顶部
        </button>
      ) : null}
    </div>
  );
}
