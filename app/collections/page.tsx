/**
 * /collections — Collections index page
 *
 * Server Component: lists all non-bulk collections as a simple warm grid
 * of navigable cards. Each card links to its /collections/[handle] PLP.
 *
 * Bulk & Wholesale collection is listed separately at the bottom.
 *
 * Never blue. AA contrast.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Collections — Shea Allnaturals",
  description:
    "Browse Shea Allnaturals collections — shea butter, argan oil, black soap, hair care, body care, and more. Handcrafted botanical skincare from Barrie, Ontario.",
};

export default async function CollectionsPage() {
  const allCollections = await store.getCollections();

  // Split: retail collections first, bulk last
  const retail = allCollections.filter(
    (c) => !/bulk|wholesale/i.test(c.handle)
  );
  const bulk = allCollections.filter((c) =>
    /bulk|wholesale/i.test(c.handle)
  );

  return (
    <div className="min-h-screen bg-cream pt-[calc(3.5rem+2rem)]">
      {/* Page header */}
      <header className="w-full bg-gradient-to-b from-cream to-[#F5ECDA]/60 border-b border-espresso/08 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-espresso/50">
              <li>
                <Link href="/" className="hover:text-espresso transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-espresso/80 font-medium">
                Collections
              </li>
            </ol>
          </nav>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-marigold">
            {retail.length} collection{retail.length !== 1 ? "s" : ""}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso leading-tight">
            Collections
          </h1>
          <p className="font-body text-base sm:text-lg text-espresso/65 max-w-2xl leading-relaxed">
            Shop by category — from shea butter and argan oil to hair care, body care, and more.
          </p>
        </div>
      </header>

      {/* Collections grid */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {retail.map((col) => (
            <li key={col.handle}>
              <Link
                href={`/collections/${col.handle}`}
                className={[
                  "flex flex-col gap-2 p-5 rounded-[--radius-card]",
                  "bg-white border border-espresso/10",
                  "shadow-[0_2px_12px_0_rgba(42,30,20,0.05)]",
                  "hover:shadow-[0_6px_24px_0_rgba(42,30,20,0.12)]",
                  "hover:border-marigold/30 hover:bg-cream",
                  "transition-all duration-200 ease-[--ease-warm]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <span className="font-display text-base font-semibold text-espresso leading-snug">
                  {col.title}
                </span>
                <span className="text-xs text-espresso/50 font-body">
                  {col.productHandles.length} product
                  {col.productHandles.length !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bulk & Wholesale section */}
        {bulk.length > 0 && (
          <section className="mt-12 pt-10 border-t border-espresso/10">
            <h2 className="font-display text-xl font-semibold text-espresso mb-4">
              Wholesale
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bulk.map((col) => (
                <li key={col.handle}>
                  <Link
                    href={`/collections/${col.handle}`}
                    className={[
                      "flex flex-col gap-2 p-5 rounded-[--radius-card]",
                      "bg-white border border-espresso/10",
                      "shadow-[0_2px_12px_0_rgba(42,30,20,0.05)]",
                      "hover:shadow-[0_6px_24px_0_rgba(42,30,20,0.12)]",
                      "hover:border-marigold/30 hover:bg-cream",
                      "transition-all duration-200 ease-[--ease-warm]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
                    ].join(" ")}
                  >
                    <span className="font-display text-base font-semibold text-espresso leading-snug">
                      {col.title}
                    </span>
                    <span className="text-xs text-espresso/50 font-body">
                      {col.productHandles.length} product
                      {col.productHandles.length !== 1 ? "s" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
