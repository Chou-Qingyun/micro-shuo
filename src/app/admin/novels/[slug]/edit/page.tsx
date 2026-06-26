import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { updateNovelAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { NovelForm } from "@/components/admin/novel-form";
import { getCategories, getNovelBySlug } from "@/lib/repository";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string; chapter?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovelBySlug(slug);

  return {
    title: novel ? `编辑：${novel.title}` : "编辑小说",
  };
}

export default async function EditNovelPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const notice = await searchParams;
  const [novel, categories] = await Promise.all([getNovelBySlug(slug), getCategories()]);

  if (!novel) {
    notFound();
  }

  const updateAction = updateNovelAction.bind(null, novel.slug);

  return (
    <AdminShell title={`编辑小说：${novel.title}`} description="修改小说基础信息，管理章节内容和前台展示。">
      {notice.created ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          小说已创建，可以继续添加章节。
        </p>
      ) : null}
      {notice.updated ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          小说信息已更新。
        </p>
      ) : null}
      {notice.chapter ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          章节已添加。
        </p>
      ) : null}

      <NovelForm categories={categories} novel={novel} action={updateAction} submitLabel="保存修改" />

      <section className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#281f2d]">章节列表</h2>
            <p className="mt-1 text-sm text-[#7a6b76]">当前共 {novel.chapters.length} 章。</p>
          </div>
          <Link
            href={`/admin/novels/${novel.slug}/chapters/new`}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
          >
            <PlusCircle size={16} aria-hidden="true" />
            新增章节
          </Link>
        </div>

        <div className="divide-y divide-rose-50">
          {novel.chapters.length === 0 ? (
            <p className="py-4 text-sm text-[#7a6b76]">暂无章节，请先添加第一章。</p>
          ) : (
            novel.chapters.map((chapter) => (
              <div
                key={chapter.slug}
                className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm"
              >
                <span>
                  <span className="block font-semibold text-[#281f2d]">
                    第 {chapter.chapterNumber} 章：{chapter.title}
                  </span>
                  <span className="mt-1 block text-[#7a6b76]">
                    {chapter.publishedAt} · {chapter.slug}
                  </span>
                </span>
                <span className="inline-flex items-center gap-3">
                  <Link
                    href={`/admin/novels/${novel.slug}/chapters/${chapter.slug}/edit`}
                    className="font-semibold text-[#9b405e]"
                  >
                    编辑
                  </Link>
                  <Link
                    href={`/novels/${novel.slug}/chapter/${chapter.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#557463]"
                  >
                    预览
                  </Link>
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
