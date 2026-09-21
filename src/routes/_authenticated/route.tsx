import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/DashboardShell";
import { getOfflineSession } from "@/lib/offline-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() reads local storage only — it never hits the network, so
    // this gate still works with no connection.
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return { user: data.session.user };

    const offline = await getOfflineSession();
    if (offline) return { user: null };

    throw redirect({ to: "/login" });
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
