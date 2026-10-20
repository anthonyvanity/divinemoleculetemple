import { createFileRoute } from "@tanstack/react-router";
import { VanityProfile } from "@/components/vanity-profile";

export const Route = createFileRoute("/Anthony_Vanity")({
  component: () => <VanityProfile name="Anthony_Vanity" alias="/HighPriest" />,
});
