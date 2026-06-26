"use client";

import { ChangeEvent, useState } from "react";
import { ImagePlus } from "lucide-react";

const MAX_COVER_SIZE = 5 * 1024 * 1024;

// 小说封面上传组件：支持本地选图上传到 Supabase Storage 的 covers bucket，
// 也支持手动粘贴图片 URL，并实时预览；最终值始终写入隐藏的 coverUrl 字段提交。
export function CoverUpload({ defaultValue = "" }: { defaultValue?: string }) {
  const [coverUrl, setCoverUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_COVER_SIZE) {
      event.target.value = "";
      setError("封面图片需小于 5MB。");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/covers", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json().catch(() => null)) as
      | { url?: string; message?: string }
      | null;

    setUploading(false);
    event.target.value = "";

    if (!response.ok || !result?.url) {
      setError(result?.message ?? "上传失败，请重试。");
      return;
    }

    setCoverUrl(result.url);
  }

  return (
    <div className="grid gap-2 text-sm font-semibold text-[#3a303c]">
      封面图片
      <div className="flex flex-wrap items-start gap-4">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="封面预览"
            className="h-36 w-28 shrink-0 rounded-[8px] border border-rose-100 object-cover"
          />
        ) : (
          <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-[8px] border border-dashed border-rose-200 bg-[#fffaf8] text-xs font-normal text-[#b89aa4]">
            暂无封面
          </div>
        )}

        <div className="grid flex-1 gap-3">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-4 py-2 text-sm font-semibold text-[#9b405e] transition hover:bg-[#f8f1ee]">
            <ImagePlus size={16} aria-hidden="true" />
            {uploading ? "上传中..." : "上传封面图片"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <input
            name="coverUrl"
            type="url"
            required
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder="或直接粘贴图片 URL"
            className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
          />

          {error ? (
            <p className="text-sm font-normal text-[#c0392b]">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
