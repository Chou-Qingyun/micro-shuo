import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI 默认只读 .env；Next.js 常用 .env.local，所以这里显式优先加载本地配置。
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 将连接地址移到配置文件；本地没有 Supabase 时用占位地址让 generate/build 可运行。
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/sweet_chinese_romance",
  },
});
