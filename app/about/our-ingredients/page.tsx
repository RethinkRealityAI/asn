import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { IngredientsTable } from "@/components/about/IngredientsTable";
import { INGREDIENTS_INTRO } from "@/lib/content/ingredients-inci";

export const metadata: Metadata = {
  title: "Our ingredients",
  description:
    "Common names and corresponding INCI names for the ingredients used in All Naturals Cosmetics products — clean, natural, vegan, Halal and Kosher. Search and filter the full list.",
};

export default function OurIngredientsPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Our ingredients" }]}
        eyebrow={INGREDIENTS_INTRO.eyebrow}
        title={INGREDIENTS_INTRO.title}
        products={[
          { src: "/hero/shea-butter.webp", alt: "Shea Allnaturals shea butter", style: { position: "absolute", right: "14%", bottom: "-6%", width: "18%", maxWidth: "200px", zIndex: 1 } },
          { src: "/decor/leaves.webp", alt: "", style: { position: "absolute", right: "28%", bottom: "3%", width: "13%", maxWidth: "150px", zIndex: 0 } },
        ]}
      />

      <AboutSubNav />

      {/* Intro + searchable table */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12">
        <p className="max-w-3xl text-lg leading-relaxed text-espresso/80">{INGREDIENTS_INTRO.lede}</p>
        <div className="mt-10">
          <IngredientsTable />
        </div>
      </section>

      {/* Free from — green band */}
      <section aria-label="What we leave out" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tl: "shea", br: "castor" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Always free from</p>
          <h2 className="mb-8 font-display text-2xl font-semibold text-cream sm:text-3xl">
            What you won&rsquo;t find in our jars.
          </h2>
          <ul className="flex flex-wrap gap-3">
            {INGREDIENTS_INTRO.freeFrom.map((f) => (
              <li key={f} className="rounded-full border border-cream/25 bg-cream/10 px-5 py-2 text-sm font-semibold text-cream">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-cream/70">
            Full INCI ingredient lists are printed on every product and on each
            product page. Have a sensitivity or a question?{" "}
            <Link href="/contact" className="font-semibold text-marigold hover:underline">Reach out</Link>{" "}
            — we&rsquo;re happy to help.
          </p>
        </div>
      </section>
    </div>
  );
}
