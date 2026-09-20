import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/LoginPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Venue Vue — POS Sign-in Portal" },
      {
        name: "description",
        content:
          "Access Venue Vue, the offline-first point of sale and event management workspace for venue teams.",
      },
      { property: "og:title", content: "Venue Vue — POS Sign-in Portal" },
      {
        property: "og:description",
        content:
          "Access Venue Vue, the offline-first point of sale and event management workspace for venue teams.",
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
