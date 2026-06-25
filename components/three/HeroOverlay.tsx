"use client";

/**
 * HeroOverlay — the floating CTA card that sits on top of the hero
 * (over the 3D canvas in Hero3D, over the poster in HeroFallback).
 *
 * This is the ONE place the `liquid-refract` lens effect is earned: a premium,
 * glassy card holding the headline, subcopy, and calls-to-action. The
 * refractive lens (Chromium) gracefully degrades to a warm blur elsewhere —
 * handled inside LiquidGlass.
 *
 * Legibility: the card carries its own warm cream wash + bevel, and the text is
 * espresso on cream → AA+ contrast even over the lighter parts of the hero.
 *
 * Shared between the animated and reduced-motion heroes so the headline + CTA
 * are pixel-identical in both states.
 */

import { GlassCard } from "@/components/glass/glass-card";
import { CardContent } from "@/components/ui/card";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/chrome/MagneticButton";
import { Button } from "@/components/ui/button";

interface HeroOverlayProps {
  /** Show the bottom scroll-cue indicator (animated hero only). */
  showScrollCue?: boolean;
}

export function HeroOverlay({ showScrollCue = true }: HeroOverlayProps) {
  return (
    <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16">
      <GlassCard
        glassVariant="liquid-refract"
        liquidProps={{ refraction: 14, blur: 2, bezel: 0.4 }}
        surfaceClassName="!rounded-[28px] max-w-xl"
      >
        <CardContent className="px-8 py-10 sm:px-10 sm:py-12">
          {/* Eyebrow */}
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-espresso/55">
            Pure · botanical · made in Canada
          </p>

          {/* Headline */}
          <RevealText
            text={"Pure botanicals,\nbeautifully made."}
            as="h1"
            className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-espresso"
          />

          {/* Subcopy */}
          <p className="mt-5 max-w-md text-base sm:text-lg font-body leading-relaxed text-espresso/75">
            Shea butter, argan, and cold-pressed botanical oils — crafted by
            hand and bottled with intention.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button size="lg" className="px-8">
                Shop the collection
              </Button>
            </MagneticButton>
            <a
              href="#story"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-espresso/80 underline-offset-4 transition-colors hover:text-clay hover:underline"
            >
              Explore the ritual
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </div>
        </CardContent>
      </GlassCard>

      {/* Scroll cue — only in the animated hero (something to scrub). */}
      {showScrollCue && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-espresso/45 sm:flex"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
            Scroll to reveal
          </span>
          <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-espresso/30 p-1">
            <span className="h-1.5 w-1 animate-[scrollcue_1.8s_ease-in-out_infinite] rounded-full bg-espresso/50 motion-reduce:animate-none" />
          </span>
        </div>
      )}
    </div>
  );
}
