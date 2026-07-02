import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { getCategories } from "@/lib/repository";
import { categories as fallbackCategories, type Category } from "@/lib/sample-data";
import { topics } from "@/lib/topics";

async function getFooterCategories() {
  if (process.env.SKIP_DATABASE_DURING_BUILD === "1") {
    return fallbackCategories;
  }

  try {
    return await getCategories();
  } catch (error) {
    console.error("Failed to load footer categories.", error);
    return fallbackCategories;
  }
}

export async function Footer() {
  const categories = await getFooterCategories();
  const typedCategories = categories as Category[];

  return (
    <footer className="border-t border-rose-100 bg-[#281f2d] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-semibold">Sweet Chinese Romance</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#f5d8d0]">
            Curated sweet romance for readers who love soft tension, devoted
            leads, and emotionally satisfying chapters.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#f5d8d0]">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} aria-hidden="true" />
              Clean reading
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail size={16} aria-hidden="true" />
              Update alerts
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e6b9ad]">
            Categories
          </p>
          <div className="mt-4 grid gap-2">
            {typedCategories.map((category: Category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-sm text-[#f5d8d0] hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e6b9ad]">
            Tropes
          </p>
          <div className="mt-4 grid gap-2">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="text-sm text-[#f5d8d0] hover:text-white"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e6b9ad]">
            Policy
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[#f5d8d0]">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-white">
              Terms of Use
            </Link>
            <span>DMCA / Copyright</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
