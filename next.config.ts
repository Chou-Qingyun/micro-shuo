import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
