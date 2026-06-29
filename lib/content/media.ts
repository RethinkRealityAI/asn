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
    title: "Topical butter — the case for shea",
    meta: "Print feature",
  },
];
