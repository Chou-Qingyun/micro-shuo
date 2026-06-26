"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminCookieName } from "@/lib/admin-auth";
import {
  createChapter,
  createNovel,
  deleteNovel,
  slugify,
  updateChapter,
  updateNovel,
} from "@/lib/content-store";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getTags(formData: FormData) {
  return getString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getStatus(formData: FormData) {
  const status = getString(formData, "status");
  return status === "Completed" ? "Completed" : "Ongoing";
}

function revalidateContentPaths(slug?: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/novels");

  if (slug) {
    revalidatePath(`/novels/${slug}`);
  }

  if (categorySlug) {
    revalidatePath(`/category/${categorySlug}`);
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
  redirect("/admin/login");
}

export async function createNovelAction(formData: FormData) {
  const title = getString(formData, "title");
  const slug = slugify(getString(formData, "slug") || title);

  const novel = await createNovel({
    title,
    slug,
    author: getString(formData, "author"),
    categorySlug: getString(formData, "categorySlug"),
    coverUrl: getString(formData, "coverUrl"),
    status: getStatus(formData),
    tags: getTags(formData),
    excerpt: getString(formData, "excerpt"),
    description: getString(formData, "description"),
    seoTitle: getString(formData, "seoTitle"),
    seoDescription: getString(formData, "seoDescription"),
    updatedAt: getString(formData, "updatedAt"),
  });

  revalidateContentPaths(novel.slug, novel.categorySlug);
  redirect(`/admin/novels/${novel.slug}/edit?created=1`);
}

export async function updateNovelAction(slug: string, formData: FormData) {
  const title = getString(formData, "title");
  const novel = await updateNovel(slug, {
    title,
    slug: slugify(getString(formData, "slug") || title),
    author: getString(formData, "author"),
    categorySlug: getString(formData, "categorySlug"),
    coverUrl: getString(formData, "coverUrl"),
    status: getStatus(formData),
    tags: getTags(formData),
    excerpt: getString(formData, "excerpt"),
    description: getString(formData, "description"),
    seoTitle: getString(formData, "seoTitle"),
    seoDescription: getString(formData, "seoDescription"),
    updatedAt: getString(formData, "updatedAt"),
  });

  revalidateContentPaths(slug, novel.categorySlug);
  revalidateContentPaths(novel.slug, novel.categorySlug);
  redirect(`/admin/novels/${novel.slug}/edit?updated=1`);
}

export async function deleteNovelAction(formData: FormData) {
  const slug = getString(formData, "slug");
  await deleteNovel(slug);
  revalidateContentPaths(slug);
  redirect("/admin/novels?deleted=1");
}

export async function createChapterAction(novelSlug: string, formData: FormData) {
  const chapter = await createChapter(novelSlug, {
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    chapterNumber: Number(getString(formData, "chapterNumber")) || undefined,
    publishedAt: getString(formData, "publishedAt"),
    content: getString(formData, "content"),
    seoTitle: getString(formData, "seoTitle"),
    seoDescription: getString(formData, "seoDescription"),
  });

  revalidateContentPaths(novelSlug);
  revalidatePath(`/novels/${novelSlug}/chapter/${chapter.slug}`);
  redirect(`/admin/novels/${novelSlug}/edit?chapter=created`);
}

export async function updateChapterAction(novelSlug: string, chapterSlug: string, formData: FormData) {
  const chapter = await updateChapter(novelSlug, chapterSlug, {
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    chapterNumber: Number(getString(formData, "chapterNumber")) || undefined,
    publishedAt: getString(formData, "publishedAt"),
    content: getString(formData, "content"),
    seoTitle: getString(formData, "seoTitle"),
    seoDescription: getString(formData, "seoDescription"),
  });

  revalidateContentPaths(novelSlug);
  revalidatePath(`/novels/${novelSlug}/chapter/${chapterSlug}`);
  revalidatePath(`/novels/${novelSlug}/chapter/${chapter.slug}`);
  redirect(`/admin/novels/${novelSlug}/chapters/${chapter.slug}/edit?updated=1`);
}

async function getCommentForAdmin(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      novel: true,
      chapter: true,
    },
  });
}

function revalidateCommentPaths(novelSlug?: string, chapterSlug?: string | null) {
  revalidatePath("/admin/comments");

  if (novelSlug) {
    revalidatePath(`/novels/${novelSlug}`);
  }

  if (novelSlug && chapterSlug) {
    revalidatePath(`/novels/${novelSlug}/chapter/${chapterSlug}`);
  }
}

export async function hideCommentAction(formData: FormData) {
  const commentId = getString(formData, "commentId");
  const comment = await getCommentForAdmin(commentId);

  if (!comment) {
    redirect("/admin/comments?updated=missing");
  }

  await prisma.comment.update({
    where: { id: comment.id },
    data: { status: "REJECTED" },
  });

  revalidateCommentPaths(comment.novel.slug, comment.chapter?.slug);
  redirect("/admin/comments?updated=hidden");
}

export async function showCommentAction(formData: FormData) {
  const commentId = getString(formData, "commentId");
  const comment = await getCommentForAdmin(commentId);

  if (!comment) {
    redirect("/admin/comments?updated=missing");
  }

  await prisma.comment.update({
    where: { id: comment.id },
    data: { status: "APPROVED" },
  });

  revalidateCommentPaths(comment.novel.slug, comment.chapter?.slug);
  redirect("/admin/comments?updated=shown");
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = getString(formData, "commentId");
  const comment = await getCommentForAdmin(commentId);

  if (!comment) {
    redirect("/admin/comments?updated=missing");
  }

  await prisma.$transaction([
    prisma.comment.updateMany({
      where: { parentId: comment.id },
      data: { parentId: null },
    }),
    prisma.comment.delete({
      where: { id: comment.id },
    }),
  ]);

  revalidateCommentPaths(comment.novel.slug, comment.chapter?.slug);
  redirect("/admin/comments?updated=deleted");
}
