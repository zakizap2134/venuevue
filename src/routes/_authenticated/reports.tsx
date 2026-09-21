import { createFileRoute } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import { useDemoData } from "@/hooks/useDemoData";
import { formatCurrency } from "@/lib/demo-seed";

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
  component: ReportsPage,
});

function ReportsPage() {
  const demo = useDemoData();
  const sales = demo?.sales ?? [];
  const total = sales.reduce((sum, sale) => sum + sale.total, 0);
  const itemCount = sales.reduce((sum, sale) => sum + sale.items, 0);
  const average = sales.length > 0 ? total / sales.length : 0;

  const byRegister = sales.reduce<Record<string, number>>((acc, sale) => {
    acc[sale.register] = (acc[sale.register] ?? 0) + sale.total;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <header className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-gold">
          <ChartColumn className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Built from the sales stored on this device — available with or without a connection.
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Gross sales", value: formatCurrency(total) },
          { label: "Average ticket", value: formatCurrency(average) },
          { label: "Items sold", value: String(itemCount) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="interactive-card rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[var(--shadow-lift)] backdrop-blur-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[var(--shadow-lift)]">
        <h2 className="border-b border-border/70 px-5 py-3 font-display text-sm font-bold tracking-tight text-foreground">
          Sales by register
        </h2>
        <ul className="divide-y divide-border/70">
          {Object.entries(byRegister).map(([register, amount]) => (
            <li key={register} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-foreground">{register}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(amount)}
              </span>
            </li>
          ))}
          {sales.length === 0 && (
            <li className="px-5 py-3 text-sm text-muted-foreground">Loading local sales…</li>
          )}
        </ul>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[var(--shadow-lift)]">
        <h2 className="border-b border-border/70 px-5 py-3 font-display text-sm font-bold tracking-tight text-foreground">
          Recent transactions
        </h2>
        <ul className="divide-y divide-border/70">
          {sales.map((sale) => (
            <li key={sale.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{sale.reference}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {sale.register} · {sale.cashier} · {sale.items} items
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {formatCurrency(sale.total)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
