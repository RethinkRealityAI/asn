/**
 * Home page — Task 2.5: Premium design-spike homepage.
 *
 * Server Component — fetches catalog data, renders three sections:
 *   1. Hero3D   — scroll-scrubbed 3D peppermint-oil moment (unchanged)
 *   2. Featured — "Find your essentials" product grid (12 re-staged cards)
 *   3. Homeland — cinematic dark espresso band: "Skincare with a homeland."
 *
 * Data strategy (updated wave-1):
 *   - Fetch the 12 re-staged handles by name in the prescribed order.
 *   - Promise.all so fetches are parallel; filter out any null results.
 *   - Order is exact (oils, butters, jars, soap diversity).
 *
 * Never blue. Honors prefers-reduced-motion (RevealText / ProductCard handle it).
 */

import Image from "next/image";
import Link from "next/link";

import { Hero3D } from "@/components/three/Hero3D";
import { ProductCard } from "@/components/product/ProductCard";
import { RevealText } from "@/components/motion/RevealText";
import { store } from "@/lib/shopify";
import type { Product } from "@/lib/shopify/types";

// ── Featured set — wave-1 re-staged handles, exact order ─────────────────────
// Diverse mix: oils, butters, jars, soap. All 12 have clean cream re-staged imagery.
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
  // Fetch the exact 12 re-staged products in parallel, preserve order.
  const results = await Promise.all(
    FEATURED_HANDLES.map((h) => store.getProduct(h))
  );
  // Filter out any null/undefined (graceful degradation if a handle is missing).
  return results.filter((p): p is Product => p != null);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── 1. Hero — scroll-scrubbed 3D peppermint reveal ─────────────── */}
      <Hero3D />

      {/* ── 2. Featured products ─────────────────────────────────────────── */}
      <FeaturedSection products={featured} />

      {/* ── 3. Homeland dark band ─────────────────────────────────────────── */}
      <HomelandBand />
    </>
  );
}

// ── Featured products section ─────────────────────────────────────────────────

function FeaturedSection({ products }: { products: Product[] }) {
  return (
    <section
      id="products"
      aria-label="Featured products"
      className="bg-cream py-20 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-7xl mx-auto">
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
            href="/collections/all"
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
            />
          ))}
        </div>

        {/* "Shop all" — mobile */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-semibold text-espresso hover:border-clay hover:text-clay transition-colors duration-200"
          >
            Shop all products →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Homeland dark band ────────────────────────────────────────────────────────

function HomelandBand() {
  return (
    <section
      id="story"
      aria-label="Skincare with a homeland"
      className="relative bg-espresso text-cream overflow-hidden"
    >
      {/* Radial warmth wash — orange-clay centre glow, grain shows through */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(226,116,43,0.13) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 80% at 80% 30%, rgba(235,165,44,0.07) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

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

            <p className="mt-6 text-cream/70 text-base sm:text-lg leading-relaxed max-w-md">
              Every jar starts with raw shea nuts and botanical oils sourced
              directly from West Africa — then cold-pressed, blended, and
              small-batch finished here in Barrie, Ontario. No fillers. No
              shortcuts. Just the land&rsquo;s best, distilled.
            </p>

            <div className="mt-10 flex items-center gap-5 flex-wrap">
              <Link
                href="/pages/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-marigold text-espresso px-7 py-3 text-sm font-semibold hover:bg-orange hover:text-cream transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
              >
                Our story →
              </Link>
              <Link
                href="/collections/all"
                className="text-sm font-semibold text-cream/70 hover:text-cream transition-colors duration-200"
              >
                Shop essentials
              </Link>
            </div>
          </div>

          {/* Image column — editorial stacked product duo */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md h-[420px] sm:h-[480px]">
              {/* Back card — Cocoa Shea Butter */}
              <div
                className="absolute top-0 left-0 w-[52%] rounded-2xl overflow-hidden shadow-[0_20px_60px_0_rgba(0,0,0,0.5)]"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="relative aspect-[4/5]" style={{ background: "#2A1E14" }}>
                  <Image
                    src="/media/cocoa-shea-butter/02.webp"
                    alt="Cocoa Shea Butter"
                    fill
                    sizes="(max-width: 768px) 40vw, 22vw"
                    className="object-cover mix-blend-luminosity opacity-75"
                  />
                </div>
              </div>

              {/* Front card — 100% Pure Shea Butter */}
              <div
                className="absolute bottom-0 right-0 w-[60%] rounded-2xl overflow-hidden shadow-[0_28px_80px_0_rgba(0,0,0,0.6)]"
                style={{ transform: "rotate(2.5deg)" }}
              >
                <div className="relative aspect-[4/5]" style={{ background: "#3A2A1C" }}>
                  <Image
                    src="/media/100-pure-shea-butter-2/01.webp"
                    alt="100% Pure Shea Butter"
                    fill
                    sizes="(max-width: 768px) 45vw, 26vw"
                    className="object-cover mix-blend-luminosity opacity-80"
                    priority
                  />
                </div>
              </div>

              {/* Decorative marigold rings */}
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full border border-marigold/20 pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full border border-marigold/10 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Ingredient callout strip */}
        <div className="mt-20 pt-10 border-t border-cream/10 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
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
