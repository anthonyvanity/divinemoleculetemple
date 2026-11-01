import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ChamberIcon } from "@/components/chamber";
import { HouseGate } from "@/components/house-gate";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LATIN_FULL, STRIP } from "@/lib/temple-content";
import { leaveTemple } from "@/lib/temple-store";
import { signOut } from "@/lib/auth/client";
import { MondayTab } from "@/components/monday-tab";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname === "/login" || pathname === "/register" || pathname === "/admin";
  const { user } = useCurrentUserState();

  if (bare) {
    return (
      <div className="min-h-dvh bg-ink text-paper">
        <HouseGate>{children}</HouseGate>
        <MondayTab />
      </div>
    );
  }

  if (pathname === "/dashboard") {
    return <DashboardFrame>{children}</DashboardFrame>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-paper">
      <header className="relative z-40 border-b border-paper/5 bg-ink pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <Link to={user ? "/dashboard" : "/"} className="flex min-w-0 flex-1 items-center gap-3">
            <img src="/header-seal.jpg" alt="" className="size-16 shrink-0 object-contain sm:size-20" />
            <span className="temple-lockup inline-grid min-w-0 max-w-full justify-items-center leading-none [font-size:min(3.25rem,calc((100vw-7.5rem)/16))]">
              <span className="whitespace-nowrap text-center font-mono font-medium uppercase tracking-[0.02em] text-gold [font-size:0.34em]">
                {LATIN_FULL}
              </span>
              <span className="mt-[0.14em] whitespace-nowrap text-center font-lulo font-extrabold uppercase tracking-normal text-paper">
                The Divine Molecule Temple
              </span>
            </span>
          </Link>
        </div>
        <div className="rainbow-bar h-1 w-full" />
        <MemberIcons />
      </header>
      <div className="w-full flex-1">
        <HouseGate>{children}</HouseGate>
        <MondayTab />
      </div>
      <footer className="relative z-20 bg-black pb-[env(safe-area-inset-bottom)] text-paper">
        <SiteFooterBody />
      </footer>
    </div>
  );
}

function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-black text-paper">
      <div className="w-full flex-1">
        <HouseGate>{children}</HouseGate>
        <MondayTab />
      </div>
      <SiteFooter />
    </div>
  );
}

function SiteFooter({ light = false }: { light?: boolean }) {
  return (
    <footer className={cn("relative z-20 pb-[env(safe-area-inset-bottom)]", light ? "bg-[#d7d0c3] text-ink" : "bg-black text-paper")}>
      <SiteFooterBody light={light} />
    </footer>
  );
}

function SiteFooterBody({ light = false }: { light?: boolean }) {
  return (
    <>
      <p className="overflow-hidden whitespace-nowrap px-3 pt-8 text-center font-sans font-medium uppercase leading-none tracking-[0.12em] text-lime [font-size:min(13px,calc((100vw-1.5rem)/42))]">
        Run light. Terminate darkness. Stay online.
      </p>
      <nav className={cn("mt-6 flex flex-nowrap items-center justify-center gap-x-1 overflow-hidden whitespace-nowrap px-2 pb-6 text-center font-sans uppercase leading-none tracking-normal [font-size:min(9px,calc((100vw-1rem)/58))]", light ? "text-ink/50" : "text-paper/50")}>
        {(
          [
            { to: "/legal/$slug" as const, slug: "accessibility", label: "Accessibility Statement" },
            { to: "/legal/$slug" as const, slug: "privacy", label: "Privacy Policy" },
            { to: "/legal/$slug" as const, slug: "terms", label: "Terms & Conditions" },
            { to: "/legal/$slug" as const, slug: "refund", label: "Refund Policy" },
            { to: "/chancellor" as const, slug: "", label: "Chancellor Desk" },
          ] as const
        ).map((item, i) => (
          <span key={item.label} className="contents">
            {i > 0 ? <span className="text-paper/30">·</span> : null}
            {item.to === "/chancellor" ? (
              <Link to="/chancellor" className="hover:text-lime">
                {item.label}
              </Link>
            ) : (
              <Link to="/legal/$slug" params={{ slug: item.slug }} className="hover:text-lime">
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <div className="bg-lime px-3 py-8 text-center text-ink sm:px-6">
        <p className="overflow-hidden whitespace-nowrap px-3 text-center font-sans font-medium uppercase leading-none text-ink [font-size:min(14px,calc((100vw-1.5rem)/64))]">
          <span className="font-lulo font-extrabold">The Divine Molecule Temple</span>
          <span className="font-normal"> is governed by </span>
          <span className="font-lulo font-extrabold">The Divine Molecule Trust</span>
        </p>
        <p className="mt-3 overflow-hidden whitespace-nowrap px-3 text-center font-sans font-normal uppercase leading-none tracking-[0.08em] [font-size:min(12px,calc((100vw-1.5rem)/62))]">
          All rights reserved, in all densities, realities and timelines, 2026
        </p>
      </div>
      <p className="overflow-hidden whitespace-nowrap bg-black px-2 py-2.5 text-left font-sans font-medium uppercase leading-none tracking-normal text-paper [font-size:min(11px,calc((100vw-1rem)/78))]">
        A digital sanctuary and modern academy for esoteric study, interactive consciousness tools, and global community ceremonies.
      </p>
    </>
  );
}

function MemberIcons() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <nav className="flex items-center gap-1 bg-ink px-2 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STRIP.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const shown = open === item.id || active;
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-label={item.title}
              onClick={() => setOpen(item.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center overflow-hidden px-2",
                active ? "bg-lime text-ink" : "text-lime hover:text-orange",
              )}
            >
              <ChamberIcon name={item.icon} className="size-4 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] transition-[max-width,margin] duration-200",
                  shown ? "ml-1.5 max-w-32" : "max-w-0",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
      {user ? (
        <button
          type="button"
          className="inline-flex h-6 shrink-0 items-center bg-lime px-1.5 text-[8px] font-semibold uppercase tracking-[0.04em] text-ink"
          onClick={() => {
            leaveTemple();
            void signOut("/").catch(() => {
              window.location.href = "/";
            });
          }}
        >
          Log out
        </button>
      ) : (
        <Link
          to="/login"
          className="inline-flex h-6 shrink-0 items-center bg-lime px-1.5 text-[8px] font-semibold uppercase tracking-[0.04em] text-ink"
        >
          Log in
        </Link>
      )}
    </nav>
  );
}

export function PhoneDock() {
  return null;
}
