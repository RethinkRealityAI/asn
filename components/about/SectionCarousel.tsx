"use client";

/**
 * SectionCarousel — the "explore the rest of About" browser on the hub page.
 *
 * A scroll-snap row of cards, one per About subpage, with prev/next controls
 * that glide the track. Each card carries the section's botanical motif and
 * teaser and links straight to the subpage — the easy way to hop around the
 * About section that the brief asked for. White cards, warm palette,
 * reduced-motion safe (arrows still work; they just jump instead of smooth).
 */

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ABOUT_SECTIONS } from "@/lib/content/about";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";

export function SectionCarousel({ excludeSlug }: { excludeSlug?: string } = {}) {
  const trackRef = useRef<HTMLUListElement>(null);
  // Don't offer a card that links back to the page you're already reading.
  const sections = ABOUT_SECTIONS.filter((s) => s.slug !== excludeSlug);
  const reduced = usePrefersReducedMotion();

  const scrollByCards = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    const amount = card ? (card as HTMLElement).offsetWidth + 16 : 320;
    track.scrollBy({ left: dir * amount, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Explore</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-espresso sm:text-3xl">
            More of our story.
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="flex size-10 items-center justify-center rounded-full border border-espresso/15 text-espresso/70 transition-colors hover:border-green/50 hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="flex size-10 items-center justify-center rounded-full border border-espresso/15 text-espresso/70 transition-colors hover:border-green/50 hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((s) => (
          <li key={s.slug} className="w-[16rem] shrink-0 snap-start sm:w-[18rem]">
            <Link
              href={`/about/${s.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-green/12 bg-gradient-to-b from-white to-[#EEF6EE]/50 p-6 shadow-[0_14px_34px_-16px_rgba(42,30,20,0.22)] transition-all duration-200 hover:-translate-y-1 hover:border-green/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-green/10">
                <Image src={`/decor/${s.decor}.webp`} alt="" width={40} height={40} className="size-8 object-contain" />
              </span>
              <p className="font-display text-lg font-semibold text-espresso group-hover:text-clay">{s.label}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-espresso/60">{s.teaser}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green">
                Read more
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
