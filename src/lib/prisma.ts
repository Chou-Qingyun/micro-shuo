import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/sweet_chinese_romance";

const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  // Next.js 构建和服务端渲染会并发启动多个进程；小连接池更适合 Supabase 前期低成本配置。
  max: Number(process.env.DATABASE_POOL_SIZE ?? (process.env.NODE_ENV === "production" ? 1 : 3)),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 15_000,
};

const adapter = new PrismaPg(poolConfig);

// 开发环境热更新会重复加载模块，这里复用 PrismaClient，避免连接数被快速打满。
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
