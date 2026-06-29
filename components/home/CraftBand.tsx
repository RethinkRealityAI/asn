"use client";

/**
 * CraftBand — "the craft" section.
 *
 * Showcases the CLEAN (un-dimmed, un-blurred) brand promo video in a large
 * rounded frame, paired with process copy and the 4 brand credential icons.
 * This is where the original promo footage lives now that the hero is a still.
 *
 * Reduced motion / no-autoplay: renders the poster still instead of the video.
 * Never blue.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

const ICONS = [
  { src: "/badges/eco-friendly.webp", label: "Eco-friendly" },
  { src: "/badges/fair-trade.webp", label: "Fair trade" },
  { src: "/badges/family-owned.webp", label: "Family owned" },
  { src: "/badges/supporting-farmers.webp", label: "Supporting farmers" },
];

export function CraftBand() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      aria-label="How it's made"
      className="relative overflow-hidden bg-cream px-5 py-24 sm:px-8 lg:px-12"
    >
      <AccentCorners corners={{ tr: "castor", bl: "argan" }} size={150} opacity={0.1} />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ── Video frame ─────────────────────────────────────────────────── */}
        <motion.div
          className="relative order-1 overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-24px_rgba(42,30,20,0.4)] lg:order-2"
          initial={reduced ? false : { opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ ease: WARM, duration: DUR.slow }}
        >
          <div className="relative aspect-[4/3] w-full bg-espresso">
            {reduced ? (
              <Image
                src="/video/promo-poster.jpg"
                alt="Cold-pressed botanical oils being poured"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/video/promo-poster.jpg"
                aria-label="Cold-pressed botanical oils being poured"
              >
                <source src="/video/promo.webm" type="video/webm" />
                <source src="/video/promo.mp4" type="video/mp4" />
              </video>
            )}
          </div>
          {/* subtle warm inner edge */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_0_0_rgba(245,236,218,0.3)]" />
        </motion.div>

        {/* ── Copy + credential icons ─────────────────────────────────────── */}
        <div className="order-2 lg:order-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            The craft
          </p>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-espresso sm:text-5xl">
            Made the old way,<br className="hidden sm:block" /> never rushed.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-espresso/65 sm:text-lg">
            Raw shea nuts and botanical oils, cold-pressed and small-batch
            blended by hand. No fillers, no shortcuts — just the land&rsquo;s
            best, bottled with patience and care.
          </p>

          {/* 4 credential badges — green seals, labels baked in, no white box */}
          <ul className="mt-10 flex flex-wrap items-center gap-5 sm:gap-7">
            {ICONS.map(({ src, label }, i) => (
              <motion.li
                key={label}
                className="flex items-center justify-center"
                initial={reduced ? false : { opacity: 0, y: 16, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{ ease: WARM, duration: DUR.base, delay: i * 0.08 }}
              >
                <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="112px"
                    className="object-contain drop-shadow-[0_8px_16px_rgba(31,77,51,0.18)]"
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
