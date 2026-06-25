"use client";

/**
 * MagneticButton — Wraps any content and applies a subtle spring-based
 * magnetic pull effect toward the cursor while the pointer is inside the
 * element (+ a small margin).
 *
 * Reduced-motion / touch handling:
 *   - Disabled entirely when usePrefersReducedMotion() is true.
 *   - Disabled when matchMedia("(pointer:fine)") is false (touch/stylus).
 *   - In both cases renders a plain <div> wrapper — no transform, no overhead.
 *   - The check uses a lazy useState so we read matchMedia only once on mount
 *     (SSR-safe: defaults to false, meaning disabled = static wrapper first).
 *
 * Layout guarantee:
 *   The magnetic translate is applied to an inner <div> so the outer element
 *   retains its normal flow dimensions. Clicks are never blocked (no
 *   pointer-events change).
 */

import { useRef, useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /**
   * Attraction strength — fraction of the half-width/height offset applied.
   * 0 = no movement, 1 = full offset. Recommended range 0.15–0.45.
   * Default: 0.3
   */
  strength?: number;
}

const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 0.5 };

export function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion();
  // Start false (static) — safe for SSR. Updated on first client mount.
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    setIsFine(window.matchMedia("(pointer:fine)").matches);
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  // Raw target values (pixels)
  const rawX = useRef(0);
  const rawY = useRef(0);

  // Framer Motion springs
  const springX = useSpring(0, SPRING_CONFIG);
  const springY = useSpring(0, SPRING_CONFIG);

  // Clamp to ±MAX_PX so the effect stays subtle
  const MAX_PX = 12;
  const x = useTransform(springX, (v) => Math.max(-MAX_PX, Math.min(MAX_PX, v)));
  const y = useTransform(springY, (v) => Math.max(-MAX_PX, Math.min(MAX_PX, v)));

  useEffect(() => {
    if (reduced || !isFine) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rawX.current = (e.clientX - cx) * strength;
      rawY.current = (e.clientY - cy) * strength;
      springX.set(rawX.current);
      springY.set(rawY.current);
    };

    const onLeave = () => {
      springX.set(0);
      springY.set(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, isFine, strength, springX, springY]);

  // Disabled: plain wrapper, no motion overhead
  if (reduced || !isFine) {
    return <div className={cn("inline-flex", className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("inline-flex", className)}>
      <motion.div style={{ x, y }}>
        {children}
      </motion.div>
    </div>
  );
}
