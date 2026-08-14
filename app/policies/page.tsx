import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "Shipping, returns, privacy and terms for Shea Allnaturals — Canada-wide shipping from $12, free local pickup in Barrie, Ontario.",
};

const SECTIONS = [
  {
    id: "shipping",
    title: "Shipping & Returns",
    body: [
      "Orders ship from our studio in Barrie, Ontario, and are typically dispatched within 1–3 business days; you'll receive tracking by email. Standard Canada-wide shipping starts at $12 CAD and express at $20 CAD; heavier orders cost more, and cross-border and international parcels are quoted by weight and destination. Your exact rate is shown at checkout before you pay.",
      "Prefer not to ship? Local pickup at our Barrie studio is free — choose it at checkout, then call ahead to confirm your order is ready.",
      "All prices are in Canadian dollars and exclude tax. GST/HST (and PST where it applies) is added at checkout based on your province, and applies to the shipping charge as well.",
      "If something isn't right, contact us within 30 days of delivery. Unopened products in original condition are eligible for a refund or exchange. For hygiene reasons, opened products can't be returned unless they arrived damaged or faulty — in which case we'll make it right.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "We collect only the information needed to process your order and provide support — your name, contact details and shipping address. Payment is handled securely by our payment processor; we never see or store your full card details.",
      "We do not sell or rent your personal information. You can ask us to access or delete your data at any time by emailing allnaturals@allnaturalscosmetics.ca.",
    ],
  },
  {
    id: "terms",
    title: "Terms of Use",
    body: [
      "All prices are in Canadian dollars (CAD) and may change without notice. Product imagery is representative; natural products can vary slightly batch to batch.",
      "Our content and branding are the property of Shea Allnaturals. By using this site you agree to use it lawfully and not to misuse our content.",
    ],
  },
];

export default function PoliciesPage() {
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
              <li aria-current="page" className="font-medium text-espresso/80">Policies</li>
            </ol>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Policies</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-espresso sm:text-5xl">
            Shipping, returns &amp; the fine print.
          </h1>
        </div>
      </header>

      {/* Sections */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-12">
          {SECTIONS.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="font-display text-2xl font-semibold text-espresso">{s.title}</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-espresso/75">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-14 rounded-2xl border border-espresso/10 bg-cream/60 p-5 text-sm leading-relaxed text-espresso/60">
          Questions about an order or a policy? Email us at{" "}
          <a href="mailto:allnaturals@allnaturalscosmetics.ca" className="font-semibold text-clay hover:underline">
            allnaturals@allnaturalscosmetics.ca
          </a>{" "}
          or visit our <Link href="/contact" className="font-semibold text-clay hover:underline">contact page</Link>.
        </p>
      </section>
    </div>
  );
}
