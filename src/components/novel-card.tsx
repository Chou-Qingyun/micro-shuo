import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock3, Sparkles } from "lucide-react";
import type { Novel } from "@/lib/sample-data";

export function NovelCard({ novel, priority = false }: { novel: Novel; priority?: boolean }) {
  return (
    <article className="grid overflow-hidden rounded-[8px] border border-rose-100 bg-white shadow-[0_18px_50px_rgba(75,43,58,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(75,43,58,0.13)]">
      <Link href={`/novels/${novel.slug}`} className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={novel.coverUrl}
          alt={`${novel.title} cover`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-[8px] bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#9b405e] shadow-sm">
          {novel.status}
        </span>
      </Link>
      <div className="grid gap-4 p-4">
        <div>
          <Link
            href={`/novels/${novel.slug}`}
            className="line-clamp-2 text-lg font-semibold leading-snug text-[#281f2d] hover:text-[#9b405e]"
          >
            {novel.title}
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6c5b68]">
            {novel.excerpt}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {novel.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-[8px] bg-[#f7eeea] px-2 py-1 text-xs font-medium text-[#7a4c5a]"
            >
              <Sparkles size={12} aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-rose-50 pt-3 text-xs font-medium text-[#7a6b76]">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={14} aria-hidden="true" />
            {novel.chapters.length} chapters
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            {novel.updatedAt}
          </span>
        </div>
      </div>
    </article>
  );
}

