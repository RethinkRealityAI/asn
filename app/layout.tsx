import type { Metadata } from "next";
import { quicksand, clash, generalSans } from "./fonts";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CustomCursor } from "@/components/chrome/CustomCursor";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shea Allnaturals — Pure botanicals, beautifully made.",
  description:
    "Hand-crafted botanical skincare rooted in West-African tradition. Shea butter, argan oil, black soap, and cold-pressed oils — made in Barrie, Ontario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${quicksand.variable} ${clash.variable} ${generalSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-espresso">
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
