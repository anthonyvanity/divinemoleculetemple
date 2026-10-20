import { createFileRoute } from "@tanstack/react-router";
import { VanityProfile } from "@/components/vanity-profile";

export const Route = createFileRoute("/highpriest")({
  component: () => <VanityProfile name="highpriest" alias="/anthony_vanity" />,
});
