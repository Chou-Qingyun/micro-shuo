function normalizeIpAddress(value: string) {
  const firstValue = value.split(",")[0]?.trim() ?? "";
  const forwardedMatch = firstValue.match(/for="?([^;,\"]+)/i);
  const rawIp = (forwardedMatch?.[1] ?? firstValue).trim().replace(/^"|"$/g, "");
  const withoutBrackets = rawIp.replace(/^\[|\]$/g, "");

  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(withoutBrackets)) {
    return withoutBrackets.split(":")[0];
  }

  return withoutBrackets.slice(0, 128);
}

export function getClientIp(request: Request) {
  // Vercel、Cloudflare、Nginx 等代理会把真实客户端 IP 放在不同请求头里。
  const headerNames = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-client-ip",
    "x-vercel-forwarded-for",
    "x-forwarded-for",
    "forwarded",
  ];

  for (const headerName of headerNames) {
    const value = request.headers.get(headerName);
    const ipAddress = value ? normalizeIpAddress(value) : "";

    if (ipAddress) {
      return ipAddress;
    }
  }

  return null;
}

export function getClientCountryCode(request: Request) {
  // Vercel 和 Cloudflare 会在边缘节点注入国家/地区代码，本地开发时通常为空。
  const headerNames = [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "cloudfront-viewer-country",
    "x-country-code",
  ];

  for (const headerName of headerNames) {
    const value = request.headers.get(headerName)?.trim().toUpperCase();

    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX") {
      return value;
    }
  }

  return null;
}
