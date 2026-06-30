"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Category, Novel } from "@/lib/sample-data";

const PAGE_SIZE = 9;

function chunkNovels(novels: Novel[]) {
  const pages: Novel[][] = [];

  for (let index = 0; index < novels.length; index += PAGE_SIZE) {
    pages.push(novels.slice(index, index + PAGE_SIZE));
  }

  return pages;
}

export function FeaturedNovelCarousel({
  novels,
  categories,
}: {
  novels: Novel[];
  categories: Category[];
}) {
  const pages = useMemo(() => chunkNovels(novels), [novels]);
  const [pageIndex, setPageIndex] = useState(0);
  const canSlide = pages.length > 1;

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setPageIndex((current) => (current + 1) % pages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [canSlide, pages.length]);

  function getCategoryName(slug: string) {
    return categories.find((category) => category.slug === slug)?.name ?? slug;
  }

  function goPrevious() {
    if (!canSlide) return;
    setPageIndex((current) => (current - 1 + pages.length) % pages.length);
  }

  function goNext() {
    if (!canSlide) return;
    setPageIndex((current) => (current + 1) % pages.length);
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[8px] bg-white px-4 py-6 shadow-[0_18px_50px_rgba(75,43,58,0.08)]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${pageIndex * 100}%)` }}
        >
          {pages.map((page, currentPageIndex) => (
            <div
              key={currentPageIndex}
              className="grid min-w-full gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {page.map((novel, itemIndex) => {
                const rank = currentPageIndex * PAGE_SIZE + itemIndex + 1;

                return (
                  <Link
                    key={novel.slug}
                    href={`/novels/${novel.slug}`}
                    className="grid grid-cols-[2rem_1fr_4.5rem] items-start gap-3 rounded-[8px] p-2 transition hover:bg-[#fffaf8]"
                  >
                    <span className="pt-1 text-right text-lg font-medium text-[#aaa0a8]">
                      {rank}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-base font-semibold leading-6 text-[#281f2d]">
                        {novel.title}
                      </span>
                      <span className="mt-2 block truncate text-sm text-[#9b8f99]">
                        {getCategoryName(novel.categorySlug)}
                      </span>
                    </span>
                    <span className="relative block aspect-3/4 overflow-hidden rounded-[6px] bg-[#f8f1ee] shadow-sm">
                      <Image
                        src={novel.coverUrl}
                        alt={`${novel.title} cover`}
                        fill
                        sizes="72px"
                        priority={rank <= 3}
                        className="object-cover"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {canSlide ? (
        <>
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous novels"
            className="absolute left-0 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#7a6b76] shadow-[0_14px_35px_rgba(75,43,58,0.14)] transition hover:text-[#9b405e]"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next novels"
            className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-white text-[#7a6b76] shadow-[0_14px_35px_rgba(75,43,58,0.14)] transition hover:text-[#9b405e]"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <div className="mt-5 flex justify-center gap-3">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPageIndex(index)}
                aria-label={`Show page ${index + 1}`}
                className={`h-1.5 w-8 rounded-full transition ${
                  index === pageIndex ? "bg-[#d57956]" : "bg-[#e7dfdb]"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
