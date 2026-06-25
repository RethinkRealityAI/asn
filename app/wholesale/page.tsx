import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Wholesale — Shea Allnaturals",
  description:
    "Bulk and wholesale orders for retailers and distributors. Inquire about Shea Allnaturals wholesale.",
};

export default function WholesalePage() {
  return (
    <ComingSoon
      title="Bulk & Wholesale"
      description="Interested in stocking Shea Allnaturals? Our wholesale portal is coming soon — or browse our bulk products now."
    />
  );
}
