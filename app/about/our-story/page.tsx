import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { SectionCarousel } from "@/components/about/SectionCarousel";
import { STORY, MISSION, BELIEFS } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The story behind Shea Allnaturals — from a Barrie salon in 2002 to the first Black Canadian-owned skincare line sold nationally, rooted in West-African tradition and made by hand. Our mission, beliefs and what we stand for.",
  alternates: { canonical: "/about/our-story" },
};

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        image="/headers/our-story.webp"
        imageAlt="A shea tree on the West African savanna at golden hour"
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about/our-story" }, { label: "Our story" }]}
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

      {/* Mission + beliefs — merged in from the old About overview */}
      <section aria-label="Our mission and beliefs" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Our mission</p>
            <h2 className="font-display text-2xl font-semibold leading-tight text-espresso sm:text-3xl">
              {MISSION.title}
            </h2>
            <p className="mt-4 leading-relaxed text-espresso/70">{MISSION.statement}</p>
            <Link
              href="/about/our-mission"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay transition-colors hover:text-orange"
            >
              More on our mission →
            </Link>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Our beliefs</p>
            <h2 className="font-display text-2xl font-semibold leading-tight text-espresso sm:text-3xl">
              Trees for the healing of the nation.
            </h2>
            <ul className="mt-4 space-y-2.5">
              {BELIEFS.items.slice(0, 3).map((b) => (
                <li key={b} className="flex gap-2.5 leading-relaxed text-espresso/70">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-green" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/about/our-beliefs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay transition-colors hover:text-orange"
            >
              Read all six beliefs →
            </Link>
          </div>
        </div>
      </section>

      {/* Explore the rest of the About section */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
        <SectionCarousel excludeSlug="our-story" />
      </section>

      {/* Private label CTA */}
      <section className="relative overflow-hidden bg-cream">
        <AccentCorners corners={{ tl: "castor", br: "argan" }} size={140} opacity={0.1} />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-5 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green">For businesses</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-espresso sm:text-3xl">
              Looking to build your own line?
            </h2>
            <p className="mt-2 leading-relaxed text-espresso/70">
              We&rsquo;re a Canadian contract manufacturer, too — from formulation to
              finished, packaged product, made under GMP in our own plant.
            </p>
          </div>
          <Link
            href="/private-label"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-green/90"
          >
            Explore private label →
          </Link>
        </div>
      </section>
    </div>
  );
}
