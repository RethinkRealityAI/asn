"use client";

/**
 * usePrefersReducedMotion
 *
 * Reads `(prefers-reduced-motion: reduce)` via matchMedia and subscribes to
 * changes so toggling the OS preference updates the UI without a page reload.
 *
 * Returns false during SSR / before mount to avoid hydration mismatches —
 * the server never runs matchMedia, so we default to "motion allowed" and
 * enhance on the client.
 *
 * Implemented manually rather than reaching for framer-motion's
 * useReducedMotion so we own the API name and avoid coupling our primitives
 * to a specific version of the library.
 */

import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  // Start false (motion allowed) — safe SSR default.
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set immediately on mount so the first paint reflects the real preference.
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
