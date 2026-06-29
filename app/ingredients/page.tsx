import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";

export const metadata: Metadata = {
  title: "Ingredients — Shea Allnaturals",
  description:
    "What goes into Shea Allnaturals — cold-pressed botanical oils, unrefined shea and black soap — and what we leave out: no parabens, sulphates, mineral oils or synthetic fragrance.",
};

const HERO_BOTANICALS = [
  { name: "Shea Butter", detail: "Unrefined, hand-scooped — deeply nourishing and rich in vitamins A & E." },
  { name: "Argan Oil", detail: "Cold-pressed, Moroccan-origin — featherlight, fast-absorbing, restorative." },
  { name: "Black Soap", detail: "Traditional, sun-dried plantain ash — a gentle, time-honoured cleanse." },
  { name: "Cocoa Butter", detail: "Cold-pressed — a velvety barrier that softens and protects." },
  { name: "Castor Oil", detail: "100% Black Jamaican — prized for hair, scalp and lash care." },
  { name: "Sweet Almond Oil", detail: "Light, vitamin-rich — calming for face, body and hair." },
];

const FREE_FROM = ["Parabens", "Sulphates (SLS/SLES)", "Mineral oils", "Artificial dyes", "Synthetic fragrance", "Animal testing"];

export default function IngredientsPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      {/* Header */}
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Ingredients" }]}
        eyebrow="Ingredients"
        title="Whole shea, nothing stripped."
        subtitle="We use few ingredients, and we use them well — cold-pressed, unrefined and honestly sourced. Here's what goes in, and what never does."
        products={[
          { src: "/hero/shea-butter.webp", alt: "Shea Allnaturals shea butter", style: { position: "absolute", right: "13%", bottom: "-6%", width: "20%", maxWidth: "216px", zIndex: 1 } },
          { src: "/hero/argan.webp", alt: "Shea Allnaturals argan oil", style: { position: "absolute", right: "28%", bottom: "0%", width: "9%", maxWidth: "104px", zIndex: 2 } },
          { src: "/decor/castor.webp", alt: "", style: { position: "absolute", right: "29%", bottom: "5%", width: "13%", maxWidth: "150px", zIndex: 0 } },
        ]}
      />

      {/* Hero botanicals */}
      <section aria-label="Our key botanicals" className="relative overflow-hidden mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <h2 className="mb-10 font-display text-2xl font-semibold text-espresso sm:text-3xl">The botanicals we build on.</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HERO_BOTANICALS.map((b) => (
            <li
              key={b.name}
              className="rounded-[1.5rem] border border-green/15 bg-gradient-to-b from-white to-[#EEF6EE]/60 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_12px_30px_-14px_rgba(42,30,20,0.16)]"
            >
              <p className="font-display text-lg font-semibold text-espresso">{b.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso/65">{b.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Free from — green band */}
      <section aria-label="What we leave out" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tl: "shea", br: "castor" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Always free from</p>
          <h2 className="mb-8 font-display text-2xl font-semibold text-cream sm:text-3xl">What you won&rsquo;t find in our jars.</h2>
          <ul className="flex flex-wrap gap-3">
            {FREE_FROM.map((f) => (
              <li key={f} className="rounded-full border border-cream/25 bg-cream/10 px-5 py-2 text-sm font-semibold text-cream">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-cream/70">
            Full INCI ingredient lists are printed on every product and on each
            product page. Have a sensitivity or a question? <Link href="/contact" className="font-semibold text-marigold hover:underline">Reach out</Link> — we&rsquo;re happy to help.
          </p>
        </div>
      </section>
    </div>
  );
}
