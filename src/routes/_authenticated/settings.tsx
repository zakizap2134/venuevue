import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — Venue Vue" },
      { name: "description", content: "Venue profile, catalog, taxes, and device settings." },
      { property: "og:title", content: "System Settings — Venue Vue" },
      { property: "og:description", content: "Venue profile, catalog, taxes, and device settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      icon={Settings}
      title="System Settings"
      description="Settings are being built — venue profile, catalog, taxes, and devices will live here."
    />
  ),
});
