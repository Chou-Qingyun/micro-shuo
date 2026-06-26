const blockTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li", "tr"];
const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "hr",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function normalizePlainContent(content: string | string[]) {
  if (Array.isArray(content)) {
    return content.map((paragraph: string) => paragraph.trim()).filter(Boolean);
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);
}

export function plainTextToHtml(content: string | string[]) {
  const paragraphs = normalizePlainContent(content);
  return paragraphs.map((paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

export function isRichHtml(content: string) {
  return /<\/?(p|br|strong|b|em|i|u|del|h[1-6]|blockquote|ul|ol|li|a|hr|pre|code|table|thead|tbody|tr|th|td)\b/i.test(content);
}

function sanitizeHref(value: string) {
  const decoded = decodeHtmlEntities(value.trim());

  if (/^(https?:\/\/|mailto:)/i.test(decoded)) {
    return decoded;
  }

  return "";
}

export function sanitizeRichContent(content: string | string[]) {
  const source = Array.isArray(content) ? plainTextToHtml(content) : content.trim();
  const html = isRichHtml(source) ? source : plainTextToHtml(source);

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|link|meta|base|form|input|button|select|textarea)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (tag: string, tagName: string, attributes: string) => {
      const name = tagName.toLowerCase();
      const isClosingTag = tag.startsWith("</");

      if (!allowedTags.has(name)) {
        return "";
      }

      if (isClosingTag) {
        return `</${name}>`;
      }

      if (name === "br") {
        return "<br>";
      }

      if (name === "a") {
        const hrefMatch = attributes.match(/\shref=(["'])(.*?)\1/i);
        const href = hrefMatch ? sanitizeHref(hrefMatch[2]) : "";
        return href
          ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`
          : "<a>";
      }

      return `<${name}>`;
    })
    .replace(/\s?on[a-z]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s?style\s*=\s*(["']).*?\1/gi, "")
    .trim();
}

export function richContentToParagraphs(content: string) {
  const withBreaks = blockTags.reduce(
    (html: string, tag: string) => html.replace(new RegExp(`</${tag}>`, "gi"), "\n\n"),
    content,
  );

  return decodeHtmlEntities(
    withBreaks
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, ""),
  )
    .split(/\n{2,}/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);
}

export function contentToHtml(content: string | string[]) {
  return sanitizeRichContent(content);
}
