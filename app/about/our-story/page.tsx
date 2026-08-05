import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { STORY } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The story behind Shea Allnaturals — from a Barrie salon in 2002 to the first Black Canadian-owned skincare line sold nationally, rooted in West-African tradition and made by hand.",
};

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        image="/headers/our-story.webp"
        imageAlt="A shea tree on the West African savanna at golden hour"
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about" }, { label: "Our story" }]}
        eyebrow={STORY.eyebrow}
        title={STORY.title}
        subtitle={STORY.lede}
      />

      <AboutSubNav />

      {/* Narrative */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-6 text-lg leading-relaxed text-espresso/80">
          {STORY.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      {/* Values — green band */}
      <section aria-label="What we stand for" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "argan", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <ol className="grid gap-8 sm:grid-cols-3">
            {STORY.values.map((v, i) => (
              <li key={v.label} className="text-cream">
                <span className="font-display text-3xl font-semibold text-marigold">0{i + 1}</span>
                <p className="mt-3 font-display text-xl font-semibold">{v.label}</p>
                <p className="mt-1.5 leading-relaxed text-cream/75">{v.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream">
              Shop the collection →
            </Link>
            <Link href="/media" className="inline-flex items-center text-sm font-semibold text-cream/80 transition-colors hover:text-cream">
              Watch how it&rsquo;s made
            </Link>
          </div>
        </div>
      </section>

      {/* Next section pointer */}
      <section className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8 lg:px-12">
        <p className="text-espresso/60">Next: the promise that guides every batch.</p>
        <Link href="/about/our-mission" className="mt-2 inline-flex items-center gap-2 font-display text-xl font-semibold text-clay transition-colors hover:text-orange">
          Our mission →
        </Link>
      </section>
    </div>
  );
}
