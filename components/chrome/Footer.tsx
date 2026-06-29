/**
 * Footer — Espresso (#2A1E14) ground with cream text.
 *
 * Structure:
 *  - "Join the ritual" newsletter band (warm cream, rounded) sitting on top
 *  - Main grid: brand + socials · shop · company · visit/contact
 *  - Bottom row: copyright + legal links
 *
 * Real business details (legacy site): 220 Bayview Dr. Unit #18, Barrie, ON
 * L4N 4Y8 · 705-719-2750 · allnaturals@allnaturalscosmetics.ca · Tue–Fri 10–4.
 * Never blue. AA contrast.
 */

import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { Button } from "@/components/ui/button";

const SHOP_LINKS = [
  { label: "Face & Body Oils", href: "/collections/essential-oils-fragrances" },
  { label: "Shea & Butters", href: "/collections/butters-moisturizers" },
  { label: "Hair Care", href: "/collections/family-hair-care" },
  { label: "Soaps & Washes", href: "/collections/washes-soaps" },
  { label: "Bulk & Wholesale", href: "/collections/bulk-wholesale" },
];

const COMPANY_LINKS = [
  { label: "Ingredients", href: "/ingredients" },
  { label: "Media & Press", href: "/media" },
  { label: "Where to Buy", href: "/where-to-buy" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS: { label: string; href: string; path: React.ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/allnaturalscosmetics/",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/allnaturalscosmetics/",
    path: <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5V12H15l-.5 3h-3v7H8.5v-7H6v-3h2.5v-2.2A4.3 4.3 0 0 1 12.8 3.5H15z" fill="currentColor" stroke="none" />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC1aT0ORc_29IknBKscpqT7A",
    path: (
      <>
        <rect x="2" y="5.5" width="20" height="13" rx="4" />
        <path d="M10 9.2v5.6l5-2.8z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "X",
    href: "https://twitter.com/allnaturallabel",
    path: <path d="M4 4l16 16M20 4L4 20" />,
  },
];

export function Footer() {
  return (
    <footer className="bg-espresso text-cream">
      {/* ── Newsletter band — warm cream, rounded, sits over the espresso ──── */}
      <div className="mx-auto max-w-7xl px-6 pt-12 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-marigold to-orange px-6 py-10 sm:px-12 sm:py-12 text-espresso">
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-espresso/70">
                Join the ritual
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight">
                New drops, seasonal care &amp; honest skin tips.
              </h2>
            </div>
            <form className="flex w-full flex-col gap-3 sm:flex-row" aria-label="Newsletter signup">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-full border border-espresso/20 bg-cream/80 px-5 py-3 text-sm text-espresso placeholder:text-espresso/45 outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/30"
              />
              <Button
                type="submit"
                size="lg"
                className="shrink-0 rounded-full bg-espresso px-7 text-cream hover:bg-espresso/85 font-semibold"
              >
                Join
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-5 md:col-span-1">
            <Wordmark tone="light" className="h-8" />
            <p className="text-sm leading-relaxed text-cream/75">
              Pure, hand-made botanical skincare — shea, argan, black soap and
              cold-pressed oils. Rooted in West-African tradition, made in
              Barrie, Ontario.
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-cream/50">
              Made in Canada 🍁
            </p>
            {/* Social icons */}
            <ul className="flex items-center gap-3">
              {SOCIALS.map(({ label, href, path }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-colors hover:border-marigold hover:text-marigold"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-[18px]"
                      aria-hidden="true"
                    >
                      {path}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/50">
              Shop
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-cream/80 transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/50">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-cream/80 transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit / contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/50">
              Visit us
            </h3>
            <address className="flex flex-col gap-2.5 not-italic text-sm text-cream/80">
              <span className="leading-relaxed">
                220 Bayview Dr. Unit&nbsp;#18<br />
                Barrie, ON&nbsp; L4N 4Y8
              </span>
              <a href="tel:+17057192750" className="transition-colors hover:text-cream">
                705-719-2750
              </a>
              <a
                href="mailto:allnaturals@allnaturalscosmetics.ca"
                className="break-words transition-colors hover:text-cream"
              >
                allnaturals@allnaturalscosmetics.ca
              </a>
              <span className="text-cream/55">Tue–Fri · 10am–4pm</span>
            </address>
          </div>
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="text-xs text-cream/50">
            © 2026 Shea Allnaturals · All prices in CAD
          </p>
          <nav aria-label="Legal links" className="flex gap-4">
            {[
              { label: "Privacy", href: "/policies#privacy" },
              { label: "Terms", href: "/policies#terms" },
              { label: "Shipping & Returns", href: "/policies#shipping" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-cream/50 transition-colors hover:text-cream">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
