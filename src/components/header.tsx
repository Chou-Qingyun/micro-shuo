import Link from "next/link";
import { BookHeart, Search } from "lucide-react";
import { getCategories } from "@/lib/repository";
import { UserMenu } from "@/components/user-menu";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function Header() {
  const categories = await getCategories();
  const isAdmin = await isAdminAuthenticated();

  return (
    <header className="sticky top-0 z-30 border-b border-rose-100/80 bg-[#fffaf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[8px] bg-[#281f2d] text-[#f6d7d2] shadow-sm">
            <BookHeart size={20} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-[#281f2d]">
              SweeRead
            </span>
            <span className="block text-xs uppercase tracking-[0.18em] text-[#9b6170]">
              Soft Love Library
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-[8px] px-3 py-2 text-sm font-medium text-[#5b4a5f] transition hover:bg-white hover:text-[#9b405e]"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-[8px] border border-rose-100 bg-white text-[#5b4a5f] shadow-sm transition hover:border-[#d99aaa] hover:text-[#9b405e]"
          >
            <Search size={18} aria-hidden="true" />
          </Link>
          <UserMenu isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
