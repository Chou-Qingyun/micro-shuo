import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { getCategories } from "@/lib/repository";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="border-t border-rose-100 bg-[#281f2d] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
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
            {categories.map((category) => (
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
