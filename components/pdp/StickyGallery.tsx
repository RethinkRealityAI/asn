"use client";

/**
 * StickyGallery
 *
 * Large main image + optional thumbnail rail for the PDP.
 * - Main image: next/image, tasteful hover zoom (reduced-motion safe)
 * - Thumbnail rail: left on desktop, below on mobile; click/keyboard selects main
 * - Single image: no rail rendered
 * - Sticky on desktop (position: sticky) while info column scrolls
 * - Never blue. AA keyboard accessible. honors prefers-reduced-motion.
 */

import { useState, KeyboardEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductImage } from "@/lib/shopify/types";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

interface StickyGalleryProps {
  images: ProductImage[];
  title: string;
}

export function StickyGallery({ images, title }: StickyGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const hasRail = images.length > 1;
  const active = images[activeIdx] ?? images[0];

  function handleThumbKeyDown(
    e: KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % images.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(images.length - 1);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setActiveIdx(idx);
    }
  }

  const imageScale = !reducedMotion && hovered ? 1.06 : 1;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-3 md:gap-4",
        "md:sticky md:top-24 md:self-start"
      )}
    >
      {/* ── Thumbnail rail — left on md+, hidden when single image ─────── */}
      {hasRail && (
        <div
          role="tablist"
          aria-label="Product images"
          className="flex flex-row md:flex-col gap-2 order-2 md:order-1 md:w-16 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[500px]"
        >
          {images.map((img, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${idx + 1}: ${img.altText || title}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIdx(idx)}
                onKeyDown={(e) => handleThumbKeyDown(e, idx)}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 md:w-full md:h-16 rounded-xl overflow-hidden",
                  "border-2 transition-all duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-1",
                  isActive
                    ? "border-green"
                    : "border-espresso/12 hover:border-green/50"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${title} — image ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1 bg-white"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main image ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] order-1 md:order-2 flex-1",
          // Glassy card with a soft green accent border — no dull beige
          "border border-green/25 bg-gradient-to-br from-white to-[#EEF5EE]/70",
          "shadow-[var(--shadow-card)] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.7),0_12px_28px_-8px_rgba(42,30,20,0.12)]"
        )}
        style={{ aspectRatio: "1 / 1" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: imageScale }}
          transition={{ ease: WARM, duration: DUR.base }}
          style={{ transformOrigin: "center center" }}
        >
          {active ? (
            <Image
              src={active.url}
              alt={active.altText || title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-contain p-8"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-espresso/30 text-sm font-body">
                No image available
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
