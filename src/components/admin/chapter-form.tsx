import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { contentToHtml } from "@/lib/rich-content";
import type { Chapter } from "@/lib/sample-data";

export function ChapterForm({
  action,
  nextChapterNumber,
  chapter,
  submitLabel = "保存章节",
}: {
  action: (formData: FormData) => void | Promise<void>;
  nextChapterNumber: number;
  chapter?: Chapter;
  submitLabel?: string;
}) {
  const contentHtml = contentToHtml(chapter?.contentHtml ?? chapter?.content ?? []);

  return (
    <form action={action} className="grid gap-5 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[140px_1fr]">
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          章节序号
          <input
            name="chapterNumber"
            type="number"
            min={1}
            required
            defaultValue={chapter?.chapterNumber ?? nextChapterNumber}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          章节标题
          <input
            name="title"
            required
            defaultValue={chapter?.title}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        章节 Slug
        <input
          name="slug"
          placeholder="chapter-1-a-bouquet-for-the-penthouse"
          defaultValue={chapter?.slug}
          className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
        />
      </label>

      <label className="grid max-w-xs gap-2 text-sm font-semibold text-[#3a303c]">
        发布时间
        <input
          name="publishedAt"
          type="date"
          defaultValue={chapter?.publishedAt ?? new Date().toISOString().slice(0, 10)}
          className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
        />
      </label>

      <RichTextEditor name="content" label="章节正文" initialValue={contentHtml} />

      <section className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4">
        <div>
          <h2 className="text-base font-semibold text-[#281f2d]">章节 SEO 设置</h2>
          <p className="mt-1 text-sm font-normal text-[#7a6b76]">
            留空时前台会自动使用章节标题、小说标题和小说短简介。
          </p>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          SEO Title
          <input
            name="seoTitle"
            placeholder="Chapter 1: A Bouquet for the Penthouse - When the CEO Chose Her"
            defaultValue={chapter?.seoTitle ?? ""}
            className="h-11 rounded-[8px] border border-rose-100 bg-white px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          SEO Description
          <textarea
            name="seoDescription"
            rows={3}
            placeholder="Read this chapter of a sweet CEO romance story with contract marriage tension and Cinderella love."
            defaultValue={chapter?.seoDescription ?? ""}
            className="rounded-[8px] border border-rose-100 bg-white p-3 font-normal leading-6 outline-none focus:border-[#c46b84]"
          />
        </label>
      </section>

      <div className="border-t border-rose-50 pt-5">
        <button
          type="submit"
          className="h-11 rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white transition hover:bg-[#81324c]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
