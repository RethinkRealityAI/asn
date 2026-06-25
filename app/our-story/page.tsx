import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Our Story — Shea Allnaturals",
  description:
    "The story behind Shea Allnaturals — pure botanicals rooted in West-African tradition, made in Barrie, Ontario.",
};

export default function OurStoryPage() {
  return (
    <ComingSoon
      title="Our Story"
      description="Pure botanicals rooted in West-African tradition. Our story is coming — check back soon."
    />
  );
}
