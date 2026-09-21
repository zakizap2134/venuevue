import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  Store,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectionBadge, useConnectionStatus } from "@/components/ConnectionBadge";
import { getUserFromLocal, storeUserLocally } from "@/lib/offline-storage";
import { endOfflineSession, getOfflineSession, isOffline } from "@/lib/offline-auth";
import { useOfflineSync } from "@/hooks/useOfflineSync";

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

const THEME_STORAGE_KEY = "venue-vue-theme";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    document.documentElement.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextDarkMode ? "dark" : "light");
    setDarkMode(nextDarkMode);
  }

  return (
    <button
      type="button"
      aria-label={darkMode ? "Use light theme" : "Use dark theme"}
      title={darkMode ? "Use light theme" : "Use dark theme"}
      aria-pressed={darkMode}
      onClick={toggleTheme}
      className="interactive-btn grid size-9 shrink-0 place-items-center rounded-lg border border-input bg-surface-raised text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {darkMode ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** Signed-in user identity: email + auto-detected role from the backend. */
export function useMe() {
  return useQuery<{ email: string; role: string } | undefined, Error>({
    queryKey: ["me-offline"],
    queryFn: async () => {
      // Offline: trust the copy cached on this device, never touch the network.
      if (isOffline()) {
        const local = await getUserFromLocal();
        if (local?.user) {
          return { email: local.user.email ?? "", role: local.user.role ?? "manager" };
        }
        const session = await getOfflineSession();
        if (session) return { email: session.email, role: session.role };
        return undefined;
      }

      try {
        const [{ data: userData }, { data: roleData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("user_roles").select("role").limit(1),
        ]);

        if (userData?.user) {
          const role = (roleData?.[0]?.role as string | undefined) ?? "manager";
          const email = userData.user.email ?? "";
          await storeUserLocally({ email, role, userId: userData.user.id });
          return { email, role };
        }
      } catch {
        // Backend unreachable — fall through to the cached copy.
      }

      const local = await getUserFromLocal();
      if (local?.user) {
        return { email: local.user.email ?? "", role: local.user.role ?? "manager" };
      }
      return undefined;
    },
    staleTime: 60_000,
    networkMode: "offlineFirst",
    retry: false,
    enabled: typeof window !== "undefined",
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

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="POS modules" className="flex h-full flex-col gap-1 p-3">
      <div className={`mb-3 flex items-center pt-2 ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-gold-glow)]">
          <Store className="size-4" aria-hidden="true" />
        </div>
        <div className={collapsed ? "hidden" : "min-w-0"}>
          <p className="truncate font-display text-sm font-bold tracking-tight text-primary-foreground">
            Venue Vue
          </p>
          <p className="truncate text-[0.65rem] uppercase tracking-wide text-primary-foreground/70">
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
            title={collapsed ? title : undefined}
            className={`interactive-btn flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              active
                ? "bg-selected text-primary-foreground shadow-[inset_0_0_0_1px_var(--selected)]"
                : "text-primary-foreground/75 hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{title}</span>}
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
  const online = useConnectionStatus();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useOfflineSync();

  const roleLabel = ROLE_LABELS[data?.role ?? "manager"] ?? "Manager";

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    // Clears the offline session marker but keeps the credential vault, so
    // the same person can sign back in with no connection.
    await endOfflineSession();
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Offline sign-out is still a valid sign-out.
    }
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-primary-foreground/15 bg-primary transition-[width] duration-200 md:block ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          <SidebarNav collapsed={sidebarCollapsed} />
          <div className="mt-auto border-t border-primary-foreground/15 p-3">
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setSidebarCollapsed((value) => !value)}
              className={`interactive-btn flex h-10 w-full items-center rounded-lg text-primary-foreground/75 hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                sidebarCollapsed ? "justify-center" : "gap-3 px-3"
              }`}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-4" aria-hidden="true" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
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
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-primary-foreground/15 bg-primary shadow-[var(--shadow-lift)]">
            <div className="flex justify-end p-2">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="interactive-btn grid size-9 place-items-center rounded-lg text-primary-foreground/75 hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-primary-foreground/15 bg-primary shadow-[var(--shadow-lift)]">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="interactive-btn grid size-9 shrink-0 place-items-center rounded-lg text-primary-foreground/75 hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold tracking-tight text-primary-foreground">
                Your venue name
              </p>
              <p className="truncate text-xs text-primary-foreground/70">Point of Sale</p>
            </div>

            <ConnectionBadge />

            <ThemeToggle />

            {/* Signed-in user: avatar, role badge, logout */}
            <div className="flex shrink-0 items-center gap-2.5 border-l border-primary-foreground/15 pl-3">
              <div
                className="grid size-9 place-items-center rounded-full bg-selected/15 text-xs font-bold text-selected shadow-[inset_0_0_0_1px_var(--selected)]"
                aria-hidden="true"
              >
                {initialsFromEmail(data?.email ?? "")}
              </div>
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="max-w-[140px] truncate text-xs font-semibold text-primary-foreground">
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
