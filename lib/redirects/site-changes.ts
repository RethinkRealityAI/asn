/**
 * lib/redirects/site-changes.ts
 *
 * 301s for URLs that were live on the CURRENT site and have since moved.
 *
 * Distinct from redirects.generated.ts, which is derived from the legacy
 * allnaturalscosmetics.com manifest. These are hand-maintained: every time a
 * collection is renamed or a product is retired in Shopify, its old URL needs
 * a home or it becomes a 404 for anyone holding a link.
 *
 * Merged into both redirect artifacts by scripts/build-redirects.ts.
 */

export const SITE_CHANGE_REDIRECTS: Record<string, string> = {
  // Men's Care removed 2026-08 (client): no product in the range is
  // men-specific — the six members were general body/hair products.
  "/collections/men-s-care": "/shop",

  // Renamed 2026-08 (client): lotions and sprays discontinued.
  "/collections/hair-oils-lotions-sprays": "/collections/hair-oils-balm",

  // Combo 12 (Body Oils, $70) was a duplicate of Combo 1 (Simply Loving
  // oils, $100) — identical photography, same six-oil set. Combo 1 kept.
  "/products/combo-12-body-oils": "/products/combo-1-simply-loving-oils",
};
