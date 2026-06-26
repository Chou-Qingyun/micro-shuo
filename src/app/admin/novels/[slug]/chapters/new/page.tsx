import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createChapterAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getNovelBySlug } from "@/lib/repository";
import type { Chapter } from "@/lib/sample-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovelBySlug(slug);

  return {
    title: novel ? `新增章节：${novel.title}` : "新增章节",
  };
}

export default async function NewChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const novel = await getNovelBySlug(slug);

  if (!novel) {
    notFound();
  }

  const action = createChapterAction.bind(null, novel.slug);
  const typedChapters = novel.chapters as Chapter[];
  const nextChapterNumber =
    Math.max(0, ...typedChapters.map((chapter: Chapter) => chapter.chapterNumber)) + 1;

  return (
    <AdminShell
      title={`新增章节：${novel.title}`}
      description="填写章节标题和正文内容。正文建议每个自然段之间空一行，前台阅读页会自动排版。"
    >
      <ChapterForm action={action} nextChapterNumber={nextChapterNumber} />
    </AdminShell>
  );
}
