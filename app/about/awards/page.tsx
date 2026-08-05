import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import { AWARDS } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "Awards & recognition",
  description:
    "National honours for our founder and CEO Lanre Tunji-Ajayi — the Meritorious Service Medal, the Senate of Canada 150 Award and more — and for the first Black Canadian-owned skincare line sold nationally.",
};

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about/our-story" }, { label: "Awards" }]}
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

      {/* Awards grid — square cards, 3 per row, warm textured backgrounds */}
      <section aria-label="Awards and recognition" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AWARDS.awards.map((a) => (
            <li
              key={a.title}
              className={cn(
                "group relative flex aspect-square flex-col justify-end overflow-hidden rounded-[1.75rem]",
                "border border-espresso/10 bg-cream",
                "shadow-[0_16px_38px_-18px_rgba(42,30,20,0.28)]",
                "motion-safe:transition-[transform,box-shadow] duration-300 ease-[--ease-warm]",
                "motion-safe:hover:-translate-y-1.5 hover:shadow-[0_26px_54px_-18px_rgba(42,30,20,0.36)]"
              )}
            >
              {/* Background texture */}
              <Image
                src={a.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[--ease-warm] motion-safe:group-hover:scale-[1.06]"
              />
              {/* Legibility scrim — heavy only under the copy so the texture
                  stays visible across the top two-thirds of the card. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-espresso/95 from-20% via-espresso/45 via-45% to-transparent to-72%"
              />

              {/* Laurel mark */}
              <span
                aria-hidden="true"
                className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-marigold/60 bg-espresso/55 text-marigold shadow-sm backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <circle cx="12" cy="9" r="5" />
                  <path d="m8.5 13.5-1.8 6.2 5.3-2.6 5.3 2.6-1.8-6.2" />
                </svg>
              </span>

              {/* Copy */}
              <div className="relative z-10 flex flex-col gap-1.5 p-6">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-marigold">
                  {a.who}
                </p>
                <h3 className="font-display text-lg font-semibold leading-snug text-cream sm:text-xl">
                  {a.title}
                </h3>
                <p className="text-sm leading-relaxed text-cream/75">{a.detail}</p>
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
