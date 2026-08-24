"use client";

/**
 * ImageHero — the bright, white "wow" hero.
 *
 * Replaces the dimmed video hero. A clean white stage with the headline on the
 * left and a floating cluster of vibrant product bottles on the right that:
 *   - animate in with a staggered reveal (scale + rise + fade),
 *   - drift with the cursor (per-layer mouse parallax — nearer bottles move more),
 *   - lift gently as you scroll the hero away,
 *   - idle-float forever (pure-CSS, so it survives reduced-motion as static).
 *
 * Bottles are transparent cutouts (public/hero/*.webp) so they overlap cleanly.
 * Botanical cutouts + a warm radial glow sit behind for depth.
 *
 * Reduced motion: no parallax, no entrance, no float — the composition simply
 * renders in its resting position. Never blue.
 */

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/chrome/MagneticButton";
import { buttonVariants } from "@/components/ui/button";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// ── Layer config ────────────────────────────────────────────────────────────
interface HeroLayer {
  src: string;
  alt: string;
  /** Absolute position + size inside the composition box. */
  pos: React.CSSProperties;
  /** 0 = far back (barely parallaxes) … 1 = foreground (parallaxes most). */
  depth: number;
  zIndex: number;
  /** Stagger delay (s) for the entrance reveal. */
  delay: number;
  /** Idle float cadence class (varied so bottles don't bob in lockstep). */
  floatClass: string;
  /** Soft grounding shadow. */
  dropShadow: string;
  /** Decorative (botanical) layers get muted opacity. */
  opacity?: number;
}

// Real products (background-removed from our actual catalog photos): the argan
// bottle standing between the two butter tubs, with an oversized leaf bundle.
const LAYERS: HeroLayer[] = [
  // Mudcloth drape — wide center backdrop so all products nestle into it
  {
    src: "/decor/cloth2.webp",
    alt: "",
    pos: {
      top: "2%", left: "3%", width: "120%",
      WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
      maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
    },
    depth: 0.12,
    zIndex: 3,
    delay: 0.04,
    floatClass: "animate-[hero-float_14s_ease-in-out_infinite_0.4s]",
    dropShadow: "drop-shadow(0 24px 38px rgba(42,30,20,0.16))",
    opacity: 1,
  },
  // Big mint-leaf bundle behind, top-right (enlarged)
  {
    src: "/decor/leaves.webp",
    alt: "",
    pos: { top: "-10%", right: "-5%", width: "48%" },
    depth: 0.16,
    zIndex: 5,
    delay: 0.05,
    floatClass: "animate-[hero-float_11s_ease-in-out_infinite]",
    dropShadow: "drop-shadow(0 22px 34px rgba(42,30,20,0.12))",
    opacity: 0.92,
  },
  // Argan oil — standing taller in the gap BETWEEN the two tubs (still behind them)
  {
    src: "/hero/argan.webp",
    alt: "Shea Allnaturals Organic Argan Oil",
    pos: { bottom: "5%", left: "33%", height: "88%" },
    depth: 0.5,
    zIndex: 18,
    delay: 0.2,
    floatClass: "animate-[hero-float_10s_ease-in-out_infinite_0.2s]",
    dropShadow: "drop-shadow(0 30px 40px rgba(42,30,20,0.2))",
  },
  // 100% Pure Shea Butter — front-left tub
  {
    src: "/hero/shea-butter.webp",
    alt: "Shea Allnaturals 100% Pure Shea Butter",
    pos: { bottom: "2%", left: "2%", width: "43%" },
    depth: 0.85,
    zIndex: 20,
    delay: 0.28,
    floatClass: "animate-[hero-float_12s_ease-in-out_infinite_0.7s]",
    dropShadow: "drop-shadow(0 34px 42px rgba(42,30,20,0.22))",
  },
  // Cocoa-Shea Butter — front-right tub
  {
    src: "/hero/cocoa.webp",
    alt: "Shea Allnaturals Cocoa-Shea Butter",
    pos: { bottom: "0%", right: "1%", width: "47%" },
    depth: 0.95,
    zIndex: 22,
    delay: 0.16,
    floatClass: "animate-[hero-float_12s_ease-in-out_infinite_0.95s]",
    dropShadow: "drop-shadow(0 34px 42px rgba(42,30,20,0.22))",
  },
  // Shea nuts — front-centre accent at the base
  {
    src: "/decor/shea-nuts.webp",
    alt: "",
    pos: { bottom: "-4%", left: "33%", width: "26%" },
    depth: 1,
    zIndex: 24,
    delay: 0.4,
    floatClass: "animate-[hero-float_8s_ease-in-out_infinite_0.5s]",
    dropShadow: "drop-shadow(0 16px 22px rgba(42,30,20,0.22))",
    opacity: 0.95,
  },
];

const MOUSE_X = 28; // px deflection at full mouse travel (× depth)
const MOUSE_Y = 18;

