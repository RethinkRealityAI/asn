/**
 * AccentCorners — the one consistent way to dress a block's corners with the
 * brand's botanical cutouts.
 *
 * Replaces the old approach of scattering decor elements at arbitrary
 * positions. Drop this inside any `position: relative` block and it lays
 * paired botanicals into the corners — subtle, consistent, and reduced-motion
 * safe (the gentle idle float is pure CSS and disabled by motion-reduce).
 *
 * Usage:
 *   <section className="relative overflow-hidden ...">
 *     <AccentCorners corners={{ tl: "leaves", br: "shea-nuts" }} />
 *     …content (give it a higher z-index or wrap in `relative z-10`)…
 *   </section>
 *
 * Server component (no hooks) — safe to use in RSC sections.
 *
 * tone:
 *   - "dark"  (default) — natural cutout colours, low opacity. For light/white/cream grounds.
 *   - "light"           — white knockout silhouette. For dark/green/espresso grounds.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

export type AccentCorner = "tl" | "tr" | "bl" | "br";
export type AccentDecor = "argan" | "castor" | "shea";

interface AccentCornersProps {
  /** Which corners get which botanical. Default: leaves top-left + shea-nuts bottom-right. */
  corners?: Partial<Record<AccentCorner, AccentDecor>>;
  /** Natural (dark grounds) vs white-knockout (light, for dark grounds). */
  tone?: "dark" | "light";
  /** Base opacity 0..1. Default 0.12 (dark) / 0.1 (light). */
  opacity?: number;
  /** Max rendered size in px (responsive clamp floors lower). Default 160. */
  size?: number;
  /** Gentle idle float. Default true. Always disabled under prefers-reduced-motion. */
  float?: boolean;
  /** Forwarded to the absolute overlay (e.g. to inherit a parent's rounding). */
  className?: string;
}

/** Per-corner anchor + outward base transform so the motif "peeks" from the edge. */
const CORNER_STYLE: Record<AccentCorner, React.CSSProperties> = {
  tl: { top: 0, left: 0, transform: "translate(-26%, -30%) rotate(-16deg)" },
  tr: { top: 0, right: 0, transform: "translate(26%, -32%) rotate(15deg)" },
  bl: { bottom: 0, left: 0, transform: "translate(-26%, 30%) rotate(12deg)" },
  br: { bottom: 0, right: 0, transform: "translate(26%, 32%) rotate(-14deg)" },
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
  const baseOpacity = Math.min(0.3, (opacity ?? (tone === "light" ? 0.12 : 0.14)) * 1.45);
  const entries = Object.entries(corners) as [AccentCorner, AccentDecor][];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {entries.map(([corner, decor]) => (
        <div key={corner} className="absolute select-none" style={CORNER_STYLE[corner]}>
          <div className={cn(float && FLOAT_CLASS[corner], "motion-reduce:animate-none")}>
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
      ))}
    </div>
  );
}
