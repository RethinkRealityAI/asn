import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { MISSION } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Our mission",
  description:
    "Our mission is to keep providing green, plant-based ingredients that perform — sustainable, natural and organic skincare, plus raw materials to make your own.",
};

export default function OurMissionPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about/our-story" }, { label: "Our mission" }]}
        eyebrow={MISSION.eyebrow}
        title={MISSION.title}
        subtitle={MISSION.statement}
        products={[
          { src: "/hero/argan.webp", alt: "Shea Allnaturals argan oil", style: { position: "absolute", right: "16%", bottom: "-5%", width: "16%", maxWidth: "180px", zIndex: 2 } },
          { src: "/decor/leaves.webp", alt: "", style: { position: "absolute", right: "28%", bottom: "2%", width: "14%", maxWidth: "160px", zIndex: 0 } },
        ]}
      />

      <AboutSubNav />

      {/* Mission points */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12">
        <ul className="grid gap-5 sm:grid-cols-3">
          {MISSION.points.map((p) => (
            <li
              key={p.label}
              className="rounded-[1.5rem] border border-green/15 bg-gradient-to-b from-white to-[#EEF6EE]/60 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_12px_30px_-14px_rgba(42,30,20,0.16)]"
            >
              <p className="font-display text-lg font-semibold text-espresso">{p.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso/65">{p.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pull quote — green band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tl: "shea", br: "argan" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-12">
          <p className="font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">
            &ldquo;We believe natural, clean beauty is the best beauty — and that your body
            should be at peace with nature.&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Shop the collection →
            </Link>
            <Link href="/about/our-ingredients" className="inline-flex items-center text-sm font-semibold text-cream/85 transition-colors hover:text-cream">
              See our ingredients
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8 lg:px-12">
        <p className="text-espresso/60">Next: the six things we stand by.</p>
        <Link href="/about/our-beliefs" className="mt-2 inline-flex items-center gap-2 font-display text-xl font-semibold text-clay transition-colors hover:text-orange">
          Our beliefs →
        </Link>
      </section>
    </div>
  );
}
