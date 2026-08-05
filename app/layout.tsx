import type { Metadata } from "next";
import { quicksand, clash, generalSans } from "./fonts";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CustomCursor } from "@/components/chrome/CustomCursor";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SITE_URL, SITE_NAME, LEGAL_NAME, IS_PRODUCTION_SITE } from "@/lib/seo/site";
import { organizationJsonLd, webSiteJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

const TITLE = "Shea Allnaturals — Pure botanicals, beautifully made.";
const DESCRIPTION =
  "Hand-crafted botanical skincare rooted in West-African tradition. Shea butter, argan oil, black soap, and cold-pressed oils — made in Barrie, Ontario since 2002.";

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL resolve absolutely.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Per-page titles get the brand appended automatically.
    template: "%s — Shea Allnaturals",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "shea butter",
    "raw shea butter Canada",
    "argan oil",
    "African black soap",
    "natural skincare Canada",
    "organic body butter",
    "private label cosmetics Canada",
    "contract manufacturer personal care",
    "Barrie Ontario skincare",
  ],
  authors: [{ name: LEGAL_NAME, url: SITE_URL }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  category: "Beauty & Personal Care",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 628,
        alt: "Shea Allnaturals — pure botanical skincare products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: IS_PRODUCTION_SITE
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
  formatDetection: { telephone: true, address: true, email: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-CA"
      data-scroll-behavior="smooth"
      className={`${quicksand.variable} ${clash.variable} ${generalSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-espresso">
        {/* Sitewide structured data — who we are, that we're searchable, and
            the physical studio. Read by search engines and AI assistants. */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationJsonLd(),
              webSiteJsonLd(),
              localBusinessJsonLd(),
            ]),
          }}
        />

        {/* Grain overlay: fixed, aria-hidden, pointer-events-none */}
        <GrainOverlay />

        {/* CartProvider: owns cart state + drawer visibility for the whole app.
            CartDrawer is mounted once here so it's always accessible. */}
        <CartProvider>
          {/* Header — cart icon reads live count from CartProvider */}
          <Header />

          {/* Page content */}
          <main className="flex-1 relative z-10">
            {children}
          </main>

          {/* Footer */}
          <Footer />

          {/* Cart drawer — single instance, animated in/out via AnimatePresence */}
          <CartDrawer />
        </CartProvider>

        {/* Custom cursor: marigold ring, desktop/pointer:fine only.
            Self-disables on touch + reduced-motion. SSR-safe (renders null
            on server and first paint). */}
        <CustomCursor />
      </body>
    </html>
  );
}
