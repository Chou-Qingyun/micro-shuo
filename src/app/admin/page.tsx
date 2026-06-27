import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BookOpenText, Layers3, MessageCircle, PlusCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCategories, getLatestNovels } from "@/lib/repository";
import { prisma } from "@/lib/prisma";
import type { Category, Novel } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "后台管理",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [categories, novels, subscriptionCount] = await Promise.all([
    getCategories(),
    getLatestNovels(),
    prisma.subscription.count({
      where: {
        source: {
          startsWith: "novel:",
        },
      },
    }),
  ]);
  const typedCategories = categories as Category[];
  const typedNovels = novels as Novel[];
  const chapterCount = typedNovels.reduce(
    (total: number, novel: Novel) => total + novel.chapters.length,
    0,
  );

  return (
    <AdminShell title="数据概览" description="查看当前小说内容数量，并快速进入常用管理操作。">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "小说总数", value: typedNovels.length, icon: BookOpenText },
          { label: "章节总数", value: chapterCount, icon: Layers3 },
          { label: "分类数量", value: typedCategories.length, icon: MessageCircle },
          { label: "小说订阅", value: subscriptionCount, icon: Bell },
        ].map((item: { label: string; value: number; icon: typeof BookOpenText }) => (
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
          <Link
            href="/admin/subscriptions"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-rose-100 bg-white px-4 text-sm font-semibold text-[#3a303c]"
          >
            <Bell size={16} aria-hidden="true" />
            订阅管理
          </Link>
        </div>
        <div className="mt-5 divide-y divide-rose-50">
          {typedNovels.slice(0, 6).map((novel: Novel) => (
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
