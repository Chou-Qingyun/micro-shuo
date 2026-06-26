import type { Category, Novel } from "@/lib/sample-data";
import { CoverUpload } from "@/components/admin/cover-upload";

const defaultCover =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80";

export function NovelForm({
  categories,
  novel,
  action,
  submitLabel,
}: {
  categories: Category[];
  novel?: Novel;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          小说标题
          <input
            name="title"
            required
            defaultValue={novel?.title}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          URL Slug
          <input
            name="slug"
            placeholder="when-the-ceo-chose-her"
            defaultValue={novel?.slug}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          作者
          <input
            name="author"
            required
            defaultValue={novel?.author}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          分类
          <select
            name="categorySlug"
            required
            defaultValue={novel?.categorySlug ?? categories[0]?.slug}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          连载状态
          <select
            name="status"
            defaultValue={novel?.status ?? "Ongoing"}
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          >
            <option value="Ongoing">连载中</option>
            <option value="Completed">已完结</option>
          </select>
        </label>
      </div>

      <CoverUpload defaultValue={novel?.coverUrl ?? defaultCover} />

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        标签，英文逗号分隔
        <input
          name="tags"
          placeholder="Billionaire, Cinderella, Contract Marriage"
          defaultValue={novel?.tags.join(", ")}
          className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        短简介
        <textarea
          name="excerpt"
          required
          rows={3}
          defaultValue={novel?.excerpt}
          className="rounded-[8px] border border-rose-100 bg-[#fffaf8] p-3 font-normal leading-6 outline-none focus:border-[#c46b84]"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        详情简介
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={novel?.description}
          className="rounded-[8px] border border-rose-100 bg-[#fffaf8] p-3 font-normal leading-6 outline-none focus:border-[#c46b84]"
        />
      </label>

      <section className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4">
        <div>
          <h2 className="text-base font-semibold text-[#281f2d]">小说 SEO 设置</h2>
          <p className="mt-1 text-sm font-normal text-[#7a6b76]">
            留空时前台会自动使用小说标题和短简介。
          </p>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          SEO Title
          <input
            name="seoTitle"
            placeholder="When the CEO Chose Her - Sweet CEO Romance Novel"
            defaultValue={novel?.seoTitle ?? ""}
            className="h-11 rounded-[8px] border border-rose-100 bg-white px-3 font-normal outline-none focus:border-[#c46b84]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
          SEO Description
          <textarea
            name="seoDescription"
            rows={3}
            placeholder="Read a sweet CEO romance novel about contract marriage, Cinderella love, and slow-burn devotion."
            defaultValue={novel?.seoDescription ?? ""}
            className="rounded-[8px] border border-rose-100 bg-white p-3 font-normal leading-6 outline-none focus:border-[#c46b84]"
          />
        </label>
      </section>

      <label className="grid max-w-xs gap-2 text-sm font-semibold text-[#3a303c]">
        更新时间
        <input
          name="updatedAt"
          type="date"
          defaultValue={novel?.updatedAt ?? new Date().toISOString().slice(0, 10)}
          className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
        />
      </label>

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
