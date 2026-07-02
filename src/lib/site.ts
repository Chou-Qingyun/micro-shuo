export const siteConfig = {
  name: "Sweet Chinese Romance",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Read Chinese romance novels in English, from CEO love stories and rebirth revenge to transmigration sweetness and campus first love.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.domain).toString();
}
