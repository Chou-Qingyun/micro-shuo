import type { MetadataRoute } from "next";
import { getCategories, getNovels } from "@/lib/repository";
import { absoluteUrl } from "@/lib/site";
import { topics } from "@/lib/topics";
import type { Category, Chapter, Novel } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, novels] = await Promise.all([getCategories(), getNovels()]);
  const typedCategories = categories as Category[];
  const typedNovels = novels as Novel[];

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/privacy-policy",
    "/terms-of-use",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  const categoryRoutes = typedCategories.map((category: Category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: new Date(),
  }));

  const topicRoutes = topics.map((topic) => ({
    url: absoluteUrl(`/topics/${topic.slug}`),
    lastModified: new Date(),
  }));

  const novelRoutes = typedNovels.flatMap((novel: Novel) => [
    {
      url: absoluteUrl(`/novels/${novel.slug}`),
      lastModified: new Date(novel.updatedAt),
    },
    ...novel.chapters.map((chapter: Chapter) => ({
      url: absoluteUrl(`/novels/${novel.slug}/chapter/${chapter.slug}`),
      lastModified: new Date(chapter.publishedAt),
    })),
  ]);

  return [...staticRoutes, ...categoryRoutes, ...topicRoutes, ...novelRoutes];
}
