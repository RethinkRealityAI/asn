import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { MAKING_A_DIFFERENCE } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Making a difference",
  description:
    "How Shea Allnaturals gives back — ethical, women-run sourcing in West Africa and a shea-butter machine donated to the Fufu community. Corporations should support the communities they draw from.",
};

export default function MakingADifferencePage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about/our-story" }, { label: "Making a difference" }]}
        eyebrow={MAKING_A_DIFFERENCE.eyebrow}
        title={MAKING_A_DIFFERENCE.title}
        subtitle={MAKING_A_DIFFERENCE.lede}
        products={[
          { src: "/decor/shea-nuts.webp", alt: "", style: { position: "absolute", right: "15%", bottom: "-6%", width: "16%", maxWidth: "180px", zIndex: 1 } },
          { src: "/hero/cocoa.webp", alt: "Shea Allnaturals cocoa butter", style: { position: "absolute", right: "28%", bottom: "-3%", width: "15%", maxWidth: "170px", zIndex: 0 } },
        ]}
      />

      <AboutSubNav />

      {/* Initiatives — alternating rows */}
      <section aria-label="Our initiatives" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:px-12">
        <ol className="space-y-5">
          {MAKING_A_DIFFERENCE.initiatives.map((it, i) => (
            <li
              key={it.title}
              className="rounded-[1.75rem] border border-green/15 bg-gradient-to-b from-white to-[#EEF6EE]/50 p-7 shadow-[0_14px_34px_-18px_rgba(42,30,20,0.22)] sm:p-9"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-2xl font-semibold text-marigold">0{i + 1}</span>
                <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">{it.when}</span>
              </div>
              <p className="mt-3 font-display text-xl font-semibold text-espresso sm:text-2xl">{it.title}</p>
              <p className="mt-2 leading-relaxed text-espresso/70">{it.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Watch — green band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "argan", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-12">
          <p className="font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">
            See the women and the craft behind every jar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/media" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Watch our films →
            </Link>
            <Link href="/shop" className="inline-flex items-center text-sm font-semibold text-cream/85 transition-colors hover:text-cream">
              Shop the collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
