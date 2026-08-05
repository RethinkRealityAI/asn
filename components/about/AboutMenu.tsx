"use client";

/**
 * AboutMenu — the desktop "About" nav dropdown.
 *
 * Accessible disclosure: opens on hover AND on focus/click, closes on Escape,
 * blur-out or outside click. Renders the six About subpages (each with a
 * teaser) plus a highlighted "Private label" link at the foot — grouping the
 * brand story and the B2B offer the way the client asked.
 *
 * Liquid-glass panel (overlay chrome — glass is allowed here), warm palette,
 * reduced-motion safe.
 */

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ABOUT_SECTIONS } from "@/lib/content/about";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

export function AboutMenu() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);
  // Small delay on mouseleave so a quick cursor slip doesn't snap it shut.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [cancelClose]);

  // Close on Escape + outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/about/our-story"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-espresso/80 transition-colors hover:bg-espresso/8 hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
      >
        About
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="About"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ ease: WARM, duration: DUR.fast }}
            className="absolute left-1/2 top-full z-50 mt-2 w-[22rem] -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-3xl border border-white/60 bg-[#FCF8F1]/92 p-2 shadow-[0_18px_50px_-12px_rgba(42,30,20,0.28)] backdrop-blur-[22px] backdrop-saturate-[1.5]">
              <ul className="grid gap-0.5">
                {ABOUT_SECTIONS.map((s) => (
                  <li key={s.slug} role="none">
                    <Link
                      role="menuitem"
                      href={`/about/${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex flex-col gap-0.5 rounded-2xl px-3.5 py-2.5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
                    >
                      <span className="text-sm font-semibold text-espresso group-hover:text-clay">{s.label}</span>
                      <span className="text-xs leading-snug text-espresso/55">{s.teaser}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mx-2 my-1.5 border-t border-espresso/10" />
              <Link
                role="menuitem"
                href="/private-label"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-green/10 px-3.5 py-3 transition-colors hover:bg-green/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-green">Private label</span>
                  <span className="text-xs leading-snug text-espresso/55">Your brand, made in our plant.</span>
                </span>
                <span aria-hidden="true" className="text-green">→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
