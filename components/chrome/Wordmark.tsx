/**
 * Wordmark — the official "Shea 🍁 Allnaturals" HD logo lockup.
 *
 * Renders the real brand artwork (cocoa letterforms + signature red maple-leaf
 * divider + ™), not text, so the mark is always pixel-accurate and on-brand.
 *
 * Two versions (use whichever fits the space):
 *   - "horizontal" (default, 1268×123) — bars, headers, footers, inline lockups.
 *   - "stacked"    (1376×627)          — centered / compact / square moments.
 *
 * Sizing: control the rendered HEIGHT with a Tailwind class via `className`
 * (e.g. "h-7 sm:h-8"); width stays auto from the intrinsic ratio → no layout shift.
 *
 * Tone:
 *   - "dark"  (default) — artwork as-is (cocoa + red leaf). Use on white/cream.
 *   - "light"           — pure-white knockout for dark grounds (espresso footer).
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** "horizontal" (default) or "stacked". */
  variant?: "horizontal" | "stacked";
  /** "dark" = cocoa+red artwork (default); "light" = white knockout for dark grounds. */
  tone?: "dark" | "light";
  /** Eagerly load (use for the header logo above the fold). */
  priority?: boolean;
}

const ART = {
  horizontal: { src: "/brand/logo-blue-horizontal.png", width: 1268, height: 123 },
  stacked: { src: "/brand/logo-blue-stacked.png", width: 1376, height: 627 },
} as const;

export function Wordmark({
  className,
  variant = "horizontal",
  tone = "dark",
  priority = false,
}: WordmarkProps) {
  const art = ART[variant];
  return (
    <Image
      src={art.src}
      alt="Shea Allnaturals"
      width={art.width}
      height={art.height}
      priority={priority}
      sizes={variant === "stacked" ? "200px" : "(max-width: 640px) 220px, 330px"}
      className={cn(
        "w-auto select-none",
        "h-7",
        tone === "light" && "brightness-0 invert",
        className
      )}
    />
  );
}
