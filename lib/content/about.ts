/**
 * About Us content — the brand's story, mission, beliefs, awards and
 * community impact. Sourced from the legacy All Naturals Cosmetics site
 * (about_anc, making-a-difference) and the founders' public record, then
 * written in the warm Sun & Soil voice.
 *
 * One typed source of truth so every About subpage, the hub, the sub-nav
 * and the tests all read from the same place.
 */

import type { AccentDecor } from "@/components/motion/AccentCorners";

/** A single About-section entry — powers the sub-nav, hub cards and carousel. */
export interface AboutSection {
  /** URL slug under /about */
  slug: string;
  /** Nav + card label */
  label: string;
  /** One-line teaser used on hub cards / carousel */
  teaser: string;
  /** Botanical motif used to dress the card */
  decor: AccentDecor;
  /** Header scenery image (optional — falls back to staged header) */
  image?: string;
}

/**
 * The About Us sub-menu, in display order. `/about` is the hub; each of these
 * is a subpage. Order is intentional — story first, impact last.
 */
export const ABOUT_SECTIONS: AboutSection[] = [
  {
    slug: "our-story",
    label: "Our story",
    teaser: "From a Barrie salon to Canada's shelves — a family, a shea tree, and a promise.",
    decor: "shea",
    image: "/headers/our-story.webp",
  },
  {
    slug: "our-mission",
    label: "Our mission",
    teaser: "Keep providing green, plant-based ingredients that perform — nothing stripped.",
    decor: "argan",
  },
  {
    slug: "our-beliefs",
    label: "Our beliefs",
    teaser: "The trees of the nation are for the healing of the nation. Six things we stand by.",
    decor: "castor",
  },
  {
    slug: "awards",
    label: "Awards",
    teaser: "National honours for our founder and our first-of-its-kind Canadian brand.",
    decor: "shea",
  },
  {
    slug: "our-ingredients",
    label: "Our ingredients",
    teaser: "Every botanical we build on, with its INCI name — searchable, in plain language.",
    decor: "argan",
  },
  {
    slug: "making-a-difference",
    label: "Making a difference",
    teaser: "Ethical sourcing and giving back to the women who make our shea butter.",
    decor: "castor",
  },
];

/** Look up a section by slug (used by subpage cross-nav). */
export function getAboutSection(slug: string): AboutSection | undefined {
  return ABOUT_SECTIONS.find((s) => s.slug === slug);
}

// ── Our story ────────────────────────────────────────────────────────────────

export const STORY = {
  eyebrow: "Our story",
  title: "Heritage you can feel on your skin.",
  lede:
    "For over two decades we've made small-batch skincare the old way — pure, cold-pressed oils, shea and black soap — sourced fairly from West Africa and blended by hand in Barrie, Ontario.",
  paragraphs: [
    "Between 2000 and 2002, clients of a small African beauty-supply store and salon kept asking for the same thing: a natural alternative to processed skincare — something wholesome that would actually nourish the skin. The answer was already growing half a world away.",
    "So in 2002, Lanre and her husband, Elder Timothy Tunji-Ajayi, travelled to their birth country of Nigeria and brought pure, unrefined shea butter into the Canadian market — founding All Naturals Cosmetics Inc. Their 100% Pure Shea Butter became the first unrefined shea butter sold in the Canadian mass market, and the brand became the first and only Black Canadian-owned product line stocked nationally by Walmart, Shoppers Drug Mart and health-food stores across the country.",
    "More than twenty years on, the promise hasn't changed. Every jar still starts with raw shea nuts and botanical oils, sourced directly from the women-run cooperatives that have harvested them for generations. From there the butters and oils are cold-pressed, blended and small-batch finished by hand — here in Barrie, Ontario, by the family that started it.",
    "We treat every formula like it's going on our own family's skin, because it is. No shortcuts, no shelf-life chemistry — just the land's best, distilled into products that work.",
  ],
  values: [
    { label: "Fairly sourced", detail: "Raw shea and botanical oils bought directly from women-run West-African cooperatives." },
    { label: "Made by hand", detail: "Cold-pressed and small-batch blended in Barrie, Ontario." },
    { label: "Nothing hidden", detail: "No parabens, sulphates, mineral oils or synthetic fragrance — ever." },
  ],
} as const;

// ── Our mission ──────────────────────────────────────────────────────────────

