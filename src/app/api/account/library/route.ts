import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

type LibraryChapter = {
  slug: string;
  title: string;
  chapterNumber: number;
};
type LibraryNovelBase = {
  slug: string;
  title: string;
  coverUrl: string;
  excerpt: string;
};
type LibraryNovelWithChapters = LibraryNovelBase & {
  chapters: LibraryChapter[];
};
type ReadingRecord = {
  progress: number;
  updatedAt: Date;
  novel: LibraryNovelBase & {
    _count: {
      chapters: number;
    };
  };
  chapter: LibraryChapter;
};
type BookmarkRecord = {
  createdAt: Date;
  novel: LibraryNovelWithChapters;
};
type NovelSubscription = {
  source: string;
  createdAt: Date;
};

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
  const typedSubscriptions = novelSubscriptions as NovelSubscription[];
  const subscribedSlugs = typedSubscriptions
    .map((subscription: NovelSubscription) => subscription.source?.replace(/^novel:/, ""))
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
  const typedRecords = records as ReadingRecord[];
  const typedBookmarks = bookmarks as BookmarkRecord[];
  const typedSubscribedNovels = subscribedNovels as LibraryNovelWithChapters[];
  const subscribedNovelMap = new Map<string, LibraryNovelWithChapters>(
    typedSubscribedNovels.map((novel: LibraryNovelWithChapters) => [novel.slug, novel]),
  );

  return NextResponse.json({
    books: typedRecords.map((record: ReadingRecord) => {
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
    savedBooks: typedBookmarks.map((bookmark: BookmarkRecord) => {
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
    subscribedBooks: typedSubscriptions.flatMap((subscription: NovelSubscription) => {
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
