"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "lucide-react";

type ChapterItem = {
  slug: string;
  title: string;
  chapterNumber: number;
};

// 阅读页目录弹窗：展示当前小说全部章节，高亮当前章节并支持点击跳转到对应章节
export function ChapterListDialog({
  novelSlug,
  chapters,
  currentChapterSlug,
}: {
  novelSlug: string;
  chapters: ChapterItem[];
  currentChapterSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  // 移动端滚动时显示悬浮目录按钮，停止操作 5 秒后自动隐藏，再次滚动会重新显示
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleScroll() {
      setShowFab(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowFab(false), 5000);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm lg:sticky lg:top-1/2 lg:-translate-y-1/2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#f8f1ee] px-4 py-3 text-sm font-semibold text-[#7a4c5a] transition hover:bg-[#f1e2dc]"
        >
          <List size={18} aria-hidden="true" />
          Contents
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Contents"
        className={`fixed right-4 top-1/2 z-40 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-[#9b405e] text-white shadow-[0_10px_30px_rgba(75,43,58,0.3)] transition-opacity duration-300 lg:hidden ${
          showFab ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <List size={22} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_18px_50px_rgba(75,43,58,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4">
              <h2 className="font-serif text-xl font-semibold text-[#281f2d]">Contents</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[#7a6b76] transition hover:text-[#9b405e]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <ul className="grid gap-1 overflow-y-auto p-3">
              {chapters.map((chapter) => {
                const isCurrent = chapter.slug === currentChapterSlug;
                return (
                  <li key={chapter.slug}>
                    <Link
                      href={`/novels/${novelSlug}/chapter/${chapter.slug}`}
                      onClick={() => setOpen(false)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`block rounded-[8px] px-3 py-2 text-sm leading-6 transition ${
                        isCurrent
                          ? "bg-[#f8f1ee] font-semibold text-[#9b405e]"
                          : "text-[#3a303c] hover:bg-[#f8f1ee]"
                      }`}
                    >
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
