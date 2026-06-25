import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Ingredients — Shea Allnaturals",
  description:
    "Every ingredient we use — sourced with care, cold-pressed or hand-processed, never synthetic.",
};

export default function IngredientsPage() {
  return (
    <ComingSoon
      title="Ingredients"
      description="A full guide to every botanical we use — cold-pressed, unrefined, and honestly sourced. Coming soon."
    />
  );
}
