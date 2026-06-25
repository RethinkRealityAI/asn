"use client";

/**
 * CustomCursor — Additive marigold ring that follows the pointer.
 *
 * Design:
 *   - Small marigold ring (border, no fill) that spring-follows the cursor.
 *   - Grows + changes opacity when hovering interactive elements
 *     (a, button, [data-cursor="hover"]).
 *   - Native cursor is PRESERVED — this is purely additive.
 *   - pointer-events: none so it never interferes with clicks.
 *   - aria-hidden — purely decorative.
 *
 * Render conditions:
 *   Renders ONLY when:
 *     (a) matchMedia("(pointer:fine)") === true (real pointer device), AND
 *     (b) usePrefersReducedMotion() === false.
 *   On touch / reduced-motion → renders nothing at all.
 *
 * SSR safety:
 *   All window/matchMedia access is inside useEffect / lazy useState.
 *   The component renders null on the server and on the first client paint
 *   (before effects run), avoiding hydration mismatches.
 *
 * Mount point:
 *   Intended for the root layout — but NOT wired in this task. Place once:
 *     <CustomCursor /> in app/layout.tsx (after other content).
 */

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";

// Ring sizing constants (px)
const SIZE_DEFAULT = 28;
const SIZE_HOVER = 48;
const SPRING_CONFIG = { damping: 24, stiffness: 250, mass: 0.6 };

export function CustomCursor() {
  const reduced = usePrefersReducedMotion();

  // Whether the device has a fine pointer — false until first client mount
  const [isFine, setIsFine] = useState(false);
  // Whether cursor has moved at all (avoids showing ring at 0,0 on load)
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  const springX = useSpring(0, SPRING_CONFIG);
  const springY = useSpring(0, SPRING_CONFIG);

  // Ref so event handlers always read the current `hovered` without stale closure
  const hoveredRef = useRef(false);

  useEffect(() => {
    setIsFine(window.matchMedia("(pointer:fine)").matches);
  }, []);

  useEffect(() => {
    if (!isFine || reduced) return;

    const SELECTORS = "a, button, [data-cursor='hover']";

    const onMove = (e: PointerEvent) => {
      springX.set(e.clientX);
      springY.set(e.clientY);
      if (!active) setActive(true);
    };

    // Hover detection via event delegation on document
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const isInteractive = !!target.closest(SELECTORS);
      if (isInteractive !== hoveredRef.current) {
        hoveredRef.current = isInteractive;
        setHovered(isInteractive);
      }
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [isFine, reduced, active, springX, springY]);

  // Don't render on server, touch devices, or reduced-motion
  if (!isFine || reduced) return null;
  // Don't render until the cursor has moved (avoids flash at top-left 0,0)
  if (!active) return null;

  const size = hovered ? SIZE_HOVER : SIZE_DEFAULT;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        // Offset so the ring is centered on the cursor point
        translateX: "-50%",
        translateY: "-50%",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid",
        // Marigold from brand palette — #EBA52C
        borderColor: "var(--color-marigold, #EBA52C)",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: hovered ? 0.85 : 0.55,
        mixBlendMode: "multiply",
      }}
      animate={{ width: size, height: size, opacity: hovered ? 0.85 : 0.55 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
    />
  );
}
