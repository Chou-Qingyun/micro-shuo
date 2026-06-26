import type { Chapter, Novel } from "@/lib/sample-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export function novelJsonLd(novel: Novel) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: {
      "@type": "Person",
      name: novel.author,
    },
    description: novel.seoDescription || novel.description,
    genre: novel.tags,
    url: absoluteUrl(`/novels/${novel.slug}`),
    image: novel.coverUrl,
    inLanguage: "en",
  };
}

export function chapterJsonLd(novel: Novel, chapter: Chapter, url: string) {
  const name = chapter.seoTitle || `${novel.title} - ${chapter.title}`;
  const description = chapter.seoDescription || novel.seoDescription || novel.excerpt;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    isPartOf: {
      "@type": "Book",
      name: novel.title,
      url: absoluteUrl(`/novels/${novel.slug}`),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    url,
    inLanguage: "en",
  };
}
