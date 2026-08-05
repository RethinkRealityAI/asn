import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { BELIEFS } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Our beliefs",
  description:
    "The trees of the nation are for the healing of the nation. Six things All Naturals Cosmetics has stood by since 2002 — for our planet, our customers and generations to come.",
};

export default function OurBeliefsPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Our beliefs" }]}
        eyebrow={BELIEFS.eyebrow}
        title={BELIEFS.title}
        products={[
          { src: "/decor/shea-nuts.webp", alt: "", style: { position: "absolute", right: "15%", bottom: "-6%", width: "16%", maxWidth: "180px", zIndex: 1 } },
          { src: "/decor/leaves.webp", alt: "", style: { position: "absolute", right: "28%", bottom: "4%", width: "13%", maxWidth: "150px", zIndex: 0 } },
        ]}
      />

      <AboutSubNav />

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-5 pt-16 sm:px-8 lg:px-12">
        <p className="text-lg leading-relaxed text-espresso/80">{BELIEFS.intro}</p>
      </section>

      {/* The six beliefs */}
      <section aria-label="Our beliefs" className="mx-auto max-w-4xl px-5 py-14 sm:px-8 lg:px-12">
        <ol className="grid gap-4 sm:grid-cols-2">
          {BELIEFS.items.map((b, i) => (
            <li
              key={b}
              className="flex gap-4 rounded-[1.5rem] border border-espresso/10 bg-white p-6 shadow-[0_12px_30px_-16px_rgba(42,30,20,0.2)]"
            >
              <span className="font-display text-2xl font-semibold text-marigold">0{i + 1}</span>
              <p className="leading-relaxed text-espresso/80">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA — green band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "castor", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-12">
          <p className="font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">
            We believe in what we do — and stand by it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/about/making-a-difference" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              See how we give back →
            </Link>
            <Link href="/about/our-ingredients" className="inline-flex items-center text-sm font-semibold text-cream/85 transition-colors hover:text-cream">
              Our ingredients
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
