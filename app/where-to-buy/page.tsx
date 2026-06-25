import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Where to Buy — Shea Allnaturals",
  description:
    "Find Shea Allnaturals at Walmart, Shoppers Drug Mart, Pharmaprix, Rexall, and more.",
};

export default function WhereToBuyPage() {
  return (
    <ComingSoon
      title="Where to Buy"
      description="Find us at Walmart, Shoppers Drug Mart, Pharmaprix, and Rexall. A full store locator is coming soon."
    />
  );
}