export const MISSION = {
  eyebrow: "Our mission",
  title: "Green ingredients, honestly made.",
  statement:
    "Our mission is to keep using and providing green ingredients to our customers. It reflects our commitment to high-performing, plant-based products.",
  points: [
    {
      label: "Plant-based & proven",
      detail:
        "We employ sustainable, natural and organic ingredients — chosen because they perform, not just because they're clean.",
    },
    {
      label: "Raw materials, too",
      detail:
        "We also supply select raw materials so you can create your own products, at a standard equal or similar to the finished goods from our plant.",
    },
    {
      label: "At peace with nature",
      detail:
        "We believe natural, clean beauty is the best beauty — and that your body should be at peace with nature.",
    },
  ],
} as const;

// ── Our beliefs ──────────────────────────────────────────────────────────────

export const BELIEFS = {
  eyebrow: "Our beliefs",
  title: "The trees of the nation are for the healing of the nation.",
  intro:
    "With that belief, in 2002 the founders of All Naturals Cosmetics Inc. began seeking natural skin-care ingredients from the tropical rainforest to blend into their total body-care products. We believe the microscopic actions of single individuals have the power to change how humanity treats Mother Earth — and we aim to steer society in a more earth-friendly direction, for our benefit and for generations to come.",
  items: [
    "We believe that our planet is strong yet delicate.",
    "We believe that we must do our part in preserving it for future generations.",
    "We believe in promoting the welfare and health of our consumers by providing them with more natural products for their daily use.",
    "We believe in what we do and stand by it.",
    "We believe that what you put in your mouth or on your skin is very important.",
    "We believe we serve our fellow human beings by providing them with high-quality, natural and holistic products.",
  ],
} as const;

// ── Awards & recognition ─────────────────────────────────────────────────────

export interface Award {
  title: string;
  detail: string;
  /** Recipient — the brand, or founder Lanre Tunji-Ajayi */
  who: string;
}

export const AWARDS = {
  eyebrow: "Awards & recognition",
  title: "Honoured at home and nationally.",
  intro:
    "Our founder and CEO, Lanre Tunji-Ajayi, has been recognised across Canada for business excellence, community development and philanthropy — and the brand itself broke new ground as the first Black Canadian-owned product line sold nationally in the mass market.",
  awards: [
    {
      title: "Meritorious Service Medal (MSM)",
      detail: "Awarded by the Governor General of Canada for a remarkable contribution to the country.",
      who: "Lanre Tunji-Ajayi",
    },
    {
      title: "Senate of Canada 150 Award",
      detail: "Recognising outstanding service and contribution to the community.",
      who: "Lanre Tunji-Ajayi",
    },
    {
      title: "100 Accomplished Black Canadian Women",
      detail: "Named among Canada's 100 Accomplished Black Canadian (ABC) Women, 2018.",
      who: "Lanre Tunji-Ajayi",
    },
    {
      title: "African Canadian Achievement Award",
      detail: "For excellence in business.",
      who: "Lanre Tunji-Ajayi",
    },
    {
      title: "Planet Africa Visionary Award of Excellence",
      detail: "Honouring visionary leadership and impact.",
      who: "Lanre Tunji-Ajayi",
    },
    {
      title: "Community Development & Philanthropy Award",
      detail: "For sustained investment in community and giving back.",
      who: "Lanre Tunji-Ajayi",
    },
  ] satisfies Award[],
  brandMilestone:
    "First and only Black Canadian-owned product line to be sold nationally in Walmart, Shoppers Drug Mart and Canadian health-food stores.",
} as const;

// ── Making a difference ──────────────────────────────────────────────────────

export const MAKING_A_DIFFERENCE = {
  eyebrow: "Making a difference",
  title: "The people behind every jar.",
  lede:
    "We believe corporations must support the communities they draw from. Our shea butter is sustainably and ethically sourced from women-run cooperatives in West Africa — and we invest back into the hands that make it.",
  initiatives: [
    {
      title: "A machine for the women of Fufu",
      when: "January 2024",
      detail:
        "We donated a shea-butter cracker and separator machine to the women of the Fufu community in Nigeria — easing the hardest, most labour-intensive steps behind every batch of butter, and helping the cooperative produce more, with less strain.",
    },
    {
      title: "Ethical, women-run sourcing",
      when: "Since 2002",
      detail:
        "Our 100% Pure Shea Butter is unrefined, unbleached and organic — sourced directly from the women-run shea industry in Apaola, Nigeria, with Ghana added as a second origin. Buying direct keeps more value in the communities that harvest it.",
    },
    {
      title: "Clean, honest and inclusive",
      when: "Always",
      detail:
        "We use clean, natural, vegan, Halal and Kosher ingredients — and we're transparent about how we use them. Our commitment is simple: to keep your body at peace with nature.",
    },
  ],
} as const;
