import type { Metadata } from "next";
import Link from "next/link";

import { LiteYouTube } from "@/components/media/LiteYouTube";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { MEDIA_VIDEOS, PRESS, YT_CHANNEL, WEBCAST, ARTICLE } from "@/lib/content/media";

export const metadata: Metadata = {
  title: "Media & Press — Shea Allnaturals",
  description:
    "Heritage films and press from Shea Allnaturals — the traditional shea-butter-making process in Fufu, Nigeria, our community work, and featured coverage.",
};

export default function MediaPage() {
  const [featured, ...rest] = MEDIA_VIDEOS;

  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      {/* Header */}
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Media & Press" }]}
        eyebrow="Media & press"
        title="The story, in motion."
        subtitle="From the shea groves of West Africa to small-batch blending in Barrie — the people, the process, and the press behind every jar."
        products={[
          { src: "/hero/cocoa.webp", alt: "Shea Allnaturals cocoa-shea butter", style: { position: "absolute", right: "12%", bottom: "-6%", width: "19%", maxWidth: "206px", zIndex: 1 } },
          { src: "/hero/castor.webp", alt: "Shea Allnaturals castor oil", style: { position: "absolute", right: "27%", bottom: "0%", width: "9%", maxWidth: "104px", zIndex: 2 } },
          { src: "/decor/shea.webp", alt: "", style: { position: "absolute", right: "30%", bottom: "-3%", width: "12%", maxWidth: "134px", zIndex: 0 } },
        ]}
      />

      {/* Featured film */}
      <section aria-label="Featured film" className="relative overflow-hidden px-5 pt-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <LiteYouTube id={featured.id} title={featured.title} />
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-green">{featured.meta}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-espresso sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-espresso/65">{featured.blurb}</p>
            </div>
          </div>
        </div>
      </section>

      {/* More films */}
      <section aria-label="More films" className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12">
        <AccentCorners corners={{ tr: "shea", bl: "argan" }} size={130} opacity={0.08} />
        <div className="relative z-10 mx-auto max-w-7xl">
          <h2 className="mb-10 font-display text-2xl font-semibold text-espresso sm:text-3xl">More from our channel</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {rest.map((v) => (
              <figure key={v.id} className="flex flex-col gap-4">
                <LiteYouTube id={v.id} title={v.title} />
                <figcaption>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-green">{v.meta}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-espresso">{v.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-espresso/60">{v.blurb}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Webcast callout — hosted off-site, link out */}
          <a
            href={WEBCAST.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-10 flex flex-col gap-3 rounded-[1.5rem] border border-espresso/10 bg-cream/50 p-6 shadow-[var(--shadow-card)] transition-colors hover:border-clay/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-cream">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="m10 8 6 4-6 4V8Z" /><rect x="2" y="4" width="20" height="16" rx="3" />
                </svg>
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-green">{WEBCAST.meta}</p>
                <p className="mt-1 font-display text-lg font-semibold text-espresso">{WEBCAST.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-espresso/60">{WEBCAST.blurb}</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-clay transition-transform group-hover:translate-x-0.5">
              Watch the talk →
            </span>
          </a>

          <div className="mt-8">
            <a
              href={YT_CHANNEL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-semibold text-espresso transition-colors hover:border-clay hover:text-clay"
            >
              Visit our YouTube channel →
            </a>
          </div>
        </div>
      </section>

      {/* Article */}
      <section aria-label="Article" className="relative overflow-hidden border-t border-espresso/08 px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <AccentCorners corners={{ tr: "castor", bl: "argan" }} size={120} opacity={0.07} />
        <article className="relative z-10 mx-auto max-w-3xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-marigold">From our founders</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-espresso sm:text-4xl lg:text-[2.75rem]">
            {ARTICLE.title}
          </h2>
          <p className="mt-4 font-display text-lg italic leading-relaxed text-espresso/60 sm:text-xl">{ARTICLE.dek}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-espresso/50">{ARTICLE.byline}</p>

          <div className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-espresso/80 sm:text-[1.05rem] sm:leading-[1.8]">
            {ARTICLE.paragraphs.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-none first-letter:text-clay"
                    : ""
                }
              >
                {para}
              </p>
            ))}
          </div>
        </article>
      </section>

      {/* Press */}
      <section aria-label="Press" className="relative overflow-hidden border-t border-espresso/08 bg-cream px-5 py-16 sm:px-8 lg:px-12">
        <AccentCorners corners={{ tl: "castor", br: "argan" }} size={130} opacity={0.09} />
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">As featured in</p>
          <h2 className="mb-10 font-display text-2xl font-semibold text-espresso sm:text-3xl">Press &amp; recognition</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRESS.map((p) => (
              <li
                key={p.outlet}
                className="rounded-[1.5rem] border border-espresso/10 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <p className="font-display text-lg font-semibold text-espresso">{p.outlet}</p>
                <p className="mt-1 text-sm text-espresso/70">{p.title}</p>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-green">{p.meta}</p>
              </li>
            ))}
            {/* Heritage note card */}
            <li className="rounded-[1.5rem] border border-marigold/30 bg-marigold/10 p-6">
              <p className="font-display text-lg font-semibold text-espresso">A decade of craft</p>
              <p className="mt-1 text-sm text-espresso/70">
                Sharing pure, botanical skincare and supporting the West-African
                communities at the heart of it.
              </p>
              <Link href="/contact" className="mt-3 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-clay hover:underline">
                Work with us →
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
