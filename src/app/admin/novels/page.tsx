import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Eye, PlusCircle, Trash2 } from "lucide-react";
import { deleteNovelAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCategories, getLatestNovels } from "@/lib/repository";

type PageProps = {
  searchParams: Promise<{ deleted?: string }>;
};

export const metadata: Metadata = {
  title: "小说管理",
};

export const dynamic = "force-dynamic";

export default async function AdminNovelsPage({ searchParams }: PageProps) {
  const { deleted } = await searchParams;
  const [novels, categories] = await Promise.all([getLatestNovels(), getCategories()]);

  function getCategoryName(slug: string) {
    return categories.find((category) => category.slug === slug)?.name ?? slug;
  }

  return (
    <AdminShell title="小说管理" description="管理小说基础信息、章节列表和前台展示内容。">
      {deleted ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          小说已删除。
        </p>
      ) : null}

      <div className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#281f2d]">全部小说</h2>
            <p className="mt-1 text-sm text-[#7a6b76]">当前共 {novels.length} 本小说。</p>
          </div>
          <Link
            href="/admin/novels/new"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
          >
            <PlusCircle size={16} aria-hidden="true" />
            新增小说
          </Link>
        </div>

        <div className="grid gap-4">
          {novels.map((novel) => (
            <article
              key={novel.slug}
              className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 md:grid-cols-[92px_1fr_auto]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-white">
                <Image
                  src={novel.coverUrl}
                  alt={`${novel.title} cover`}
                  fill
                  sizes="92px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#281f2d]">{novel.title}</h3>
                <p className="mt-1 text-sm text-[#7a6b76]">
                  {getCategoryName(novel.categorySlug)} · {novel.status === "Completed" ? "已完结" : "连载中"} · {novel.chapters.length} 章
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6c5b68]">{novel.excerpt}</p>
                <p className="mt-2 text-xs text-[#8a6c67]">Slug: {novel.slug}</p>
              </div>
              <div className="flex flex-wrap content-start gap-2 md:justify-end">
                <Link
                  href={`/novels/${novel.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-rose-100 bg-white px-3 text-sm font-semibold text-[#3a303c]"
                >
                  <Eye size={15} aria-hidden="true" />
                  前台
                </Link>
                <Link
                  href={`/admin/novels/${novel.slug}/edit`}
                  className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#557463] px-3 text-sm font-semibold text-white"
                >
                  <Edit3 size={15} aria-hidden="true" />
                  编辑
                </Link>
                <form action={deleteNovelAction}>
                  <input type="hidden" name="slug" value={novel.slug} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#f8e8e6] px-3 text-sm font-semibold text-[#9b405e]"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    删除
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
