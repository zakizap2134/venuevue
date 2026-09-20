import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/LoginPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Venue Vue" },
      {
        name: "description",
        content:
          "Sign in to Venue Vue, the offline-first point of sale and event management system for venues.",
      },
      { property: "og:title", content: "Sign in — Venue Vue" },
      {
        property: "og:description",
        content:
          "Sign in to Venue Vue, the offline-first point of sale and event management system for venues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// Sign-in gate — the workspace (catalog, cart, event views) renders inside
// the AppShell after login is wired to the backend.
function Index() {
  return <LoginPage />;
}
