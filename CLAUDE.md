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
- **Deploy:** `npx netlify deploy --build --prod` (Netlify CLI is authed as Dapo Ajisafe / RethinkReality; repo linked to site `asn-shea`). **OneDrive gotcha:** OneDrive locks `.next/`/`.netlify/` → EPERM. Fix: `Remove-Item -Recurse -Force .next` (and the `.netlify` lock) or deploy from a copy outside OneDrive (e.g. `C:\Temp`). **⚠️ NEVER run `npm run build` or `rm -rf .next` while `npm run dev` is running** — they share `.next`, and clearing/overwriting it corrupts the dev server's Turbopack cache (panic: "Failed to open SST file … os error 3" → every route 500s). Stop the dev/preview server first, then build; restart dev with a fresh `.next` afterward.

## Architecture (where things live)
- **Commerce data** flows through one typed interface: `lib/shopify/index.ts` (`store: StoreClient`). v1 uses a **mock adapter** (`lib/shopify/mock/adapter.ts`) seeded from the real catalog CSV → `lib/shopify/mock/catalog.json` (113 products / 208 variants / 22 collections; `bulk-wholesale` bucket kept separate from retail). **Swap to the real Shopify Storefront API behind this same interface** when a token exists (set `SHOPIFY_STOREFRONT_TOKEN`).
- **Cart** is client-side: `components/cart/` (`CartProvider` → localStorage `shea-cart-v1`, `CartDrawer` glass, `AddToCartButton`), pure logic in `lib/cart/state.ts`. Shaped like a Storefront cart so it swaps cleanly. **Checkout is a deliberate STUB** (alert, no payment) until Shopify is wired.
- **Pages:** `app/page.tsx` (home), `app/shop`, `app/collections/[handle]` + `/collections`, `app/products/[handle]` (PDP, all 113 SSG, JSON-LD), `app/cart`, plus coming-soon stubs (`/our-story`, `/journal`, `/wholesale`, `/contact`, `/ingredients`, `/where-to-buy`). `params` are async (Next 16).
- **Components:** `components/{chrome,product,plp,pdp,cart,motion,three,glass,homeland}`. Re-staged product images at `public/media/<handle>/01.webp` (originals backed up `00-orig.webp`). Decorative cutouts `public/decor/`, trust badges `public/badges/`, hero video `public/video/`.

## Conventions (hard rules)
- **Palette is warm "Sun & Soil" only** in the UI: cream `#F5ECDA`, marigold `#EBA52C`, orange `#E2742B`, clay `#D24E2B` (primary CTA), green `#2F7D4F` (natural credentials), espresso `#2A1E14` (text), leaf/maple red `#D5372A`. **Site background is WHITE; cream is a strategic accent only** — the client dislikes brown/beige overuse, so favour green/orange/marigold pops on white; espresso only where it grounds (footer, body text).
- **⚠️ LOGO EXCEPTION — the wordmark is NAVY BLUE `#1d2c71`** (`public/brand/wordmark-{horizontal,stacked}.png`, recolored from the brown via a sharp pixel pass; red maple leaf kept). Client decision 2026-06-28: keep the original blue logo so the site matches the blue logo printed on existing product labels (brand recognition), until labels are reprinted. The brown HD originals remain in `../NEW DESIGN/`. The rest of the UI stays warm/no-blue.
- **Honor `prefers-reduced-motion`** on every animation. **AA contrast.** Sentence case.
- **Glass (glasscn) is for OVERLAY CHROME only** (nav, cart drawer, hero/quick-add overlays) — never on product cards (on white it reads grey). Product cards = white, rounded (`--radius-card` 28px), layered drop shadow, hover-lift, uniform height.
- **Imagery (current direction — 2026-06-26):** use the **REAL product photos** (authentic bilingual labels) imported from the asset bundle via `npm run images`. The old **AI "seal" re-staging is RETIRED** — the client rejected the fabricated seal icon + generic wordmark; product labels must be authentic (old-blue-logo originals are fine). Enhance real photos only via **AI background-removal** (clean cutouts → `public/hero/`) + nestle **botanical decor** (`public/decor/` leaves/shea-nuts) to accentuate and cover cutout notches. The new **maple-leaf logo** (`public/brand/wordmark-{horizontal,stacked}.png`) is for **site chrome only** (and any *newly generated* product renders) — never AI-baked onto real product labels. Seal asset IDs remain in the memory note `reference-shea-higgsfield-assets` for reference only.

## Testing (TDD standard — enforced from 2026-06-30)
Every new feature, bug fix, or behavior change **requires a failing test first**. Red → Green → Refactor. No exceptions.
- Test runner: **Vitest** (`npm test`). Config: `vitest.config.ts` — node environment, no jsdom. Tests live in `test/` or colocated as `*.test.ts`.
- Current baseline: **92/92 tests passing** across 9 files (cart, adapter, seed, collections, filters, jsonld, images, assets, wholesale).
- `test/assets.test.ts` — brand/decor/pail asset existence + size guards. **Run after any image asset change.**
- `test/wholesale.test.ts` — bulk-wholesale collection isolation, pail path consistency.
- Future tests go in `test/` for data/logic, or colocated `*.test.ts` for lib modules.

