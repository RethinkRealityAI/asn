// lib/catalog/filters.ts

import type { Product, Collection } from "@/lib/shopify/types";

// ── Public types ──────────────────────────────────────────────────────────────

export type Facets = {
  categories: { handle: string; title: string; count: number }[];
  priceBuckets: {
    id: string;
    label: string;
    min: number;
    max: number | null;
    count: number;
  }[];
  concerns: { tag: string; count: number }[];
};

export type SortKey = "featured" | "price-asc" | "price-desc" | "title";

export type FilterState = {
  category?: string;
  price?: string;
  concern?: string;
  /** Free-text search over title, productType and tags. */
  q?: string;
  sort?: SortKey;
};

// ── Price bucket definitions (ordered, exhaustive) ────────────────────────────

const PRICE_BUCKETS: {
  id: string;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "lt-15",   label: "Under $15",  min: 0,  max: 15   },
  { id: "15-30",   label: "$15 – $30",  min: 15, max: 30   },
  { id: "30-60",   label: "$30 – $60",  min: 30, max: 60   },
  { id: "60-plus", label: "$60+",       min: 60, max: null  },
];

// ── Tags that are internal / ops metadata — never surfaced as concerns ─────────

const SKIP_CONCERN_TAGS = new Set([
  "front_spec_may2022",
  "Spas & Salons",
]);

function isSkippedConcernTag(tag: string): boolean {
  if (SKIP_CONCERN_TAGS.has(tag)) return true;
  if (/^bulk/i.test(tag)) return true;
  return false;
}

// ── deriveFacets ──────────────────────────────────────────────────────────────

/**
 * Derive filterable facets from the full product list + the derived collections.
 *
 * - categories: one entry per non-empty Collection
 * - priceBuckets: 4 fixed buckets keyed on priceRange.min.amount
 * - concerns: non-internal tags with counts, sorted by frequency then alpha
 */
export function deriveFacets(
  products: Product[],
  collections: Collection[]
): Facets {
  // ── Categories ────────────────────────────────────────────────────────────
  const categories = collections
    .filter((c) => c.productHandles.length > 0)
    .map((c) => ({
      handle: c.handle,
      title: c.title,
      count: c.productHandles.length,
    }));

  // ── Price buckets ─────────────────────────────────────────────────────────
  const bucketCounts = new Map<string, number>(
    PRICE_BUCKETS.map((b) => [b.id, 0])
  );
  for (const product of products) {
    const minPrice = product.priceRange.min.amount;
    const bucket = PRICE_BUCKETS.find(
      (b) => minPrice >= b.min && (b.max === null || minPrice < b.max)
    );
    if (bucket) {
      bucketCounts.set(bucket.id, (bucketCounts.get(bucket.id) ?? 0) + 1);
    }
  }
  const priceBuckets = PRICE_BUCKETS.map((b) => ({
    ...b,
    count: bucketCounts.get(b.id) ?? 0,
  }));

  // ── Concerns ─────────────────────────────────────────────────────────────
  // Products carry cross-sell/category tags in their raw `tags` list (e.g. a
  // product tagged "Combo Packages" is ALSO in the Combo Packages collection).
  // Surfacing those as "concerns" produces a second, confusingly-identical
  // chip for the same category — exclude any tag that IS a category title.
  const categoryTitleSet = new Set(categories.map((c) => c.title));
  const tagCounts = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.tags) {
      if (!tag || isSkippedConcernTag(tag) || categoryTitleSet.has(tag)) continue;
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const concerns = [...tagCounts.entries()]
    .filter(([, count]) => count > 0)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return { categories, priceBuckets, concerns };
}

// ── applyFilters ──────────────────────────────────────────────────────────────

/**
 * Filter + sort a product list according to a FilterState.
 * Returns a new array; the input is never mutated.
 *
 * `collections` is required when `filters.category` is set — pass the same
 * array returned by `deriveCollections`. It is optional otherwise.
 *
 * Filter precedence: category → price → concern → sort.
 * Unknown/stale filter values are treated as "no filter" (graceful degradation).
 */
export function applyFilters(
  products: Product[],
  filters: FilterState,
  collections?: Collection[]
): Product[] {
  let result = [...products];

  // ── Category filter ───────────────────────────────────────────────────────
  if (filters.category && collections) {
    const col = collections.find((c) => c.handle === filters.category);
    if (col) {
      const allowed = new Set(col.productHandles);
      result = result.filter((p) => allowed.has(p.handle));
    } else {
      // Unknown category handle → return nothing (the user selected a category
      // that does not exist in the derived collections).
      result = [];
    }
  } else if (filters.category && !collections) {
    // Called without collections but with a category filter: cannot filter,
    // degrade gracefully and return all products. Warn in dev.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[applyFilters] category filter ignored — pass `collections` as third arg"
      );
    }
  }

  // ── Price filter ──────────────────────────────────────────────────────────
  if (filters.price) {
    const bucket = PRICE_BUCKETS.find((b) => b.id === filters.price);
    if (bucket) {
      result = result.filter((p) => {
        const min = p.priceRange.min.amount;
        return min >= bucket.min && (bucket.max === null || min < bucket.max);
      });
    }
    // Unknown price id: degrade → no price filter applied (result unchanged)
  }

  // ── Concern filter ────────────────────────────────────────────────────────
  if (filters.concern) {
    result = result.filter((p) => p.tags.includes(filters.concern!));
  }

  // ── Search query ──────────────────────────────────────────────────────────
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    result = result.filter((p) =>
      `${p.title} ${p.productType} ${p.tags.join(" ")}`.toLowerCase().includes(q)
    );
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sort = filters.sort ?? "featured";
  switch (sort) {
    case "price-asc":
      result.sort(
        (a, b) => a.priceRange.min.amount - b.priceRange.min.amount
      );
      break;
    case "price-desc":
      result.sort(
        (a, b) => b.priceRange.min.amount - a.priceRange.min.amount
      );
      break;
    case "title":
      result.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
      break;
    case "featured":
    default:
      // Preserve original catalog order
      break;
  }

  return result;
}
