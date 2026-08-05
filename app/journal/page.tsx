import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Honest skin-care tips, seasonal drops, and behind-the-scenes from Shea Allnaturals.",
};

export default function JournalPage() {
  return (
    <ComingSoon
      title="Journal"
      description="Skin-care tips, seasonal drops, and honest ingredients education — coming soon."
    />
  );
}
