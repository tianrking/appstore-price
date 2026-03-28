# AppStore PriceScope 🔍

Global App Store price comparison and exchange-rate tracking matrix

Language: **English** | [繁體中文](./README.zh-Hant.md) | [Español](./README.es.md)

A full-stack App Store price intelligence platform built with Node.js + React (Next.js), optimized for Vercel.

## Features

- Multi-region App search (iPhone / iPad / Mac / TV)
- Global price comparison (base app + in-app purchases)
- Region-level detail view with currency conversion to CNY
- Popular search words
- Dark / light / system theme
- Shareable app pages (`/app/[id]`) with Open Graph preview cards
- Structured SEO outputs (`robots.txt`, `sitemap.xml`, JSON-LD on share pages)
- AdSense integration (Auto Ads + optional manual slot placeholders)
- Compatible legacy endpoints (`/app/*`) and modern REST endpoints (`/api/*`)
- In-memory cache by default, optional shared Redis cache for multi-instance deployments

## Data Sources

- Apple App Store webpages: `https://apps.apple.com/...`
- Exchange rates: `https://open.er-api.com/v6/latest/{currency}`

## Tech Stack

- Frontend: Next.js App Router + React 19
- Backend: Next.js Route Handlers (Node runtime)
- Parsing: `fetch + cheerio`
- Concurrency: `p-limit`
- Validation: `zod`
- Cache: `lru-cache` + optional Upstash Redis

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Deploy on Vercel

1. Import this repo into Vercel
2. Framework: Next.js (auto-detected)
3. Build Command: `npm run build`
4. Install Command: `npm install`
5. Optional env vars for shared cache:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Optional manual AdSense slots:
   - `NEXT_PUBLIC_ADSENSE_SLOT_HERO`
   - `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT`

## Deploy on Cloudflare Workers (coexist with Vercel)

This repository now supports a coexist setup:

- Vercel deployment: `npm run build`
- Cloudflare deployment: OpenNext + Wrangler (`wrangler.jsonc`)

Commands:

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Notes:

- The scripts use `npx @opennextjs/cloudflare@latest` to avoid local lock-in.
- You can keep both platforms in one branch/repo.

## API

Legacy-compatible:

- `POST /app/getAreaList`
- `POST /app/getPopularSearchWordList`
- `POST /app/getAppList`
- `POST /app/getAppInfo`
- `POST /app/getAppInfoComparison`

Modern:

- `GET /api/areas`
- `GET /api/popular-searches`
- `POST /api/apps/search`
- `GET /api/apps/:appId`
- `GET /api/apps/:appId/comparison`
