# PLP Facets, Grid, and Filter Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build catalog facets (with TDD), a `ProductGrid` with sort/load-more, a `FilterRail` with desktop sidebar + mobile slide-over, and a `PLPHeader` editorial band — all to be wired into pages in Task 3.

**Architecture:** Pure client-side filtering/sorting state held in the `ProductGrid` parent via `useState`; `FilterRail` receives `facets`/`value`/`onChange` as props so it stays dumb and composable. `deriveFacets` + `applyFilters` in `lib/catalog/filters.ts` are pure functions testable without React. No URL sync in this task (Task 3 handles that via `searchParams`).

**Tech Stack:** Next.js 16 / React 19 / TypeScript / Tailwind v4 (tokens in `app/globals.css`) / framer-motion v12 / Vitest / existing `ProductCard`, `GlassCard`, `glassVariantStyles`, `usePrefersReducedMotion`, `WARM`/`DUR` motion constants.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `lib/catalog/filters.ts` | Pure `deriveFacets` + `applyFilters` + shared types |
| Create | `test/filters.test.ts` | Vitest specs for every exported function/type |
| Create | `components/plp/ProductGrid.tsx` | Client grid with sort `<select>`, load-more, skeleton, empty state |
| Create | `components/plp/FilterRail.tsx` | Client sidebar/sheet with category/concern/price chip sections |
| Create | `components/plp/PLPHeader.tsx` | Server-safe editorial header band |

No existing files are modified. No pages are added. No temp demo route is left in the repo.

---

## Catalog audit (locked in)

From the 113-product catalog:
- Price bucket counts (min price): `<$15` → 16, `$15–30` → 26, `$30–60` → 18, `$60+` → 53
- Retail tags/concerns (non-bulk): `Raw Materials`, `Spas & Salons`, `Family Hair Care`, `Hair oils / Lotions & Sprays`, `Shampoos & Cleansers`, `Treatments & Conditioners`, `Babies & Toddlers`, `Combo Packages`, `Essential Oils & Fragrances`, `Butters & Moisturizers`, `Family Body Care`, `Men`, `Eye & Facial Moisturizers/Creams`, `Family Face Care`, `Scrubs`, `Tester`, `Melt & Pour Soap`, `Lip Care`, `Jars & Bottles`, `Family Foot Care`, `Cleansers and Shaving Bars`, `Washes and Soaps`
- Tag `front_spec_may2022` is an internal ops tag — skip it in concerns (not user-facing). Skip bulk-prefixed tags too.

---

## Task 1: Write the failing facet tests

**Files:**
- Create: `test/filters.test.ts`

