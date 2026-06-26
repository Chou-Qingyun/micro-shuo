# Sweet Chinese Romance

面向海外女性读者的垂直甜宠小说站 MVP，技术架构为 `Next.js + PostgreSQL + Prisma + Supabase/Vercel`。

## 已完成能力

- 首页：编辑推荐、分类入口、最新更新、订阅入口、广告位预留
- 分类导航：CEO Romance、Transmigration Sweet Romance、Rebirth Sweet Romance、Campus Sweet Romance
- 小说详情页：封面、简介、标签、章节列表、收藏按钮、评论区、广告位
- 阅读页：干净阅读体验、章节切换、章节评论、低干扰广告位
- 搜索页：按标题、作者、简介、标签搜索
- 登录页：Supabase Auth 接入前的 UI 占位
- SEO：动态 metadata、canonical、`sitemap.xml`、`robots.txt`、JSON-LD 结构化数据
- 数据层：Prisma PostgreSQL schema + 本地示例数据 fallback

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 生产构建检查

```bash
npm run lint
npm run build
```

## Supabase / PostgreSQL 配置

复制 `.env.example` 为 `.env.local`，填入 Supabase 项目的连接信息：

```bash
cp .env.example .env.local
```

需要配置的关键变量：

```text
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_ADSENSE_ENABLED="false"
```

`NEXT_PUBLIC_ADSENSE_ENABLED` 控制前台广告位是否显示。前期未接入 Google AdSense 时保持
`false`；等网站通过 AdSense 审核并接入广告代码后，改为 `true` 即可显示广告位。

Prisma 7 已使用 `prisma.config.ts` 管理数据库连接。配置好 `DATABASE_URL` 后执行：

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 后续接数据库的位置

当前页面默认读取 `src/lib/sample-data.ts`，这样没有数据库也能预览完整网站。

后续正式接 Supabase PostgreSQL 时，重点改这里：

```text
src/lib/repository.ts
```

把里面的本地数组查询替换为 Prisma 查询即可，页面层不需要大改。

## 主要目录

```text
prisma/schema.prisma          数据库模型
prisma.config.ts              Prisma 7 配置
src/app                       Next.js App Router 页面
src/components                可复用 UI 组件
src/lib/sample-data.ts        本地示例小说数据
src/lib/repository.ts         数据访问层
src/lib/prisma.ts             Prisma Client
src/lib/supabase.ts           Supabase Client
```
