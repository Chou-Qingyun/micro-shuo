export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON-LD 会直接进入 HTML，替换 < 可避免内容意外截断 script 标签。
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

