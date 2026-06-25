"use client";

/**
 * HomelandScene — the animated decorative layer of the Homeland section.
 *
 * This client component owns all framer-motion scroll/reveal logic.
 * The parent HomelandBand (server component) imports this so Next.js can
 * server-render the text content and only hydrate the motion layer.
 *
 * Design:
 *   - Green (#2F7D4F) background with mudcloth texture overlay.
 *   - 6 floating decor elements (leaves, shea-nuts, oil, shea-butter decors
 *     + 2 product images) arranged around the text column.
 *   - On scroll into view: staggered fade + scale-up + translate-up reveal.
 *   - Gentle parallax: slower elements drift at 0.15x scroll speed.
 *   - prefers-reduced-motion: elements simply present, no animation.
 */

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

/** Each floating element's placement and parallax config */
interface FloatingElement {
  src: string;
  alt: string;
  /** Tailwind + inline positioning classes */
  className: string;
  style: React.CSSProperties;
  /** Parallax offset range in px — positive = moves up as user scrolls down */
  parallaxRange: [number, number];
  /** Stagger index for the reveal animation */
  index: number;
  /** Image intrinsic size (for next/image optimization) */
  width: number;
  height: number;
}

const ELEMENTS: FloatingElement[] = [
  // Top-right: leaves curling in from corner
  {
    src: "/decor/leaves.webp",
    alt: "",
    className: "absolute pointer-events-none select-none",
    style: {
      top: "-2%",
      right: "-3%",
      width: "clamp(160px, 20vw, 280px)",
      opacity: 0.82,
      transform: "rotate(18deg)",
      zIndex: 2,
    },
    parallaxRange: [-30, 20],
    index: 0,
    width: 400,
    height: 400,
  },
  // Bottom-left: shea nuts spilling in
  {
    src: "/decor/shea-nuts.webp",
    alt: "",
    className: "absolute pointer-events-none select-none",
    style: {
      bottom: "6%",
      left: "-2%",
      width: "clamp(120px, 14vw, 210px)",
      opacity: 0.75,
      transform: "rotate(-12deg)",
      zIndex: 2,
    },
    parallaxRange: [20, -20],
    index: 1,
    width: 400,
    height: 400,
  },
  // Mid-right: oil drizzle decor — pushed into the right column (visible on desktop, hugs edge on mobile)
  {
    src: "/decor/oil.webp",
    alt: "",
    className: "absolute pointer-events-none select-none",
    style: {
      top: "38%",
      right: "-2%",
      width: "clamp(70px, 8vw, 130px)",
      opacity: 0.55,
      transform: "rotate(6deg)",
      zIndex: 1,
    },
    parallaxRange: [-20, 30],
    index: 2,
    width: 300,
    height: 400,
  },
  // Bottom-centre: shea butter texture chunk
  {
    src: "/decor/shea-butter.webp",
    alt: "",
    className: "absolute pointer-events-none select-none",
    style: {
      bottom: "-3%",
      left: "38%",
      width: "clamp(90px, 10vw, 160px)",
      opacity: 0.55,
      transform: "rotate(-5deg)",
      zIndex: 1,
    },
    parallaxRange: [10, -15],
    index: 3,
    width: 300,
    height: 300,
  },
  // Right column — product: 100% Pure Shea Butter jar
  {
    src: "/media/100-pure-shea-butter-2/01.webp",
    alt: "100% Pure Shea Butter",
    className: "absolute pointer-events-none select-none",
    style: {
      bottom: "8%",
      right: "6%",
      width: "clamp(110px, 13vw, 190px)",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      zIndex: 5,
      transform: "rotate(-3deg)",
    },
    parallaxRange: [-25, 25],
    index: 4,
    width: 400,
    height: 500,
  },
  // Right column — product: Cocoa Shea Butter
  {
    src: "/media/cocoa-shea-butter/02.webp",
    alt: "Cocoa Shea Butter",
    className: "absolute pointer-events-none select-none",
    style: {
      top: "8%",
      right: "18%",
      width: "clamp(90px, 11vw, 160px)",
      borderRadius: "14px",
      boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
      zIndex: 4,
      transform: "rotate(4deg)",
      opacity: 0.88,
    },
    parallaxRange: [-15, 20],
    index: 5,
    width: 400,
    height: 500,
  },
];

/** Single floating element with parallax + reveal */
function FloatEl({ el }: { el: FloatingElement }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], el.parallaxRange);

  if (reduced) {
    return (
      <div ref={ref} className={el.className} style={el.style} aria-hidden="true">
        <Image
          src={el.src}
          alt={el.alt}
          width={el.width}
          height={el.height}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={el.className}
      style={{ ...el.style, y }}
      initial={{ opacity: 0, scale: 0.82, y: 40 }}
      whileInView={{ opacity: el.style.opacity as number ?? 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{
        ease: WARM,
        duration: DUR.slow,
        delay: 0.08 + el.index * 0.1,
      }}
      aria-hidden="true"
    >
      <Image
        src={el.src}
        alt={el.alt}
        width={el.width}
        height={el.height}
        style={{ width: "100%", height: "auto" }}
      />
    </motion.div>
  );
}

export function HomelandScene() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Mudcloth texture — low opacity corner motif */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/decor/mudcloth.webp)",
          backgroundSize: "clamp(220px, 28vw, 400px)",
          backgroundRepeat: "repeat",
          backgroundPosition: "top right",
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      />
      {/* Additional mudcloth instance — offset bottom-left for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/decor/mudcloth.webp)",
          backgroundSize: "clamp(160px, 20vw, 300px)",
          backgroundRepeat: "repeat",
          backgroundPosition: "bottom left",
          opacity: 0.05,
          mixBlendMode: "soft-light",
        }}
      />

      {ELEMENTS.map((el) => (
        <FloatEl key={el.src + el.index} el={el} />
      ))}
    </div>
  );
}
