# Shea Allnaturals Storefront — Project Status

_Last updated: 2026-06-30 · Live: https://asn-shea.netlify.app_

This is the living "what's done / what's next" record. For architecture, conventions, and run/deploy commands see `CLAUDE.md` (+ `AGENTS.md` for Next-16 technical notes). The original design spec and phased plans live in `../docs/superpowers/`.

---

## ✅ Done (shipped & live)

### 2026-07-21 About Us section + Private Label (this session)
- **New About Us section** with a header dropdown (`components/about/AboutMenu.tsx`) and a mobile accordion (`MobileMenu.tsx`), plus a shared sticky sub-nav (`AboutSubNav.tsx`) so visitors hop between subpages. Footer "Company" column updated.
- **Hub `/about`** (story + mission + beliefs summary, values, `SectionCarousel.tsx` scroll-snap browser, private-label CTA) and six subpages: `/about/our-story`, `/about/our-mission`, `/about/our-beliefs`, `/about/awards`, `/about/our-ingredients`, `/about/making-a-difference`. Old `/our-story` and `/ingredients` now 307-redirect into the section.
- **Interactive INCI index** (`IngredientsTable.tsx`): the brand's authoritative 360-ingredient common-name ↔ INCI list (`scripts/data/inci.csv` → `lib/content/ingredients-inci.ts` via `scripts/build-inci.mjs`), searchable + category-filterable, desktop table / mobile cards.
- **Private Label page** `/private-label` — ANCI contract-manufacturing pitch (capabilities, product-category examples, mailto inquiry form mirroring the legacy Services fields). Content in `lib/content/private-label.ts`.
- Content sourced from the legacy allnaturalscosmetics.com pages (about/beliefs/mission/awards/making-a-difference) + client-supplied copy, all typed in `lib/content/about.ts`.
- **Tests:** +20 in `test/about.test.ts` (data-model integrity) → **112 passing**. Build green: **158 static pages**, `tsc` clean.

### 2026-06-30 redesign polish (this session)
- **Hero cloth** (`public/decor/cloth2.webp`): new warm African mudcloth generated via Higgsfield; repositioned to full-width backdrop (120% wide, CSS mask-gradient fade on left edge) so it wraps behind all three hero products.
- **PageHeader cloth**: updated to `cloth2.webp`, position tightened (`-bottom-[4%]`, `w-[52%]`) to close the gap that appeared at bottom of section headers.
- **Wholesale pail logos fixed**: all three `public/hero/pail-*.webp` now carry the real "Shea ★ Allnaturals™" wordmark. Originals re-downloaded from Higgsfield CDN at 1024×1024; `fix-pail-logos.js` (sharp composite) patched each with a per-pail y-position. Committed and live.
- **TDD baseline expanded**: 9 test files, **92 passing tests** (up from 65). Added `test/assets.test.ts` (brand/decor/pail asset existence + size guards) and `test/wholesale.test.ts` (bulk-wholesale collection isolation + pail path consistency).

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

## ⚠️ Findings from the 2026-08 client review pass

**Contact form — 2 unread submissions.** Both `/contact` and `/wholesale` post to
**Netlify Forms** on the `asn-shea` project (not mailto — the
`allnaturals@allnaturalscosmetics.ca` address in `ContactForm.tsx` is only the
fallback link shown in the UI). The `contact` form has **2 submissions, most
recently 2026-08-13**; `wholesale` has none. There is no sign a notification is
configured, so those enquiries are sitting unread in the Netlify dashboard.
**Action:** read them (Netlify → Forms → contact) and set up an email
notification under Forms → Settings → Form notifications.

