import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bell, BookOpenText, Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";

type SubscriptionCount = {
  source: string;
  _count: {
    source: number;
  };
};

type SubscriptionNovel = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  updatedAt: Date;
};

type NovelSubscriptionRow = SubscriptionNovel & {
  subscriptionCount: number;
};

export const metadata: Metadata = {
  title: "订阅管理",
};

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const [novels, counts] = await Promise.all([
    prisma.novel.findMany({
      orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        updatedAt: true,
      },
    }),
    prisma.subscription.groupBy({
      by: ["source"],
      where: {
        source: {
          startsWith: "novel:",
        },
      },
      _count: {
        source: true,
      },
    }),
  ]);

  const countMap = new Map<string, number>(
    (counts as SubscriptionCount[]).map((item: SubscriptionCount) => [
      item.source.replace(/^novel:/, ""),
      item._count.source,
    ]),
  );
  const rows: NovelSubscriptionRow[] = (novels as SubscriptionNovel[])
    .map((novel: SubscriptionNovel) => ({
      ...novel,
      subscriptionCount: countMap.get(novel.slug) ?? 0,
    }))
    .filter((novel: NovelSubscriptionRow) => novel.subscriptionCount > 0)
    .sort(
      (left: NovelSubscriptionRow, right: NovelSubscriptionRow) =>
        right.subscriptionCount - left.subscriptionCount ||
        right.updatedAt.getTime() - left.updatedAt.getTime(),
    );
  const totalSubscriptions = rows.reduce(
    (total: number, novel: NovelSubscriptionRow) => total + novel.subscriptionCount,
    0,
  );
  const subscribedNovelCount = rows.filter(
    (novel: NovelSubscriptionRow) => novel.subscriptionCount > 0,
  ).length;
  const topNovel = rows.find((novel: NovelSubscriptionRow) => novel.subscriptionCount > 0);

  return (
    <AdminShell title="订阅管理" description="查看所有小说的订阅数量，按订阅热度排序展示。">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <Bell className="text-[#9b405e]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">小说订阅总数</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">
            {totalSubscriptions}
          </p>
        </div>
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <BookOpenText className="text-[#9b405e]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">有订阅的小说</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">
            {subscribedNovelCount}
          </p>
        </div>
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <Eye className="text-[#9b405e]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">订阅最高</p>
          <p className="mt-1 line-clamp-1 text-lg font-semibold text-[#281f2d]">
            {topNovel?.title ?? "暂无订阅"}
          </p>
          <p className="mt-1 text-sm text-[#7a6b76]">
            {topNovel ? `${topNovel.subscriptionCount} 个订阅` : "等待读者订阅小说"}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#281f2d]">小说订阅列表</h2>
          <p className="mt-1 text-sm text-[#7a6b76]">
            当前共 {rows.length} 本有订阅记录的小说。
          </p>
        </div>

        <div className="grid gap-4">
          {rows.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-rose-100 bg-[#fffaf8] p-8 text-center">
              <BookOpenText className="mx-auto text-[#9b405e]" size={28} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#281f2d]">暂无订阅小说</p>
              <p className="mt-1 text-sm text-[#7a6b76]">有读者订阅小说后会显示在这里。</p>
            </div>
          ) : (
            rows.map((novel: NovelSubscriptionRow) => (
              <article
                key={novel.id}
                className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 md:grid-cols-[84px_1fr_auto]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-white">
                  <Image
                    src={novel.coverUrl}
                    alt={`${novel.title} cover`}
                    fill
                    sizes="84px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#281f2d]">{novel.title}</h3>
                  <p className="mt-1 text-sm text-[#7a6b76]">Slug: {novel.slug}</p>
                  <p className="mt-2 text-xs text-[#8a6c67]">
                    更新时间：{novel.updatedAt.toISOString().slice(0, 10)}
                  </p>
                </div>

                <div className="flex flex-wrap content-start items-center gap-3 md:justify-end">
                  <div className="rounded-[8px] bg-white px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-[#7a6b76]">订阅数量</p>
                    <p className="mt-1 font-serif text-3xl font-semibold text-[#9b405e]">
                      {novel.subscriptionCount}
                    </p>
                  </div>
                  <Link
                    href={`/novels/${novel.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-rose-100 bg-white px-3 text-sm font-semibold text-[#3a303c]"
                  >
                    <Eye size={15} aria-hidden="true" />
                    前台
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
