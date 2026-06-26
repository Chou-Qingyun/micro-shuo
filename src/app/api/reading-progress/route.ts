import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    novelSlug?: string;
    chapterSlug?: string;
    progress?: number;
  } | null;

  if (!body?.novelSlug || !body.chapterSlug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({
    where: { slug: body.novelSlug },
  });

  if (!novel) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const chapter = await prisma.chapter.findFirst({
    where: {
      novelId: novel.id,
      slug: body.chapterSlug,
    },
  });

  if (!chapter) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await prisma.readingProgress.upsert({
    where: {
      userId_novelId: {
        userId: user.id,
        novelId: novel.id,
      },
    },
    update: {
      chapterId: chapter.id,
      progress: body.progress ?? 0,
    },
    create: {
      userId: user.id,
      novelId: novel.id,
      chapterId: chapter.id,
      progress: body.progress ?? 0,
    },
  });

  return NextResponse.json({ ok: true });
}

