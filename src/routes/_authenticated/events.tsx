import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({
    meta: [
      { title: "Event Management — Venue Vue" },
      { name: "description", content: "Plan, schedule, and run events at your venue." },
      { property: "og:title", content: "Event Management — Venue Vue" },
      { property: "og:description", content: "Plan, schedule, and run events at your venue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      icon={CalendarRange}
      title="Event Management"
      description="Event tools are being built — scheduling, ticketing, and event-day views will live here."
    />
  ),
});
