/**
 * Home page
 *
 * Hero (Task 2.2): the scroll-scrubbed 3D peppermint-oil moment lives in
 * <Hero3D/> — a tall section with a pinned canvas stage that reveals, spins,
 * and dollies the bottle as you scroll, with a liquid-refract CTA card on top.
 * Reduced-motion / no-WebGL visitors get the static poster fallback instead.
 *
 * The sections below are minimal placeholders that exist only to give scroll
 * depth past the hero; the real homepage sections (products, story, etc.)
 * arrive in later tasks.
 */
import { Hero3D } from "@/components/three/Hero3D";

export default function Home() {
  return (
    <>
      {/* ── Hero — scroll-scrubbed 3D peppermint reveal ───────────────── */}
      <Hero3D />

      {/* ── Placeholder sections — scroll depth past the hero ─────────── */}
      <section id="products" className="bg-[#F0E6D0] py-24 px-6 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-espresso mb-4">
          Featured Products
        </h2>
        <p className="text-espresso/60 max-w-lg mx-auto text-base">
          Product cards arrive in a later task — placeholder section for scroll
          depth.
        </p>
      </section>

      <section id="story" className="bg-espresso text-cream py-24 px-6 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
          Our Story
        </h2>
        <p className="max-w-xl mx-auto text-cream/70 text-base leading-relaxed">
          Full story section arrives in a later task — placeholder for scroll
          depth.
        </p>
      </section>
    </>
  );
}
