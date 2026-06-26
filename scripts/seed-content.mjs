import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { readFile } from "node:fs/promises";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const categories = [
  {
    name: "CEO Romance",
    slug: "ceo-romance",
    description:
      "Powerful CEOs, tender confessions, Cinderella turns, and slow-burn protection.",
    tone: "Velvet city nights, contract marriage sparks, and soft luxury healing.",
  },
  {
    name: "Transmigration Sweet Romance",
    slug: "transmigration-sweet-romance",
    description:
      "Modern heroines step into another life and rewrite fate with wit and sweetness.",
    tone: "Fate-reset stories with bright humor, courtly tension, and a warm ending.",
  },
  {
    name: "Rebirth Sweet Romance",
    slug: "rebirth-sweet-romance",
    description:
      "A second chance to love better, choose bravely, and turn regret into tenderness.",
    tone: "Revenge lightly held, devotion deeply felt, and every chapter a reset.",
  },
  {
    name: "Campus Sweet Romance",
    slug: "campus-sweet-romance",
    description:
      "Youthful crushes, study notes, rainy walks, and the first heartbeat of love.",
    tone: "Clean, soft, youthful romance for readers who love gentle emotional payoff.",
  },
];

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toStatus(status) {
  return status === "Completed" ? "COMPLETED" : "ONGOING";
}

function dateFrom(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : new Date();
}

async function readLocalNovels() {
  const content = await readFile("data/novels.json", "utf8");
  return JSON.parse(content);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Please configure .env.local first.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const localNovels = await readLocalNovels();

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        tone: category.tone,
      },
      create: category,
    });
  }

  for (const localNovel of localNovels) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: localNovel.categorySlug },
    });

    const novel = await prisma.novel.upsert({
      where: { slug: localNovel.slug },
      update: {
        title: localNovel.title,
        author: localNovel.author,
        excerpt: localNovel.excerpt,
        description: localNovel.description,
        coverUrl: localNovel.coverUrl,
        status: toStatus(localNovel.status),
        categoryId: category.id,
      },
      create: {
        title: localNovel.title,
        slug: localNovel.slug,
        author: localNovel.author,
        excerpt: localNovel.excerpt,
        description: localNovel.description,
        coverUrl: localNovel.coverUrl,
        status: toStatus(localNovel.status),
        categoryId: category.id,
        publishedAt: dateFrom(localNovel.updatedAt),
      },
    });

    await prisma.novelTag.deleteMany({
      where: { novelId: novel.id },
    });

    for (const tagName of localNovel.tags || []) {
      const tagSlug = slugify(tagName);

      if (!tagSlug) continue;

      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: { name: tagName },
        create: { name: tagName, slug: tagSlug },
      });

      await prisma.novelTag.create({
        data: {
          novelId: novel.id,
          tagId: tag.id,
        },
      });
    }

    await prisma.chapter.deleteMany({
      where: { novelId: novel.id },
    });

    for (const localChapter of localNovel.chapters || []) {
      const paragraphs = Array.isArray(localChapter.content)
        ? localChapter.content
        : String(localChapter.content || "")
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
      const content = paragraphs.join("\n\n");

      await prisma.chapter.create({
        data: {
          novelId: novel.id,
          title: localChapter.title,
          slug: localChapter.slug,
          chapterNumber: localChapter.chapterNumber,
          publishedAt: dateFrom(localChapter.publishedAt),
          content,
          wordCount: content.split(/\s+/).filter(Boolean).length,
        },
      });
    }
  }

  console.log(`Seeded ${categories.length} categories and ${localNovels.length} novels.`);
} finally {
  await prisma.$disconnect();
}
