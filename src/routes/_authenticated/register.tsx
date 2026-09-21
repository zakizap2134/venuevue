import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useDemoData } from "@/hooks/useDemoData";
import { formatCurrency } from "@/lib/demo-seed";

export const Route = createFileRoute("/_authenticated/register")({
  head: () => ({
    meta: [
      { title: "Register / Sales POS — Venue Vue" },
      { name: "description", content: "Ring up orders and take payments at the register." },
      { property: "og:title", content: "Register / Sales POS — Venue Vue" },
      { property: "og:description", content: "Ring up orders and take payments at the register." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

const STOCK_STYLES: Record<string, string> = {
  "in-stock": "bg-success/15 text-success",
  "low-stock": "bg-warning/15 text-warning",
  "out-of-stock": "bg-destructive/15 text-destructive",
};

const STOCK_LABELS: Record<string, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

function RegisterPage() {
  const demo = useDemoData();
  const items = demo?.inventory ?? [];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <header className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-gold">
          <ShoppingCart className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Register / Sales POS
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalog and stock levels stored on this device — the register list stays available with
            no connection.
          </p>
        </div>
      </header>

      <section
        aria-label="Product catalog"
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="interactive-card rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[var(--shadow-lift)] backdrop-blur-md"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.category}
            </p>
            <h2 className="mt-1 font-display text-base font-bold tracking-tight text-foreground">
              {item.name}
            </h2>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(item.price)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{item.stock} on hand</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                  STOCK_STYLES[item.status] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {STOCK_LABELS[item.status] ?? item.status}
              </span>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading catalog from this device…</p>
        )}
      </section>
    </div>
  );
}
