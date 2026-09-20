import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectionBadge } from "@/components/ConnectionBadge";

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier / Staff",
};

const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Register / Sales POS", url: "/register", icon: ShoppingCart },
  { title: "Event Management", url: "/events", icon: CalendarRange },
  { title: "Reports & Analytics", url: "/reports", icon: ChartColumn },
  { title: "System Settings", url: "/settings", icon: Settings },
] as const;

/** Signed-in user identity: email + auto-detected role from the backend. */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const [{ data: userData }, { data: roleData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("user_roles").select("role").limit(1),
      ]);
      return {
        email: userData.user?.email ?? "",
        // Roles are assigned server-side; fall back to Manager if none found.
        role: (roleData?.[0]?.role as string | undefined) ?? "manager",
      };
    },
    staleTime: 60_000,
  });
}

function initialsFromEmail(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const letters = (parts.length > 1 ? first + second : name.slice(0, 2)) || "VV";
  return letters.toUpperCase();
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="POS modules" className="flex h-full flex-col gap-1 p-3">
      <div className="mb-3 flex items-center gap-3 px-2 pt-2">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-gold-glow)]">
          <Store className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold tracking-tight text-foreground">
            Venue Vue
          </p>
          <p className="truncate text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            POS Console
          </p>
        </div>
      </div>

      {NAV_ITEMS.map(({ title, url, icon: Icon }) => {
        const active = currentPath === url;
        return (
          <Link
            key={url}
            to={url}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`interactive-btn flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-primary/15 text-gold shadow-[inset_0_0_0_1px_var(--gold-soft)]"
                : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = ROLE_LABELS[data?.role ?? "manager"] ?? "Manager";

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-surface/85 backdrop-blur-md md:block">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border/60 bg-surface shadow-[var(--shadow-lift)]">
            <div className="flex justify-end p-2">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="interactive-btn grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-surface/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="interactive-btn grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold tracking-tight text-foreground">
                Your venue name
              </p>
              <p className="truncate text-xs text-muted-foreground">Point of Sale</p>
            </div>

            <ConnectionBadge />

            {/* Signed-in user: avatar, role badge, logout */}
            <div className="flex shrink-0 items-center gap-2.5 border-l border-border/60 pl-3">
              <div
                className="grid size-9 place-items-center rounded-full bg-primary/20 text-xs font-bold text-gold shadow-[inset_0_0_0_1px_var(--gold-soft)]"
                aria-hidden="true"
              >
                {initialsFromEmail(data?.email ?? "")}
              </div>
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="max-w-[140px] truncate text-xs font-semibold text-foreground">
                  {data?.email ?? "…"}
                </p>
                <span className="status-pill status-pill-online mt-0.5 !px-2 !py-0 text-[0.6rem]">
                  <span className="status-dot" aria-hidden="true" />
                  {roleLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="interactive-btn flex items-center gap-2 rounded-xl border border-input bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
