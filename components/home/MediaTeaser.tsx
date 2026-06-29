/**
 * MediaTeaser — homepage "media section".
 *
 * Surfaces the brand's heritage films (the real shea-butter-making documentary
 * footage) with a link to the full /media page. Server component; the players
 * are the LiteYouTube client islands.
 */

import Link from "next/link";
import { LiteYouTube } from "@/components/media/LiteYouTube";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { MEDIA_VIDEOS } from "@/lib/content/media";

export function MediaTeaser() {
  // Lead with the making-of film + the community donation film.
  const featured = MEDIA_VIDEOS.slice(0, 2);

  return (
    <section
      aria-label="Media and press"
      className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 lg:px-12"
    >
      <AccentCorners corners={{ tr: "argan", bl: "castor" }} size={140} opacity={0.09} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
              Media &amp; press
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-espresso sm:text-5xl">
              From our hands to yours.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-espresso/60">
              See the craft at its source — the traditional shea-butter process
              in Fufu, Nigeria, and the community we grow alongside.
            </p>
          </div>
          <Link
            href="/media"
            className="group hidden shrink-0 items-center gap-1.5 pb-1 text-sm font-semibold text-espresso/70 transition-colors duration-200 hover:text-clay sm:inline-flex"
          >
            All media &amp; press
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {featured.map((v) => (
            <figure key={v.id} className="flex flex-col gap-4">
              <LiteYouTube id={v.id} title={v.title} />
              <figcaption>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-green">{v.meta}</p>
                <p className="mt-1 font-display text-lg font-semibold text-espresso">{v.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/media"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-semibold text-espresso transition-colors duration-200 hover:border-clay hover:text-clay"
          >
            All media &amp; press →
          </Link>
        </div>
      </div>
    </section>
  );
}
