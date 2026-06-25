/**
 * Footer — Espresso (#2A1E14) background with cream text.
 *
 * Layout:
 *  - Top section: brand column + two link columns + newsletter column
 *  - Bottom row: copyright left, legal links right
 */

import { Wordmark } from "./Wordmark";
import { Button } from "@/components/ui/button";

const SHOP_LINKS = [
  { label: "Face & Body Oils", href: "#" },
  { label: "Shea & Butters", href: "#" },
  { label: "Hair Care", href: "#" },
  { label: "Soaps & Washes", href: "#" },
  { label: "Bulk & Wholesale", href: "#" },
];

const COMPANY_LINKS = [
  { label: "Our Story", href: "#" },
  { label: "Ingredients", href: "#" },
  { label: "Where to Buy", href: "#" },
  { label: "Journal", href: "#" },
  { label: "Contact", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-espresso text-cream">
      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <Wordmark className="text-cream" size="text-2xl" />
            <p className="text-sm leading-relaxed text-cream/75">
              Pure, hand-made botanical skincare — shea, argan, black soap
              and cold-pressed oils. Rooted in West-African tradition, made
              in Barrie, Ontario.
            </p>
            <p className="text-xs font-medium text-cream/50 uppercase tracking-widest">
              Made in Canada 🍁
            </p>
            <p className="text-xs text-cream/50">
              Find us at Walmart · Shoppers · Pharmaprix · Rexall
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/50">
              Shop
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-cream/80 transition-colors hover:text-cream"
                  >
                    {label}
                  </a>
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
                  <a
                    href={href}
                    className="text-sm text-cream/80 transition-colors hover:text-cream"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/50">
              Stay in the loop
            </h3>
            <p className="text-sm text-cream/75">
              New arrivals, seasonal drops, and honest skin-care tips — straight
              to your inbox.
            </p>
            {/* Non-functional form placeholder — submit handler added in later task */}
            <div className="flex flex-col gap-2">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                className="rounded-full border border-cream/20 bg-cream/10 px-4 py-2 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-marigold focus:ring-1 focus:ring-marigold"
              />
              {/* Marigold/secondary variant button */}
              <Button
                variant="secondary"
                size="sm"
                className="self-start bg-marigold text-espresso hover:bg-orange font-semibold"
              >
                Join
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────── */}
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/50">
            © 2026 Shea Allnaturals · All prices in CAD
          </p>
          <nav aria-label="Legal links" className="flex gap-4">
            {["Privacy", "Terms", "Shipping & Returns"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs text-cream/50 transition-colors hover:text-cream"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