**Is the old WordPress site still live on the apex?** Netlify reports the
project's primary domain as `https://www.allnaturalscosmetics.com`, but web
searches still surface `allnaturalscosmetics.com/media/`, `/about_anc/` and
`/product/…` as live WordPress pages. Either those are stale index entries, or
the **apex still serves the old site while www serves this one** — which would
be duplicate content competing with the rebuild, and would also mean the
"lost" media/About content is not lost at all. This could not be checked from
the build environment (the domain is blocked by the egress proxy).
**Action:** open `http://allnaturalscosmetics.com` (no www) in a browser. If
WordPress answers, mirror it for the missing content, then point the apex at
Netlify.

**Legacy links inside product descriptions.** 29 absolute links across 21
product descriptions.

- **Fixed (3):** the `allnaturalskincare.ca` links — a different, dead domain,
  so these were hard 404s. Rewritten to relative `/products/…` in
  `neem-oil-acne-face-cream`, `whole-shea-butter` and `black-soap-facial-wash`.
- **Outstanding (26):** links to `allnaturalscosmetics.com/product/…`,
  `/services/` and `/2021/…` blog posts. Every one resolves today *via the
  redirect map*, so they are not broken — but they are absolute links to the
  apex domain, which makes them wrong the moment the apex question above is
  answered either way. A verified rewrite plan (all 26 mapped to live
  destinations, 0 unresolved) was produced during this pass; apply it once the
  apex is confirmed, since relative links are correct in both cases.

**Combo descriptions — recovered in full.** Seven
live combos had a completely empty `descriptionHtml`. Archived captures of the
old WooCommerce product pages (2025–2026) show why: those combos never carried a
long description — the DESCRIPTION accordion is **absent entirely** on every one
of them, matching what the original WooCommerce export shows. Only Combos 4, 8,
10 and 11 ever had the "Pack includes one each of…" body copy.

What the captures *did* preserve is each combo's WooCommerce **short
description**, a one-line tagline that never made it into Shopify. All seven
have now been written to the live store verbatim:

| Combo | Restored tagline |
| --- | --- |
| 1 – Simply Loving Oils | You deserve this ultimate temptation! |
| 2 – Baby Care | Finally, you can liberate your baby's bum from zinc and other chemicals in diaper rash products and his/her skin from petrolatum by-products. |
| 3 – Argan Hair & Body | We offer this line in a combo because we would like you to try our Argan products! |
| 5 – Ageless Care | With Babassu, watch dull, aged skin revitalized into robust healthy complexion! |
| 6 – Youthful Face & Neck | With the Babassu melting like butter into your skin, what else is left to say! |
| 7 – Acne Be Gone | Dedication to this regimen will ensure a clearer, cleaner, well-toned, youthful complexion. |
| 9 – Healthy Nails & Cuticles | We think you will write a review after trying this combo! |

