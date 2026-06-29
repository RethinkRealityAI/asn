import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { STORES } from "@/lib/content/stores";

export const metadata: Metadata = {
  title: "Where to Buy — Shea Allnaturals",
  description:
    "Find Shea Allnaturals online and on shelves at major Canadian retailers — Walmart, Shoppers Drug Mart, Jean Coutu and Rexall — or visit our Barrie studio.",
};

const GMAPS_DIR = "https://www.google.com/maps/search/?api=1&query=44.3581283,-79.6837872";

export default function WhereToBuyPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-espresso/08 bg-cream px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <AccentCorners corners={{ tl: "argan", br: "shea" }} size={150} opacity={0.1} />
        <div className="relative z-10 mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
              <li><Link href="/" className="transition-colors hover:text-espresso">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-espresso/80">Where to Buy</li>
            </ol>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Where to buy</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-espresso sm:text-5xl lg:text-6xl">
            Find us in store.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-espresso/65 sm:text-lg">
            Shea Allnaturals is stocked at major retailers across Canada — and
            always available to ship from our online shop.
          </p>
        </div>
      </header>

      {/* Retailers */}
      <section aria-label="Retail partners" className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STORES.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-green/15 bg-gradient-to-b from-white to-[#EEF6EE]/60 px-4 py-8 backdrop-blur-md transition-all duration-200 ease-[--ease-warm] hover:-translate-y-1 hover:border-green/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_10px_26px_-12px_rgba(42,30,20,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
              >
                <span className="font-display text-base font-semibold leading-tight text-espresso transition-colors group-hover:text-clay sm:text-lg">
                  {s.name}
                </span>
                {s.note && (
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-green">{s.note}</span>
                )}
                <span className="mt-1 text-xs font-semibold text-clay opacity-0 transition-opacity group-hover:opacity-100">Shop ↗</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-espresso/45">
          Availability varies by location — call ahead to confirm stock, or shop
          the full range online.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-orange"
          >
            Shop online →
          </Link>
        </div>
      </section>

      {/* Visit the studio — green band */}
      <section aria-label="Visit our studio" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "argan", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-md text-cream">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Visit the studio</p>
            <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Barrie, Ontario.</h2>
            <p className="mt-4 leading-relaxed text-cream/80">
              Come say hello at our small-batch studio — 220 Bayview Dr.
              Unit&nbsp;#18, Barrie, ON. Open Tuesday to Friday, 10am–4pm.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href={GMAPS_DIR}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-orange hover:text-cream"
              >
                Get directions →
              </a>
              <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-cream/80 transition-colors hover:text-cream">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
