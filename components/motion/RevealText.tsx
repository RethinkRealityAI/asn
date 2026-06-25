"use client";

/**
 * RevealText — headline reveal animation.
 *
 * Line-splitting approach:
 *   Accept a string and split on `\n` to produce explicit lines. Each line is
 *   wrapped in an overflow-hidden mask container (with small vertical padding
 *   so ascenders/descenders aren't clipped), and the inner span slides up from
 *   translateY(100%) → translateY(0). Lines are staggered.
 *
 *   Why not DOM line-detection (ResizeObserver + spans)?
 *   True reflow-based detection causes hydration mismatches and requires a
 *   layout pass. The `\n`-split approach is SSR-safe, deterministic, and suits
 *   the typical headline use-case where line breaks are intentional.
 *
 * Reduced-motion:
 *   When usePrefersReducedMotion() is true the text renders instantly with no
 *   transforms or clip masks — just the element and its classes, fully legible.
 *
 * SSR safety:
 *   The server renders readable text immediately (no clip mask, no transform).
 *   The AnimatePresence / motion logic activates only on the client after
 *   hydration, so there is no mismatch.
 */

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

interface RevealTextProps {
  /** Text content — use \n to define explicit line breaks. */
  text?: string;
  /** Alternatively pass children as a plain string. */
  children?: string;
  /** Rendered HTML element. Defaults to h2. */
  as?: HeadingTag;
  className?: string;
  /** Delay before the first line begins animating (seconds). */
  delay?: number;
  /** Per-line stagger interval (seconds). Default 0.08. */
  stagger?: number;
}

export function RevealText({
  text,
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.08,
}: RevealTextProps) {
  const reduced = usePrefersReducedMotion();

  // Resolve content from either prop
  const raw = text ?? (typeof children === "string" ? children : "");
  // Split on newlines — empty parts become blank spacer lines which we filter
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);

  // Cast through a permissive component type: the dynamic `motion[Tag]` index
  // otherwise resolves to a union that newer @types/react treats as accepting
  // `never` children. ComponentType<any> restores normal children typing.
  const MotionTag = motion[
    Tag as keyof typeof motion
  ] as ComponentType<Record<string, unknown>>;

  // Reduced motion: render plain element, no masks, no animation
  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <MotionTag className={cn("overflow-hidden", className)}>
      {lines.map((line, i) => (
        // Mask container — overflow hidden, with vertical padding so
        // descenders (g, y, p) and ascenders (h, l, d) are not clipped.
        <span
          key={i}
          style={{
            display: "block",
            overflow: "hidden",
            paddingTop: "0.05em",
            paddingBottom: "0.1em",
          }}
        >
          <motion.span
            style={{ display: "block" }}
            initial={{ y: "105%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{
              ease: WARM,
              duration: DUR.base,
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
