import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookMarked, List } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { BookmarkButton } from "@/components/bookmark-button";
import { CommentBox } from "@/components/comment-box";
import { ChapterListDialog } from "@/components/chapter-list-dialog";
import { JsonLd } from "@/components/json-ld";
import { ReadingProgressTracker } from "@/components/reading-progress-tracker";
import { getChapter } from "@/lib/repository";
import { chapterJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const result = await getChapter(slug, chapterSlug);

  if (!result) {
    return {};
  }

  const title = result.chapter.seoTitle || `${result.chapter.title} - ${result.novel.title}`;
  const description =
    result.chapter.seoDescription || result.novel.seoDescription || result.novel.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/novels/${result.novel.slug}/chapter/${result.chapter.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: [result.novel.coverUrl],
    },
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapterSlug } = await params;
  const result = await getChapter(slug, chapterSlug);

  if (!result) {
    notFound();
  }

  const { novel, chapter, previousChapter, nextChapter } = result;
  const canonicalPath = `/novels/${novel.slug}/chapter/${chapter.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={chapterJsonLd(novel, chapter, absoluteUrl(canonicalPath))} />
      <ReadingProgressTracker novelSlug={novel.slug} chapterSlug={chapter.slug} />
      <div className="grid gap-7 lg:grid-cols-[1fr_280px]">
        <article className="rounded-[8px] border border-rose-100 bg-white px-5 py-7 shadow-sm sm:px-8 lg:px-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-rose-50 pb-5">
            <Link
              href={`/novels/${novel.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b405e]"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to detail
            </Link>
            <BookmarkButton novelSlug={novel.slug} />
          </div>

          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              {novel.title}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#281f2d] sm:text-5xl">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="mt-3 text-sm text-[#7a6b76]">Published {chapter.publishedAt}</p>

            <div className="reader-content mt-9 text-[1.08rem] leading-9 text-[#352b37] sm:text-[1.16rem]">
              {chapter.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 border-y border-rose-50 py-5">
              <AdSlot label="Chapter End AdSense Slot" />
            </div>

            <nav className="mt-8 grid gap-3 sm:grid-cols-3">
              {previousChapter ? (
                <Link
                  href={`/novels/${novel.slug}/chapter/${previousChapter.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-rose-100 bg-white px-4 text-sm font-semibold text-[#281f2d] transition hover:border-[#d99aaa]"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <Link
                href={`/novels/${novel.slug}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#f8f1ee] px-4 text-sm font-semibold text-[#7a4c5a] transition hover:bg-[#f1e2dc]"
              >
                <List size={16} aria-hidden="true" />
                Chapters
              </Link>
              {nextChapter ? (
                <Link
                  href={`/novels/${novel.slug}/chapter/${nextChapter.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white transition hover:bg-[#81324c]"
                >
                  Next
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
            </nav>

            <div className="mt-8">
              <CommentBox novelSlug={novel.slug} chapterSlug={chapter.slug} />
            </div>
          </div>
        </article>

        <aside className="grid content-start gap-5">
          <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
            <BookMarked className="text-[#557463]" size={24} aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-[#281f2d]">
              Reading Mode
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6c5b68]">
              Clean page, calm spacing, and lightweight chapter navigation.
            </p>
          </div>
          <ChapterListDialog
            novelSlug={novel.slug}
            chapters={novel.chapters}
            currentChapterSlug={chapter.slug}
          />
          <AdSlot label="Reader Sidebar AdSense Slot" />
        </aside>
      </div>
    </div>
  );
}
