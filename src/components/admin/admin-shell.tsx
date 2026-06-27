import Link from "next/link";
import {
  Bell,
  BookOpenText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusCircle,
  UsersRound,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

export function AdminShell({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description: string;
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-153px)] bg-[#f6efea]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[8px] border border-rose-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <p className="px-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
            管理后台
          </p>
          <nav className="mt-4 grid gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#3a303c] hover:bg-[#f8f1ee]"
            >
              <LayoutDashboard size={17} aria-hidden="true" />
              数据概览
            </Link>
            <Link
              href="/admin/novels"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#3a303c] hover:bg-[#f8f1ee]"
            >
              <BookOpenText size={17} aria-hidden="true" />
              小说管理
            </Link>
            <Link
              href="/admin/novels/new"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#9b405e] hover:bg-[#f8f1ee]"
            >
              <PlusCircle size={17} aria-hidden="true" />
              新增小说
            </Link>
            <Link
              href="/admin/comments"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#3a303c] hover:bg-[#f8f1ee]"
            >
              <MessageCircle size={17} aria-hidden="true" />
              评论管理
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#3a303c] hover:bg-[#f8f1ee]"
            >
              <UsersRound size={17} aria-hidden="true" />
              用户管理
            </Link>
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#3a303c] hover:bg-[#f8f1ee]"
            >
              <Bell size={17} aria-hidden="true" />
              订阅管理
            </Link>
          </nav>
          <form action={logoutAction} className="mt-5 border-t border-rose-50 pt-4">
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#7a6b76] hover:bg-[#f8f1ee]"
            >
              <LogOut size={17} aria-hidden="true" />
              退出登录
            </button>
          </form>
        </aside>

        <section>
          {breadcrumb ? <div className="mb-4">{breadcrumb}</div> : null}
          <div className="mb-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
            <h1 className="font-serif text-4xl font-semibold text-[#281f2d]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#6c5b68]">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
