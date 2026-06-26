import type { MetadataRoute } from "next";
import { getCategories, getNovels } from "@/lib/repository";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, novels] = await Promise.all([getCategories(), getNovels()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/login",
    "/privacy-policy",
    "/terms-of-use",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: new Date(),
  }));

  const novelRoutes = novels.flatMap((novel) => [
    {
      url: absoluteUrl(`/novels/${novel.slug}`),
      lastModified: new Date(novel.updatedAt),
    },
    ...novel.chapters.map((chapter) => ({
      url: absoluteUrl(`/novels/${novel.slug}/chapter/${chapter.slug}`),
      lastModified: new Date(chapter.publishedAt),
    })),
  ]);

  return [...staticRoutes, ...categoryRoutes, ...novelRoutes];
}
