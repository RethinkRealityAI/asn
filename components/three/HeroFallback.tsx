/**
 * HeroFallback — static, server-safe hero.
 *
 * Rendered instead of the 3D canvas when:
 *   - the user prefers reduced motion, OR
 *   - WebGL is unavailable.
 *
 * No canvas, no animation, no three.js. Just a clean warm still (the
 * pre-rendered `hero-poster.webp`) with the SAME headline + CTA overlay as the
 * animated hero, so the page reads identically and stays fully legible.
 *
 * This component is intentionally NOT marked "use client" — it has no
 * interactivity and can render on the server. The CTA pieces it pulls in
 * (RevealText, MagneticButton) are themselves client components and hydrate
 * on their own.
 */

import Image from "next/image";
import { HeroOverlay } from "./HeroOverlay";

export function HeroFallback() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-cream">
      {/* Static poster — warm peppermint-oil still on cream */}
      <Image
        src="/hero-poster.webp"
        alt="Shea Allnaturals peppermint essential oil on a warm cream backdrop"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Soft cream vignette to keep the headline legible over the image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_45%,rgba(245,236,218,0.55)_0%,rgba(245,236,218,0.15)_45%,rgba(245,236,218,0)_70%)]"
      />

      {/* Shared CTA overlay (no scroll cue — nothing to scrub) */}
      <div className="absolute inset-0 flex items-center">
        <HeroOverlay showScrollCue={false} />
      </div>
    </section>
  );
}
