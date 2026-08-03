import type { MetadataRoute } from "next";
import { getCategories, getSitemapNovels } from "@/lib/repository";
import { absoluteUrl } from "@/lib/site";
import { topics } from "@/lib/topics";
import type { Category } from "@/lib/sample-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, novels] = await Promise.all([getCategories(), getSitemapNovels()]);
  const typedCategories = categories as Category[];

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/privacy-policy",
    "/terms-of-use",
  ].map((path) => ({
    url: absoluteUrl(path),
  }));

  const categoryRoutes = typedCategories.map((category: Category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
  }));

  const topicRoutes = topics.map((topic) => ({
    url: absoluteUrl(`/topics/${topic.slug}`),
  }));

  const novelRoutes = novels.flatMap((novel) => [
    {
      url: absoluteUrl(`/novels/${novel.slug}`),
      lastModified: new Date(novel.updatedAt),
    },
    ...novel.chapters.map((chapter) => ({
      url: absoluteUrl(`/novels/${novel.slug}/chapter/${chapter.slug}`),
      lastModified: new Date(
        Math.max(
          new Date(chapter.publishedAt).getTime(),
          new Date(chapter.updatedAt).getTime(),
        ),
      ),
    })),
  ]);

  return [...staticRoutes, ...categoryRoutes, ...topicRoutes, ...novelRoutes];
}
