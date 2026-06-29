import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";

export const metadata: Metadata = {
  title: "Wholesale & Bulk — Shea Allnaturals",
  description:
    "Stock Shea Allnaturals in your store, spa or salon. Bulk sizes, private-label and distributor options — handcrafted natural skincare from Barrie, Ontario.",
};

const FOR_WHO = [
  { label: "Retailers", detail: "Boutiques, pharmacies and natural-health stores." },
  { label: "Spas & Salons", detail: "Treatment-room sizes and back-bar bulk." },
  { label: "Private Label", detail: "Our formulas, your brand — made to order." },
];

const STEPS = [
  { n: "01", t: "Tell us what you need", d: "Products, sizes, volumes and timelines." },
  { n: "02", t: "We send a quote", d: "Wholesale pricing, lead times and minimums." },
  { n: "03", t: "We make & ship", d: "Small-batch, hand-finished, shipped Canada-wide." },
];

export default function WholesalePage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-espresso/08 bg-cream px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <AccentCorners corners={{ tl: "argan", br: "castor" }} size={150} opacity={0.1} />
        <div className="relative z-10 mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
              <li><Link href="/" className="transition-colors hover:text-espresso">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-espresso/80">Wholesale</li>
            </ol>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Wholesale &amp; bulk</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-espresso sm:text-5xl lg:text-6xl">
            Stock skincare people<br className="hidden sm:block" /> come back for.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-espresso/65 sm:text-lg">
            Already on shelves at major Canadian retailers — bring Shea
            Allnaturals to your store, spa or salon with bulk sizes, distributor
            pricing and private-label options.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-orange">
              Request wholesale pricing →
            </Link>
            <Link href="/collections/bulk-wholesale" className="inline-flex items-center text-sm font-semibold text-espresso/70 transition-colors hover:text-clay">
              Browse bulk products
            </Link>
          </div>
        </div>
      </header>

      {/* Who it's for */}
      <section aria-label="Who we supply" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <ul className="grid gap-5 sm:grid-cols-3">
          {FOR_WHO.map((w) => (
            <li key={w.label} className="rounded-[1.5rem] border border-green/15 bg-gradient-to-b from-white to-[#EEF6EE]/60 p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_12px_30px_-14px_rgba(42,30,20,0.16)]">
              <p className="font-display text-xl font-semibold text-espresso">{w.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso/65">{w.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works — green band */}
      <section aria-label="How it works" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "shea", bl: "argan" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">How it works</p>
          <h2 className="mb-10 font-display text-2xl font-semibold text-cream sm:text-3xl">Three simple steps.</h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="text-cream">
                <span className="font-display text-3xl font-semibold text-marigold">{s.n}</span>
                <p className="mt-3 font-display text-lg font-semibold">{s.t}</p>
                <p className="mt-1.5 leading-relaxed text-cream/75">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Become a stockist →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
