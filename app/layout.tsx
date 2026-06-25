import type { Metadata } from "next";
import { quicksand, clash, generalSans } from "./fonts";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CustomCursor } from "@/components/chrome/CustomCursor";
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

        {/* Placeholder header — Task 2.1 replaces with frosted-glass scroll-aware version */}
        <Header />

        {/* Page content */}
        <main className="flex-1 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Custom cursor: marigold ring, desktop/pointer:fine only.
            Self-disables on touch + reduced-motion. SSR-safe (renders null
            on server and first paint). */}
        <CustomCursor />
      </body>
    </html>
  );
}
