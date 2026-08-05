import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { WholesaleForm } from "@/components/wholesale/WholesaleForm";

export const metadata: Metadata = {
  title: "Wholesale & Bulk — Shea Allnaturals",
  description:
    "Stock Shea Allnaturals in your store, spa or salon. Bulk sizes, private-label and distributor options — handcrafted natural skincare from Barrie, Ontario.",
};

const FOR_WHO = [
  { label: "Retailers", detail: "Boutiques, pharmacies and natural-health stores.", image: "/headers/wholesale-retailers.webp" },
  { label: "Spas & Salons", detail: "Treatment-room sizes and back-bar bulk.", image: "/headers/wholesale-spa.webp" },
  { label: "Private Label", detail: "Our formulas, your brand — made to order.", image: "/headers/wholesale-private-label.webp" },
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
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Wholesale" }]}
        eyebrow="Wholesale & bulk"
        title="Stock skincare people come back for."
        subtitle="Already on shelves at major Canadian retailers — bring Shea Allnaturals to your store, spa or salon with bulk sizes, distributor pricing and private-label options."
        products={[
          { src: "/hero/pail-shea-butter.webp", alt: "Shea Allnaturals 100% Pure Shea Butter wholesale pail", style: { position: "absolute", right: "15%", bottom: "-9%", width: "21%", maxWidth: "232px", zIndex: 2 } },
          { src: "/hero/pail-cocoa-shea.webp", alt: "Shea Allnaturals Cocoa-Shea Butter wholesale pail", style: { position: "absolute", right: "3%", bottom: "-5%", width: "20%", maxWidth: "214px", zIndex: 1 } },
          { src: "/hero/pail-argan-body.webp", alt: "Shea Allnaturals Argan Oil Body Butter wholesale pail", style: { position: "absolute", right: "27%", bottom: "-3%", width: "18%", maxWidth: "194px", zIndex: 0 } },
          { src: "/decor/shea-nuts.webp", alt: "", style: { position: "absolute", right: "20%", bottom: "-9%", width: "9%", maxWidth: "100px", zIndex: 3 } },
        ]}
      />

      {/* Primary CTAs — kept out of the header so its height matches the other pages */}
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center gap-4">
          <a href="#apply" className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-orange">
            Apply to stock us →
          </a>
          <Link href="/collections/bulk-wholesale" className="inline-flex items-center text-sm font-semibold text-espresso/70 transition-colors hover:text-clay">
            Browse bulk products
          </Link>
        </div>
      </div>

      {/* Who it's for — liquid-glass cards over real imagery */}
      <section aria-label="Who we supply" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {FOR_WHO.map((w) => (
            <li
              key={w.label}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_18px_44px_-16px_rgba(42,30,20,0.22)] transition-all duration-300 ease-[--ease-warm] hover:-translate-y-1.5 hover:[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.9),0_28px_58px_-16px_rgba(42,30,20,0.32)]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={w.image}
                  alt={w.label}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-[--ease-warm] group-hover:scale-[1.05]"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/20 to-transparent" />
              </div>
              {/* frosted-glass label panel (glass shines over imagery) */}
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/40 bg-white/20 p-5 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_8px_24px_-10px_rgba(42,30,20,0.4)]">
                <p className="font-display text-xl font-semibold text-cream">{w.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream/85">{w.detail}</p>
              </div>
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
            <a href="#apply" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Become a stockist →
            </a>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" aria-label="Wholesale application" className="relative scroll-mt-28 overflow-hidden px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <AccentCorners corners={{ tl: "argan", br: "shea" }} size={130} opacity={0.07} />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Wholesale application</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">Let&apos;s stock your shelves.</h2>
            <p className="mt-3 text-base leading-relaxed text-espresso/65">
              Tell us a little about your business and what you&apos;d like to carry. We&apos;ll reply within 1–2 business days with pricing, minimums and lead times.
            </p>
          </div>
          <div className="rounded-[2rem] border border-espresso/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
            <WholesaleForm />
          </div>
        </div>
      </section>
    </div>
  );
}
