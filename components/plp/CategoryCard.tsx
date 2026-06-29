/**
 * CategoryCard — premium collection card.
 *
 * A representative product photo fills the rounded card; a frosted-glass label
 * strip (glass over imagery — where glass actually shines) carries the title +
 * count. Hover lifts the card and gently zooms the image. A subtle botanical
 * corner accent ties it to the rest of the site. No sharp corners. Never blue.
 *
 * Server component (hover is pure CSS).
 */

import Image from "next/image";
import Link from "next/link";
import { AccentCorners, type AccentDecor } from "@/components/motion/AccentCorners";

interface CategoryCardProps {
  href: string;
  title: string;
  count: number;
  /** Representative product image url (local /media webp), or null. */
  cover: string | null;
  /** Botanical accent for the top corner, rotated through for variety. */
  accent?: AccentDecor;
  priority?: boolean;
}

export function CategoryCard({ href, title, count, cover, accent = "argan", priority }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-white/60 bg-image-zone transition-all duration-300 ease-[--ease-warm] hover:-translate-y-1.5 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.7),0_18px_44px_-16px_rgba(42,30,20,0.2)] hover:[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.9),0_28px_58px_-16px_rgba(42,30,20,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-[--ease-warm] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cream">
            <span className="font-display text-2xl font-semibold text-espresso/30">{title}</span>
          </div>
        )}

        {/* subtle botanical corner accent over the image */}
        <AccentCorners corners={{ tr: accent }} tone="light" size={96} opacity={0.16} float={false} />

        {/* warm bottom fade so the glass label always reads */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-espresso/30 to-transparent" />
      </div>

      {/* Frosted-glass label strip — glass over imagery */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl border border-[#F5ECDA]/60 bg-[#F5ECDA]/55 px-4 py-3 backdrop-blur-md backdrop-saturate-150 shadow-[0_2px_16px_rgba(42,30,20,0.12)]">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold leading-snug text-espresso">{title}</p>
          <p className="text-[0.7rem] text-espresso/55">{count} product{count !== 1 ? "s" : ""}</p>
        </div>
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-cream transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}
