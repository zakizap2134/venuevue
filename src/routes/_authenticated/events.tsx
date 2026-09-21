import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, MapPin, Users } from "lucide-react";
import { useDemoData } from "@/hooks/useDemoData";

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
  component: EventsPage,
});

const STATUS_STYLES: Record<string, string> = {
  live: "bg-success/15 text-success",
  upcoming: "bg-info/15 text-info",
  closed: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  live: "Live now",
  upcoming: "Upcoming",
  closed: "Closed",
};

function EventsPage() {
  const demo = useDemoData();
  const events = demo?.events ?? [];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <header className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-gold">
          <CalendarRange className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Event Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything booked at your venue — stored on this device, so it stays readable offline.
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="interactive-card rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[var(--shadow-lift)] backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-base font-bold tracking-tight text-foreground">
                {event.name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                  STATUS_STYLES[event.status] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {STATUS_LABELS[event.status] ?? event.status}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <dd>{event.hall}</dd>
              </div>
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 shrink-0" aria-hidden="true" />
                <dd>{event.date}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0" aria-hidden="true" />
                <dd>{event.guests} guests</dd>
              </div>
            </dl>
          </article>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading events from this device…</p>
        )}
      </section>
    </div>
  );
}
