import type { Metadata } from "next";
import { Search } from "lucide-react";
import { NovelCard } from "@/components/novel-card";
import { getLatestNovels, searchNovels } from "@/lib/repository";
import type { Novel } from "@/lib/sample-data";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Search",
  description: "Search sweet Chinese romance novels by trope, title, and author.",
  alternates: {
    canonical: "/search",
  },
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchNovels(query) : await getLatestNovels();
  const typedResults = results as Novel[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Library Search
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold text-[#281f2d]">
          Find your next sweet obsession
        </h1>
        <form action="/search" className="mt-7 flex gap-2 rounded-[8px] border border-rose-100 bg-white p-2 shadow-sm">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try CEO, rebirth, contract marriage..."
            className="min-w-0 flex-1 rounded-[8px] px-3 text-sm text-[#281f2d] outline-none placeholder:text-[#a98d95]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-[8px] bg-[#9b405e] text-white transition hover:bg-[#81324c]"
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {typedResults.map((novel: Novel) => (
          <NovelCard key={novel.slug} novel={novel} />
        ))}
      </div>

      {typedResults.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[#7a6b76]">No matching stories yet.</p>
      ) : null}
    </div>
  );
}
