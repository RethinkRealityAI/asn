# Shea Allnaturals Storefront — Project Status

_Last updated: 2026-06-25 · Live: https://asn-shea.netlify.app_

This is the living "what's done / what's next" record. For architecture, conventions, and run/deploy commands see `CLAUDE.md` (+ `AGENTS.md` for Next-16 technical notes). The original design spec and phased plans live in `../docs/superpowers/`.

---

## ✅ Done (shipped & live)

### Foundation & design system (Plan A)
- Next.js 16 + React 19 + Tailwind v4 + shadcn (Base UI) + glasscn, on Netlify. Self-hosted fonts (Quicksand / Clash Display / General Sans). Sun & Soil tokens, grain texture.
- Typed `StoreClient` data layer with a **mock adapter seeded from the real CSV** (113 products / 208 variants / 22 collections; retail vs `bulk-wholesale` separated). 65 passing tests (Vitest).
- Product image pipeline (originals → optimized webp under `public/media/<handle>/`).

### Storefront pages (Plan B)
- **Home**, **`/shop`** (faceted filter rail: category/concern/price + sort + load-more), **`/collections/[handle]`** (22 SSG) + `/collections` index, **PDP `/products/[handle]`** (all 113 SSG — sticky gallery, variant→price, add-to-cart, motion accordions, related, **Product + BreadcrumbList JSON-LD**), **`/cart`** + glass **cart drawer** (client cart, localStorage, **checkout stubbed** — no fake payment), coming-soon stubs for our-story/journal/wholesale/contact/ingredients/where-to-buy.

### Design revision → clean white site
- Site background switched from cream-dominant to **clean white**; cream is now a strategic accent (credentials band). Product cards → **white, rounded 28px, layered drop-shadow "3D float", hover-lift, uniform height** (clamped titles, fixed image ratio).
- **Green + red put to work:** botanical-green category eyebrows / "in stock" / vegan-cruelty-free credentials; clay/leaf-red Bestseller/New badges + maple-leaf "Made in Canada".

### Premium imagery (Higgsfield)
- **43 retail products re-staged** onto a clean white→cream backdrop wearing the **new Shea seal label** (recipe: `image_auto`/`nano_banana_pro` + product photo + seal `6998b459…` as references). Installed as the primary `01.webp` (originals backed up to `00-orig.webp`). One product (`hair-body-cleanser`) skipped on an NSFW false-positive — still on its original photo.
- Decorative transparent cutouts (`public/decor/`: mudcloth, shea-nuts, leaves, shea-butter, oil) + 4 on-brand trust badges (`public/badges/`).

### Homepage richness
- **Video hero:** the brand promo (`Shea_Allnaturals_oils_promo.mp4`) transcoded to a performant loop (`public/video/hero.mp4` 1.16 MB / `hero.webm` 512 KB / poster), **warm-graded + blurred + dimmed** so the OLD blue labels are neutralized and the cream headline reads clearly. (The scroll-scrubbed **3D peppermint hero is parked** in `components/three/` for reuse elsewhere.)
- **Green "homeland" scroll-pop scene:** deep green + subtle mudcloth texture; botanical cutouts + product shots float in with staggered reveal + parallax (`components/homeland/HomelandScene.tsx`), reduced-motion safe.
- **Trust badges band** + **"Where to buy"** stockist strip (Walmart / Shoppers Drug Mart / Pharmaplus / Jean Coutu / Rexall — typographic, not AI-faked logos) + subtle decorative accents on otherwise-plain sections.

---

## 🔜 Next steps (priority order)

1. **Homeland product floats → transparent.** The 2 product shots in the green homeland scene read as cream cards (they have baked backdrops, unlike the transparent botanical cutouts). Background-remove them so they float cleanly. _(small)_
2. **Fix `/pages/our-story` 404.** A stray RSC prefetch hits the legacy `/pages/our-story` path; the real `/our-story` works. Find and fix the bad link. _(small)_
3. **Collection imagery (#34).** Generate a fitting hero/thumbnail image per collection (Higgsfield) so collection pages aren't just random product shots. _(medium)_
4. **Site-manifest parity audit (#35).** Cross-check `../NEW DESIGN/all_naturals_site_manifest.csv` (198 URLs + `proposed_route`) against the new site; build/stub anything from the old site that's missing (pages, policies, blog). Also wire the 301 redirect map. _(medium)_
5. **Fresh on-brand hero video (optional).** Generate a clean botanical/oil-pour hero video (no old labels at all) to replace the treated promo. _(medium)_
6. **Plan C — real commerce + launch hardening.** Stand up Shopify, import the catalog, set `SHOPIFY_STOREFRONT_TOKEN`, and swap the mock adapter + client cart for the live **Storefront API + hosted checkout** (interface is swap-ready). Then Customer Accounts, predictive search, 301 redirects, and CWV/Lighthouse + WCAG-AA hardening. _(large)_

## ⚠️ Known issues / housekeeping
- `hair-body-cleanser` still on its original photo (Higgsfield NSFW false-positive — re-stage via the UI or an alternate crop).
- Stray Netlify site **`asn-820`** was auto-created during the first deploy — delete it in the Netlify dashboard.
- OneDrive locks `.next/`/`.netlify/` on deploy (EPERM) — clear them or deploy from a copy outside OneDrive.
- 3 product images occasionally 404 only at the `w=3840` srcset breakpoint on first hit (CDN cold-start; self-resolves).
- `asn` subdomain is taken globally → site is `asn-shea`; point the real domain when ready.

## Reference
- Higgsfield asset IDs + the product re-staging recipe: see the agent memory note `reference-shea-higgsfield-assets`, or browse the Higgsfield account via `show_generations`.
- Brand seal emblem job id: `6998b459-fb71-4d54-8f14-6c4efdd7e961`.
