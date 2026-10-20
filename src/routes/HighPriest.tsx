import { createFileRoute } from "@tanstack/react-router";
import { VanityProfile } from "@/components/vanity-profile";

export const Route = createFileRoute("/HighPriest")({
  component: () => <VanityProfile name="HighPriest" alias="/anthony_vanity" />,
});
