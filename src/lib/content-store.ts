import { prisma } from "@/lib/prisma";
import { richContentToParagraphs, sanitizeRichContent } from "@/lib/rich-content";
import type { Chapter, Novel } from "@/lib/sample-data";

export type NovelInput = Omit<Novel, "chapters" | "updatedAt"> & {
  updatedAt?: string;
};

export type ChapterInput = Omit<Chapter, "chapterNumber" | "content"> & {
  chapterNumber?: number;
  content: string | string[];
};
type NovelTagTransaction = Pick<typeof prisma, "novelTag" | "tag">;
type ContentTransaction = Pick<typeof prisma, "category" | "novel" | "novelTag" | "tag">;
type DbNovelStatus = "ONGOING" | "COMPLETED";
type StoredChapterSummary = {
  id: string;
  slug: string;
  chapterNumber: number;
  publishedAt: Date;
};
type StoredNovelWithChapters = {
  id: string;
  chapters: StoredChapterSummary[];
};

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeContent(content: string | string[]) {
  return richContentToParagraphs(sanitizeRichContent(content));
}

function toNovelStatus(status: NovelInput["status"]): DbNovelStatus {
  return status === "Completed" ? "COMPLETED" : "ONGOING";
}

async function upsertNovelTags(transaction: NovelTagTransaction, novelId: string, tags: string[]) {
  await transaction.novelTag.deleteMany({
    where: { novelId },
  });

  for (const tagName of tags.map((tag: string) => tag.trim()).filter(Boolean)) {
    const tagSlug = slugify(tagName);

    if (!tagSlug) continue;

    const tag = await transaction.tag.upsert({
      where: { slug: tagSlug },
      update: { name: tagName },
      create: { name: tagName, slug: tagSlug },
    });

    await transaction.novelTag.create({
      data: {
        novelId,
        tagId: tag.id,
      },
    });
  }
}

export async function createNovel(input: NovelInput) {
  const slug = slugify(input.slug || input.title);

  if (!slug) {
    throw new Error("小说 slug 不能为空");
  }

  const tags = input.tags.map((tag: string) => tag.trim()).filter(Boolean);

  return prisma.$transaction(async (transaction: ContentTransaction) => {
    const category = await transaction.category.findUnique({
      where: { slug: input.categorySlug },
    });

    if (!category) {
      throw new Error("未找到分类，请先初始化分类数据");
    }

    const novel = await transaction.novel.create({
      data: {
        title: input.title,
        slug,
        author: input.author,
        excerpt: input.excerpt,
        description: input.description,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        coverUrl: input.coverUrl,
        status: toNovelStatus(input.status),
        categoryId: category.id,
      },
      include: {
        category: true,
      },
    });

    await upsertNovelTags(transaction, novel.id, tags);

    return {
      ...input,
      slug: novel.slug,
      tags,
      updatedAt: input.updatedAt || today(),
      chapters: [],
    };
  });
}

export async function updateNovel(slug: string, input: NovelInput) {
  const nextSlug = slugify(input.slug || input.title);

  const current = await prisma.novel.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!current) {
    throw new Error("未找到要编辑的小说");
  }

  const tags = input.tags.map((tag: string) => tag.trim()).filter(Boolean);

  return prisma.$transaction(async (transaction: ContentTransaction) => {
    const category = await transaction.category.findUnique({
      where: { slug: input.categorySlug },
    });

    if (!category) {
      throw new Error("未找到分类，请先初始化分类数据");
    }

    const novel = await transaction.novel.update({
      where: { id: current.id },
      data: {
        title: input.title,
        slug: nextSlug,
        author: input.author,
        excerpt: input.excerpt,
        description: input.description,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        coverUrl: input.coverUrl,
        status: toNovelStatus(input.status),
        categoryId: category.id,
      },
    });

    await upsertNovelTags(transaction, novel.id, tags);

    return {
      ...input,
      slug: novel.slug,
      tags,
      updatedAt: novel.updatedAt.toISOString().slice(0, 10),
      chapters: [],
    };
  });
}

export async function deleteNovel(slug: string) {
  await prisma.novel.delete({
    where: { slug },
  });
}

export async function createChapter(novelSlug: string, input: ChapterInput) {
  const novel = await prisma.novel.findUnique({
    where: { slug: novelSlug },
    include: { chapters: true },
  });

  if (!novel) {
    throw new Error("未找到小说");
  }

  const typedNovel = novel as StoredNovelWithChapters;
  const chapterNumber =
    input.chapterNumber ||
    Math.max(
      0,
      ...typedNovel.chapters.map((chapter: StoredChapterSummary) => chapter.chapterNumber),
    ) + 1;
  const slug = slugify(input.slug || `chapter-${chapterNumber}-${input.title}`);

  const richContent = sanitizeRichContent(input.content);
  const paragraphs = richContentToParagraphs(richContent);
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();

  const chapter = await prisma.chapter.create({
    data: {
      novelId: typedNovel.id,
      title: input.title,
      slug,
      chapterNumber,
      publishedAt,
      content: richContent,
      wordCount: paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
    },
  });

  return {
    title: chapter.title,
    slug: chapter.slug,
    chapterNumber: chapter.chapterNumber,
    publishedAt: chapter.publishedAt.toISOString().slice(0, 10),
    content: paragraphs,
    contentHtml: richContent,
    seoTitle: chapter.seoTitle,
    seoDescription: chapter.seoDescription,
  };
}

export async function updateChapter(novelSlug: string, chapterSlug: string, input: ChapterInput) {
  const novel = await prisma.novel.findUnique({
    where: { slug: novelSlug },
    include: { chapters: true },
  });

  if (!novel) {
    throw new Error("未找到小说");
  }

  const typedNovel = novel as StoredNovelWithChapters;
  const current = typedNovel.chapters.find(
    (chapter: StoredChapterSummary) => chapter.slug === chapterSlug,
  );

  if (!current) {
    throw new Error("未找到章节");
  }

  const chapterNumber = input.chapterNumber || current.chapterNumber;
  const slug = slugify(input.slug || `chapter-${chapterNumber}-${input.title}`);
  const richContent = sanitizeRichContent(input.content);
  const paragraphs = richContentToParagraphs(richContent);
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : current.publishedAt;

  const chapter = await prisma.chapter.update({
    where: { id: current.id },
    data: {
      title: input.title,
      slug,
      chapterNumber,
      publishedAt,
      content: richContent,
      wordCount: paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
    },
  });

  return {
    title: chapter.title,
    slug: chapter.slug,
    chapterNumber: chapter.chapterNumber,
    publishedAt: chapter.publishedAt.toISOString().slice(0, 10),
    content: paragraphs,
    contentHtml: richContent,
    seoTitle: chapter.seoTitle,
    seoDescription: chapter.seoDescription,
  };
}
