"use client";

/**
 * HeroOverlay — the floating headline + CTA block that sits on top of the hero.
 *
 * Design (updated: warm video treatment pass):
 *   The video is now heavily filtered (desaturated + sepia + blurred) to a warm
 *   atmospheric backdrop. We no longer use the glass card — instead the headline
 *   and subcopy are cream (#F5ECDA) rendered directly against the dark espresso
 *   scrim, with a soft text-shadow for legibility. This reads as premium editorial
 *   (Aesop / Glossier territory) rather than a glass UI panel.
 *
 *   Legibility: scrim + text-shadow ensures WCAG AA on cream over espresso/60.
 *   Shared between the animated and reduced-motion heroes so the headline + CTA
 *   are pixel-identical in both states.
 */

import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/chrome/MagneticButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroOverlayProps {
  /** Show the bottom scroll-cue indicator (animated hero only). */
  showScrollCue?: boolean;
}

export function HeroOverlay({ showScrollCue = true }: HeroOverlayProps) {
  return (
    <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16">
      <div className="max-w-xl">
        {/* Eyebrow */}
        <p
          className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-marigold"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          Pure · botanical · made in Canada
        </p>

        {/* Headline — cream on dark scrim */}
        <RevealText
          text={"Pure botanicals,\nbeautifully made."}
          as="h1"
          className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-cream"
        />

        {/* Subcopy */}
        <p
          className="mt-5 max-w-md text-base sm:text-lg font-body leading-relaxed text-cream/85"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
        >
          Shea butter, argan, and cold-pressed botanical oils — crafted by
          hand and bottled with intention.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <MagneticButton>
            <Button
              size="lg"
              className="px-8 bg-marigold text-espresso hover:bg-orange hover:text-cream font-semibold transition-colors duration-200"
            >
              Shop the collection
            </Button>
          </MagneticButton>
          <Link
            href="#story"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cream/80 underline-offset-4 transition-colors hover:text-marigold"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            Explore the ritual
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll cue — only in the animated hero (something to scrub). */}
      {showScrollCue && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/45 sm:flex"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
            Scroll to reveal
          </span>
          <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-cream/30 p-1">
            <span className="h-1.5 w-1 animate-[scrollcue_1.8s_ease-in-out_infinite] rounded-full bg-cream/50 motion-reduce:animate-none" />
          </span>
        </div>
      )}
    </div>
  );
}
