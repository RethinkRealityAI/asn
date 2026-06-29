"use client";

/**
 * AccentCorners — the one consistent way to dress a block's corners with the
 * brand's botanical cutouts.
 *
 * Replaces the old approach of scattering decor elements at arbitrary
 * positions. Drop this inside any `position: relative` block and it lays
 * paired botanicals into the corners — subtle, consistent, premium.
 *
 * Motion (the polish): as a section scrolls into view each botanical SLIDES IN
 * from its own edge + fades + scales up to its resting "peek" position, then
 * idle-floats forever. Because each corner enters from its own direction (and
 * is staggered), section seams read as intentional, choreographed reveals
 * rather than statically-clipped blobs. Honors prefers-reduced-motion (renders
 * at rest, no entrance, no float).
 *
 * Usage:
 *   <section className="relative overflow-hidden ...">
 *     <AccentCorners corners={{ tl: "argan", br: "shea" }} />
 *     …content (give it a higher z-index or wrap in `relative z-10`)…
 *   </section>
 *
 * tone:
 *   - "dark"  (default) — natural cutout colours, low opacity. For light/white/cream grounds.
 *   - "light"           — white knockout silhouette. For dark/green/espresso grounds.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

export type AccentCorner = "tl" | "tr" | "bl" | "br";
export type AccentDecor = "argan" | "castor" | "shea";

interface AccentCornersProps {
  /** Which corners get which botanical. Default: argan top-left + shea bottom-right. */
  corners?: Partial<Record<AccentCorner, AccentDecor>>;
  /** Natural (dark grounds) vs white-knockout (light, for dark grounds). */
  tone?: "dark" | "light";
  /** Base opacity 0..1. Default 0.12 (light) / 0.14 (dark), boosted ~1.45×. */
  opacity?: number;
  /** Max rendered size in px (responsive clamp floors lower). Default 160. */
  size?: number;
  /** Gentle idle float. Default true. Always disabled under prefers-reduced-motion. */
  float?: boolean;
  /** Forwarded to the absolute overlay (e.g. to inherit a parent's rounding). */
  className?: string;
}

/** Per-corner anchor (the peek/rotate transform lives on a nested static div). */
const CORNER_ANCHOR: Record<AccentCorner, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

/** Outward "peek" + rotation so the motif reads as growing in from the edge. */
const CORNER_PEEK: Record<AccentCorner, string> = {
  tl: "translate(-26%, -30%) rotate(-16deg)",
  tr: "translate(26%, -32%) rotate(15deg)",
  bl: "translate(-26%, 30%) rotate(12deg)",
  br: "translate(26%, 32%) rotate(-14deg)",
};

/** Entrance offset — each corner slides in from its own side of the frame. */
const CORNER_REVEAL: Record<AccentCorner, { x: number; y: number }> = {
  tl: { x: -34, y: -28 },
  tr: { x: 34, y: -28 },
  bl: { x: -34, y: 28 },
  br: { x: 34, y: 28 },
};

/** Vary the float cadence per corner so paired accents don't bob in lockstep. */
const FLOAT_CLASS: Record<AccentCorner, string> = {
  tl: "animate-[accent-float_9s_ease-in-out_infinite]",
  tr: "animate-[accent-float_11s_ease-in-out_infinite_0.6s]",
  bl: "animate-[accent-float_10s_ease-in-out_infinite_0.3s]",
  br: "animate-[accent-float_12s_ease-in-out_infinite_0.9s]",
};

const DEFAULT_CORNERS: Partial<Record<AccentCorner, AccentDecor>> = {
  tl: "argan",
  br: "shea",
};

export function AccentCorners({
  corners = DEFAULT_CORNERS,
  tone = "dark",
  opacity,
  size = 160,
  float = true,
  className,
}: AccentCornersProps) {
  const reduced = usePrefersReducedMotion();
  const baseOpacity = Math.min(0.3, (opacity ?? (tone === "light" ? 0.12 : 0.14)) * 1.45);
  const entries = Object.entries(corners) as [AccentCorner, AccentDecor][];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {entries.map(([corner, decor], i) => {
        // Static inner stack: peek/rotate → idle float → image.
        const inner = (
          <div style={{ transform: CORNER_PEEK[corner] }}>
            <div className={cn(!reduced && float && FLOAT_CLASS[corner], "motion-reduce:animate-none")}>
              <Image
                src={`/decor/${decor}.webp`}
                alt=""
                width={400}
                height={400}
                className={cn("h-auto", tone === "light" && "brightness-0 invert")}
                style={{
                  width: `clamp(${Math.round(size * 0.8)}px, 18vw, ${Math.round(size * 1.5)}px)`,
                  opacity: baseOpacity,
                }}
              />
            </div>
          </div>
        );

        if (reduced) {
          return (
            <div key={corner} className="absolute select-none" style={CORNER_ANCHOR[corner]}>
              {inner}
            </div>
          );
        }

        return (
          <motion.div
            key={corner}
            className="absolute select-none"
            style={CORNER_ANCHOR[corner]}
            initial={{ opacity: 0, x: CORNER_REVEAL[corner].x, y: CORNER_REVEAL[corner].y, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ ease: WARM, duration: DUR.slow, delay: i * 0.12 }}
          >
            {inner}
          </motion.div>
        );
      })}
    </div>
  );
}
