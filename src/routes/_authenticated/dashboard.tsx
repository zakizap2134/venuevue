import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Package, Wallet } from "lucide-react";
import { useMe, ROLE_LABELS } from "@/components/DashboardShell";
import { useDemoData } from "@/hooks/useDemoData";
import { formatCurrency } from "@/lib/demo-seed";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Venue Vue" },
      {
        name: "description",
        content:
          "Venue Vue POS dashboard — today's sales, active events, and inventory at a glance.",
      },
      { property: "og:title", content: "Dashboard — Venue Vue" },
      {
        property: "og:description",
        content:
          "Venue Vue POS dashboard — today's sales, active events, and inventory at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useMe();
  const demo = useDemoData();
  const roleLabel = ROLE_LABELS[data?.role ?? "manager"] ?? "Manager";

  const totalSales = demo?.sales.reduce((sum, sale) => sum + sale.total, 0) ?? 0;
  const activeEvents = demo?.events.filter((e) => e.status === "live").length ?? 0;
  const lowStock = demo?.inventory.filter((i) => i.status !== "in-stock").length ?? 0;

  const METRICS = [
    {
      icon: Wallet,
      label: "Total Sales",
      value: demo ? formatCurrency(totalSales) : "—",
      hint: `${demo?.sales.length ?? 0} transactions recorded today`,
    },
    {
      icon: CalendarRange,
      label: "Active Events",
      value: demo ? String(activeEvents) : "—",
      hint: "Events live at your venue right now",
    },
    {
      icon: Package,
      label: "Inventory Status",
      value: demo ? (lowStock === 0 ? "Healthy" : `${lowStock} to restock`) : "—",
      hint: `${demo?.inventory.length ?? 0} items in the catalog`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      {/* Welcome banner */}
      <section className="interactive-card relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-8 shadow-[var(--shadow-lift)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--gold-soft),transparent_55%)] opacity-40"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            {roleLabel} console
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome to Venue Vue POS
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Your venue at a glance — sales, events, and inventory update here as
            the floor gets busy. Pick a module on the left to get started.
          </p>
        </div>
      </section>

      {/* Summary metrics */}
      <section
        aria-label="Summary metrics"
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {METRICS.map(({ icon: Icon, label, value, hint }) => (
          <div
            key={label}
            className="interactive-card rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[var(--shadow-lift)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <div className="grid size-9 place-items-center rounded-xl bg-info/15 text-info">
                <Icon className="size-4" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