Two side benefits from the same captures: every archived price matches Shopify
exactly (no drift), and the old numbering is confirmed — old Combo 8 → new 7,
old 9 → new 8, old 10 → new 9, the shift caused by the discontinued
*Combo 7 – Healing Oils & Soaps* (tagline, for the record: "We've made it easier
to try the healing oils of the world!").

**Pack contents — read off the product photography.** The contents were never
lost either: each combo's own hero shot is a flat-lay of the exact products in
the pack, at high enough resolution to read every label. All seven now carry a
"Pack includes one each of:" list in the same house style as Combos 4, 8, 10
and 11.

| Combo | Contents read from `public/media/<handle>/01.webp` |
| --- | --- |
| 1 – Simply Loving Oils | Black Jamaican Castor · Shea + Argan · Virgin Olive · Organic Argan · Sweet Almond · Tea Tree (six 100ml bottles) |
| 2 – Baby Care | Shea Baby & Toddler Hair & Body Cleanser 8oz · All-Over Oil · Body & Bum Butter |
| 3 – Argan Hair & Body | Argan Oil Shampoo 8oz/250ml · Argan Oil Conditioner 8oz/250ml · Argan Oil Body Butter · Argan Oil Hair & Locks Balm · 100% Organic Argan Oil 100ml |
| 5 – Ageless Care | Babassu Natural Butter 200ml · Babassu Natural Butter 68ml · Black Soap & Coconut Oil Cleansing Bar |
| 6 – Youthful Face & Neck | Shea Butter Facial Wash · Afrikan Beauty's Black Soap 120g · Babassu Natural Butter 68ml · Skin Renewal Facial Cream |
| 7 – Acne Be Gone | Tea Tree Oil 100ml · Neem Oil Acne Face Cream 4oz/125ml · Neem Oil Acne Bar 120g |
| 9 – Healthy Nails & Cuticles | Shea Butter Nail & Cuticle Remedy 120g · Afrikan Beauty's Black Soap 120g · Shea-Deep Cleansing Bar |

Method, so this is auditable: Combo 4's photo was used as a control — it shows
exactly the three products its existing description lists, confirming the shots
are faithful inventories rather than styling. The one unlabelled item, a pink
translucent bar in Combo 9, was identified as the **Shea-Deep Cleansing Bar** by
elimination: the same bar appears in Combo 8, whose known four-item list
accounts for every other object in frame. Every product identified resolves to a
real catalogue SKU.

**Two naming mismatches surfaced by this pass**, both worth a decision:

- The bottle in Combo 1 is labelled **"Shea + Argan Oil"**; the store lists it as
  **"Argan-Shea Oil"**. Descriptions use the label wording.
- The tub in Combo 3 is labelled **"Argan Oil Hair & Locks Balm"**; the store
  lists it as **"Argan oil Hair & Locks Butter"**. Descriptions use the label
  wording, which also matches the "Hair Oils & Balm" collection rename.

**Still needed from the client:**

- **INCI** for all eleven combos. Not readable at this resolution and absent from
  the four combos that already had body copy, so this genuinely has to come from
  Tim.
- **Two inferred sizes to confirm:** the Castor and Tea Tree bottles in Combo 1
  are stated as 100ml. All six bottles are visibly identical in the shot and the
  other four are confirmed 100ml by their labels and by the archived Combo 12
  copy, but those two were not read directly.
- **Unsized items:** All-Over Oil, Body & Bum Butter, Argan Oil Body Butter,
  Argan Oil Hair & Locks Balm, Shea Butter Facial Wash, Skin Renewal Facial
  Cream and the Shea-Deep Cleansing Bar are listed without a size because none
  is legible on the label.
- **Combo 4's stated body wash size (8oz)** disagrees with the bottle in its own
  photo, which reads 12 fl oz. Pre-existing copy, not changed here.
- Three of the bar soaps in these combos — Afrikan Beauty's Black Soap, the Neem
  Oil Acne Bar and the Black Soap & Coconut Oil bar — are **not sold as
  standalone SKUs**, which is the same gap as the doc's item #22.

**Awards.** Trimmed to the three business/community honours. The Meritorious
Service Medal, Senate of Canada 150 Award and 100 Accomplished Black Canadian
Women were removed: research confirmed via the Governor General's own recipient
record that the MSM was awarded to Lanre Tunji-Ajayi for founding the **Sickle
Cell Awareness Group of Ontario**, a separate organisation. No award to All
Naturals Cosmetics Inc. as a company could be found anywhere. The three
retained awards are sourced only from the client's own prior copy — ask for
certificates and years before presenting them as independently verifiable.

**Press.** No Financial Post article found; the company's own bio page cites
**National Post** (the Financial Post is its business section) — likely the
same item misremembered. No Globe and Mail article could be corroborated. The
ALIVE Magazine piece is real: *"Tropical Topical"*, **bylined by Lanre
herself** (alive.com), so frame it as a contributed article, not coverage.

**Sourcing community spelling.** The community is **Apaola** (not "Apaolo" or
"Akpala") — already correct in `lib/content/about.ts`. Fufu, which received the
cracker/separator machine in January 2024, appears to be a **different**
community; worth confirming with the client.

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
