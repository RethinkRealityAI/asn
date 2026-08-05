import type { Product } from "@/lib/shopify/types";

/** Lightweight product shape for search dropdown results / API responses. */
export type SearchHit = {
  handle: string;
  title: string;
  price: number;
  currencyCode: string;
  image: string | null;
};

export function toSearchHit(p: Product): SearchHit {
  return {
    handle: p.handle,
    title: p.title,
    price: p.priceRange.min.amount,
    currencyCode: p.priceRange.min.currencyCode,
    image: p.images[0]?.url ?? null,
  };
}
