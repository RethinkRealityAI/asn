"use client";

/**
 * PageHeader — the reusable vibrant section header.
 *
 * Two modes:
 *  - Staged (default): warm backdrop + subtle mudcloth pattern + the brand's own
 *    cloth drape + REAL product cutouts on the right, title block on the left.
 *    Our cloth, our products, our touch — no stock environments.
 *  - Scenery (pass `image`): a full-bleed photo + warm-dark scrim + cream text.
 *    Used for the origin story, where evocative scenery fits.
 *
 * Cloth + the lead product show on mobile too (title is width-constrained so they
 * don't collide); extra products are desktop-only. Animates in; reduced-motion safe.
 * Never blue.
 */

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-reduced-motion";
import { WARM, DUR } from "@/lib/motion/easings";

export interface HeaderCrumb {
  label: string;
  href?: string;
}

/** A real product cutout staged in the header. `style` positions it (absolute). */
export interface HeaderProduct {
  src: string;
  alt: string;
  style: React.CSSProperties;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: HeaderCrumb[];
  /** Real product cutouts staged on the right (over the cloth). First one shows on mobile. */
  products?: HeaderProduct[];
  /** Show the cloth drape (staged mode). Default true. */
  showCloth?: boolean;
  /** Scenery mode: full-bleed background photo + scrim + cream text. */
  image?: string;
  imageAlt?: string;
  /** Optional CTA actions rendered under the subtitle. */
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
  products = [],
  showCloth = true,
  image,
  imageAlt = "",
  actions,
}: PageHeaderProps) {
  const reduced = usePrefersReducedMotion();
  const scenery = !!image;

  return (
    <header
      className={[
        "relative isolate overflow-hidden border-b border-espresso/08 px-5 sm:px-8 lg:px-12",
        scenery
          ? "py-20 lg:py-28"
          : "flex min-h-[20rem] flex-col justify-center py-12 sm:h-[26rem] sm:py-0",
      ].join(" ")}
      style={scenery ? undefined : { background: "linear-gradient(115deg, #FCF8EF 0%, #F5ECDA 52%, #EFE0C6 100%)" }}
    >
      {scenery ? (
        <>
          <Image src={image!} alt={imageAlt} fill priority sizes="100vw" className="-z-10 object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{ background: "linear-gradient(100deg, rgba(42,30,20,0.84) 0%, rgba(42,30,20,0.55) 45%, rgba(42,30,20,0.2) 100%)" }}
          />
        </>
      ) : (
        <>
          {/* subtle mudcloth pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "url(/decor/mudcloth-pattern.svg)", backgroundRepeat: "repeat", backgroundSize: "128px", opacity: 0.05 }}
          />
          {/* warm glow on the cloth side */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(55% 100% at 88% 55%, rgba(235,165,44,0.20) 0%, transparent 68%)" }}
          />
          {/* cloth drape — bottom-right, shows on mobile too */}
          {showCloth && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[5%] -bottom-[4%] w-[52%] max-w-[680px] select-none sm:w-[56%]"
              initial={reduced ? false : { opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: WARM, duration: DUR.slow }}
            >
              <Image src="/decor/cloth2.webp" alt="" width={1200} height={896} className="h-auto w-full" priority />
            </motion.div>
          )}
          {/* real product cutouts (first shows on mobile, rest desktop-only) */}
          {products.map((p, i) => (
            <motion.div
              key={`${p.src}-${i}`}
              aria-hidden="true"
              className={i === 0 ? "pointer-events-none select-none" : "pointer-events-none hidden select-none sm:block"}
              style={p.style}
              initial={reduced ? false : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: WARM, duration: DUR.slow, delay: 0.18 + i * 0.1 }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={600}
                height={780}
                className="h-auto w-full"
                style={{ filter: "drop-shadow(0 22px 32px rgba(42,30,20,0.3))" }}
              />
            </motion.div>
          ))}
        </>
      )}

      {/* Title block */}
      <div className="relative z-10 w-full max-w-3xl">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className={["flex items-center gap-1.5 text-xs", scenery ? "text-cream/60" : "text-espresso/50"].join(" ")}>
              {crumbs.map((c, i) => (
                <Fragment key={`${c.label}-${i}`}>
                  {i > 0 && <li aria-hidden="true">/</li>}
                  <li
                    aria-current={i === crumbs.length - 1 ? "page" : undefined}
                    className={i === crumbs.length - 1 ? (scenery ? "font-medium text-cream/90" : "font-medium text-espresso/80") : ""}
                  >
                    {c.href ? (
                      <Link href={c.href} className={["transition-colors", scenery ? "hover:text-cream" : "hover:text-espresso"].join(" ")}>
                        {c.label}
                      </Link>
                    ) : (
                      c.label
                    )}
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">{eyebrow}</p>
        )}
        <h1
          className={[
            "font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl",
            scenery ? "max-w-2xl text-cream [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]" : "max-w-[62%] text-espresso sm:max-w-2xl",
          ].join(" ")}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={[
              "mt-4 text-base leading-relaxed sm:text-lg",
              scenery ? "max-w-xl text-cream/85" : "max-w-[56%] text-espresso/70 sm:max-w-md",
            ].join(" ")}
          >
            {subtitle}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
      </div>
    </header>
  );
}
