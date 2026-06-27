import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShieldBan, ShieldCheck, UsersRound } from "lucide-react";
import { allowUserLoginAction, blockUserLoginAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ updated?: string; q?: string; status?: string }>;
};

type UserStatusFilter = "blocked" | "allowed";

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  lastLoginIp: string | null;
  lastLoginCountry: string | null;
  lastLoginAt: Date | null;
  isLoginBlocked: boolean;
  createdAt: Date;
};

export const metadata: Metadata = {
  title: "用户管理",
};

export const dynamic = "force-dynamic";

function getNotice(updated?: string) {
  if (updated === "blocked") return "用户已禁止登录。";
  if (updated === "allowed") return "用户已重新允许登录。";
  if (updated === "deleted") return "用户已物理删除。";
  if (updated === "missing") return "用户不存在或已被删除。";
  if (updated === "missing-service-role") {
    return "删除用户需要配置 SUPABASE_SERVICE_ROLE_KEY。";
  }
  if (updated === "delete-auth-failed") {
    return "删除 Supabase Auth 用户失败，请检查 service role key 或稍后重试。";
  }
  return "";
}

function getStatusFilter(status?: string): UserStatusFilter | undefined {
  if (status === "blocked" || status === "allowed") {
    return status;
  }

  return undefined;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "从未登录";
  }

  return value.toISOString().slice(0, 16).replace("T", " ");
}

function formatCountry(countryCode: string | null) {
  if (!countryCode) {
    return "未知";
  }

  try {
    const formatter = new Intl.DisplayNames(["zh-CN"], { type: "region" });
    return formatter.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function getAvatarInitial(user: AdminUserRow) {
  return (user.displayName || user.email).slice(0, 1).toUpperCase();
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { updated, q, status } = await searchParams;
  const search = q?.trim() || undefined;
  const statusFilter = getStatusFilter(status);
  const notice = getNotice(updated);
  const where = {
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { displayName: { contains: search, mode: "insensitive" as const } },
            { lastLoginIp: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(statusFilter ? { isLoginBlocked: statusFilter === "blocked" } : {}),
  };
  const [users, totalCount, blockedCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ lastLoginAt: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isLoginBlocked: true } }),
  ]);
  const adminUsers = users as AdminUserRow[];
  const allowedCount = totalCount - blockedCount;
  const buildFilterHref = (nextStatus?: UserStatusFilter) => {
    const params = new URLSearchParams();
    if (nextStatus) params.set("status", nextStatus);
    if (search) params.set("q", search);
    const queryString = params.toString();
    return queryString ? `/admin/users?${queryString}` : "/admin/users";
  };

  return (
    <AdminShell
      title="用户管理"
      description="查看普通用户资料、最近登录 IP 和国家，并管理用户登录权限。"
    >
      {notice ? (
        <p className="mb-4 rounded-[8px] bg-[#eef5ef] px-4 py-3 text-sm font-medium text-[#557463]">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <UsersRound className="text-[#9b405e]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">普通用户总数</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">
            {totalCount}
          </p>
        </div>
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <ShieldCheck className="text-[#557463]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">允许登录</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">
            {allowedCount}
          </p>
        </div>
        <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <ShieldBan className="text-[#9b405e]" size={22} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-[#7a6b76]">禁止登录</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-[#281f2d]">
            {blockedCount}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#281f2d]">用户列表</h2>
            <p className="mt-1 text-sm text-[#7a6b76]">默认显示最近 100 个用户。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "全部", href: buildFilterHref(), active: !statusFilter, count: totalCount },
              {
                label: "允许登录",
                href: buildFilterHref("allowed"),
                active: statusFilter === "allowed",
                count: allowedCount,
              },
              {
                label: "禁止登录",
                href: buildFilterHref("blocked"),
                active: statusFilter === "blocked",
                count: blockedCount,
              },
            ].map((filter) => (
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

        <form method="get" className="mb-5 flex flex-wrap gap-2">
          {statusFilter ? <input type="hidden" name="status" value={statusFilter} /> : null}
          <input
            type="text"
            name="q"
            defaultValue={search ?? ""}
            placeholder="搜索邮箱、昵称或 IP..."
            className="h-9 w-full rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 text-sm outline-none focus:border-[#c46b84] sm:w-72"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
          >
            <Search size={15} aria-hidden="true" />
            搜索
          </button>
          {search ? (
            <Link
              href={statusFilter ? `/admin/users?status=${statusFilter}` : "/admin/users"}
              className="inline-flex h-9 items-center rounded-[8px] border border-rose-100 bg-white px-4 text-sm font-semibold text-[#6c5b68]"
            >
              清除
            </Link>
          ) : null}
        </form>

        <div className="grid gap-4">
          {adminUsers.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-rose-100 bg-[#fffaf8] p-8 text-center">
              <UsersRound className="mx-auto text-[#9b405e]" size={28} aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#281f2d]">暂无用户</p>
              <p className="mt-1 text-sm text-[#7a6b76]">当前筛选条件下没有普通用户。</p>
            </div>
          ) : (
            adminUsers.map((user: AdminUserRow) => (
              <article
                key={user.id}
                className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 xl:grid-cols-[1fr_auto]"
              >
                <div className="grid min-w-0 gap-4 md:grid-cols-[56px_1.4fr_1fr_1fr]">
                  <div
                    className="grid size-14 place-items-center overflow-hidden rounded-[8px] bg-[#9b405e] text-lg font-semibold text-white"
                    style={
                      user.avatarUrl
                        ? {
                            backgroundImage: `url("${user.avatarUrl}")`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                    aria-label="用户头像"
                  >
                    {user.avatarUrl ? null : <span>{getAvatarInitial(user)}</span>}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#281f2d]">
                      {user.email}
                    </p>
                    <p className="mt-1 truncate text-sm text-[#7a6b76]">
                      昵称：{user.displayName || "未设置"}
                    </p>
                    <p className="mt-2">
                      <span
                        className={`rounded-[8px] px-2.5 py-1 text-xs font-semibold ${
                          user.isLoginBlocked
                            ? "bg-[#f8e8e6] text-[#9b405e]"
                            : "bg-[#eef5ef] text-[#557463]"
                        }`}
                      >
                        {user.isLoginBlocked ? "禁止登录" : "允许登录"}
                      </span>
                    </p>
                  </div>

                  <div className="text-sm leading-6 text-[#6c5b68]">
                    <p className="font-semibold text-[#3a303c]">最新登录 IP</p>
                    <p>{user.lastLoginIp || "未知"}</p>
                    <p className="text-xs text-[#8a6c67]">{formatDate(user.lastLoginAt)}</p>
                  </div>

                  <div className="text-sm leading-6 text-[#6c5b68]">
                    <p className="font-semibold text-[#3a303c]">IP 所属国家</p>
                    <p>{formatCountry(user.lastLoginCountry)}</p>
                    <p className="text-xs text-[#8a6c67]">
                      注册：{user.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap content-start gap-2 xl:justify-end">
                  {user.isLoginBlocked ? (
                    <form action={allowUserLoginAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#557463] px-3 text-sm font-semibold text-white"
                      >
                        <ShieldCheck size={15} aria-hidden="true" />
                        允许登录
                      </button>
                    </form>
                  ) : (
                    <form action={blockUserLoginAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-rose-100 bg-white px-3 text-sm font-semibold text-[#3a303c]"
                      >
                        <ShieldBan size={15} aria-hidden="true" />
                        禁止登录
                      </button>
                    </form>
                  )}
                  <UserDeleteButton userId={user.id} email={user.email} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
