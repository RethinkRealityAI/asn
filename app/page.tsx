/**
 * Home page — premium redesign pass.
 *
 * Sections:
 *   1. ImageHero    — bright WHITE hero, vibrant parallax product bottles ("wow")
 *   2. Featured     — "Find your essentials" product wall (12 re-staged cards)
 *   3. CraftBand    — the CLEAN (un-dimmed) promo video + copy + 4 credential icons
 *   4. HomelandBand — deep-green heritage scene with LARGE product imagery
 *   5. MediaTeaser  — heritage films + press, links to /media
 *   6. WhereToBuyBand — typographic stockist strip
 *
 * Botanical cutouts are used as consistent CORNER accents (AccentCorners),
 * not scattered floats. Never blue. Honors prefers-reduced-motion.
 */

import Image from "next/image";
import Link from "next/link";

import { ImageHero } from "@/components/hero/ImageHero";
import { ProductCard } from "@/components/product/ProductCard";
import { RevealText } from "@/components/motion/RevealText";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { CraftBand } from "@/components/home/CraftBand";
import { HomelandBand } from "@/components/home/HomelandBand";
import { MediaTeaser } from "@/components/home/MediaTeaser";
import { STORES } from "@/lib/content/stores";
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

async function getFeaturedProducts(): Promise<Product[]> {
  const results = await Promise.all(
    FEATURED_HANDLES.map((h) => store.getProduct(h))
  );
  return results.filter((p): p is Product => p != null);
}

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <ImageHero />
      <FeaturedSection products={featured} />
      <CraftBand />
      <HomelandBand />
      <MediaTeaser />
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
      className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 lg:px-12"
    >
      <AccentCorners corners={{ tl: "argan", br: "castor" }} size={150} />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
              Handcrafted in Barrie, Ontario
            </p>
            <RevealText
              text={"Find your essentials."}
              as="h2"
              className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl"
            />
            <p className="mt-4 max-w-md text-base leading-relaxed text-espresso/60">
              Pure botanicals, cold-pressed oils and shea butter — made the old
              way, for skin that remembers.
            </p>
          </div>

          <Link
            href="/shop"
            className="group hidden shrink-0 items-center gap-1.5 pb-1 text-sm font-semibold text-espresso/70 transition-colors duration-200 hover:text-clay sm:inline-flex"
          >
            Shop all
            <span className="inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Product wall — generous gaps, large cards */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-7">
          {products.map((product, i) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={i < 4}
              badgeOverride={
                i < 4 ? { label: "Bestseller", classes: "bg-green text-white" } : undefined
              }
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-semibold text-espresso transition-colors duration-200 hover:border-clay hover:text-clay"
          >
            Shop all products →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Where to Buy strip ────────────────────────────────────────────────────────

function WhereToBuyBand() {
  return (
    <section
      aria-label="Where to buy"
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-12"
      style={{ background: "linear-gradient(135deg, #F0A93A 0%, #E2742B 55%, #D24E2B 100%)" }}
    >
      {/* Big botanical accents filling all four corners for life */}
      <AccentCorners corners={{ tl: "castor", tr: "argan", bl: "shea", br: "castor" }} tone="light" size={360} opacity={0.18} />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-espresso/70">
          Also available at
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-espresso sm:text-5xl lg:text-6xl">
          Find us in store.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-espresso/75">
          Loved online and on shelves — find Shea Allnaturals at major retailers
          right across Canada.
        </p>

        {/* Stockist cards — true liquid glass (frosted over the orange) */}
        <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {STORES.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-white/50 bg-white/30 px-4 py-8 backdrop-blur-xl transition-all duration-200 ease-[--ease-warm] hover:-translate-y-1.5 hover:bg-white/45 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-10px_22px_-12px_rgba(255,255,255,0.4),0_16px_36px_-14px_rgba(42,30,20,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-orange"
              >
                <span className="font-display text-base font-semibold leading-tight text-espresso sm:text-lg">
                  {s.name}
                </span>
                {s.note && (
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-espresso/65">
                    {s.note}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/where-to-buy"
          className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-espresso px-7 py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-espresso/85"
        >
          Full store finder →
        </Link>
      </div>
    </section>
  );
}
