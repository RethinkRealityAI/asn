import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Contact — Shea Allnaturals",
  description: "Get in touch with Shea Allnaturals — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact us"
      description="A contact form is on the way. In the meantime, find us at your local Walmart, Shoppers, Pharmaprix, or Rexall."
    />
  );
}
