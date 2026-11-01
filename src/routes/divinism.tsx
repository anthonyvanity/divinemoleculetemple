import { createFileRoute } from "@tanstack/react-router";
import { PublicDivinism } from "@/components/public-face";

export const Route = createFileRoute("/divinism")({ component: PublicDivinism });