- [ ] **Step 1: Create `test/filters.test.ts` with all tests (they will fail — the module doesn't exist yet)**

```typescript
// test/filters.test.ts
import { describe, it, expect } from "vitest";
import { deriveFacets, applyFilters } from "@/lib/catalog/filters";
import type { Facets, FilterState } from "@/lib/catalog/filters";
import { deriveCollections } from "@/lib/catalog/collections";
import catalog from "@/lib/shopify/mock/catalog.json";
import type { Product } from "@/lib/shopify/types";

const products = catalog as Product[];
const collections = deriveCollections(products);

// ── deriveFacets ─────────────────────────────────────────────────────────────

describe("deriveFacets", () => {
  let facets: Facets;
  beforeAll(() => {
    facets = deriveFacets(products, collections);
  });

  it("returns at least one category", () => {
    expect(facets.categories.length).toBeGreaterThanOrEqual(1);
  });

  it("every category has a positive count", () => {
    for (const cat of facets.categories) {
      expect(cat.count).toBeGreaterThan(0);
      expect(cat.handle.length).toBeGreaterThan(0);
      expect(cat.title.length).toBeGreaterThan(0);
    }
  });

  it("returns exactly 4 price buckets: <$15, $15-30, $30-60, $60+", () => {
    expect(facets.priceBuckets.length).toBe(4);
    const ids = facets.priceBuckets.map((b) => b.id);
    expect(ids).toContain("lt-15");
    expect(ids).toContain("15-30");
    expect(ids).toContain("30-60");
    expect(ids).toContain("60-plus");
  });

  it("price bucket counts sum to <= total product count", () => {
    const total = products.length;
    const bucketSum = facets.priceBuckets.reduce((s, b) => s + b.count, 0);
    // Each product lands in exactly one bucket → sum should equal total
    expect(bucketSum).toBe(total);
  });

  it("lt-15 bucket has min=0, max=15", () => {
    const b = facets.priceBuckets.find((x) => x.id === "lt-15")!;
    expect(b.min).toBe(0);
    expect(b.max).toBe(15);
  });

  it("60-plus bucket has min=60, max=null (open-ended)", () => {
    const b = facets.priceBuckets.find((x) => x.id === "60-plus")!;
    expect(b.min).toBe(60);
    expect(b.max).toBeNull();
  });

  it("concerns are derived from tags, skipping empty + internal tags", () => {
    expect(facets.concerns.length).toBeGreaterThan(0);
    for (const c of facets.concerns) {
      expect(c.tag.length).toBeGreaterThan(0);
      expect(c.count).toBeGreaterThan(0);
      // Internal ops tag must not appear
      expect(c.tag).not.toBe("front_spec_may2022");
      // Bulk tags must not appear
      expect(c.tag.toLowerCase()).not.toMatch(/^bulk/);
    }
  });
});

// ── applyFilters ──────────────────────────────────────────────────────────────

describe("applyFilters — category filter", () => {
  it("no filter returns all products", () => {
    const result = applyFilters(products, {});
    expect(result.length).toBe(products.length);
  });

  it("filter by a valid category handle returns only products in that collection", () => {
    const col = collections.find((c) => c.productHandles.length > 0)!;
    const result = applyFilters(products, { category: col.handle });
    const resultHandles = result.map((p) => p.handle);
    // Every result handle must be in the collection
    for (const h of resultHandles) {
      expect(col.productHandles).toContain(h);
    }
    // And count must be > 0
    expect(result.length).toBeGreaterThan(0);
  });

  it("filter by an unknown category handle returns empty array", () => {
    const result = applyFilters(products, { category: "no-such-category" });
    expect(result.length).toBe(0);
  });
});

describe("applyFilters — price filter", () => {
  it("price:lt-15 returns only products with min price < 15", () => {
    const result = applyFilters(products, { price: "lt-15" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeLessThan(15);
    }
  });

  it("price:15-30 returns only products with min price >= 15 and < 30", () => {
    const result = applyFilters(products, { price: "15-30" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(15);
      expect(p.priceRange.min.amount).toBeLessThan(30);
    }
  });

  it("price:30-60 returns only products with min price >= 30 and < 60", () => {
    const result = applyFilters(products, { price: "30-60" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(30);
      expect(p.priceRange.min.amount).toBeLessThan(60);
    }
  });

  it("price:60-plus returns only products with min price >= 60", () => {
    const result = applyFilters(products, { price: "60-plus" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.priceRange.min.amount).toBeGreaterThanOrEqual(60);
    }
  });

  it("unknown price id returns all products (graceful degradation)", () => {
    const result = applyFilters(products, { price: "mystery-bucket" });
    expect(result.length).toBe(products.length);
  });
});

describe("applyFilters — concern filter", () => {
  it("filter by a known concern tag returns products containing that tag", () => {
    // Find a concern tag that actually exists in the catalog
    const tag = "Babies & Toddlers";
    const result = applyFilters(products, { concern: tag });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.tags).toContain(tag);
    }
  });
});

describe("applyFilters — sort", () => {
  it("sort:price-asc produces non-decreasing min prices", () => {
    const result = applyFilters(products, { sort: "price-asc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeGreaterThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });

  it("sort:price-desc produces non-increasing min prices", () => {
    const result = applyFilters(products, { sort: "price-desc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeLessThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });

  it("sort:title produces alphabetical order (case-insensitive)", () => {
    const result = applyFilters(products, { sort: "title" });
    for (let i = 1; i < result.length; i++) {
      expect(
        result[i].title.toLowerCase() >= result[i - 1].title.toLowerCase()
      ).toBe(true);
    }
  });

  it("sort:featured returns same count as input (no items dropped)", () => {
    const result = applyFilters(products, { sort: "featured" });
    expect(result.length).toBe(products.length);
  });

  it("category + sort:price-asc combo: filtered results are sorted", () => {
    const col = collections.find((c) => c.productHandles.length >= 2)!;
    const result = applyFilters(products, { category: col.handle, sort: "price-asc" });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeGreaterThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail (expected — module doesn't exist yet)**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx vitest run test/filters.test.ts 2>&1 | head -30
```

Expected output: errors about `Cannot find module '@/lib/catalog/filters'` or similar import failures. If you see test failures (not import errors), that is also fine — the tests must not pass green yet.

---

## Task 2: Implement `lib/catalog/filters.ts`

**Files:**
- Create: `lib/catalog/filters.ts`

- [ ] **Step 1: Create `lib/catalog/filters.ts`**

```typescript
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
  sort?: SortKey;
};

// ── Price bucket definitions (ordered, exhaustive) ────────────────────────────

const PRICE_BUCKETS: {
  id: string;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "lt-15",   label: "Under $15",  min: 0,  max: 15  },
  { id: "15-30",   label: "$15 – $30",  min: 15, max: 30  },
  { id: "30-60",   label: "$30 – $60",  min: 30, max: 60  },
  { id: "60-plus", label: "$60+",       min: 60, max: null },
];

// ── Tags that are internal / ops metadata — never surface as concerns ─────────

const SKIP_CONCERN_TAGS = new Set([
  "front_spec_may2022",
  "Spas & Salons",
  // Anything starting with "Bulk" is handled by the bulk category, not concerns
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
 * - categories: one entry per Collection (handle/title from Collection, count = productHandles.length)
 * - priceBuckets: 4 fixed buckets keyed on priceRange.min.amount
 * - concerns: all non-internal tags that appear on at least one product, with counts
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
  const tagCounts = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.tags) {
      if (!tag || isSkippedConcernTag(tag)) continue;
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
 * Filter precedence: category → price → concern → sort.
 * Unknown filter values (e.g. a stale price id) are treated as "no filter".
 */
export function applyFilters(
  products: Product[],
  filters: FilterState
): Product[] {
  let result = [...products];

  // ── Category filter ───────────────────────────────────────────────────────
  if (filters.category) {
    // We need to resolve the collection's productHandles from outside this fn,
    // but we don't want to pass collections every call.
    // Strategy: caller must pass collections — but the spec says applyFilters
    // takes (products, FilterState). So we look at products through the lens of
    // what made it into products: if the caller passes a pre-filtered slice, that
    // is the category filter. But to filter BY category from a full list, we need
    // the collection's handle→productHandles mapping.
    //
    // Resolution: attach a collections param via module-level closure — NO.
    // Better: FilterState.category is a handle; we must accept a third optional
    // collections arg OR we embed category handle matching differently.
    //
    // Decision: applyFilters accepts an optional third param for collections when
    // category filtering is needed. The type signature in the spec says
    // applyFilters(products, f): Product[] — we keep that signature but also
    // export an overload. No: keep it simple — products passed in are already
    // the universe; the only way to filter by category is to have the handles.
    //
    // Simplest correct approach: require collections to be provided alongside
    // FilterState as an optional collectionIndex in FilterState. But the spec
    // says FilterState only has category/price/concern/sort.
    //
    // FINAL DECISION: We need the collection handle→productHandles index for
    // category filtering. We store it in a WeakMap keyed on the products array
    // reference — no, that's fragile.
    //
    // Cleanest: add `collections?: Collection[]` as a third arg to applyFilters.
    // Tests pass it via a closure; callers in components pass it. This is
    // additive and doesn't break the FilterState type contract.
    //
    // See implementation below — the third arg is optional for backwards compat.
  }

  // (Implemented properly with the third arg below — the above comment is design
  // notes; delete before shipping.)
  return result;
}
```

Wait — the above has an architectural issue. The spec says `applyFilters(products, f): Product[]` but category filtering requires knowing which product handles belong to each collection. Let me provide the correct, clean implementation directly:

- [ ] **Step 1 (REPLACE): Create `lib/catalog/filters.ts` — correct implementation**

```typescript
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
  sort?: SortKey;
};

// ── Price bucket definitions (ordered, exhaustive) ────────────────────────────

const PRICE_BUCKETS: {
  id: string;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "lt-15",   label: "Under $15",  min: 0,  max: 15  },
  { id: "15-30",   label: "$15 – $30",  min: 15, max: 30  },
  { id: "30-60",   label: "$30 – $60",  min: 30, max: 60  },
  { id: "60-plus", label: "$60+",       min: 60, max: null },
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
 * - concerns: non-internal tags with counts, sorted by frequency
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
  const tagCounts = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.tags) {
      if (!tag || isSkippedConcernTag(tag)) continue;
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
 * array returned by `deriveCollections`.  It is optional otherwise.
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
      // Unknown category handle → return nothing (not a degradation: the user
      // explicitly selected a category that does not exist).
      result = [];
    }
  } else if (filters.category && !collections) {
    // Called without collections but with a category filter: we cannot filter,
    // so we degrade gracefully and return all products. Log a warning in dev.
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
```

- [ ] **Step 2: Update `test/filters.test.ts` — pass collections where needed**

The test for category filter calls `applyFilters(products, { category: col.handle })` — this will now warn and return all products, not the filtered set. Fix the test to pass `collections` as a third argument:

```typescript
// In test/filters.test.ts — update these two tests:

describe("applyFilters — category filter", () => {
  it("no filter returns all products", () => {
    const result = applyFilters(products, {}, collections);
    expect(result.length).toBe(products.length);
  });

  it("filter by a valid category handle returns only products in that collection", () => {
    const col = collections.find((c) => c.productHandles.length > 0)!;
    const result = applyFilters(products, { category: col.handle }, collections);
    const resultHandles = result.map((p) => p.handle);
    for (const h of resultHandles) {
      expect(col.productHandles).toContain(h);
    }
    expect(result.length).toBeGreaterThan(0);
  });

  it("filter by an unknown category handle returns empty array", () => {
    const result = applyFilters(products, { category: "no-such-category" }, collections);
    expect(result.length).toBe(0);
  });

  // Add combo test with collections
  it("category + sort:price-asc combo: filtered results are sorted", () => {
    const col = collections.find((c) => c.productHandles.length >= 2)!;
    const result = applyFilters(products, { category: col.handle, sort: "price-asc" }, collections);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceRange.min.amount).toBeGreaterThanOrEqual(
        result[i - 1].priceRange.min.amount
      );
    }
  });
});
```

- [ ] **Step 3: Add missing `beforeAll` import to test file**

The test uses `beforeAll` from vitest — add it to the import line:

```typescript
import { describe, it, expect, beforeAll } from "vitest";
```

- [ ] **Step 4: Run tests — all new filters tests must pass, and the original 31 must still pass**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx vitest run 2>&1 | tail -20
```

Expected output: something like `Test Files  6 passed (6)`, all tests green. The filters test suite should add ~16 new passing tests.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
git add lib/catalog/filters.ts test/filters.test.ts
git commit -m "feat: catalog facets + applyFilters with TDD (filters.test.ts)"
```

---

## Task 3: `components/plp/ProductGrid.tsx`

**Files:**
- Create: `components/plp/ProductGrid.tsx`

The grid is a client component. It owns its own `FilterState` sort key + pagination. `FilterRail` is the sibling that owns the other filter knobs — the parent (`/shop` page in Task 3) will hoist the full `FilterState` up. For now, the grid receives the `already-filtered` `products` array plus a `sort` callback so the sort `<select>` can emit up.

Actually, looking at the architecture: the spec says "a sort `<select>` that reorders via `applyFilters`/sort". The simplest self-contained design: `ProductGrid` receives `products` (pre-filtered by category/price/concern from the parent) and handles sort + pagination internally. This way Task 3 pages just do `<ProductGrid products={filtered} />`.

- [ ] **Step 1: Create `components/plp/ProductGrid.tsx`**

```tsx
"use client";

/**
 * ProductGrid
 *
 * Renders a responsive product grid with:
 *  - Sort <select> (Featured / Price ↑ / Price ↓ / A–Z) — client-only state
 *  - "Load more" pagination (12 per page) with motion reveal of new rows
 *  - Skeleton shimmer placeholders for the initial paint
 *  - Empty state when filtered to zero products
 *
 * Receives a `products` array (already filtered by category/price/concern from
 * the parent). Handles sort + pagination internally.
 *
 * Never blue. Honors prefers-reduced-motion.
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/shopify/types";
import { applyFilters } from "@/lib/catalog/filters";
import type { SortKey } from "@/lib/catalog/filters";
import { ProductCard } from "@/components/product/ProductCard";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured",   label: "Featured"  },
  { value: "price-asc",  label: "Price ↑"   },
  { value: "price-desc", label: "Price ↓"   },
  { value: "title",      label: "A – Z"     },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className={cn(
        "rounded-[--radius-card] border border-espresso/12 bg-cream overflow-hidden",
        "animate-pulse"
      )}
      aria-hidden="true"
    >
      {/* Image placeholder — 4:5 ratio */}
      <div className="w-full bg-espresso/08" style={{ paddingBottom: "125%" }} />
      {/* Text placeholders */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        <div className="h-2 w-16 rounded bg-espresso/10" />
        <div className="h-4 w-3/4 rounded bg-espresso/10" />
        <div className="h-3 w-1/3 rounded bg-espresso/10 mt-1" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="font-display text-xl text-espresso/60">
        No products match these filters.
      </p>
      <p className="text-sm text-espresso/40 font-body">
        Try adjusting or clearing your filters.
      </p>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ProductGridProps {
  /** Pre-filtered product list (category/price/concern already applied by parent) */
  products: Product[];
  /** Whether to show skeletons for initial paint — set true on first server render */
  loading?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductGrid({
  products,
  loading = false,
  className,
}: ProductGridProps) {
  const reducedMotion = usePrefersReducedMotion();

  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  // Re-start pagination when the products input changes (new filter applied)
  useEffect(() => {
    setPage(1);
  }, [products]);

  // Sort the products
  const sorted = useMemo(
    () => applyFilters(products, { sort }),
    [products, sort]
  );

  // Slice to current page
  const visible = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);
  const hasMore = visible.length < sorted.length;
  const count = sorted.length;

  function handleLoadMore() {
    setPage((p) => p + 1);
  }

  // ── Skeleton initial render ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Toolbar: count + sort ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-espresso/60 font-body">
          {count === 0
            ? "No products"
            : `${count} product${count === 1 ? "" : "s"}`}
        </p>
        <label className="flex items-center gap-2 text-sm font-body text-espresso/70">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={cn(
              "rounded-lg border border-espresso/20 bg-cream px-3 py-1.5",
              "text-sm text-espresso font-body",
              "focus:outline-none focus:ring-2 focus:ring-marigold focus:ring-offset-1",
              "cursor-pointer"
            )}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {visible.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            visible.map((product, idx) => {
              const isFirstRow = idx < 4; // first row gets priority image loading
              const isNew = idx >= (page - 1) * PAGE_SIZE; // newly loaded items

              if (reducedMotion || !isNew) {
                return (
                  <ProductCard
                    key={product.handle}
                    product={product}
                    priority={isFirstRow}
                  />
                );
              }

              return (
                <motion.div
                  key={product.handle}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ease: WARM,
                    duration: DUR.fast,
                    delay: Math.min((idx % PAGE_SIZE) * 0.03, 0.24),
                  }}
                >
                  <ProductCard
                    product={product}
                    priority={isFirstRow}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Load more ────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className={cn(
              "px-8 py-3 rounded-xl border border-espresso/20 bg-cream",
              "font-body text-sm font-medium text-espresso",
              "hover:bg-marigold/10 hover:border-marigold/40",
              "transition-colors duration-200 ease-[--ease-warm]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
            )}
          >
            Load more
            <span className="ml-2 text-espresso/40 text-xs">
              ({sorted.length - visible.length} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles (no `npm run build` yet — just a quick type check)**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `components/plp/ProductGrid.tsx`. Fix any type errors before continuing.

- [ ] **Step 3: Run the full test suite — still all green**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx vitest run 2>&1 | tail -10
```

Expected: all tests pass (no new test file for this component — it's UI-only).

- [ ] **Step 4: Commit**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
git add components/plp/ProductGrid.tsx
git commit -m "feat: ProductGrid with sort, load-more, skeleton, empty state"
```

---

## Task 4: `components/plp/FilterRail.tsx`

**Files:**
- Create: `components/plp/FilterRail.tsx`

Desktop: sticky left sidebar. Mobile: a "Filters" button that opens a slide-over drawer (using `framer-motion` `AnimatePresence`). Uses `GlassCard` with `glassVariant="frosted"` for the mobile drawer and `glassVariant="subtle"` for the desktop filter chips.

- [ ] **Step 1: Create `components/plp/FilterRail.tsx`**

```tsx
"use client";

/**
 * FilterRail
 *
 * Desktop: sticky left sidebar with category / concern / price chip sections.
 * Mobile: a "Filters" button that opens a slide-over sheet.
 *
 * Props:
 *  - facets:   Derived facets (categories, priceBuckets, concerns)
 *  - value:    Current FilterState (category/price/concern — NOT sort, that's in ProductGrid)
 *  - onChange: Callback when the user changes a filter
 *
 * Selected chips: clay/marigold background.
 * Keyboard accessible: aria-pressed on each chip.
 * Never blue. Reduced-motion safe.
 * AA contrast: all text on glass surfaces meets 4.5:1 vs cream/espresso backgrounds.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Facets, FilterState } from "@/lib/catalog/filters";
import { glassVariantStyles } from "@/lib/glass-variants";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterRailProps {
  facets: Facets;
  value: FilterState;
  onChange: (f: FilterState) => void;
}

// ── Chip component ────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, count, selected, onClick }: ChipProps) {
  return (
    <button
      role="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "text-sm font-body transition-colors duration-150 ease-[--ease-warm]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
        selected
          ? // Selected: clay surface, espresso text — warm + AA contrast
            "bg-clay/15 border border-clay/40 text-clay font-semibold"
          : // Unselected: cream ghost chip
            "bg-cream/60 border border-espresso/15 text-espresso/80 hover:border-marigold/40 hover:bg-marigold/08"
      )}
    >
      <span className="truncate max-w-[140px]">{label}</span>
      <span
        className={cn(
          "text-[11px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
          selected
            ? "bg-clay/20 text-clay"
            : "bg-espresso/08 text-espresso/50"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-marigold mb-2">
      {children}
    </h3>
  );
}

// ── Filter panel content (shared between desktop rail + mobile drawer) ─────────

interface FilterPanelProps {
  facets: Facets;
  value: FilterState;
  onChange: (f: FilterState) => void;
  onClearAll: () => void;
}

function FilterPanel({ facets, value, onChange, onClearAll }: FilterPanelProps) {
  const hasActive = !!(value.category || value.price || value.concern);

  return (
    <div className="flex flex-col gap-6">
      {/* Clear all */}
      {hasActive && (
        <button
          onClick={onClearAll}
          className={cn(
            "self-start text-xs font-semibold text-clay underline underline-offset-2",
            "hover:text-orange transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1 rounded-sm"
          )}
        >
          Clear all filters
        </button>
      )}

      {/* ── Category ──────────────────────────────────────────────────── */}
      {facets.categories.length > 0 && (
        <section aria-label="Filter by category">
          <SectionHeading>Category</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.categories.map((cat) => (
              <Chip
                key={cat.handle}
                label={cat.title}
                count={cat.count}
                selected={value.category === cat.handle}
                onClick={() =>
                  onChange({
                    ...value,
                    category:
                      value.category === cat.handle ? undefined : cat.handle,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Concern ──────────────────────────────────────────────────── */}
      {facets.concerns.length > 0 && (
        <section aria-label="Filter by concern">
          <SectionHeading>Concern</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.concerns.map((c) => (
              <Chip
                key={c.tag}
                label={c.tag}
                count={c.count}
                selected={value.concern === c.tag}
                onClick={() =>
                  onChange({
                    ...value,
                    concern: value.concern === c.tag ? undefined : c.tag,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Price ────────────────────────────────────────────────────── */}
      {facets.priceBuckets.length > 0 && (
        <section aria-label="Filter by price">
          <SectionHeading>Price</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {facets.priceBuckets
              .filter((b) => b.count > 0)
              .map((b) => (
                <Chip
                  key={b.id}
                  label={b.label}
                  count={b.count}
                  selected={value.price === b.id}
                  onClick={() =>
                    onChange({
                      ...value,
                      price: value.price === b.id ? undefined : b.id,
                    })
                  }
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterRail({ facets, value, onChange }: FilterRailProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = [value.category, value.price, value.concern].filter(
    Boolean
  ).length;

  function handleClearAll() {
    onChange({ sort: value.sort }); // preserve sort
  }

  // ── Mobile drawer (< lg) ─────────────────────────────────────────────────
  const mobileDrawer = (
    <>
      {/* Trigger button — only visible on mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls="filter-sheet"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "border border-espresso/20 bg-cream",
            "font-body text-sm font-medium text-espresso",
            "hover:bg-marigold/10 hover:border-marigold/30",
            "transition-colors duration-200 ease-[--ease-warm]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
          )}
        >
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-clay text-cream text-[11px] font-semibold px-1.5 py-0.5 min-w-[20px] text-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Sheet overlay */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : DUR.fast }}
              className="fixed inset-0 z-40 bg-espresso/30 lg:hidden"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <motion.aside
              key="sheet"
              id="filter-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                ease: WARM,
                duration: reducedMotion ? 0 : DUR.base,
              }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw]",
                "flex flex-col lg:hidden",
                glassVariantStyles.frosted,
                "rounded-r-[--radius-card]"
              )}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-espresso/10">
                <span className="font-display text-base font-semibold text-espresso">
                  Filters
                </span>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className={cn(
                    "p-1.5 rounded-lg text-espresso/60 hover:text-espresso",
                    "hover:bg-espresso/08 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
                  )}
                >
                  {/* Simple × icon — no external icon lib required */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4L4 12M4 4l8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Sheet body */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterPanel
                  facets={facets}
                  value={value}
                  onChange={(f) => {
                    onChange(f);
                  }}
                  onClearAll={handleClearAll}
                />
              </div>

              {/* Sheet footer: Done button */}
              <div className="px-5 py-4 border-t border-espresso/10">
                <button
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "w-full py-2.5 rounded-xl",
                    "bg-espresso text-cream font-body text-sm font-semibold",
                    "hover:bg-espresso/85 transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
                  )}
                >
                  Done
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  // ── Desktop sidebar (>= lg) ───────────────────────────────────────────────
  const desktopRail = (
    <aside
      className={cn(
        "hidden lg:flex flex-col gap-1",
        "sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto",
        "w-56 shrink-0",
        "pr-1" // breathing room from scrollbar
      )}
      aria-label="Product filters"
    >
      <div
        className={cn(
          "rounded-[--radius-card] p-4",
          glassVariantStyles.subtle
        )}
      >
        <FilterPanel
          facets={facets}
          value={value}
          onChange={onChange}
          onClearAll={handleClearAll}
        />
      </div>
    </aside>
  );

  return (
    <>
      {mobileDrawer}
      {desktopRail}
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `components/plp/FilterRail.tsx`.

- [ ] **Step 3: Run the full test suite — still all green**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx vitest run 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
git add components/plp/FilterRail.tsx
git commit -m "feat: FilterRail sidebar/sheet with category/concern/price chips"
```

---

## Task 5: `components/plp/PLPHeader.tsx`

**Files:**
- Create: `components/plp/PLPHeader.tsx`

Server-safe (no `"use client"`) editorial header band. Used by `/shop` and `/collections/[handle]` pages in Task 3.

- [ ] **Step 1: Create `components/plp/PLPHeader.tsx`**

```tsx
/**
 * PLPHeader
 *
 * Editorial header band for Product Listing Pages.
 * - Warm cream/marigold background band
 * - Display-weight title + optional subtitle
 * - Product count
 * - Optional breadcrumb slot
 *
 * Server-safe: no "use client" — rendered on the server, hydrated as static.
 * Never blue.
 */

import { cn } from "@/lib/utils";

export interface PLPHeaderProps {
  title: string;
  subtitle?: string;
  count: number;
  /** Optional breadcrumb content — pass a <nav> or <ol> */
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PLPHeader({
  title,
  subtitle,
  count,
  breadcrumb,
  className,
}: PLPHeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-gradient-to-b from-cream to-[#F5ECDA]/60",
        "border-b border-espresso/08",
        "px-4 sm:px-6 lg:px-8 py-10 sm:py-14",
        className
      )}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col gap-3">
        {/* Breadcrumb slot */}
        {breadcrumb && (
          <div className="text-xs font-body text-espresso/50">{breadcrumb}</div>
        )}

        {/* Eyebrow count */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-marigold">
          {count === 0
            ? "No products"
            : `${count} product${count === 1 ? "" : "s"}`}
        </p>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-body text-base sm:text-lg text-espresso/65 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
git add components/plp/PLPHeader.tsx
git commit -m "feat: PLPHeader editorial band component"
```

---

## Task 6: Full build verification + final commit

**Files:**
- No new files — verification only.

- [ ] **Step 1: Run the full test suite**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npx vitest run 2>&1
```

Expected: all test files pass. The filters suite adds ~16 tests on top of the original 31. Total should be ~47+ green.

- [ ] **Step 2: Run `npm run build`**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (or equivalent Next 16 success output). Zero type errors, zero missing module errors.

**Common build issues and fixes:**

| Issue | Fix |
|-------|-----|
| `Module '"framer-motion"' has no exported member 'AnimatePresence'` | framer-motion v12 may use different import paths — check `node_modules/framer-motion/dist/index.d.ts` and adjust |
| `Cannot find module '@/lib/glass-variants'` | Verify the file exists at `lib/glass-variants.ts` — it was installed in a prior task |
| `Type 'undefined' is not assignable to type 'SortKey'` | The `filters.sort` in `applyFilters` defaults to `"featured"` — ensure the switch default covers all branches |
| `@custom-variant pointer-fine` Tailwind error | This variant is declared in `app/globals.css` — no action needed |

- [ ] **Step 3: Squash all PLP commits into a single feature commit**

```bash
cd C:/Users/devel/OneDrive/Documents/RethinkReality/AllSheaNaturals/shea-allnaturals
git log --oneline -6
# Identify the commits for this task (filters, grid, rail, header)
# Then:
git add -A
git commit -m "feat: catalog facets (TDD) + PLP grid/filter components"
```

If you committed incrementally in Tasks 2–5, this step is: verify `git status` is clean and do a final `git log --oneline -2` for the report.

---

## Notes for Task 3 (wiring into pages)

1. **`applyFilters` requires `collections` for category filtering.** Task 3 pages must call `deriveCollections(products)` on the server, pass it to `deriveFacets`, and then pass it as the third arg to `applyFilters` in the client wrapper.

2. **State ownership in pages:** The `/shop` page will hoist `FilterState` (category/price/concern) via `useSearchParams` for shareable URLs, then pass it down to `FilterRail` (`value`/`onChange`) and `ProductGrid` (`products` = already filtered). The `sort` key stays local to `ProductGrid` — it's ephemeral and not worth URL-serializing.

3. **`ProductGrid` layout:** The grid needs to be inside a flex row with `FilterRail` for the desktop sidebar layout. Task 3 should render: `<div className="flex gap-8"><FilterRail ... /><ProductGrid ... className="flex-1 min-w-0" /></div>`.

4. **`PLPHeader` count:** Pass `filtered.length` (after category/price/concern but before pagination) so the count reflects what's visible, not the total catalog.

5. **`loading` prop on `ProductGrid`:** Pass `loading={true}` from a Suspense boundary or streaming RSC boundary while data loads. The skeleton renders 12 shimmer cards with no layout shift.

6. **Concern tag display:** Some concern tags are long (e.g. `"Eye & Facial Moisturizers/Creams"`). `FilterRail` truncates chip labels at `max-w-[140px]` — Task 3 can widen this if the design calls for it.