// ── Single parallax layer ─────────────────────────────────────────────────────
function ParallaxLayer({
  layer,
  px,
  py,
  reduced,
}: {
  layer: HeroLayer;
  px: MotionValue<number>;
  py: MotionValue<number>;
  reduced: boolean;
}) {
  // Mouse-driven offset, scaled by depth (nearer = moves more).
  const x = useTransform(px, (v) => v * layer.depth * MOUSE_X);
  const y = useTransform(py, (v) => v * layer.depth * MOUSE_Y);

  return (
    <motion.div
      className="absolute select-none"
      style={layer.pos}
      initial={reduced ? false : { opacity: 0, y: 48, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ease: WARM, duration: DUR.slow, delay: reduced ? 0 : layer.delay }}
    >
      {/* Mouse parallax */}
      <motion.div style={reduced ? undefined : { x, y }}>
        {/* Idle float */}
        <div className={reduced ? "" : `${layer.floatClass} motion-reduce:animate-none`}>
          <Image
            src={layer.src}
            alt={layer.alt}
            width={1000}
            height={1300}
            priority={layer.src.includes("/hero/")}
            sizes="(max-width: 1024px) 50vw, 40vw"
            className="h-auto w-full"
            style={{ filter: layer.dropShadow, opacity: layer.opacity ?? 1 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function ImageHero() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse parallax source (normalized −1…1), spring-smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const py = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  // Scroll: lift + fade the whole cluster as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const clusterY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const clusterOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.55]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Shea Allnaturals hero"
      className="relative w-full overflow-hidden bg-white"
    >
      {/* Subtle African mudcloth texture — ties the white home sections to the homeland scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/decor/mudcloth.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.05,
        }}
      />
      {/* Warm radial glow — keeps the white from feeling clinical, makes bottles pop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 72% 42%, rgba(235,165,44,0.16) 0%, rgba(226,116,43,0.07) 40%, rgba(255,255,255,0) 72%)",
        }}
      />
      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-6 px-5 pb-12 pt-[calc(3.5rem+4.5rem)] sm:px-8 lg:min-h-0 lg:max-w-[1440px] lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pb-20 lg:pt-[calc(3.5rem+3.5rem)] xl:max-w-[1640px] xl:gap-14 xl:px-20 xl:pb-24 xl:pt-[calc(3.5rem+4.5rem)] 2xl:max-w-[1840px]">
        {/* ── Text column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-6">
          <motion.p
            className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-clay"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: WARM, duration: DUR.base }}
          >
            Proudly made in Canada 🍁
          </motion.p>

          <RevealText
            text={"Pure botanicals,\nbeautifully made."}
            as="h1"
            className="font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-espresso sm:text-5xl lg:text-[4rem] xl:text-[4.6rem] 2xl:text-[5.2rem]"
          />

          <motion.p
            className="mt-6 max-w-md text-base leading-relaxed text-espresso/65 sm:text-lg xl:max-w-lg xl:text-xl"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: WARM, duration: DUR.base, delay: 0.25 }}
          >
            Shea butter, argan, and other botanical fats and oils — hand-crafted
            in Barrie, Ontario and packaged with intention for skin to remember.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: WARM, duration: DUR.base, delay: 0.38 }}
          >
            <MagneticButton>
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full bg-green px-8 font-semibold text-cream ring-1 ring-inset ring-orange/55 shadow-[0_10px_28px_-10px_rgba(226,116,43,0.5)] transition-all duration-200 hover:bg-green/90 hover:ring-orange hover:shadow-[0_12px_30px_-8px_rgba(226,116,43,0.62)]"
                )}
              >
                Shop the collection
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Credential chips — rounded, glassy over white */}
          <motion.ul
            className="mt-10 flex flex-wrap gap-2.5"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.base, delay: 0.5 }}
          >
            {["Cruelty-free", "Cold-pressed", "Fairly sourced"].map((c) => (
              <li
                key={c}
                className="rounded-full bg-orange px-4 py-1.5 text-xs font-semibold tracking-wide text-cream shadow-[0_6px_16px_-6px_rgba(226,116,43,0.55)]"
              >
                {c}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ── Composition column ──────────────────────────────────────────── */}
        <motion.div
          className="relative lg:col-span-6"
          style={reduced ? undefined : { y: clusterY, opacity: clusterOpacity }}
        >
          <div className="relative mx-auto aspect-[5/5] w-full max-w-3xl sm:aspect-[6/5] xl:max-w-none">
            {LAYERS.map((layer) => (
              <ParallaxLayer
                key={`${layer.src}-${layer.zIndex}`}
                layer={layer}
                px={px}
                py={py}
                reduced={reduced}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-espresso/35 sm:flex"
      >
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em]">Scroll</span>
        <span className="relative flex h-8 w-4 items-start justify-center rounded-full border border-espresso/25 p-1">
          <span className="h-1.5 w-0.5 animate-[scrollcue_1.8s_ease-in-out_infinite] rounded-full bg-espresso/45 motion-reduce:animate-none" />
        </span>
      </div>
    </section>
  );
}
