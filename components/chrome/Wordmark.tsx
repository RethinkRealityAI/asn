/**
 * Wordmark — "Shea 🍁 Allnaturals" text lockup.
 *
 * Renders as text (not an image) for crisp scaling and full recolorability.
 * Color = currentColor, so a parent simply sets text-espresso or text-cream.
 * The inline maple-leaf SVG always renders in leaf red (#D5372A).
 *
 * Props:
 *   className — forwarded to the root <span>
 *   size      — controls font-size class (defaults to "text-2xl")
 */

import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Tailwind font-size class, e.g. "text-xl", "text-3xl". Default "text-2xl". */
  size?: string;
}

export function Wordmark({ className, size = "text-2xl" }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-wordmark font-semibold tracking-tight select-none",
        size,
        className
      )}
      aria-label="Shea Allnaturals"
      role="img"
    >
      {/* "Shea" — inherits currentColor */}
      <span>Shea</span>

      {/* Maple leaf — fixed leaf red regardless of context */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline-block shrink-0 w-[0.85em] h-[0.85em]"
      >
        {/*
          Canadian maple leaf silhouette, filled solid.
          Path adapted from standard maple-leaf outline (11-lobed).
        */}
        <path
          d="M12 2
             L13.5 6.5 L17 5 L15 8.5 L19.5 9 L16.5 11.5 L18 14
             L14 13 L14 16 L12 14 L10 16 L10 13 L6 14
             L7.5 11.5 L4.5 9 L9 8.5 L7 5 L10.5 6.5 Z
             M11 16 L11 22 L13 22 L13 16 Z"
          fill="#D5372A"
        />
      </svg>

      {/* "Allnaturals" — inherits currentColor */}
      <span>Allnaturals</span>
    </span>
  );
}
