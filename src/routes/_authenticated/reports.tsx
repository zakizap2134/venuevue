import { createFileRoute } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Venue Vue" },
      { name: "description", content: "Sales trends, event performance, and staff reports." },
      { property: "og:title", content: "Reports & Analytics — Venue Vue" },
      { property: "og:description", content: "Sales trends, event performance, and staff reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      icon={ChartColumn}
      title="Reports & Analytics"
      description="Reports are being built — sales trends, event performance, and exports will live here."
    />
  ),
});
