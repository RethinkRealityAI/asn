import type { Product, Collection } from "@/lib/shopify/types";

/** Convert a human-readable title to a URL-safe handle. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A product is bulk/wholesale if:
 *   - its productType starts with "Bulk" or contains "Bulk", OR
 *   - any of its tags starts with "Bulk" or contains "Bulk", OR
 *   - any variant title matches gallon/kg/lb/lbs/bulk keywords
 */
function isBulk(product: Product): boolean {
  if (/bulk/i.test(product.productType)) return true;
  if (product.tags.some(t => /bulk/i.test(t))) return true;
  if (product.variants.some(v => /gallon|\bkg\b|lb|lbs|bulk/i.test(v.title))) return true;
  return false;
}

/**
 * Map from a retail-focused productType/tag to a clean display title.
 * Only retail / cross-category tags are included here; Bulk-* types
 * are handled separately via the bulk gate above.
 */
const CATEGORY_TITLES: Record<string, string> = {
  "Babies & Toddlers": "Babies & Toddlers",
  "Butters & Moisturizers": "Butters & Moisturizers",
  "Cleansers and Shaving Bars": "Cleansers & Shaving Bars",
  "Combo Packages": "Combo Packages",
  "Essential Oils & Fragrances": "Essential Oils & Fragrances",
  "Eye & Facial Moisturizers/Creams": "Eye & Facial Creams",
  "Family Body Care": "Family Body Care",
  "Family Face Care": "Family Face Care",
  "Family Foot Care": "Family Foot Care",
  "Family Hair Care": "Family Hair Care",
  "Hair oils / Lotions & Sprays": "Hair Oils, Lotions & Sprays",
  "Jars & Bottles": "Jars & Bottles",
  "Lip Care": "Lip Care",
  "Melt & Pour Soap": "Melt & Pour Soap",
  "Men": "Men's Care",
  "Raw Materials": "Raw Materials",
  "Scrubs": "Scrubs",
  "Shampoos & Cleansers": "Shampoos & Cleansers",
  "Tester": "Testers",
  "Treatments & Conditioners": "Treatments & Conditioners",
  "Washes and Soaps": "Washes & Soaps",
};

/**
 * For each product, decide which retail category title(s) it belongs to.
 * We use productType first; then supplement with meaningful tags that add
 * cross-category memberships (e.g. a hair-care product that is also "Men").
 */
function retailCategories(product: Product): string[] {
  const cats = new Set<string>();

  // Primary: productType (if it maps to a known retail category)
  const typeTitle = CATEGORY_TITLES[product.productType];
  if (typeTitle) cats.add(typeTitle);

  // Secondary: tags that map to retail categories and differ from the primary
  for (const tag of product.tags) {
    const tagTitle = CATEGORY_TITLES[tag];
    if (tagTitle) cats.add(tagTitle);
  }

  return [...cats];
}

/**
 * Derive a flat list of Collections from the product catalog.
 *
 * Rules:
 *  - Every product appears in its retail category collection(s) based on
 *    productType and tags.
 *  - Bulk/wholesale products ALSO appear in a dedicated "bulk-wholesale"
 *    collection (they may simultaneously belong to a retail category if
 *    they carry retail tags, but in practice most bulk products only have
 *    bulk tags so they land only in the bulk collection).
 *  - Empty collections are dropped.
 *  - Handles are slugified titles, guaranteed [a-z0-9-]+.
 */
export function deriveCollections(products: Product[]): Collection[] {
  // Map from display title → Set of product handles
  const categoryMap = new Map<string, Set<string>>();

  const bulkTitle = "Bulk & Wholesale";
  categoryMap.set(bulkTitle, new Set());

  for (const product of products) {
    const cats = retailCategories(product);

    // Add to retail categories
    for (const cat of cats) {
      if (!categoryMap.has(cat)) categoryMap.set(cat, new Set());
      categoryMap.get(cat)!.add(product.handle);
    }

    // Also add to bulk collection when applicable
    if (isBulk(product)) {
      categoryMap.get(bulkTitle)!.add(product.handle);
    }
  }

  // Build Collection objects, drop empty, sort sensibly
  const collections: Collection[] = [];
  for (const [title, handles] of categoryMap) {
    if (handles.size === 0) continue;
    collections.push({
      handle: slugify(title),
      title,
      productHandles: [...handles],
    });
  }

  // Sort: bulk last, rest alphabetically by title
  collections.sort((a, b) => {
    const aBulk = /bulk|wholesale/i.test(a.handle);
    const bBulk = /bulk|wholesale/i.test(b.handle);
    if (aBulk && !bBulk) return 1;
    if (!aBulk && bBulk) return -1;
    return a.title.localeCompare(b.title);
  });

  return collections;
}
