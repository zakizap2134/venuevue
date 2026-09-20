import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

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
  component: () => (
    <ModulePlaceholder
      icon={ShoppingCart}
      title="Register / Sales POS"
      description="The register is being built — product grid, cart, and checkout will live here."
    />
  ),
});
