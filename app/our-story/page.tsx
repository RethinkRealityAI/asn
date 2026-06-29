import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";

export const metadata: Metadata = {
  title: "Our Story — Shea Allnaturals",
  description:
    "The story behind Shea Allnaturals — pure botanicals rooted in West-African tradition, hand-made in Barrie, Ontario.",
};

const VALUES = [
  { label: "Fairly sourced", detail: "Raw shea and botanical oils bought directly from West-African communities." },
  { label: "Made by hand", detail: "Cold-pressed and small-batch blended in Barrie, Ontario." },
  { label: "Nothing hidden", detail: "No parabens, sulphates, mineral oils or synthetic fragrance — ever." },
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      {/* Header — scenery (origin story) */}
      <PageHeader
        image="/headers/our-story.webp"
        imageAlt="A shea tree on the West African savanna at golden hour"
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
        eyebrow="Our story"
        title="Heritage you can feel on your skin."
        subtitle="For over a decade we've made small-batch skincare the old way — pure, cold-pressed oils, shea and black soap — sourced fairly from West Africa and blended by hand in Barrie, Ontario."
      />

      {/* Narrative */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-6 text-lg leading-relaxed text-espresso/80">
          <p>
            Shea Allnaturals began with a simple belief: that the best skincare
            already exists in nature, and the job of a maker is to honour it —
            not to dilute it with fillers and synthetics.
          </p>
          <p>
            Every jar starts with raw shea nuts and botanical oils sourced
            directly from the communities that have harvested them for
            generations, including the women of Fufu, Nigeria. From there, the
            butters and oils are cold-pressed, blended, and small-batch finished
            by hand here in Barrie, Ontario.
          </p>
          <p>
            We&rsquo;re a family-run business, and we treat every formula like
            it&rsquo;s going on our own family&rsquo;s skin — because it is. No
            shortcuts, no shelf-life chemistry, just the land&rsquo;s best,
            distilled into products that work.
          </p>
        </div>
      </section>

      {/* Values — green band */}
      <section aria-label="What we stand for" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "argan", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <ol className="grid gap-8 sm:grid-cols-3">
            {VALUES.map((v, i) => (
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
    </div>
  );
}
