import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PublicFace } from "@/components/public-face";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const PASS = ["/login", "/register", "/legal", "/contact", "/cos", "/altar", "/gates", "/enter", "/archives", "/archive", "/program", "/awakening", "/auth", "/ascend", "/shop", "/academy", "/classes", "/nexus", "/ceremonies", "/member", "/anthony_vanity", "/Anthony_Vanity", "/HighPriest", "/highpriest", "/ChancellorMonday", "/chancellormonday"];
const MEMBER = ["/dashboard", "/profile", "/chancellor"];

export function HouseGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const pass = PASS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const member = MEMBER.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPending || user || pass || member || pathname === "/") return children;
  return <PublicFace path={pathname} />;
}