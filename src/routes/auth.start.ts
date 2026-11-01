import { createFileRoute } from "@tanstack/react-router";
import { handleAuthStart } from "@/lib/auth/start.server";

export const Route = createFileRoute("/auth/start")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthStart(request),
    },
  },
});
