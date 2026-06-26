import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Layers3, MessageCircle, PlusCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCategories, getLatestNovels } from "@/lib/repository";

export const metadata: Metadata = {
  title: "后台管理",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [categories, novels] = await Promise.all([getCategories(), getLatestNovels()]);
  const chapterCount = novels.reduce((total, novel) => total + novel.chapters.length, 0);

  return (
    <AdminShell title="数据概览" description="查看当前小说内容数量，并快速进入常用管理操作。">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "小说总数", value: novels.length, icon: BookOpenText },
          { label: "章节总数", value: chapterCount, icon: Layers3 },
          { label: "分类数量", value: categories.length, icon: MessageCircle },
        ].map((item) => (
          <div key={item.label} className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
            <item.icon className="text-[#9b405e]" size={22} aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-[#7a6b76]">{item.label}</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#281f2d]">最近更新</h2>
            <p className="mt-1 text-sm text-[#7a6b76]">按更新时间排序显示最近维护的小说。</p>
          </div>
          <Link
            href="/admin/novels/new"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
          >
            <PlusCircle size={16} aria-hidden="true" />
            新增小说
          </Link>
        </div>
        <div className="mt-5 divide-y divide-rose-50">
          {novels.slice(0, 6).map((novel) => (
            <Link
              key={novel.slug}
              href={`/admin/novels/${novel.slug}/edit`}
              className="flex items-center justify-between gap-4 py-4 text-sm"
            >
              <span>
                <span className="block font-semibold text-[#281f2d]">{novel.title}</span>
                <span className="mt-1 block text-[#7a6b76]">
                  {novel.chapters.length} 章 · {novel.updatedAt}
                </span>
              </span>
              <span className="text-[#9b405e]">编辑</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
