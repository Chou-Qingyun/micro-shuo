import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { NovelCard } from "@/components/novel-card";
import { getNovels } from "@/lib/repository";
import { getTopicBySlug, getTopicNovels, topics } from "@/lib/topics";
import type { Novel } from "@/lib/sample-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return {};
  }

  return {
    title: topic.title,
    description: topic.description,
    alternates: {
      canonical: `/topics/${topic.slug}`,
    },
    openGraph: {
      title: topic.title,
      description: topic.description,
      type: "website",
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const novels = (await getNovels()) as Novel[];
  const topicNovels = getTopicNovels(topic, novels);
  const fallbackNovels = topicNovels.length > 0 ? topicNovels : novels.slice(0, 4);
  const relatedTopics = topics.filter((item) => item.slug !== topic.slug).slice(0, 4);
  const faqJsonLd = topic.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: topic.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
            <Sparkles size={16} aria-hidden="true" />
            {topic.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-[#281f2d] sm:text-6xl">
            {topic.title}
          </h1>
          <div className="mt-6 grid gap-4 text-lg leading-8 text-[#5f515f]">
            {topic.intro.map((paragraph: string) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <BookOpen className="text-[#557463]" size={24} aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl font-semibold text-[#281f2d]">
            Browse by mood
          </h2>
          <div className="mt-4 grid gap-2">
            {relatedTopics.map((item) => (
              <Link
                key={item.slug}
                href={`/topics/${item.slug}`}
                className="inline-flex items-center justify-between gap-3 rounded-[8px] bg-[#fffaf8] px-3 py-2 text-sm font-semibold text-[#5f515f] transition hover:bg-[#f8f1ee] hover:text-[#9b405e]"
              >
                {item.title}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-12">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              Matched stories
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              Start with these titles
            </h2>
          </div>
          <Link href="/search" className="hidden text-sm font-semibold text-[#9b405e] sm:inline-flex">
            Search all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fallbackNovels.map((novel: Novel, index: number) => (
            <NovelCard key={novel.slug} novel={novel} priority={index < 2} />
          ))}
        </div>
      </section>

      {topic.faq?.length ? (
        <section className="mt-12 border-t border-rose-100 pt-10">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              Reader questions
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              What to know before you start
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {topic.faq.map((item) => (
              <div key={item.question} className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold leading-7 text-[#281f2d]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6c5b68]">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
