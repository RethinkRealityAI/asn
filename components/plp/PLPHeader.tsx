/**
 * PLPHeader
 *
 * Editorial header band for Product Listing Pages.
 * - Warm cream/marigold gradient background
 * - Display-weight title + optional subtitle
 * - Product count eyebrow
 * - Optional breadcrumb slot
 *
 * Server-safe: no "use client" — rendered on the server, hydrated as static HTML.
 * Never blue.
 */

import { cn } from "@/lib/utils";

export interface PLPHeaderProps {
  title: string;
  subtitle?: string;
  count: number;
  /** Optional breadcrumb content — pass a <nav> or <ol> */
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PLPHeader({
  title,
  subtitle,
  count,
  breadcrumb,
  className,
}: PLPHeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-gradient-to-b from-cream to-[#F5ECDA]/60",
        "border-b border-espresso/08",
        "px-4 sm:px-6 lg:px-8 py-10 sm:py-14",
        className
      )}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col gap-3">
        {/* Breadcrumb slot */}
        {breadcrumb && (
          <div className="text-xs font-body text-espresso/50">{breadcrumb}</div>
        )}

        {/* Eyebrow count */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-marigold">
          {count === 0
            ? "No products"
            : `${count} product${count === 1 ? "" : "s"}`}
        </p>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-body text-base sm:text-lg text-espresso/65 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
