import type { Novel } from "@/lib/sample-data";

export type Topic = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
  intro: string[];
  categorySlugs?: string[];
  keywords: string[];
};

export const topics: Topic[] = [
  {
    title: "Chinese Romance Novels in English",
    slug: "chinese-romance-novels-in-english",
    eyebrow: "Start here",
    description:
      "Read Chinese romance novels in English, from CEO love stories and rebirth revenge to transmigration sweetness and campus first love.",
    intro: [
      "Chinese romance novels in English bring together fast emotional payoff, trope-rich setups, and serialized chapters that are easy to follow night after night.",
      "This collection is built for readers who want clean navigation, sweet tension, devoted leads, and stories that move quickly from first spark to deeply satisfying attachment.",
    ],
    keywords: ["chinese", "romance", "sweet", "ceo", "rebirth", "transmigration", "campus"],
  },
  {
    title: "CEO Romance Novels",
    slug: "ceo-romance-novels",
    eyebrow: "Power love",
    description:
      "Browse CEO romance novels with billionaire leads, contract marriage tension, soft luxury, devoted protection, and Cinderella turns.",
    intro: [
      "CEO romance is for readers who like high stakes wrapped in polished city nights: powerful men, sharp heroines, public pressure, private tenderness, and the delicious moment when control turns into devotion.",
      "Expect billionaire romance, contract marriage sparks, bodyguard tension, wealthy-family drama, and heroines who are not as easy to buy, break, or forget as the world assumes.",
    ],
    categorySlugs: ["ceo-romance"],
    keywords: ["ceo", "billionaire", "contract", "marriage", "wealthy", "bodyguard", "urban"],
  },
  {
    title: "Rebirth Romance Novels",
    slug: "rebirth-romance-novels",
    eyebrow: "Second chances",
    description:
      "Find rebirth romance novels with second chances, sweet revenge, devoted husbands, family drama, and emotionally satisfying resets.",
    intro: [
      "Rebirth romance gives the heroine what readers always want after a betrayal: memory, timing, and one more chance to choose better.",
      "These stories lean into sweet revenge, face-slapping family drama, protective love interests, and the comfort of watching regret turn into agency and affection.",
    ],
    categorySlugs: ["rebirth-sweet-romance"],
    keywords: ["rebirth", "reborn", "second chance", "revenge", "face-slapping", "reset"],
  },
  {
    title: "Transmigration Romance Novels",
    slug: "transmigration-romance-novels",
    eyebrow: "New world",
    description:
      "Read transmigration romance novels where modern heroines enter new worlds, dodge bad endings, and rewrite the plot with wit and sweetness.",
    intro: [
      "Transmigration romance is playful, dramatic, and instantly readable: a heroine wakes in a new role, knows just enough to panic, and starts bending the plot before the plot can ruin her.",
      "This shelf favors clever survival, villain dynamics, courtly or wealthy-household pressure, and warm romance that grows while everyone else is still following the old script.",
    ],
    categorySlugs: ["transmigration-sweet-romance"],
    keywords: ["transmigration", "villain", "novel", "plot", "survival", "ancient"],
  },
  {
    title: "Villainess Romance Novels",
    slug: "villainess-romance-novels",
    eyebrow: "Soft chaos",
    description:
      "Explore villainess romance novels with misunderstood heroines, dangerous male leads, comic survival, and sweet plot-twisting affection.",
    intro: [
      "Villainess romance turns the so-called bad role into the most interesting person in the room. The heroine may inherit a terrible reputation, but she also gets the sharpest choices.",
      "Look here for transmigration setups, fake cruelty, dangerous devotion, palace or family scheming, and the slow reveal that the villainess might be the only honest heart left.",
    ],
    keywords: ["villainess", "villain", "psycho", "dangerous", "transmigration", "scheming"],
  },
  {
    title: "Billionaire Chinese Romance",
    slug: "billionaire-chinese-romance",
    eyebrow: "Soft luxury",
    description:
      "Billionaire Chinese romance novels with powerful families, alpha leads, contract love, hidden identities, and protective devotion.",
    intro: [
      "Billionaire Chinese romance is less about money alone and more about pressure: family power, reputation, secrets, business alliances, and the one person who becomes worth risking all of it.",
      "These stories are a good fit if you like alpha leads, hidden identities, contract love, bodyguard loyalty, and heroines who force powerful men to become emotionally honest.",
    ],
    categorySlugs: ["ceo-romance", "rebirth-sweet-romance"],
    keywords: ["billionaire", "alpha", "wealthy", "ceo", "contract", "hidden", "powerful"],
  },
];

export function getTopicBySlug(slug: string) {
  return topics.find((topic: Topic) => topic.slug === slug);
}

export function getTopicNovels(topic: Topic, novels: Novel[]) {
  const normalizedKeywords = topic.keywords.map((keyword: string) => keyword.toLowerCase());

  return novels.filter((novel: Novel) => {
    const matchesCategory = topic.categorySlugs?.includes(novel.categorySlug) ?? false;
    const searchableText = [
      novel.title,
      novel.excerpt,
      novel.description,
      novel.categorySlug,
      ...novel.tags,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesCategory ||
      normalizedKeywords.some((keyword: string) => searchableText.includes(keyword))
    );
  });
}
