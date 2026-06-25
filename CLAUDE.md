@AGENTS.md

# Shea Allnaturals — Storefront (project guide)

Premium **headless e-commerce** rebuild for **Shea Allnaturals** (formerly "All Naturals Cosmetics", Barrie ON) under the **"Sun & Soil"** rebrand. Engagement: Rethink Reality / Salvus Immersa.

- **Live:** https://asn-shea.netlify.app  (`asn.netlify.app` was taken globally → using `asn-shea` until a real domain is pointed).
- **Canonical PRD:** `../NEW DESIGN/Shea_Allnaturals_Project_Overview_and_PRD.md`. Design spec + plans: `../docs/superpowers/` (spec, Plan A foundation+spike, Plan B pages).
- **Detailed living status + changelog:** `docs/PROJECT-STATUS.md` ← read this for full "what's done / next".

## Stack & how to run
- **Next.js 16.2.9 (App Router, Turbopack) · React 19.2 · Tailwind v4** (tokens in `app/globals.css` `@theme` — NO tailwind config file) · **shadcn (Base UI, not Radix) + glasscn** liquid-glass · **framer-motion v12** · React-Three-Fiber/drei (the 3D hero is currently parked, see below) · self-hosted fonts (Quicksand wordmark / Clash Display headlines / General Sans body). See `AGENTS.md` (imported above) for Next-16 gotchas.
- **Use `npm`/`npx` only — pnpm is broken in this environment.**
- Dev: `npm run dev` · Build: `npm run build` · Test: `npm test` (Vitest, 65 tests) · Seed catalog: `npm run seed` · Images: `npm run images`.
- **Deploy:** `npx netlify deploy --build --prod` (Netlify CLI is authed as Dapo Ajisafe / RethinkReality; repo linked to site `asn-shea`). **OneDrive gotcha:** OneDrive locks `.next/`/`.netlify/` → EPERM. Fix: `Remove-Item -Recurse -Force .next` (and the `.netlify` lock) or deploy from a copy outside OneDrive (e.g. `C:\Temp`).

## Architecture (where things live)
- **Commerce data** flows through one typed interface: `lib/shopify/index.ts` (`store: StoreClient`). v1 uses a **mock adapter** (`lib/shopify/mock/adapter.ts`) seeded from the real catalog CSV → `lib/shopify/mock/catalog.json` (113 products / 208 variants / 22 collections; `bulk-wholesale` bucket kept separate from retail). **Swap to the real Shopify Storefront API behind this same interface** when a token exists (set `SHOPIFY_STOREFRONT_TOKEN`).
- **Cart** is client-side: `components/cart/` (`CartProvider` → localStorage `shea-cart-v1`, `CartDrawer` glass, `AddToCartButton`), pure logic in `lib/cart/state.ts`. Shaped like a Storefront cart so it swaps cleanly. **Checkout is a deliberate STUB** (alert, no payment) until Shopify is wired.
- **Pages:** `app/page.tsx` (home), `app/shop`, `app/collections/[handle]` + `/collections`, `app/products/[handle]` (PDP, all 113 SSG, JSON-LD), `app/cart`, plus coming-soon stubs (`/our-story`, `/journal`, `/wholesale`, `/contact`, `/ingredients`, `/where-to-buy`). `params` are async (Next 16).
- **Components:** `components/{chrome,product,plp,pdp,cart,motion,three,glass,homeland}`. Re-staged product images at `public/media/<handle>/01.webp` (originals backed up `00-orig.webp`). Decorative cutouts `public/decor/`, trust badges `public/badges/`, hero video `public/video/`.

## Conventions (hard rules)
- **NEVER use blue.** Warm "Sun & Soil" palette only: cream `#F5ECDA`, marigold `#EBA52C`, orange `#E2742B`, clay `#D24E2B` (primary CTA), green `#2F7D4F` (natural credentials), espresso `#2A1E14` (text), leaf/maple red `#D5372A` (Canada + badges). **Site background is WHITE; cream is a strategic accent only.**
- **Honor `prefers-reduced-motion`** on every animation. **AA contrast.** Sentence case.
- **Glass (glasscn) is for OVERLAY CHROME only** (nav, cart drawer, hero/quick-add overlays) — never on product cards (on white it reads grey). Product cards = white, rounded (`--radius-card` 28px), layered drop shadow, hover-lift, uniform height.
- **Imagery recipe (Higgsfield):** re-stage products via `image_auto`/`nano_banana_pro` with the product photo + the brand **seal** emblem (job `6998b459…`) as references, on a clean white→cream backdrop, label = the Shea seal + product name in marigold/clay/cocoa, never blue. Full recipe + asset IDs in the memory note `reference-shea-higgsfield-assets`.

## Status (2026-06-25)
Done & live: Plan A spike → Plan B full storefront (shop/PLP/PDP/cart) → design revision to a **clean white site** with rounded elevated uniform cards → **43 products re-staged** with the seal label → **video hero** (dimmed/warm, no blue; 3D hero parked in `components/three/` for reuse) → **green scroll-pop "homeland" scene** (mudcloth + floating botanical cutouts) → trust badges + "where to buy" strip + decorative accents.

**Next steps** (see `docs/PROJECT-STATUS.md` for detail):
1. Homeland: background-remove the 2 product shots so they float transparently (they currently read as cream cards on green).
2. Fix the stray `/pages/our-story` prefetch 404 (real `/our-story` works — find the bad link).
3. Collection imagery — a fitting image per collection.
4. Site-manifest parity audit vs the old site's 198 URLs (`../NEW DESIGN/all_naturals_site_manifest.csv`).
5. Optional: a fresh on-brand hero video (no old labels).
6. **Plan C** — real Shopify (Storefront token + hosted checkout swapping the mock adapter/cart), Customer Accounts, predictive search, 301 redirect map, CWV/Lighthouse + a11y hardening.
