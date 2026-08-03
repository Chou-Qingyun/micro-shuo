import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Crown, Gem, HeartHandshake, Search } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FeaturedNovelCarousel } from "@/components/featured-novel-carousel";
import { SubscribeForm } from "@/components/subscribe-form";
import { getCategories, getNovelSummaries, type NovelSummary } from "@/lib/repository";
import { topics } from "@/lib/topics";
import type { Category } from "@/lib/sample-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Chinese Romance Novels in English",
  description:
    "Read Chinese romance novels in English, including CEO romance, rebirth revenge, transmigration sweetness, billionaire love stories, and campus first love.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Chinese Romance Novels in English",
    description:
      "A sweet English-reading library for CEO romance, rebirth romance, transmigration romance, billionaire love stories, and campus first love.",
    type: "website",
  },
};

export default async function Home() {
  const [categories, allNovels] = await Promise.all([
    getCategories(),
    getNovelSummaries(),
  ]);
  const typedCategories = categories as Category[];
  const typedAllNovels = allNovels as NovelSummary[];
  const typedFeaturedNovels = typedAllNovels.slice(0, 3);
  const carouselNovels = typedAllNovels.slice(0, 18);
  const typedLatestNovels = typedAllNovels.slice(0, 8);
  const homeTopics = topics.slice(1, 5);

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
              Read Chinese romance novels in English.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f515f]">
              A curated library for CEO love stories, rebirth revenge,
              transmigration sweetness, billionaire devotion, and campus crushes
              with clean, comfortable reading.
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
            <div className="relative overflow-hidden rounded-[8px] border border-rose-100 bg-white p-5 shadow-[0_24px_70px_rgba(75,43,58,0.12)]">
              {typedFeaturedNovels[0]?.coverUrl ? (
                <Image
                  src={typedFeaturedNovels[0].coverUrl}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  aria-hidden="true"
                />
              ) : null}
              <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/70 to-white/25" aria-hidden="true" />
              <div className="relative z-10">
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

      <section className="border-y border-rose-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
                Reader paths
              </p>
              <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
                Browse popular romance tropes
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homeTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(75,43,58,0.1)]"
              >
                <Gem className="text-[#9b405e]" size={24} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-[#281f2d]">{topic.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6c5b68]">{topic.description}</p>
              </Link>
            ))}
          </div>
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
        <FeaturedNovelCarousel novels={carouselNovels} categories={typedCategories} />
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
            {typedLatestNovels.map((novel: NovelSummary) => (
              <Link
                key={novel.slug}
                href={`/novels/${novel.slug}`}
                className="flex items-center justify-between gap-4 rounded-[8px] border border-rose-100 bg-white p-4 shadow-sm transition hover:border-[#d99aaa]"
              >
                <span>
                  <span className="block font-semibold text-[#281f2d]">{novel.title}</span>
                  <span className="mt-1 block text-sm text-[#7a6b76]">
                    {novel.chapterCount} chapters · {novel.tags.slice(0, 2).join(", ")}
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
