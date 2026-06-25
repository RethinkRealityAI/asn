"use client";

/**
 * Hero3D — the hero section wrapper that drives the scroll-scrubbed 3D bottle.
 *
 * Layout / scroll-scrub:
 *   The <section> is tall (180vh) so there is real scroll distance to scrub.
 *   Inside it, a `sticky top-0 h-screen` stage pins the canvas to the viewport
 *   while the page scrolls past. `useScroll({ target, offset })` measures the
 *   section against the viewport and yields `scrollYProgress` (0 → 1 from when
 *   the section's start hits the viewport start, to when its end hits the
 *   viewport end). That MotionValue is handed to HeroScene, which reads it
 *   every frame in useFrame and maps it to reveal / spin / dolly. Because we
 *   read the live value (not a snapshot), scrubbing BACK reverses the motion.
 *
 * Code-splitting:
 *   HeroScene (and therefore three / @react-three/*) is loaded via
 *   `next/dynamic(..., { ssr: false })`. This is allowed here because THIS file
 *   is a Client Component (see AGENTS.md). Three.js never enters the server or
 *   initial route bundle — it arrives in its own async chunk on the client.
 *
 * Fallbacks (no canvas at all):
 *   - prefers-reduced-motion  → static poster hero
 *   - WebGL unavailable        → static poster hero
 *   Both render <HeroFallback/> with the identical headline + CTA.
 */

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useScroll } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { HeroFallback } from "./HeroFallback";
import { HeroOverlay } from "./HeroOverlay";

// Three.js + R3F live in an async, client-only chunk. ssr:false is permitted
// because this wrapper is a Client Component.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

/** One-time WebGL feature detection (client only). */
function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function Hero3D() {
  const reducedMotion = usePrefersReducedMotion();

  // null = not yet checked (SSR / first paint); we render the static-safe
  // shell until the client confirms WebGL support, avoiding a flash of canvas.
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  useEffect(() => {
    setWebglOk(detectWebGL());
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Decide which experience to show.
  // While webglOk is null (pre-mount) we lean on the poster fallback so the
  // server render and first client paint match and stay legible.
  const useCanvas = !reducedMotion && webglOk === true;

  if (reducedMotion || webglOk === false) {
    return <HeroFallback />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "180vh" }}
      aria-label="Shea Allnaturals hero"
    >
      {/* Sticky stage — pinned to the viewport across the scroll distance. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-cream">
        {/* Warm radial wash behind the bottle (no blue). */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_42%,#FBF4E6_0%,#F5ECDA_52%,#EAD9BC_100%)]"
        />
        {/* Soft golden bloom centered on the product. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(45%_42%_at_55%_55%,rgba(235,165,44,0.18)_0%,rgba(235,165,44,0)_70%)]"
        />

        {/* 3D canvas (client-only chunk). Absolutely positioned full-bleed. */}
        {useCanvas && (
          <div className="absolute inset-0">
            <HeroScene scrollYProgress={scrollYProgress} />
          </div>
        )}

        {/* Floating CTA — left-aligned premium hero. */}
        <div className="absolute inset-0 flex items-center">
          <HeroOverlay showScrollCue={useCanvas} />
        </div>
      </div>
    </section>
  );
}
