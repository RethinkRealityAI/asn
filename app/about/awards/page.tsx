import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { AWARDS } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Awards & recognition — Shea Allnaturals",
  description:
    "National honours for our founder and CEO Lanre Tunji-Ajayi — the Meritorious Service Medal, the Senate of Canada 150 Award and more — and for the first Black Canadian-owned skincare line sold nationally.",
};

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Awards" }]}
        eyebrow={AWARDS.eyebrow}
        title={AWARDS.title}
        subtitle={AWARDS.intro}
        products={[
          { src: "/decor/leaves.webp", alt: "", style: { position: "absolute", right: "16%", bottom: "-4%", width: "15%", maxWidth: "170px", zIndex: 1 } },
        ]}
      />

      <AboutSubNav />

      {/* Brand milestone */}
      <section className="mx-auto max-w-4xl px-5 pt-16 sm:px-8 lg:px-12">
        <div className="rounded-[1.75rem] border border-marigold/30 bg-marigold/8 p-7 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange">A Canadian first</p>
          <p className="mt-3 font-display text-xl font-semibold leading-snug text-espresso sm:text-2xl">
            {AWARDS.brandMilestone}
          </p>
        </div>
      </section>

      {/* Awards grid */}
      <section aria-label="Awards and recognition" className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {AWARDS.awards.map((a) => (
            <li
              key={a.title}
              className="flex gap-4 rounded-[1.5rem] border border-espresso/10 bg-white p-6 shadow-[0_12px_30px_-16px_rgba(42,30,20,0.2)]"
            >
              <span aria-hidden className="mt-0.5 text-2xl">🏅</span>
              <div>
                <p className="font-display text-lg font-semibold text-espresso">{a.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-espresso/65">{a.detail}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-green">{a.who}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA — green band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tl: "argan", br: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-12">
          <p className="font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">
            Recognition we carry into every jar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/about/making-a-difference" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Making a difference →
            </Link>
            <Link href="/media" className="inline-flex items-center text-sm font-semibold text-cream/85 transition-colors hover:text-cream">
              Media &amp; press
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
