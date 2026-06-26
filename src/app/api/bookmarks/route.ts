import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ saved: false, bookmarks: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const novelSlug = searchParams.get("novelSlug");

  if (novelSlug) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        novel: { slug: novelSlug },
      },
    });

    return NextResponse.json({ saved: Boolean(bookmark) });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      novel: true,
    },
  });

  return NextResponse.json({
    bookmarks: bookmarks.map((bookmark) => ({
      slug: bookmark.novel.slug,
      title: bookmark.novel.title,
      createdAt: bookmark.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { novelSlug?: string } | null;
  const novelSlug = body?.novelSlug;

  if (!novelSlug) {
    return NextResponse.json({ message: "Missing novel slug." }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({
    where: { slug: novelSlug },
  });

  if (!novel) {
    return NextResponse.json({ message: "Novel not found." }, { status: 404 });
  }

  await prisma.bookmark.upsert({
    where: {
      userId_novelId: {
        userId: user.id,
        novelId: novel.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      novelId: novel.id,
    },
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const novelSlug = searchParams.get("novelSlug");

  if (!novelSlug) {
    return NextResponse.json({ message: "Missing novel slug." }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({
    where: {
      userId: user.id,
      novel: { slug: novelSlug },
    },
  });

  return NextResponse.json({ saved: false });
}

