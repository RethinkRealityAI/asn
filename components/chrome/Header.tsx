/**
 * Header — PLACEHOLDER (Task 0.6)
 *
 * This is a simple, non-glass header shell.
 * Task 2.1 will replace this with the frosted-glass, scroll-aware version
 * that transitions between transparent-over-hero and a blurred glass bar.
 *
 * Structure:
 *   1. Promo bar — slim marigold/cream announcement strip
 *   2. Main bar — Wordmark left · Nav center · Icon actions right
 */

import { Wordmark } from "./Wordmark";

const NAV_LINKS = [
  { label: "Shop", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Our Story", href: "#" },
  { label: "Wholesale", href: "#" },
  { label: "Journal", href: "#" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-espresso/10">
      {/* ── Promo bar ──────────────────────────────────────────────────── */}
      <div className="bg-marigold/15 text-espresso">
        <p className="mx-auto max-w-7xl px-6 py-2 text-center text-xs font-medium tracking-wide">
          Free Canada-wide shipping over $75 &nbsp;·&nbsp; Cold-pressed &amp;
          cruelty-free &nbsp;·&nbsp; Made in Canada 🍁
        </p>
      </div>

      {/* ── Main bar ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Wordmark — espresso on cream/white */}
          <a href="/" aria-label="Shea Allnaturals home" className="flex-shrink-0">
            <Wordmark className="text-espresso" size="text-xl" />
          </a>

          {/* Nav — center */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-6"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-espresso/80 transition-colors hover:text-espresso"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Icon actions — right */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              aria-label="Search"
              className="p-1.5 text-espresso/70 transition-colors hover:text-espresso rounded-full hover:bg-cream/60"
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Account */}
            <button
              aria-label="Account"
              className="p-1.5 text-espresso/70 transition-colors hover:text-espresso rounded-full hover:bg-cream/60"
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

            {/* Cart */}
            <button
              aria-label="Cart (0 items)"
              className="relative p-1.5 text-espresso/70 transition-colors hover:text-espresso rounded-full hover:bg-cream/60"
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
