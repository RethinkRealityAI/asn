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

  // Combos renumbered 2026-08 (client): the range ran 1-6, 8-12, 14 with two
  // archived gaps, so the visible numbering never matched the labels. Titles
  // are now sequential 1-11 and the handles were realigned to match, since a
  // URL reading combo-9 under a heading reading "Combo 8" is its own bug.
  // Shopify also holds its own redirects (redirectNewHandle), but those only
  // cover the Online Store — this headless front end needs these.
  "/products/combo-5-ageless-carecombo-5-ageless-carecombo-pak-5-shea-love":
    "/products/combo-5-ageless-care",
  "/products/combo-8-acne-be-gone": "/products/combo-7-acne-be-gone",
  "/products/combo-9-feet-body-luxury": "/products/combo-8-feet-body-luxury",
  "/products/combo-10-healthy-nails-cuticles":
    "/products/combo-9-healthy-nails-cuticles",
  "/products/combo-11-face-body-love": "/products/combo-10-face-body-love",
  "/products/combo-12-tresses-so-soft": "/products/combo-11-tresses-so-soft",

  // ── Archived products ────────────────────────────────────────────────────
  // An archived product is not returned by the Storefront API, so it is never
  // statically generated and its URL 404s. Point each at the collection a
  // visitor most likely wanted instead.
  //
  // These are SAFE to keep even if a product is later un-archived: Netlify
  // only applies a redirect when no file matches the path, and an un-archived
  // product generates /products/<handle>/index.html which wins. Do NOT add a
  // "!" (forced) suffix to these rules — that would shadow the real page.
  "/products/combo-7-healing-oils-soaps": "/collections/combo-packages",
  "/products/shea-butter-massage-oil": "/collections/butters-moisturizers",
  "/products/black-soap-facial-wash": "/collections/washes-soaps",

  // ── Malformed handles ────────────────────────────────────────────────────
  // Three handles arrived from the WooCommerce export with their slug
  // concatenated two or three times over (a known WP export artefact). They
  // were ugly in the URL bar and in search results; now cleaned up.
  "/products/sheaargan-oilsheaargan-oilsheaargan-oil": "/products/argan-shea-oil",
  "/products/passion-fruit-face-neck-cream-8-8lb-size-8-8lbpassion-fruit-face-neck-cream-8-8lbpassion-fruit-face-neck-cream-3":
    "/products/passion-fruit-face-neck-cream",
  "/products/skin-rejuvenating-night-cream-8-8lb-size-8-8lbskin-rejuvenating-night-cream-8-8lbnight-cream-3":
    "/products/rejuvenating-night-cream",

  // ── Dead redirect targets from the legacy manifest ───────────────────────
  // The manifest's `proposed_route` column was written against a planned
  // information architecture that was never built: it routes 22 legacy URLs
  // to /blog/*, /account, /services/* and /wholesale/* pages that do not
  // exist, so every one of them 404s today.
  //
  // Re-point each at the page that actually carries the content. Because the
  // build flattens chains, mapping the /blog/* key is enough — the dated
  // WordPress permalinks (/2021/08/03/awards -> /blog/awards) collapse onto
  // the final destination automatically, and any shared /blog/* link works too.
  "/blog/awards": "/about/awards",
  "/blog/making-a-difference": "/about/making-a-difference",
  "/blog/our-beliefs": "/about/our-beliefs",
  "/blog/ingredients-inci": "/about/our-ingredients",
  "/blog/policies": "/policies",
  "/blog/services": "/private-label",
  "/blog/quality-control": "/private-label",
  "/blog/meet-lanre-the-president-and-ceo-of-all-naturals-cosmetics-inc":
    "/about/our-story",

  // Ingredient/education posts have no home yet — the Journal is a
  // coming-soon stub, which still beats a 404.
  "/blog/what-is-shea-butter": "/journal",
  "/blog/the-benefits-of-shea-butter": "/journal",
  "/blog/shea-in-the-summer": "/journal",
  "/blog/shea-butter": "/journal",
  "/blog/babassu-oil-the-wonder-ingredient-of-south-america": "/journal",
  "/blog/its-all-about-the-butter-shea-butter": "/journal",
  "/blog/the-wonder-of-cocoa-butter-for-skin": "/journal",
  "/blog/category/about": "/journal",
  "/blog/category/an-blog": "/journal",

  // Sections that were folded into other pages during the rebuild.
  "/wholesale/distributor-application": "/wholesale",
  "/wholesale/private-label": "/private-label",
  "/services": "/private-label",
  "/services/product-shoot": "/private-label",
  // The shea-butter-making film lives on the media page.
  "/about/shea-butter-process": "/media",
  // Customer accounts are not built yet — send them somewhere real.
  "/account": "/contact",

  // ── Legacy product-category URLs ─────────────────────────────────────────
  // The manifest mapped /product-category/<slug> to /collections/<same-slug>
  // verbatim, but the rebuild derives its collection handles from product
  // types, so 15 of those slugs never existed. Map each to the collection
  // that actually holds the products.
  "/product-category/body-care": "/collections/family-body-care",
  "/product-category/face-care": "/collections/family-face-care",
  "/product-category/hair-care": "/collections/family-hair-care",
  "/product-category/foot": "/collections/family-foot-care",
  "/product-category/cleansers": "/collections/cleansers-shaving-bars",
  "/product-category/washes-and-soaps": "/collections/washes-soaps",
  "/product-category/eye-facial-moisturizerscreams": "/collections/eye-facial-creams",
  "/product-category/bottles-jars": "/collections/jars-bottles",
  "/product-category/tester": "/collections/testers",

  // "…-bases" were the bulk manufacturing bases, and Spas & Salons is a bulk
  // tag — all of them live under Bulk & Wholesale now.
  "/product-category/bath-body-bases": "/collections/bulk-wholesale",
  "/product-category/face-care-bases": "/collections/bulk-wholesale",
  "/product-category/shampoos-conditioners-bases": "/collections/bulk-wholesale",
  "/product-category/hair-twist-butters-and-scalp-foods-bases": "/collections/bulk-wholesale",
  "/product-category/spas-salons": "/collections/bulk-wholesale",

  // Men's Care was removed (see above) — same destination as its collection.
  "/product-category/men": "/shop",
};
