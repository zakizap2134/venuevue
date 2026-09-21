import { useEffect, useState, type ReactNode } from "react";
import { Cloud, CloudOff, ReceiptText, RefreshCcw, Store, Wallet } from "lucide-react";

/** Tracks browser connectivity and syncs offline mutations. */
function useConnectionStatus() {
  const [online, setOnline] = useState(true);


  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // When coming back online, sync pending mutations
  useEffect(() => {
    if (online) {
      syncOfflineMutations();
    }
  }, [online]);

  return online;
}

async function syncOfflineMutations() {
  const { markSynced, getPendingMutations } = await import("@/lib/offline-storage");
  const pending = await getPendingMutations();
  for (const mutation of pending) {
    try {
      // Perform the actual Supabase operation based on mutation type
      const supabase = await import("@/integrations/supabase/client");
      switch (mutation.type) {
        case "insert":
          await supabase.default.from(mutation.table).insert(mutation.data);
          break;
        case "update":
          await supabase.default.from(mutation.table).update(mutation.data).match(mutation.where);
          break;
        case "delete":
          await supabase.default.from(mutation.table).delete().match(mutation.where);
          break;
      }
      await markSynced(mutation.id);
    } catch (error) {
      console.error("Failed to sync mutation", mutation.id, error);
      // Will retry next time coming online
    }
  }
}

/** Connection badge showing online/offline status. */
function ConnectionBadge() {
  const online = useConnectionStatus();

  return (
    <span
      className={`status-pill ${online ? "status-pill-online" : "status-pill-offline"}`}
      aria-live="polite"
    >
      <span className="status-dot" aria-hidden="true" />
      {online ? "Online" : "Offline mode"}
    </span>
  );
}

function QuickStats() {
  // Placeholder stats — wired to live data as POS features land.
  const stats = [
    { icon: ReceiptText, label: "Orders today", value: "—" },
    { icon: Wallet, label: "Net sales", value: "—" },
    { icon: RefreshCcw, label: "Pending sync", value: "0" },
  ];

  return (
    <div className="hidden items-center gap-2 lg:flex">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card px-3 py-1.5"
          title={label}
        >
          <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          {/* Venue branding — replace the placeholder venue name with the
              signed-in venue's identity. */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-gold-glow)]">
              <Store className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-foreground">
                Venue Vue
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Your venue name · Point of Sale
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <QuickStats />
            <ConnectionBadge />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
