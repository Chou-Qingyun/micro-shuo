import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Supabase uses a deliberately small connection pool. Generate public pages
    // sequentially so a production build cannot exhaust database connections.
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
    staticGenerationRetryCount: 1,
  },
  images: {
    // 示例封面图来自 Unsplash；后续换 Supabase Storage/R2 时在这里补充新域名。
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
