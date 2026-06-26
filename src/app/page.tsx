import Link from "next/link";
import { ArrowRight, BookOpen, Crown, Gem, HeartHandshake, Search } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { NovelCard } from "@/components/novel-card";
import { SubscribeForm } from "@/components/subscribe-form";
import { getCategories, getFeaturedNovels, getLatestNovels } from "@/lib/repository";
import type { Category, Novel } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featuredNovels, latestNovels] = await Promise.all([
    getCategories(),
    getFeaturedNovels(),
    getLatestNovels(),
  ]);
  const typedCategories = categories as Category[];
  const typedFeaturedNovels = featuredNovels as Novel[];
  const typedLatestNovels = latestNovels as Novel[];

  return (
    <>
      <section className="border-b border-rose-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex flex-wrap gap-2">
              {["CEO devotion", "Second chance", "Soft healing"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-[8px] border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#7a4c5a] shadow-sm"
                >
                  <Gem size={13} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[0.98] text-[#281f2d] sm:text-6xl lg:text-7xl">
              Sweet Chinese romance for soft nights and powerful feelings.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f515f]">
              A curated library for CEO love stories, Cinderella turns, rebirth
              sweetness, transmigration warmth, and campus crushes with clean,
              comfortable reading.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/novels/${typedFeaturedNovels[0]?.slug}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#81324c]"
              >
                <BookOpen size={18} aria-hidden="true" />
                Start Reading
              </Link>
              <Link
                href="/search"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-rose-100 bg-white px-5 text-sm font-semibold text-[#281f2d] shadow-sm transition hover:border-[#d99aaa]"
              >
                <Search size={18} aria-hidden="true" />
                Search Library
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-[0_24px_70px_rgba(75,43,58,0.12)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
                <Crown size={17} aria-hidden="true" />
                Editor Pick
              </div>
              <h2 className="mt-5 font-serif text-4xl font-semibold text-[#281f2d]">
                {typedFeaturedNovels[0]?.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5f515f]">
                {typedFeaturedNovels[0]?.description}
              </p>
              <Link
                href={`/novels/${typedFeaturedNovels[0]?.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9b405e]"
              >
                Read the first chapter
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <AdSlot label="Google AdSense Slot" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              Categories
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              Choose your mood
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {typedCategories.map((category: Category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(75,43,58,0.1)]"
            >
              <HeartHandshake className="text-[#557463]" size={24} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-[#281f2d]">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6c5b68]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              Featured
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              Tender stories with sparkle
            </h2>
          </div>
          <Link href="/search" className="hidden text-sm font-semibold text-[#9b405e] sm:inline-flex">
            Browse all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {typedFeaturedNovels.map((novel: Novel, index: number) => (
            <NovelCard key={novel.slug} novel={novel} priority={index === 0} />
          ))}
        </div>
      </section>

      <section className="border-y border-rose-100 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              Latest
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              Recently updated
            </h2>
          </div>
          <div className="grid gap-3">
            {typedLatestNovels.map((novel: Novel) => (
              <Link
                key={novel.slug}
                href={`/novels/${novel.slug}`}
                className="flex items-center justify-between gap-4 rounded-[8px] border border-rose-100 bg-white p-4 shadow-sm transition hover:border-[#d99aaa]"
              >
                <span>
                  <span className="block font-semibold text-[#281f2d]">{novel.title}</span>
                  <span className="mt-1 block text-sm text-[#7a6b76]">
                    {novel.chapters.length} chapters · {novel.tags.slice(0, 2).join(", ")}
                  </span>
                </span>
                <ArrowRight className="shrink-0 text-[#9b405e]" size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[8px] border border-rose-100 bg-[#f8f1ee] p-6 shadow-sm">
          <h2 className="font-serif text-3xl font-semibold text-[#281f2d]">
            Get chapter updates
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6c5b68]">
            Receive gentle reminders when new sweet romance chapters go live.
          </p>
          <div className="mt-5">
            <SubscribeForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
