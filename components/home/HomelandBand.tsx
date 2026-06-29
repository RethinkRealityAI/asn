"use client";

/**
 * HomelandBand — deep-green heritage scene.
 *
 * Rebuilt: instead of small scattered floats, this leads with LARGE, intentional
 * product imagery (transparent cutout bottles) that fill the right column, with
 * the botanical cutouts demoted to consistent corner accents (AccentCorners).
 *
 * Motion: products reveal + gently float; a soft glow grounds them on the green.
 * Reduced-motion safe. Never blue.
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AccentCorners } from "@/components/motion/AccentCorners";
import { RevealText } from "@/components/motion/RevealText";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

const INGREDIENTS = [
  { label: "Shea Butter", detail: "Unrefined, hand-scooped" },
  { label: "Argan Oil", detail: "Cold-pressed, Moroccan-origin" },
  { label: "Black Soap", detail: "Sun-dried plantain ash" },
];

export function HomelandBand() {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      id="story"
      aria-label="Skincare with a homeland"
      className="relative overflow-hidden"
      style={{ background: "#1d4d33" }}
    >
      {/* African mudcloth fills the whole background (cover, not tiled) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/decor/mudcloth.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Botanical-green overlay over the cloth — lets the pattern read through */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(36,95,60,0.90) 0%, rgba(29,77,51,0.86) 100%)" }}
      />
      {/* Warm radial wash so the green never reads cold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 60% at 28% 50%, rgba(235,165,44,0.13) 0%, transparent 70%)",
            "radial-gradient(ellipse 55% 80% at 82% 40%, rgba(226,116,43,0.13) 0%, transparent 62%)",
          ].join(", "),
        }}
      />
      <AccentCorners corners={{ tl: "argan", br: "shea" }} tone="light" size={170} opacity={0.12} />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-32 lg:px-12">
        {/* ── Text column ─────────────────────────────────────────────────── */}
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
            West Africa · Barrie, Ontario
          </p>
          <RevealText
            text={"Skincare with\na homeland."}
            as="h2"
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl"
            delay={0.1}
          />
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
            Every jar starts with raw shea nuts and botanical oils sourced
            directly from West Africa — then cold-pressed, blended, and
            small-batch finished here in Barrie, Ontario. No fillers. No
            shortcuts. Just the land&rsquo;s best, distilled.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/media"
              className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors duration-200 hover:bg-orange hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-[#245F3C]"
            >
              Explore our heritage →
            </Link>
            <Link href="/shop" className="text-sm font-semibold text-cream/70 transition-colors duration-200 hover:text-cream">
              Shop essentials
            </Link>
          </div>

          {/* Ingredient callout strip */}
          <div className="mt-14 grid gap-6 border-t border-cream/15 pt-8 text-center sm:grid-cols-3 sm:text-left">
            {INGREDIENTS.map(({ label, detail }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-marigold">{label}</span>
                <span className="text-sm text-cream/55">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Big product composition ─────────────────────────────────────── */}
        <div className="relative mx-auto aspect-square w-full max-w-xl">
          {/* grounding glow */}
          <div
            aria-hidden
            className="absolute inset-x-[8%] bottom-[10%] top-[12%] rounded-[50%]"
            style={{ background: "radial-gradient(ellipse at center, rgba(245,236,218,0.18) 0%, transparent 68%)" }}
          />

          {/* Big castor-plant leaves behind, balancing the right/top */}
          <FloatProduct
            src="/decor/castor.webp"
            alt=""
            reduced={reduced}
            delay={0.15}
            floatClass="animate-[hero-float_12s_ease-in-out_infinite_0.4s]"
            style={{ right: "-8%", top: "-2%", width: "42%", zIndex: 8, opacity: 0.95 }}
          />
          {/* Castor oil — tall dropper, grouped just left of the tubs, base aligned */}
          <FloatProduct
            src="/hero/castor.webp"
            alt="Shea Allnaturals 100% Black Jamaican Castor Oil"
            reduced={reduced}
            delay={0.32}
            floatClass="animate-[hero-float_10s_ease-in-out_infinite_0.2s]"
            style={{ left: "11%", bottom: "2%", height: "66%", zIndex: 14 }}
          />
          {/* Pure shea butter — centre-front tub */}
          <FloatProduct
            src="/hero/shea-butter.webp"
            alt="Shea Allnaturals 100% Pure Shea Butter"
            reduced={reduced}
            delay={0.22}
            floatClass="animate-[hero-float_11s_ease-in-out_infinite]"
            style={{ left: "26%", bottom: "3%", width: "40%", zIndex: 20 }}
          />
          {/* Cocoa-shea butter — front-right tub */}
          <FloatProduct
            src="/hero/cocoa.webp"
            alt="Shea Allnaturals Cocoa-Shea Butter"
            reduced={reduced}
            delay={0.1}
            floatClass="animate-[hero-float_13s_ease-in-out_infinite_0.5s]"
            style={{ right: "-1%", bottom: "0%", width: "47%", zIndex: 22 }}
          />
          {/* Shea branch + nuts — foreground accent grounding the grouping + covering the castor notch */}
          <FloatProduct
            src="/decor/shea.webp"
            alt=""
            reduced={reduced}
            delay={0.5}
            floatClass="animate-[hero-float_9s_ease-in-out_infinite_0.25s]"
            style={{ left: "10%", bottom: "-5%", width: "34%", zIndex: 24 }}
          />
        </div>
      </div>
    </section>
  );
}

// ── Single big floating product ───────────────────────────────────────────────
function FloatProduct({
  src,
  alt,
  style,
  reduced,
  delay,
  floatClass,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
  reduced: boolean;
  delay: number;
  floatClass: string;
}) {
  return (
    <motion.div
      className="absolute select-none"
      style={style}
      initial={reduced ? false : { opacity: 0, y: 44, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ ease: WARM, duration: DUR.slow, delay: reduced ? 0 : delay }}
    >
      <div className={reduced ? "" : `${floatClass} motion-reduce:animate-none`}>
        <Image
          src={src}
          alt={alt}
          width={1000}
          height={1300}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="h-auto w-full"
          style={{ filter: "drop-shadow(0 30px 44px rgba(0,0,0,0.4))" }}
        />
      </div>
    </motion.div>
  );
}