## Status (2026-07-10) — PLAN C: LIVE SHOPIFY
**143/143 tests**, `tsc` clean. The store now runs on **real Shopify** (`shea-allnaturals.myshopify.com`, Basic plan, CAD):
- **113 products + 22 collections live in Shopify** (CSV import + MCP collectionCreate; memberships verified to match `deriveCollections` exactly; Shopify's built-in `frontpage` collection is filtered out by the adapter).
- **Storefront adapter** (`lib/shopify/storefront/adapter.ts` + shared `client.ts` fetcher) drives the site when `SHOPIFY_STOREFRONT_TOKEN`+`SHOPIFY_STORE_DOMAIN` are set (`.env.local` + Netlify env, all contexts). Curated `/media` imagery overlays Shopify CDN images via shared `lib/shopify/local-images.ts`.
- **Real checkout:** `CheckoutButton` (drawer + cart page) creates a Shopify cart from local state (`lib/cart/checkout.ts`) and redirects to the hosted `checkoutUrl`. Cart storage key bumped to `shea-cart-v2` (discards mock-era carts with non-GID variant ids). Uses `NEXT_PUBLIC_SHOPIFY_*` env (Storefront token is public-by-design).
- **301 redirects:** Netlify CDN-native `public/_redirects` (166 entries) generated by `npm run redirects` from `data/source/all_naturals_site_manifest.csv`. (Next 16 `proxy.ts` was tried and REMOVED — `@netlify/plugin-nextjs` 5.x cannot bundle Turbopack-built middleware: `Cannot find module './chunks/[turbopack]_runtime.js'`. Don't reintroduce proxy.ts while deploying to Netlify.)
- **Deploy gotchas (C:\Temp\asn-src staging):** (1) EPERM `rmdir .netlify\static\<anything>` = the plugin **cannot remove a pre-existing `.netlify/static` tree on Windows** — before EVERY deploy, clear `.netlify` except `state.json` (`Get-ChildItem .netlify -Exclude state.json | Remove-Item -Recurse -Force`) and `.next`. Also keep `public/` free of empty dirs (same EPERM). (2) `MissingBlobsEnvironmentError` = broken/missing `.netlify/state.json`; if writing it from PowerShell 5.1, `-Encoding utf8` adds a **BOM** that breaks the CLI's JSON parse — write BOM-free (`[IO.File]::WriteAllText` with `UTF8Encoding($false)`). (3) `netlify link --id` may link the WRONG project — verify with `npx netlify status` (must say asn-shea / 80ce3c12-…) before deploying.
- **Shipping** configured in Shopify (Domestic Standard/Express, US cross-border, Intl via Canada Post). **⚠️ Pending merchant actions:** disable Online Store password protection (checkout URLs redirect to /password until then), paste policies from `docs/shopify-policies.md` (connector lacks `write_legal_policies`), connect PayPal/payments, then delete the `checkout-test-product` ($1) after the payment test.
- **Shopify MCP gotchas:** blocks `bulkOperationRunMutation`, `storefrontAccessTokenCreate`, `write_legal_policies`. Product loads → native CSV import (`scripts/shopify-csv.ts` → `shea-products-import.csv`); collections → aliased `collectionCreate` batches (generate payloads with a script and READ them — never hand-type GID lists).

## Status (2026-06-30)
Build green: **150 static pages**, `tsc` clean, **92/92 tests**. Live: https://asn-shea.netlify.app

This pass (all shipped to the working tree):
- **Real logo** (`public/brand/wordmark-{horizontal,stacked}.png`, proper red maple leaf + ™) replaces the old text wordmark in `Wordmark.tsx` (image-based, `variant` + `tone` props). Horizontal in chrome bars/headers; stacked on ComingSoon.
- **Nav cleanup:** removed *Our Story* + *Journal (blog)*; added **Media** + **Contact** (Header, MobileMenu, Footer).
- **Accent system:** `components/motion/AccentCorners.tsx` — the one consistent way to dress block corners with botanicals (replaces the old scattered floats). Applied across home/shop/collections/contact/media.
- **Hero:** `components/hero/ImageHero.tsx` — bright WHITE hero, **real product cutouts** (peppermint/argan/shea-butter) + botanical accents, mouse + scroll parallax, staggered reveal, reduced-motion safe. (Video hero retired; `VideoHero`/3D hero still parked in `components/three/`.)
- **CraftBand** (`components/home/`): the **clean** (un-dimmed) promo video (`public/video/promo.*`) + copy + the 4 credential icons.
- **HomelandBand** rebuilt: **big** real product imagery (cocoa/shea-butter/castor) on green + botanical accents.
- **MediaTeaser** + **`/media`**: real heritage films (Fufu shea-making 2022, community donation 2024, Whole Life Expo 2015) via `LiteYouTube`, ALIVE Magazine press. Data in `lib/content/media.ts`.
- **`/contact`**: real address/phone/email/hours + socials + mailto `ContactForm` + Google Maps embed.
- **`/collections`**: `CategoryCard` — real product cover + **frosted-glass label** (glass over imagery) + corner accent, fully rounded.
- **Product imagery RESTORED to real photos** site-wide (`npm run images` re-import; **212 real images**, index rebuilt; 43 seal re-stages overwritten; 00-orig backups deleted). PDP galleries show all real images.

**Next steps:**
1. Owner preview → nudge hero/homeland product + accent positions (the parallax layer %s are first-pass).
2. Redeploy to Netlify after sign-off.
3. **Plan C** — real Shopify (Storefront token + hosted checkout), Customer Accounts, predictive search, 301 redirect map, CWV/Lighthouse + a11y hardening.
