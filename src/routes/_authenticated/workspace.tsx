import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — Venue Vue" },
      {
        name: "description",
        content:
          "Your Venue Vue workspace — point of sale and event management for your venue.",
      },
      { property: "og:title", content: "Workspace — Venue Vue" },
      {
        property: "og:description",
        content:
          "Your Venue Vue workspace — point of sale and event management for your venue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Workspace,
});

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier / Staff",
};

// Workspace placeholder — catalog, cart, and event views land here next.
function Workspace() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const [{ data: userData }, { data: roleData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("user_roles").select("role").limit(1),
      ]);
      return {
        email: userData.user?.email ?? "",
        role: roleData?.[0]?.role as string | undefined,
      };
    },
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  const roleLabel = data?.role ? (ROLE_LABELS[data.role] ?? data.role) : "Staff";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="interactive-card rounded-3xl border border-border/70 bg-card/90 p-8 shadow-[var(--shadow-lift)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Signed in as
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="status-pill status-pill-online">
                  <span className="status-dot" aria-hidden="true" />
                  {isLoading ? "Loading…" : roleLabel}
                </span>
                <span className="text-sm text-muted-foreground">{data?.email}</span>
              </div>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Your workspace is being built. Catalog, cart, and event views will
                appear here — your role unlocks what you can do.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="interactive-btn flex items-center gap-2 rounded-xl border border-input bg-surface-raised px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              Sign out
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
