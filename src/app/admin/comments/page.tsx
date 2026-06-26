import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, MessageCircle, Trash2 } from "lucide-react";
import { deleteCommentAction, hideCommentAction, showCommentAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ updated?: string; status?: string }>;
};

const statusLabels = {
  APPROVED: "正常显示",
  REJECTED: "已屏蔽",
  PENDING: "待审核",
} as const;

const statusClasses = {
  APPROVED: "bg-[#eef5ef] text-[#557463]",
  REJECTED: "bg-[#f8e8e6] text-[#9b405e]",
  PENDING: "bg-[#fff4d8] text-[#7b6338]",
} as const;

type CommentStatusValue = keyof typeof statusLabels;
type CommentStatusCount = {
  status: CommentStatusValue;
  _count: {
    status: number;
  };
};

export const metadata: Metadata = {
  title: "评论管理",
};

export const dynamic = "force-dynamic";

function getNotice(updated?: string) {
  if (updated === "hidden") return "评论已屏蔽，前台将不再显示。";
  if (updated === "shown") return "评论已恢复显示。";
  if (updated === "deleted") return "评论已物理删除。";
  if (updated === "missing") return "评论不存在或已被删除。";
  return "";
}

function getStatusFilter(status?: string) {
  if (status === "APPROVED" || status === "REJECTED" || status === "PENDING") {
    return status;
  }

  return undefined;
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const { updated, status } = await searchParams;
  const statusFilter = getStatusFilter(status);
  const notice = getNotice(updated);
  const [comments, counts] = await Promise.all([
    prisma.comment.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: true,
        novel: true,
        chapter: true,
      },
    }),
    prisma.comment.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
  ]);
  const commentCounts = counts as CommentStatusCount[];
  const countMap = new Map<CommentStatusValue, number>(
    commentCounts.map((item: CommentStatusCount) => [item.status, item._count.status]),
  );
  const totalCount = commentCounts.reduce(
    (total: number, item: CommentStatusCount) => total + item._count.status,
    0,
  );
  const filters = [
    { label: "全部", href: "/admin/comments", active: !statusFilter, count: totalCount },
    {
      label: "正常显示",
      href: "/admin/comments?status=APPROVED",
      active: statusFilter === "APPROVED",
      count: countMap.get("APPROVED") ?? 0,
    },
    {
      label: "已屏蔽",
      href: "/admin/comments?status=REJECTED",
      active: statusFilter === "REJECTED",
      count: countMap.get("REJECTED") ?? 0,
    },
    {
      label: "待审核",
      href: "/admin/comments?status=PENDING",
      active: statusFilter === "PENDING",
      count: countMap.get("PENDING") ?? 0,
    },
  ];

  return (
    <AdminShell title="评论管理" description="管理普通用户发布的评论，支持屏蔽、恢复显示和物理删除。">
      {notice ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          {notice}
        </p>
      ) : null}

      <section className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#281f2d]">用户评论列表</h2>
            <p className="mt-1 text-sm text-[#7a6b76]">默认显示最近 100 条评论。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Link
                key={filter.href}
                href={filter.href}
                className={`inline-flex h-9 items-center rounded-[8px] px-3 text-sm font-semibold ${
                  filter.active ? "bg-[#9b405e] text-white" : "bg-[#f8f1ee] text-[#6c5b68]"
                }`}
              >
                {filter.label} {filter.count}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {comments.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-rose-100 bg-[#fffaf8] p-8 text-center">
              <MessageCircle className="mx-auto text-[#9b405e]" size={28} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#281f2d]">暂无评论</p>
              <p className="mt-1 text-sm text-[#7a6b76]">当前筛选条件下没有用户评论。</p>
            </div>
          ) : (
            comments.map((comment) => {
              const statusLabel = statusLabels[comment.status];
              const statusClass = statusClasses[comment.status];
              const frontUrl = comment.chapter
                ? `/novels/${comment.novel.slug}/chapter/${comment.chapter.slug}`
                : `/novels/${comment.novel.slug}`;

              return (
                <article
                  key={comment.id}
                  className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-[8px] px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                      <span className="text-xs text-[#8a6c67]">
                        {comment.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#352b37]">
                      {comment.body}
                    </p>
                    <div className="mt-3 grid gap-1 text-xs leading-5 text-[#7a6b76]">
                      <p>用户：{comment.user?.displayName ?? "Reader"}（{comment.user?.email ?? "未关联邮箱"}）</p>
                      <p>
                        位置：
                        <Link
                          href={frontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#9b405e]"
                        >
                          {comment.novel.title}
                          {comment.chapter ? ` / ${comment.chapter.title}` : ""}
                        </Link>
                      </p>
                      <p>ID：{comment.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                    {comment.status === "REJECTED" ? (
                      <form action={showCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#557463] px-3 text-sm font-semibold text-white"
                        >
                          <Eye size={15} aria-hidden="true" />
                          显示
                        </button>
                      </form>
                    ) : (
                      <form action={hideCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-rose-100 bg-white px-3 text-sm font-semibold text-[#3a303c]"
                        >
                          <EyeOff size={15} aria-hidden="true" />
                          屏蔽
                        </button>
                      </form>
                    )}
                    <form action={deleteCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
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
              );
            })
          )}
        </div>
      </section>
    </AdminShell>
  );
}
