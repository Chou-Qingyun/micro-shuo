import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const novelSlug = searchParams.get("novelSlug");
  const chapterSlug = searchParams.get("chapterSlug");

  if (!novelSlug) {
    return NextResponse.json({ comments: [] }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      novel: { slug: novelSlug },
      ...(chapterSlug ? { chapter: { slug: chapterSlug } } : { chapterId: null }),
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
    take: 50,
  });

  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString().slice(0, 10),
      author: comment.user?.displayName ?? "Reader",
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    novelSlug?: string;
    chapterSlug?: string;
    body?: string;
  } | null;
  const novelSlug = body?.novelSlug;
  const chapterSlug = body?.chapterSlug;
  const commentBody = body?.body?.trim();

  if (!novelSlug || !commentBody) {
    return NextResponse.json({ message: "Missing comment content." }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({
    where: { slug: novelSlug },
  });

  if (!novel) {
    return NextResponse.json({ message: "Novel not found." }, { status: 404 });
  }

  const chapter = chapterSlug
    ? await prisma.chapter.findFirst({
        where: {
          novelId: novel.id,
          slug: chapterSlug,
        },
      })
    : null;

  if (chapterSlug && !chapter) {
    return NextResponse.json({ message: "Chapter not found." }, { status: 404 });
  }

  await prisma.comment.create({
    data: {
      body: commentBody,
      status: "APPROVED",
      userId: user.id,
      novelId: novel.id,
      chapterId: chapter?.id,
    },
  });

  return NextResponse.json({ ok: true });
}
