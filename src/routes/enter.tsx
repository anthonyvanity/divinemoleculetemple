import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/enter")({ component: Enter });

function Enter() {
  return <Navigate to="/gates" />;
}
