import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contentToHtml, richContentToParagraphs } from "@/lib/rich-content";
import type { Category, Chapter, Novel } from "@/lib/sample-data";

export const publicContentCacheTag = "public-content";
const publicContentCacheOptions = {
  tags: [publicContentCacheTag],
  revalidate: 3600,
};

type DbNovelStatus = "ONGOING" | "COMPLETED" | "HIATUS";
type NovelWithRelations = Awaited<ReturnType<typeof getNovelRecords>>[number];
type CategoryRecord = {
  name: string;
  slug: string;
  description: string;
  tone: string;
};
type ChapterResult = {
  novel: Novel;
  chapter: Chapter;
  previousChapter?: Chapter;
  nextChapter?: Chapter;
};

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toUiStatus(status: DbNovelStatus): Novel["status"] {
  return status === "COMPLETED" ? "Completed" : "Ongoing";
}

function splitChapterContent(content: string) {
  return richContentToParagraphs(contentToHtml(content));
}

function mapChapter(chapter: NovelWithRelations["chapters"][number]): Chapter {
  return {
    title: chapter.title,
    slug: chapter.slug,
    chapterNumber: chapter.chapterNumber,
    publishedAt: toDateString(chapter.publishedAt),
    content: splitChapterContent(chapter.content),
    contentHtml: contentToHtml(chapter.content),
    seoTitle: chapter.seoTitle,
    seoDescription: chapter.seoDescription,
  };
}

function mapNovel(novel: NovelWithRelations): Novel {
  return {
    title: novel.title,
    slug: novel.slug,
    author: novel.author,
    categorySlug: novel.category.slug,
    coverUrl: novel.coverUrl,
    status: toUiStatus(novel.status as DbNovelStatus),
    tags: novel.tags.map((item: NovelWithRelations["tags"][number]) => item.tag.name),
    excerpt: novel.excerpt,
    description: novel.description,
    seoTitle: novel.seoTitle,
    seoDescription: novel.seoDescription,
    updatedAt: toDateString(novel.updatedAt),
    chapters: novel.chapters.map((chapter: NovelWithRelations["chapters"][number]) =>
      mapChapter(chapter),
    ),
  };
}

async function getNovelRecords() {
  return prisma.novel.findMany({
    orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
  });
}

const getCachedCategories = unstable_cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return (categories as CategoryRecord[]).map((category: CategoryRecord) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    tone: category.tone || category.description,
  }));
}, ["public-categories"], publicContentCacheOptions);

export async function getCategories(): Promise<Category[]> {
  return getCachedCategories();
}

const getCachedNovels = unstable_cache(async (): Promise<Novel[]> => {
  const novels = await getNovelRecords();
  return novels.map((novel: NovelWithRelations) => mapNovel(novel));
}, ["public-novels"], publicContentCacheOptions);

export async function getNovels(): Promise<Novel[]> {
  return getCachedNovels();
}

export async function getFeaturedNovels(): Promise<Novel[]> {
  const novels = await getNovels();
  return novels.slice(0, 3);
}

export async function getLatestNovels(): Promise<Novel[]> {
  return getNovels();
}

const getCachedCategoryBySlug = unstable_cache(async (slug: string): Promise<Category | undefined> => {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return undefined;
  }

  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    tone: category.tone || category.description,
  };
}, ["public-category-by-slug"], publicContentCacheOptions);

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getCachedCategoryBySlug(slug);
}

const getCachedNovelsByCategory = unstable_cache(async (slug: string): Promise<Novel[]> => {
  const novels = await prisma.novel.findMany({
    where: {
      category: {
        slug,
      },
    },
    orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
  });

  return (novels as NovelWithRelations[]).map((novel: NovelWithRelations) => mapNovel(novel));
}, ["public-novels-by-category"], publicContentCacheOptions);

export async function getNovelsByCategory(slug: string): Promise<Novel[]> {
  return getCachedNovelsByCategory(slug);
}

const getCachedNovelBySlug = unstable_cache(async (slug: string): Promise<Novel | undefined> => {
  const novel = await prisma.novel.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
  });

  return novel ? mapNovel(novel) : undefined;
}, ["public-novel-by-slug"], publicContentCacheOptions);

export async function getNovelBySlug(slug: string): Promise<Novel | undefined> {
  return getCachedNovelBySlug(slug);
}

export async function getChapter(
  novelSlug: string,
  chapterSlug: string,
): Promise<ChapterResult | null> {
  const novel = await getNovelBySlug(novelSlug);
  const chapter = novel?.chapters.find((item: Chapter) => item.slug === chapterSlug);

  if (!novel || !chapter) {
    return null;
  }

  return {
    novel,
    chapter,
    previousChapter: novel.chapters.find(
      (item: Chapter) => item.chapterNumber === chapter.chapterNumber - 1,
    ),
    nextChapter: novel.chapters.find(
      (item: Chapter) => item.chapterNumber === chapter.chapterNumber + 1,
    ),
  };
}

export async function getRelatedNovels(novelSlug: string, limit = 3): Promise<Novel[]> {
  const novels = await getNovels();
  const current = novels.find((novel: Novel) => novel.slug === novelSlug);

  if (!current) {
    return novels.slice(0, limit);
  }

  const currentTags = new Set(current.tags.map((tag: string) => tag.toLowerCase()));

  return novels
    .filter((novel: Novel) => novel.slug !== novelSlug)
    .map((novel: Novel) => {
      const sharedTags = novel.tags.filter((tag: string) => currentTags.has(tag.toLowerCase())).length;
      const categoryBoost = novel.categorySlug === current.categorySlug ? 3 : 0;

      return {
        novel,
        score: categoryBoost + sharedTags,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.novel)
    .slice(0, limit);
}

export async function searchNovels(query: string): Promise<Novel[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const novels = await getNovels();

  return novels.filter((novel: Novel) => {
    const searchableText = [
      novel.title,
      novel.author,
      novel.excerpt,
      novel.description,
      ...novel.tags,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
