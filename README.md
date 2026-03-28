# DIY JS App Store Price Tracker

Node.js + React (Next.js) 实现的 App Store 全球价格查询与内购对比系统，适配 Vercel。

## 功能覆盖

- 支持地区列表查询
- 按地区搜索 App 列表（iPhone / iPad / Mac / TV 并行搜索）
- 查询 App 在全部地区的价格、开发者、副标题、内购价格
- 全局比价视图（软件本体 + 内购）
- 分地区详情视图
- 热门搜索词（内存统计）
- 深色/浅色/系统模式
- 1 天缓存（应用列表、应用详情、汇率）
- 兼容原 Java 项目接口路径：`/app/getAreaList` 等

## 数据源

- Apple App Store 网页：`https://apps.apple.com/...`
- 汇率服务：`https://open.er-api.com/v6/latest/{currency}`

## 技术架构

- 前端：Next.js App Router + React 19
- 后端：Next.js Route Handlers (Node runtime)
- 抓取解析：`fetch + cheerio`
- 并发：`p-limit`
- 参数校验：`zod`
- 缓存：`lru-cache`

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`

## 部署到 Vercel

1. 推送到 Git 仓库
2. 在 Vercel 导入该仓库
3. Framework 选择 Next.js，使用默认构建命令即可

## API

### 兼容原接口

- `POST /app/getAreaList`
- `POST /app/getPopularSearchWordList`
- `POST /app/getAppList`
- `POST /app/getAppInfo`
- `POST /app/getAppInfoComparison`

### 新接口

- `GET /api/areas`
- `GET /api/popular-searches`
- `POST /api/apps/search`
- `GET /api/apps/:appId`
- `GET /api/apps/:appId/comparison`

## 备注

- 默认可直接运行（内存缓存 + 内存热词统计）。
- 如果配置 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN`，会自动启用共享缓存与共享热门词统计，适合 Vercel 多实例部署。

## 环境变量

可参考 `.env.example`：

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
