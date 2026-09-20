import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Venue Vue — POS & Event Management" },
      {
        name: "description",
        content:
          "Offline-first point of sale and event management for venues, built to keep selling even when the network drops.",
      },
      { property: "og:title", content: "Venue Vue — POS & Event Management" },
      {
        property: "og:description",
        content:
          "Offline-first point of sale and event management for venues, built to keep selling even when the network drops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// Placeholder workspace content — the POS catalog, cart, and event views
// will render inside this shell.
function Index() {
  const categories = [
    "Drinks",
    "Food",
    "Merch",
    "Tickets",
    "Combos",
    "More coming",
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium uppercase tracking-wide text-gold">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Workspace ready
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The floor is yours
          </h2>
          <p className="mt-2 text-muted-foreground">
            This is the main stage for your point of sale. Catalog, cart, and
            event tools will dock here — online or off.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((name, i) => (
            <button
              key={name}
              type="button"
              className="interactive-card flex flex-col items-start gap-8 rounded-2xl border border-border/70 bg-card p-4 text-left focus-visible:outline-none"
              disabled={i === categories.length - 1}
            >
              <span className="font-display text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="text-xs text-muted-foreground">
                {i === categories.length - 1 ? "Stay tuned" : "0 items"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-gold/30 bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Set up your first event
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a menu, assign a register, and start taking orders.
            </p>
          </div>
          <button
            type="button"
            className="interactive-btn inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold-glow)] hover:bg-gold-soft"
          >
            Get started
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
