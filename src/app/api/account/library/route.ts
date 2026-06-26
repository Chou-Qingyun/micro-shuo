import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const records = await prisma.readingProgress.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      novel: {
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      },
      chapter: true,
    },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      novel: {
        include: {
          chapters: {
            orderBy: { chapterNumber: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  const novelSubscriptions = await prisma.subscription.findMany({
    where: {
      email: user.email,
      source: {
        startsWith: "novel:",
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const subscribedSlugs = novelSubscriptions
    .map((subscription) => subscription.source?.replace(/^novel:/, ""))
    .filter((slug): slug is string => Boolean(slug));
  const subscribedNovels = subscribedSlugs.length
    ? await prisma.novel.findMany({
        where: {
          slug: { in: subscribedSlugs },
        },
        include: {
          chapters: {
            orderBy: { chapterNumber: "asc" },
            take: 1,
          },
        },
      })
    : [];
  const subscribedNovelMap = new Map(subscribedNovels.map((novel) => [novel.slug, novel]));

  return NextResponse.json({
    books: records.map((record) => {
      const chapterTotal = Math.max(record.novel._count.chapters, 1);
      const chapterProgress = Math.round((record.chapter.chapterNumber / chapterTotal) * 100);

      return {
        novelSlug: record.novel.slug,
        title: record.novel.title,
        coverUrl: record.novel.coverUrl,
        chapterSlug: record.chapter.slug,
        chapterTitle: record.chapter.title,
        chapterNumber: record.chapter.chapterNumber,
        progress: Math.min(100, Math.max(record.progress, chapterProgress)),
        updatedAt: record.updatedAt.toISOString().slice(0, 10),
      };
    }),
    savedBooks: bookmarks.map((bookmark) => {
      const firstChapter = bookmark.novel.chapters[0];

      return {
        novelSlug: bookmark.novel.slug,
        title: bookmark.novel.title,
        coverUrl: bookmark.novel.coverUrl,
        excerpt: bookmark.novel.excerpt,
        savedAt: bookmark.createdAt.toISOString().slice(0, 10),
        firstChapterSlug: firstChapter?.slug ?? null,
      };
    }),
    subscribedBooks: novelSubscriptions.flatMap((subscription) => {
      const novelSlug = subscription.source?.replace(/^novel:/, "") ?? "";
      const novel = subscribedNovelMap.get(novelSlug);

      if (!novel) {
        return [];
      }

      const firstChapter = novel.chapters[0];

      return {
        novelSlug: novel.slug,
        title: novel.title,
        coverUrl: novel.coverUrl,
        excerpt: novel.excerpt,
        subscribedAt: subscription.createdAt.toISOString().slice(0, 10),
        firstChapterSlug: firstChapter?.slug ?? null,
      };
    }),
  });
}
