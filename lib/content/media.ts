/**
 * Media & press content — sourced from the brand's real legacy media page.
 * Heritage films live on the All Naturals YouTube channel.
 */

export interface MediaVideo {
  /** YouTube video id */
  id: string;
  title: string;
  /** small meta line (place · year) */
  meta: string;
  blurb: string;
}

export const MEDIA_VIDEOS: MediaVideo[] = [
  {
    id: "VNx53oWYJ5Y",
    title: "The shea butter making process",
    meta: "Fufu, Nigeria · 2022",
    blurb:
      "From raw nut to golden butter — the traditional craft, filmed at the source where it has been practised for generations.",
  },
  {
    id: "667SMvZMi8A",
    title: "Giving back to the Fufu community",
    meta: "January 2024",
    blurb:
      "Donating a shea-butter cracker and separator machine to the women of the Fufu community — easing the work behind every jar.",
  },
  {
    id: "GhmZ0n026fs",
    title: "Beautiful skin, yours naturally",
    meta: "Whole Life Expo · 2015",
    blurb:
      "Sharing our philosophy of pure, botanical skincare — the way nature intended, with nothing stripped away.",
  },
];

export const YT_CHANNEL = "https://www.youtube.com/channel/UC1aT0ORc_29IknBKscpqT7A";

export interface PressItem {
  outlet: string;
  title: string;
  meta: string;
}

export const PRESS: PressItem[] = [
  {
    outlet: "ALIVE Magazine",
    title: "Topical Butter",
    meta: "Print feature",
  },
];

/** A long-form article from the company, preserved from the legacy media page. */
export interface Article {
  title: string;
  byline: string;
  dek: string;
  paragraphs: string[];
}

export const ARTICLE: Article = {
  title: "Cosmetics or Cosmeceuticals?",
  byline: "Lanre Tunji-Ajayi · VP, All Naturals Cosmetics Inc.",
  dek: "On the difference between cosmetics and “cosmeceuticals,” what the label really means, and why it matters for brands and consumers alike.",
  paragraphs: [
    "Many store owners and consumers are confused by the term “cosmeceuticals,” which refers to the combination of cosmetics and pharmaceuticals. These products have active ingredients purporting to have medical or drug-like benefits that go beyond traditional personal care products.",
    "Because the “cosmeceutical” label applies to topical products such as creams, lotions and ointments — and because there are no requirements by the Food and Drug Administration (FDA) to prove that cosmeceutical products live up to their claims — many use the term interchangeably with cosmetics.",
    "As a matter of fact, according to the United States Food and Drug Administration (FDA), the Food, Drug, and Cosmetic Act “does not recognize any such category as cosmeceuticals.” A product can be a drug, a cosmetic, or a combination of both, but the term “cosmeceutical” has no meaning under the law. A cosmetic, on the other hand, is simply a personal care product with no drug claim. Even though it might provide substantial benefits, the manufacturer or advertiser of a cosmetic product is careful in labelling so as to ensure that the product is not perceived as a drug.",
    "It is a much more straightforward term that is less misleading to consumers. Cosmetics cannot be advertised as a product that can cure, treat or prevent disease, or that can affect the structure or function of the human body. An advantage to cosmetics is that they do not need to be approved by the FDA prior to sale. In Canada, a cosmetic is required to be listed with Health Canada.",
    "Start-ups in the personal care industry — as well as established companies in nutricosmetics or nutraceutics looking to diversify into personal care — could create great brands without having to run these products at their own plants or go through rigorous drug-approval processes. This is simply done by contracting the production out to a contract manufacturer, eliminating a lot of the overhead cost involved in setting up a personal care manufacturing facility.",
    "Canadian companies such as All Naturals Cosmetics Inc., located in Barrie, Ontario, hold a rigorous standard of quality in their personal care manufacturing processes, and have served many start-ups as well as established companies in fulfilling their private-labelling and contract-manufacturing needs. Ingredients used by the company are pure, natural, non-animal-tested and safe — with selected Kosher and Organic ingredients used as well.",
  ],
};
