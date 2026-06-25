"use client";

/**
 * VideoHero — full-bleed video-background hero.
 *
 * Replaces the scroll-scrubbed Hero3D on the homepage. The brand promo video
 * plays as a dimmed, looping backdrop; the existing hero copy (eyebrow,
 * headline, subcopy, CTAs) floats on top via HeroOverlay, left-aligned.
 *
 * Design decisions:
 *   - 90vh height — a clean single viewport, no scroll runway.
 *   - Warm espresso-to-transparent scrim ensures AA contrast on the headline.
 *   - prefers-reduced-motion / no-autoplay → renders <HeroFallback /> (poster
 *     static image) — no <video> autoplay fires.
 *   - SSR-safe: usePrefersReducedMotion starts false on server → video renders
 *     by default; the hook flips it client-side if needed (no flash).
 *   - preload="metadata" — browser fetches duration/dimensions only until play.
 *   - poster shown instantly before first video frame paints.
 *
 * Brand rules: never blue. Warm "Sun & Soil" palette only.
 */

import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { HeroOverlay } from "./HeroOverlay";
import { HeroFallback } from "./HeroFallback";

export function VideoHero() {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Honor prefers-reduced-motion: show the static poster hero instead of
  // autoplaying video. This covers both accessibility and battery concerns.
  if (reducedMotion) {
    return <HeroFallback />;
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "90vh" }}
      aria-label="Shea Allnaturals hero"
    >
      {/* ── Video background ──────────────────────────────────────────────── */}
      {/*
        CSS filter treatment: desaturate + warm sepia + slight blur so old blue
        labels are not legible and no brand-violating hue bleeds through.
        brightness(0.78) keeps it dark enough that the scrim below can ensure
        AA contrast without going pitch-black. blur(3px) smears fine label
        text into pure atmosphere. saturate(0.35) kills the blue channel.
        sepia(0.28) adds warm amber-tobacco cast matching the brand palette.
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/hero-poster.jpg"
        aria-hidden="true"
        style={{
          filter: "saturate(0.35) sepia(0.28) brightness(0.78) blur(3px)",
          transform: "scale(1.03)", /* compensate blur edge-bleeding */
        }}
      >
        {/* WebM first (smaller / VP9 quality); MP4 as universal fallback */}
        <source src="/video/hero.webm" type="video/webm" />
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* ── Warm dim scrim ────────────────────────────────────────────────── */}
      {/*
        Three-layer scrim for maximum warmth + AA legibility:
        1. Overall espresso tint (60%) — deepens the already-filtered frame.
        2. Warm amber bottom-to-top gradient — like firelight rising from below.
        3. Left-to-right directional gradient — heaviest where the text card sits.
        Combined: headline area is near-black espresso; right side shows warm video.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-espresso/60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(42,20,8,0.55) 0%, rgba(42,20,8,0.15) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(30,17,10,0.72) 0%, rgba(30,17,10,0.40) 45%, rgba(30,17,10,0.12) 75%, rgba(30,17,10,0) 100%)",
        }}
      />

      {/* ── Foreground overlay (eyebrow + headline + CTAs) ───────────────── */}
      {/*
        HeroOverlay contains GlassCard → carries its own warm cream wash so the
        text is espresso-on-cream inside the card. The dark scrim beneath
        ensures the card edges are legible even if the glass is translucent.
      */}
      <div className="absolute inset-0 flex items-center">
        <HeroOverlay showScrollCue={false} />
      </div>

      {/* ── Subtle scroll cue ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/50 sm:flex"
      >
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em]">
          Scroll
        </span>
        <span className="relative flex h-8 w-4 items-start justify-center rounded-full border border-cream/40 p-1">
          <span className="h-1.5 w-0.5 animate-[scrollcue_1.8s_ease-in-out_infinite] rounded-full bg-cream/60 motion-reduce:animate-none" />
        </span>
      </div>
    </section>
  );
}
