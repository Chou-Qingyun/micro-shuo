import type { Metadata } from "next";
import { createNovelAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { NovelForm } from "@/components/admin/novel-form";
import { getCategories } from "@/lib/repository";

export const metadata: Metadata = {
  title: "新增小说",
};

export const dynamic = "force-dynamic";

export default async function NewNovelPage() {
  const categories = await getCategories();

  return (
    <AdminShell title="新增小说" description="创建一本文学作品的基础信息，保存后可继续添加章节。">
      <NovelForm categories={categories} action={createNovelAction} submitLabel="保存小说" />
    </AdminShell>
  );
}
