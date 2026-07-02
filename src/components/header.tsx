import Link from "next/link";
import { BookHeart, ChevronDown, Search } from "lucide-react";
import { getCategories } from "@/lib/repository";
import { UserMenu } from "@/components/user-menu";
import { categories as fallbackCategories, type Category } from "@/lib/sample-data";

// 导航栏主要分类的显示数量，超出部分收进「More」下拉
const PRIMARY_NAV_COUNT = 4;

async function getNavigationCategories() {
  if (process.env.SKIP_DATABASE_DURING_BUILD === "1") {
    return fallbackCategories;
  }

  try {
    return await getCategories();
  } catch (error) {
    console.error("Failed to load header categories.", error);
    return fallbackCategories;
  }
}

export async function Header() {
  const categories = await getNavigationCategories();
  const typedCategories = categories as Category[];
  const primaryCategories = typedCategories.slice(0, PRIMARY_NAV_COUNT);
  const moreCategories = typedCategories.slice(PRIMARY_NAV_COUNT);

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
          {primaryCategories.map((category: Category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-[8px] px-3 py-2 text-sm font-medium text-[#5b4a5f] transition hover:bg-white hover:text-[#9b405e]"
            >
              {category.name}
            </Link>
          ))}

          {moreCategories.length > 0 ? (
            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-[8px] px-3 py-2 text-sm font-medium text-[#5b4a5f] transition hover:bg-white hover:text-[#9b405e]"
              >
                More
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              <div className="invisible absolute left-0 top-full z-40 w-48 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="grid gap-1 rounded-[8px] border border-rose-100 bg-white p-2 shadow-[0_18px_50px_rgba(75,43,58,0.16)]">
                  {moreCategories.map((category: Category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="rounded-[8px] px-3 py-2 text-sm font-medium text-[#5b4a5f] transition hover:bg-[#f8f1ee] hover:text-[#9b405e]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-[8px] border border-rose-100 bg-white text-[#5b4a5f] shadow-sm transition hover:border-[#d99aaa] hover:text-[#9b405e]"
          >
            <Search size={18} aria-hidden="true" />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
