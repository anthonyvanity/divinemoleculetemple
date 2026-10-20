import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/study")({
  beforeLoad: () => {
    throw redirect({ to: "/academy/$code", params: { code: "FM-101" } });
  },
  component: () => null,
});
