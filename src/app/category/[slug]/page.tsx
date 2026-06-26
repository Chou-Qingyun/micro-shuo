import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NovelCard } from "@/components/novel-card";
import { getCategoryBySlug, getNovelsByCategory } from "@/lib/repository";
import type { Novel } from "@/lib/sample-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, novels] = await Promise.all([
    getCategoryBySlug(slug),
    getNovelsByCategory(slug),
  ]);

  if (!category) {
    notFound();
  }
  const typedNovels = novels as Novel[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Category
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold text-[#281f2d]">
          {category.name}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f515f]">{category.tone}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {typedNovels.map((novel: Novel) => (
          <NovelCard key={novel.slug} novel={novel} />
        ))}
      </div>
    </div>
  );
}
