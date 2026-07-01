"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

const excludedPrefixes = ["/admin", "/account"];
const excludedPaths = new Set(["/login", "/search"]);

export function VercelInsights() {
  const pathname = usePathname();
  const shouldSkip =
    excludedPaths.has(pathname) ||
    excludedPrefixes.some((prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (shouldSkip) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
