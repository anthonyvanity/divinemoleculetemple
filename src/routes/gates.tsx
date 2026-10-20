import { createFileRoute } from "@tanstack/react-router";
import { MembershipGrid } from "@/components/temple-blocks";

export const Route = createFileRoute("/gates")({ component: Gates });

function Gates() {
  return (
    <main className="page-canary bg-ink text-paper">
      <MembershipGrid />
    </main>
  );
}
