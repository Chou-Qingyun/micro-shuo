import type { Novel } from "@/lib/sample-data";

export type Topic = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
  intro: string[];
  categorySlugs?: string[];
  keywords: string[];
  faq?: {
    question: string;
    answer: string;
  }[];
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
    faq: [
      {
        question: "What are Chinese romance novels in English?",
        answer:
          "They are Chinese romance stories presented for English readers, often built around fast-moving serialized chapters, strong tropes, emotional conflict, and satisfying romantic payoff.",
      },
      {
        question: "Where should new readers start?",
        answer:
          "Start with a trope you already enjoy, such as CEO romance, rebirth romance, transmigration romance, billionaire love stories, or campus first love.",
      },
    ],
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
    faq: [
      {
        question: "What makes a CEO romance novel popular?",
        answer:
          "Readers often come for the power imbalance, city luxury, contract marriage tension, and the moment a controlled male lead becomes openly devoted.",
      },
      {
        question: "Are CEO romance novels the same as billionaire romance?",
        answer:
          "They overlap, but CEO romance focuses on workplace power, public image, and business-family pressure, while billionaire romance can include a wider range of wealthy-lead stories.",
      },
    ],
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
    faq: [
      {
        question: "What is a rebirth romance novel?",
        answer:
          "A rebirth romance gives a character a second chance after betrayal, regret, or tragedy, letting them protect themselves and choose love with clearer eyes.",
      },
      {
        question: "Why do readers like rebirth romance?",
        answer:
          "The appeal is emotional correction: bad choices can be fixed, villains can be exposed, and quiet devotion can finally be recognized.",
      },
    ],
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
    faq: [
      {
        question: "What is transmigration romance?",
        answer:
          "Transmigration romance follows a character who wakes in another world, body, or story role and has to survive the original plot while building a new relationship.",
      },
      {
        question: "Is transmigration romance usually fantasy or modern?",
        answer:
          "It can be either. Many stories use ancient courts, novel worlds, wealthy households, or modern alternate lives as the setting for a rewritten romance.",
      },
    ],
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
    faq: [
      {
        question: "What is a villainess romance novel?",
        answer:
          "A villainess romance centers a heroine who is labeled dangerous, doomed, or disliked, then lets her rewrite that role with intelligence, survival instinct, and unexpected tenderness.",
      },
      {
        question: "Why are villainess stories often linked to transmigration?",
        answer:
          "Transmigration makes the setup immediate: the heroine knows the original ending, understands her bad reputation, and has a reason to change the story before it destroys her.",
      },
    ],
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
    faq: [
      {
        question: "What is billionaire Chinese romance?",
        answer:
          "It is romance built around wealthy leads, powerful families, hidden identities, business pressure, and the private vulnerability behind public status.",
      },
      {
        question: "What tropes appear most often in billionaire Chinese romance?",
        answer:
          "Common tropes include contract marriage, protective CEOs, family opposition, secret heirs, fake relationships, and heroines who challenge a powerful lead's control.",
      },
    ],
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
