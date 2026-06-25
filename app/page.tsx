/**
 * Home page — Task 2.5 + design richness pass.
 *
 * Server Component — fetches catalog data, renders sections:
 *   1. VideoHero      — warm-filtered atmospheric video backdrop hero
 *   2. Featured       — "Find your essentials" product grid (12 re-staged cards)
 *                       with subtle decor accent in the header
 *   3. BotanicalBand  — trust badges (4 credential roundels) replacing SVG icons
 *   4. HomelandBand   — deep GREEN scroll-pop scene (was espresso)
 *   5. WhereToBuyBand — typographic retail stockist strip
 *
 * Data strategy:
 *   - Fetch the 12 re-staged handles in parallel; filter nulls.
 *   - Order is exact (oils, butters, jars, soap diversity).
 *
 * Never blue. Honors prefers-reduced-motion (RevealText / ProductCard handle it).
 */

import Image from "next/image";
import Link from "next/link";

import { VideoHero } from "@/components/three/VideoHero";
import { ProductCard } from "@/components/product/ProductCard";
import { RevealText } from "@/components/motion/RevealText";
import { TrustBadges } from "@/components/trust/TrustBadges";
import { HomelandScene } from "@/components/homeland/HomelandScene";
import { store } from "@/lib/shopify";
import type { Product } from "@/lib/shopify/types";

// ── Featured set — wave-1 re-staged handles, exact order ─────────────────────
const FEATURED_HANDLES = [
  "peppermint-essential-oil",
  "100-organic-argan-oil-2",
  "cocoa-shea-butter",
  "100-pure-shea-butter-2",
  "argan-oil-body-butter",
  "all-over-oil",
  "100-black-jamaican-castor-oil",
  "shea-butter-massage-oil",
  "black-soap-facial-wash",
  "100-sweet-almond-oil",
  "argan-oil-shampoo",
  "shea-butter-hair-scalp-oil-2",
] as const;

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getFeaturedProducts(): Promise<Product[]> {
  const results = await Promise.all(
    FEATURED_HANDLES.map((h) => store.getProduct(h))
  );
  return results.filter((p): p is Product => p != null);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── 1. Hero — warm atmospheric video backdrop ────────────────────── */}
      <VideoHero />

      {/* ── 2. Featured products ─────────────────────────────────────────── */}
      <FeaturedSection products={featured} />

      {/* ── 3. Trust badges band ─────────────────────────────────────────── */}
      <BotanicalBand />

      {/* ── 4. Homeland green scroll-pop scene ───────────────────────────── */}
      <HomelandBand />

      {/* ── 5. Where to buy ──────────────────────────────────────────────── */}
      <WhereToBuyBand />
    </>
  );
}

// ── Featured products section ─────────────────────────────────────────────────

