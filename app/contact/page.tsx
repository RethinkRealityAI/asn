import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import { AccentCorners } from "@/components/motion/AccentCorners";

export const metadata: Metadata = {
  title: "Contact — Shea Allnaturals",
  description:
    "Get in touch with Shea Allnaturals. Visit our studio at 220 Bayview Dr. Unit #18, Barrie, ON, call 705-719-2750, or send us a message.",
};

// Geocoded studio location (220 Bayview Dr, Barrie, ON L4N 4Y8)
const LAT = 44.3581283;
const LON = -79.6837872;
const OSM_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${LON - 0.006}%2C${LAT - 0.004}%2C${LON + 0.006}%2C${LAT + 0.004}&layer=mapnik&marker=${LAT}%2C${LON}`;
const GMAPS_DIR = `https://www.google.com/maps/search/?api=1&query=${LAT},${LON}`;

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/allnaturalscosmetics/" },
  { label: "Facebook", href: "https://www.facebook.com/allnaturalscosmetics/" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC1aT0ORc_29IknBKscpqT7A" },
  { label: "X", href: "https://twitter.com/allnaturallabel" },
];

export default function ContactPage() {
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
              <li aria-current="page" className="font-medium text-espresso/80">Contact</li>
            </ol>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
            We&rsquo;d love to hear from you
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-espresso sm:text-5xl lg:text-6xl">
            Get in touch.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-espresso/65 sm:text-lg">
            Questions about a product, a wholesale enquiry, or just want to say
            hello? Reach out — we&rsquo;re a small, family-run team and we read
            every message.
          </p>
        </div>
      </header>

      {/* Details + form */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Details card — botanical green, cream text */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F7D4F] to-[#1F5436] p-8 text-cream shadow-[0_24px_60px_-20px_rgba(31,84,54,0.6)]">
              <AccentCorners corners={{ tr: "argan", br: "castor" }} tone="light" size={130} opacity={0.16} />
              {/* warm glow so the green doesn't read flat/cold */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 80% 15%, rgba(235,165,44,0.18) 0%, transparent 65%)" }} />
              <div className="relative z-10 flex flex-col gap-7">
                <ContactDetail
                  title="Visit the studio"
                  lines={["220 Bayview Dr. Unit #18", "Barrie, Ontario  L4N 4Y8", "Canada"]}
                  icon={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
                />
                <ContactDetail
                  title="Call us"
                  lines={[]}
                  icon={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />}
                >
                  <a href="tel:+17057192750" className="text-sm font-medium text-cream transition-colors hover:text-marigold">
                    705-719-2750
                  </a>
                </ContactDetail>
                <ContactDetail
                  title="Email"
                  lines={[]}
                  icon={<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>}
                >
                  <a href="mailto:allnaturals@allnaturalscosmetics.ca" className="break-words text-sm font-medium text-cream transition-colors hover:text-marigold">
                    allnaturals@allnaturalscosmetics.ca
                  </a>
                </ContactDetail>
                <ContactDetail
                  title="Studio hours"
                  lines={["Tuesday – Friday", "10:00am – 4:00pm", "Sat–Mon · by appointment"]}
                  icon={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
                />

                {/* Socials */}
                <div className="border-t border-cream/15 pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream/60">Follow along</p>
                  <ul className="flex flex-wrap gap-2.5">
                    {SOCIALS.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex rounded-full border border-cream/25 px-4 py-1.5 text-xs font-semibold text-cream/85 transition-colors hover:border-marigold hover:bg-marigold hover:text-espresso"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="lg:col-span-3">
            <div className="rounded-[2rem] border border-espresso/10 bg-white p-8 shadow-[var(--shadow-card)]">
              <h2 className="mb-6 font-display text-2xl font-semibold text-espresso">Send a message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section aria-label="Our location" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="relative media-rounded border border-espresso/10 shadow-[var(--shadow-card)]">
          <iframe
            title="Map to Shea Allnaturals, 220 Bayview Dr Unit #18, Barrie ON"
            src={OSM_SRC}
            className="h-[360px] w-full sm:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Directions pill */}
          <a
            href={GMAPS_DIR}
            target="_blank"
            rel="noreferrer noopener"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-cream shadow-lg transition-colors hover:bg-orange"
          >
            Get directions →
          </a>
        </div>
      </section>
    </div>
  );
}

// ── Detail row (on the green card) ────────────────────────────────────────────
function ContactDetail({
  title,
  lines,
  icon,
  children,
}: {
  title: string;
  lines: string[];
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marigold text-espresso shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cream/60">{title}</p>
        {children}
        {lines.map((l) => (
          <p key={l} className="text-sm leading-relaxed text-cream/85">{l}</p>
        ))}
      </div>
    </div>
  );
}
