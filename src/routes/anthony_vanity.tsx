import { createFileRoute } from "@tanstack/react-router";
import { VanityProfile } from "@/components/vanity-profile";

export const Route = createFileRoute("/anthony_vanity")({
  component: () => <VanityProfile name="anthony_vanity" alias="/HighPriest" />,
});
