import { createFileRoute } from "@tanstack/react-router";
import { VanityProfile } from "@/components/vanity-profile";

export const Route = createFileRoute("/ChancellorMonday")({
  component: () => <VanityProfile name="ChancellorMonday" />,
});
