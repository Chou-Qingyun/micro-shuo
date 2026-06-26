import { NovelStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Category, Chapter, Novel } from "@/lib/sample-data";

type NovelWithRelations = Awaited<ReturnType<typeof getNovelRecords>>[number];

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toUiStatus(status: NovelStatus): Novel["status"] {
  return status === NovelStatus.COMPLETED ? "Completed" : "Ongoing";
}

function splitChapterContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapChapter(chapter: NovelWithRelations["chapters"][number]): Chapter {
  return {
    title: chapter.title,
    slug: chapter.slug,
    chapterNumber: chapter.chapterNumber,
    publishedAt: toDateString(chapter.publishedAt),
    content: splitChapterContent(chapter.content),
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
    status: toUiStatus(novel.status),
    tags: novel.tags.map((item) => item.tag.name),
    excerpt: novel.excerpt,
    description: novel.description,
    seoTitle: novel.seoTitle,
    seoDescription: novel.seoDescription,
    updatedAt: toDateString(novel.updatedAt),
    chapters: novel.chapters.map(mapChapter),
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

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    tone: category.tone || category.description,
  }));
}

export async function getNovels() {
  const novels = await getNovelRecords();
  return novels.map(mapNovel);
}

export async function getFeaturedNovels() {
  const novels = await getNovels();
  return novels.slice(0, 3);
}

export async function getLatestNovels() {
  return getNovels();
}

export async function getCategoryBySlug(slug: string) {
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
}

export async function getNovelsByCategory(slug: string) {
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

  return novels.map(mapNovel);
}

export async function getNovelBySlug(slug: string) {
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
}

export async function getChapter(novelSlug: string, chapterSlug: string) {
  const novel = await getNovelBySlug(novelSlug);
  const chapter = novel?.chapters.find((item) => item.slug === chapterSlug);

  if (!novel || !chapter) {
    return null;
  }

  return {
    novel,
    chapter,
    previousChapter: novel.chapters.find(
      (item) => item.chapterNumber === chapter.chapterNumber - 1,
    ),
    nextChapter: novel.chapters.find(
      (item) => item.chapterNumber === chapter.chapterNumber + 1,
    ),
  };
}

export async function searchNovels(query: string): Promise<Novel[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const novels = await getNovels();

  return novels.filter((novel) => {
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
