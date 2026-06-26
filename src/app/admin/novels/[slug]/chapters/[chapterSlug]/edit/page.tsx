import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { updateChapterAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getChapter } from "@/lib/repository";

type PageProps = {
  params: Promise<{ slug: string; chapterSlug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const result = await getChapter(slug, chapterSlug);

  return {
    title: result ? `编辑章节：${result.chapter.title}` : "编辑章节",
  };
}

export default async function EditChapterPage({ params, searchParams }: PageProps) {
  const { slug, chapterSlug } = await params;
  const notice = await searchParams;
  const result = await getChapter(slug, chapterSlug);

  if (!result) {
    notFound();
  }

  const { novel, chapter } = result;
  const action = updateChapterAction.bind(null, novel.slug, chapter.slug);

  return (
    <AdminShell
      title={`编辑章节：${chapter.title}`}
      description="修改章节正文、URL Slug 和章节级 SEO 信息。"
      breadcrumb={
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#7a6b76]">
          <Link href="/admin/novels" className="transition hover:text-[#9b405e]">
            小说管理
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link
            href={`/admin/novels/${novel.slug}/edit`}
            className="transition hover:text-[#9b405e]"
          >
            编辑小说：{novel.title}
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="font-medium text-[#3a303c]">编辑章节</span>
        </nav>
      }
    >
      {notice.updated ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          章节信息已更新。
        </p>
      ) : null}

      <ChapterForm
        action={action}
        nextChapterNumber={chapter.chapterNumber}
        chapter={chapter}
        submitLabel="保存修改"
      />
    </AdminShell>
  );
}
