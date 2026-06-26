import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { BookmarkButton } from "@/components/bookmark-button";
import { CommentBox } from "@/components/comment-box";
import { JsonLd } from "@/components/json-ld";
import { SubscribeForm } from "@/components/subscribe-form";
import { getCategories, getNovelBySlug } from "@/lib/repository";
import { novelJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovelBySlug(slug);

  if (!novel) {
    return {};
  }

  const title = novel.seoTitle || novel.title;
  const description = novel.seoDescription || novel.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/novels/${novel.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "book",
      images: [novel.coverUrl],
    },
  };
}

export default async function NovelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [novel, categories] = await Promise.all([getNovelBySlug(slug), getCategories()]);

  if (!novel) {
    notFound();
  }

  const category = categories.find((item) => item.slug === novel.categorySlug);
  const firstChapter = novel.chapters[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={novelJsonLd(novel)} />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-rose-100 bg-white shadow-[0_24px_70px_rgba(75,43,58,0.14)]">
            <Image
              src={novel.coverUrl}
              alt={`${novel.title} cover`}
              fill
              priority
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mt-4 grid gap-3">
            {firstChapter ? (
              <Link
                href={`/novels/${novel.slug}/chapter/${firstChapter.slug}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#81324c]"
              >
                <BookOpen size={18} aria-hidden="true" />
                Read Now
              </Link>
            ) : (
              <span className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#f1e2dc] px-5 text-sm font-semibold text-[#7a4c5a]">
                <BookOpen size={18} aria-hidden="true" />
                No chapters yet
              </span>
            )}
            <BookmarkButton novelSlug={novel.slug} />
          </div>
        </aside>

        <section>
          <div className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {category ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="rounded-[8px] bg-[#eef5ef] px-3 py-1 text-xs font-semibold text-[#557463]"
                >
                  {category.name}
                </Link>
              ) : null}
              <span className="rounded-[8px] bg-[#f7eeea] px-3 py-1 text-xs font-semibold text-[#9b405e]">
                {novel.status}
              </span>
            </div>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight text-[#281f2d]">
              {novel.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-[#7a6b76]">By {novel.author}</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f515f]">{novel.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {novel.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 py-1.5 text-xs font-semibold text-[#7a4c5a]"
                >
                  <Sparkles size={13} aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 border-t border-rose-50 pt-5 text-sm text-[#6c5b68] sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <BookOpen size={16} aria-hidden="true" />
                {novel.chapters.length} chapters
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                Updated {novel.updatedAt}
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={16} aria-hidden="true" />
                Comments open
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-3xl font-semibold text-[#281f2d]">Chapters</h2>
              <div className="mt-4 divide-y divide-rose-50">
                {novel.chapters.length === 0 ? (
                  <p className="py-4 text-sm text-[#7a6b76]">No chapters published yet.</p>
                ) : (
                  novel.chapters.map((chapter) => (
                    <Link
                      key={chapter.slug}
                      href={`/novels/${novel.slug}/chapter/${chapter.slug}`}
                      className="flex items-center justify-between gap-4 py-4 text-sm transition hover:text-[#9b405e]"
                    >
                      <span>
                        <span className="block font-semibold text-[#281f2d]">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </span>
                        <span className="mt-1 block text-[#7a6b76]">{chapter.publishedAt}</span>
                      </span>
                      <ChevronRight size={17} aria-hidden="true" />
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="grid content-start gap-5">
              <AdSlot label="Sidebar AdSense Slot" />
              <div className="rounded-[8px] border border-rose-100 bg-[#f8f1ee] p-5">
                <h2 className="font-serif text-2xl font-semibold text-[#281f2d]">Update alerts</h2>
                <p className="mt-2 text-sm leading-6 text-[#6c5b68]">Follow this title when new chapters arrive.</p>
                <div className="mt-4">
                  <SubscribeForm source={`novel:${novel.slug}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <CommentBox novelSlug={novel.slug} />
          </div>
        </section>
      </div>
    </div>
  );
}
