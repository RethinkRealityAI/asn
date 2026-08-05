"use client";

/**
 * Header — frosted-glass, scroll-aware (Task 2.1)
 *
 * Structure:
 *   1. Promo bar — slim espresso-on-cream announcement strip
 *   2. Main nav row — transparent at top, frosted glass after scroll threshold
 *
 * Scroll behavior:
 *   - scrollY ≈ 0: nav is fully transparent (glass opacity = 0)
 *   - scrollY ≥ SCROLL_THRESHOLD: glass opacity = 1 (frosted warm bar + shadow)
 *   - Driven by framer-motion useScroll + useMotionValueEvent
 *   - usePrefersReducedMotion → skips animation, shows frosted bar always
 *
 * SSR safety:
 *   - "use client" ensures window/scroll hooks only run in the browser
 *   - useState initialized to `false` (glass hidden) — matches SSR render
 *
 * Contrast:
 *   - Text is always espresso (#2A1E14)
 *   - Over cream hero (#F5ECDA): contrast ~12:1 — AAA
 *   - Over frosted glass (#F5ECDA/55 blur): contrast ~10:1 — AAA
 *   - Never blue.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { MobileMenu } from "./MobileMenu";
import { HeaderSearch } from "./HeaderSearch";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";
import { useCart } from "@/components/cart/useCart";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
];

/** Scroll distance (px) before the glass bar appears */
const SCROLL_THRESHOLD = 80;

export function Header() {
  const reducedMotion = usePrefersReducedMotion();
  const { count: cartCount, openCart } = useCart();

  // Whether the frosted glass background is visible.
  // Reduced-motion users always see it; others start transparent.
  const [isGlassActive, setIsGlassActive] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (reducedMotion) return; // reduced-motion: always glass
    setIsGlassActive(latest > SCROLL_THRESHOLD);
  });

  // Whether to show the frosted state (also true for reduced-motion)
  const showGlass = reducedMotion || isGlassActive;

  const openMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      {/* ── Fixed wrapper — sits above hero (z-40), below modals ──────── */}
      <header className="fixed inset-x-0 top-0 z-40 flex flex-col">

        {/* ── Promo bar ──────────────────────────────────────────────── */}
        <div className="relative z-10 bg-espresso text-cream">
          <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] truncate sm:tracking-[0.22em]">
            Free Canada-wide shipping over $75
            <span className="hidden sm:inline"> &nbsp;·&nbsp; Cold-pressed &amp; cruelty-free &nbsp;·&nbsp; Made in Canada 🍁</span>
          </p>
        </div>

        {/* ── Main nav row ───────────────────────────────────────────── */}
        <div className="relative">
          {/* Glass background layer — animates in on scroll */}
          <motion.div
            aria-hidden="true"
            className={[
              "absolute inset-0 pointer-events-none",
              // Clean warm-white liquid glass — translucent, not a solid beige bar.
              "backdrop-blur-[22px] backdrop-saturate-[1.5]",
              "bg-[#FCF8F1]/68",
              "border-b border-white/50",
              "shadow-[0_4px_24px_rgba(42,30,20,0.07)] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.7),0_4px_24px_rgba(42,30,20,0.07)]",
            ].join(" ")}
            initial={false}
            animate={{ opacity: showGlass ? 1 : 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { ease: WARM, duration: DUR.fast }
            }
          />

          {/* Nav content */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">

              {/* ── Wordmark ─────────────────────────────────────────── */}
              <Link
                href="/"
                aria-label="Shea Allnaturals home"
                className={[
                  "flex-shrink-0 rounded-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <Wordmark className="h-7 sm:h-8" priority />
              </Link>

              {/* ── Desktop nav links ─────────────────────────────────── */}
              <nav
                aria-label="Main navigation"
                className="hidden md:flex items-center gap-1"
              >
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className={[
                      "px-3 py-1.5 rounded-full",
                      "text-sm font-medium text-espresso/80",
                      "hover:text-espresso hover:bg-espresso/8",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                      "transition-colors",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* ── Icon actions ─────────────────────────────────────── */}
              <div className="flex items-center gap-1">

                {/* Search — hidden on mobile to save space (hamburger is there) */}
                <HeaderSearch />

                {/* Account */}
                <button
                  aria-label="Your account"
                  className={[
                    "hidden sm:flex p-2 rounded-full",
                    "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                    "transition-colors",
                  ].join(" ")}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                </button>

                {/* Cart — always visible; opens drawer */}
                <button
                  onClick={openCart}
                  aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
                  className={[
                    "relative p-2 rounded-full",
                    "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                    "transition-colors",
                  ].join(" ")}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {/* Live cart count badge */}
                  {cartCount > 0 && (
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute -top-0.5 -right-0.5",
                        "flex h-4 w-4 items-center justify-center",
                        "rounded-full bg-clay text-cream",
                        "text-[9px] font-bold leading-none",
                      ].join(" ")}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Hamburger — mobile only */}
                <button
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav-panel"
                  onClick={mobileMenuOpen ? closeMenu : openMenu}
                  className={[
                    "flex md:hidden p-2 rounded-full",
                    "text-espresso/70 hover:text-espresso hover:bg-espresso/8",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold",
                    "transition-colors",
                  ].join(" ")}
                >
                  <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
                  {/* Animated hamburger/X lines */}
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    {mobileMenuOpen ? (
                      <path d="M18 6 6 18M6 6l12 12" />
                    ) : (
                      <>
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay — rendered outside the fixed header to avoid clip */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMenu} />
    </>
  );
}