function FeaturedSection({ products }: { products: Product[] }) {
  return (
    <section
      id="products"
      aria-label="Featured products"
      className="relative bg-white py-20 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* ── Subtle decor accent — leaves peeking from top-right ──────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 pointer-events-none select-none"
        style={{
          width: "clamp(100px, 14vw, 200px)",
          opacity: 0.08,
          transform: "translate(20%, -15%) rotate(-20deg)",
        }}
      >
        <Image
          src="/decor/leaves.webp"
          alt=""
          width={300}
          height={300}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {/* ── Subtle oil decor — bottom-left corner ────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 pointer-events-none select-none"
        style={{
          width: "clamp(70px, 10vw, 140px)",
          opacity: 0.07,
          transform: "translate(-20%, 20%) rotate(15deg)",
        }}
      >
        <Image
          src="/decor/oil.webp"
          alt=""
          width={200}
          height={280}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-marigold text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Handcrafted in Barrie, Ontario
            </p>
            <RevealText
              text={"Find your\nessentials."}
              as="h2"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-espresso leading-[1.05] tracking-tight"
            />
            <p className="mt-4 text-espresso/60 text-base max-w-sm leading-relaxed">
              Pure botanicals, cold-pressed oils and shea butter — made the
              old way, for skin that remembers.
            </p>
          </div>

          {/* "Shop all" — desktop */}
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-espresso/70 hover:text-clay transition-colors duration-200 shrink-0 pb-1 group"
          >
            Shop all
            <span
              className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* Product grid — 2 cols → 3 → 4; 12 cards = 3 clean rows of 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={i < 4}
              badgeOverride={
                i < 4
                  ? { label: "Bestseller", classes: "bg-clay/12 text-clay border border-clay/30" }
                  : undefined
              }
            />
          ))}
        </div>

        {/* "Shop all" — mobile */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-semibold text-espresso hover:border-clay hover:text-clay transition-colors duration-200"
          >
            Shop all products →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Trust badges band ─────────────────────────────────────────────────────────
// Replaces the SVG-icon credential strip with actual badge images.
// Cream surface with stagger-reveal animation.

function BotanicalBand() {
  return (
    <section
      aria-label="Our credentials"
      className="bg-cream border-y border-espresso/08 py-12 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Overline */}
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-espresso/40 mb-8">
          Why Shea Allnaturals
        </p>
        {/* Badge grid — TrustBadges is client-side for the stagger animation */}
        <TrustBadges />
      </div>
    </section>
  );
}

// ── Homeland green band ───────────────────────────────────────────────────────
// Deep botanical green backdrop with mudcloth texture and scroll-pop decor.

function HomelandBand() {
  return (
    <section
      id="story"
      aria-label="Skincare with a homeland"
      className="relative overflow-hidden"
      style={{ background: "#245F3C" /* slightly deeper than green token for richness */ }}
    >
      {/* Radial warmth wash — warm centre glow to keep the green from reading cold */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(235,165,44,0.09) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 80% at 80% 30%, rgba(226,116,43,0.06) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Mudcloth texture + floating decor elements (client component) */}
      <HomelandScene />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text column */}
          <div>
            <p className="text-marigold text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              West Africa · Barrie, Ontario
            </p>

            <RevealText
              text={"Skincare with\na homeland."}
              as="h2"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream leading-[1.05] tracking-tight"
              delay={0.1}
            />

            <p className="mt-6 text-cream/75 text-base sm:text-lg leading-relaxed max-w-md">
              Every jar starts with raw shea nuts and botanical oils sourced
              directly from West Africa — then cold-pressed, blended, and
              small-batch finished here in Barrie, Ontario. No fillers. No
              shortcuts. Just the land&rsquo;s best, distilled.
            </p>

            <div className="mt-10 flex items-center gap-5 flex-wrap">
              <Link
                href="/pages/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-marigold text-espresso px-7 py-3 text-sm font-semibold hover:bg-orange hover:text-cream transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-green"
              >
                Our story →
              </Link>
              <Link
                href="/shop"
                className="text-sm font-semibold text-cream/70 hover:text-cream transition-colors duration-200"
              >
                Shop essentials
              </Link>
            </div>
          </div>

          {/* Right column — spacer; the decor elements (from HomelandScene)
              fill this zone with the floating product imagery */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        {/* Ingredient callout strip */}
        <div className="mt-20 pt-10 border-t border-cream/12 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          {[
            { label: "Shea Butter", detail: "Unrefined, hand-scooped" },
            { label: "Argan Oil", detail: "Cold-pressed, Moroccan-origin" },
            { label: "Black Soap", detail: "Sun-dried plantain ash" },
          ].map(({ label, detail }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-marigold text-xs font-semibold uppercase tracking-[0.15em]">
                {label}
              </span>
              <span className="text-cream/50 text-sm">{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Where to Buy strip ────────────────────────────────────────────────────────
// Typographic retailer strip — no fake logos, just refined espresso names.
// Cream background, separated from footer by a warm border.

const STOCKISTS = [
  "Walmart",
  "Shoppers Drug Mart",
  "Pharmaplus",
  "Jean Coutu",
  "Rexall",
];

function WhereToBuyBand() {
  return (
    <section
      aria-label="Where to buy"
      className="relative bg-cream border-t border-espresso/08 py-14 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Faint shea-nuts decor — top right */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 pointer-events-none select-none"
        style={{
          width: "clamp(80px, 10vw, 140px)",
          opacity: 0.06,
          transform: "translate(15%, -10%) rotate(30deg)",
        }}
      >
        <Image
          src="/decor/shea-nuts.webp"
          alt=""
          width={250}
          height={250}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Heading */}
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-espresso/35 mb-2">
          Also available at
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-espresso mb-10 tracking-tight">
          Find us in store
        </h2>

        {/* Retailer names — clean typographic treatment with marigold dot separators */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          {STOCKISTS.map((name, i) => (
            <span key={name} className="flex items-center gap-3 sm:gap-4">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="block w-1 h-1 rounded-full shrink-0"
                  style={{ background: "rgba(235,165,44,0.6)" }}
                />
              )}
              <span className="text-sm sm:text-base font-semibold text-espresso/55 tracking-wide">
                {name}
              </span>
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-espresso/40 max-w-xs mx-auto leading-relaxed">
          Available online and in select retail locations across Canada.
        </p>

        <Link
          href="/where-to-buy"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-clay/80 hover:text-clay underline-offset-4 hover:underline transition-colors duration-200 uppercase tracking-[0.15em]"
        >
          Full store finder →
        </Link>
      </div>
    </section>
  );
}
