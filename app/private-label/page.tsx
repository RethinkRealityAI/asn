import type { Metadata } from "next";
import Link from "next/link";

import { AccentCorners } from "@/components/motion/AccentCorners";
import { PageHeader } from "@/components/chrome/PageHeader";
import { PrivateLabelForm } from "@/components/about/PrivateLabelForm";
import {
  PRIVATE_LABEL,
  PRODUCT_CATEGORIES,
  CAPABILITIES,
  PRIVATE_LABEL_CLOSING,
} from "@/lib/content/private-label";

export const metadata: Metadata = {
  title: "Private label & contract manufacturing — All Naturals Cosmetics",
  description:
    "Founded in 2002, All Naturals Cosmetics Inc. (ANCI) is a Canadian contract manufacturer of natural and organic personal care — from formulation through production, packaging and distribution, under GMP and Health Canada compliance.",
};

export default function PrivateLabelPage() {
  return (
    <div className="min-h-screen bg-white pt-[calc(3.5rem+2.5rem)]">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About us", href: "/about/our-story" }, { label: "Private label" }]}
        eyebrow={PRIVATE_LABEL.eyebrow}
        title={PRIVATE_LABEL.title}
        subtitle={PRIVATE_LABEL.lede}
        products={[
          { src: "/hero/pail-shea-butter.webp", alt: "All Naturals Cosmetics wholesale pail", style: { position: "absolute", right: "14%", bottom: "-9%", width: "20%", maxWidth: "220px", zIndex: 2 } },
          { src: "/hero/pail-cocoa-shea.webp", alt: "All Naturals Cosmetics cocoa-shea pail", style: { position: "absolute", right: "2%", bottom: "-5%", width: "19%", maxWidth: "205px", zIndex: 1 } },
          { src: "/hero/pail-argan-body.webp", alt: "All Naturals Cosmetics argan body butter pail", style: { position: "absolute", right: "27%", bottom: "-3%", width: "17%", maxWidth: "185px", zIndex: 0 } },
        ]}
      />

      {/* CTAs */}
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#inquiry" className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-orange">
            Start an inquiry →
          </Link>
          <Link href="/wholesale" className="inline-flex items-center text-sm font-semibold text-espresso/70 transition-colors hover:text-clay">
            Looking for wholesale instead?
          </Link>
        </div>
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="space-y-6 text-lg leading-relaxed text-espresso/80">
          {PRIVATE_LABEL.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section aria-label="What we do" className="mx-auto max-w-6xl px-5 pb-4 sm:px-8 lg:px-12">
        <ul className="grid gap-5 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <li
              key={c.title}
              className="rounded-[1.5rem] border border-espresso/10 bg-white p-7 shadow-[0_12px_30px_-16px_rgba(42,30,20,0.2)]"
            >
              <p className="font-display text-lg font-semibold text-espresso">{c.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-espresso/65">{c.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Product examples — green band */}
      <section aria-label="Examples of products offered" className="relative mt-14 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2F7D4F 0%, #1F5436 100%)" }} aria-hidden />
        <AccentCorners corners={{ tr: "argan", bl: "shea" }} tone="light" size={150} opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Examples of products offered</p>
          <h2 className="mb-8 font-display text-2xl font-semibold text-cream sm:text-3xl">
            From cleansers to butters, oils to serums.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRODUCT_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <h3 className="font-display text-lg font-semibold text-marigold">{cat.name}</h3>
                <ul className="mt-3 space-y-2">
                  {cat.products.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-cream/85">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-marigold" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-cream/70">
            Packaging options range from jars and bottles to gallon containers,
            pails and drums — with low minimum order quantities for emerging
            brands and scalable runs for established ones.
          </p>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="scroll-mt-28 mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Start a conversation</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-espresso sm:text-4xl">Tell us about your line.</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-espresso/70">
          Share a few details and our private-label team will get back to you with
          next steps.
        </p>
        <div className="mt-8">
          <PrivateLabelForm />
        </div>
      </section>

      {/* Closing */}
      <section className="relative overflow-hidden bg-cream">
        <AccentCorners corners={{ tl: "castor", br: "argan" }} size={140} opacity={0.1} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-14 text-center sm:px-8 lg:px-12">
          <p className="text-lg leading-relaxed text-espresso/80">{PRIVATE_LABEL_CLOSING}</p>
        </div>
      </section>
    </div>
  );
}
