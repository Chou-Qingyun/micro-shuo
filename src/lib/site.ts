export const siteConfig = {
  name: "Sweet Chinese Romance",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "A healing, light-luxury romance library for CEO love stories, rebirth sweetness, transmigration romance, and campus crushes.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.domain).toString();
}

