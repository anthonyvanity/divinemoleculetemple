import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Flame, GraduationCap, Home, Library, Menu, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ChamberIcon } from "@/components/chamber";
import { HouseGate } from "@/components/house-gate";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  ACADEMY_LINE,
  ACADEMY_LINKS,
  FOOTER,
  LATIN_FULL,
  MISSION_LINKS,
  NAV,
  STRIP,
} from "@/lib/temple-content";
import { givenTotal, leaveTemple, useTemple } from "@/lib/temple-store";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname === "/login" || pathname === "/register";
  const onHome = pathname === "/";
  const { user } = useCurrentUserState();

  if (bare) {
    return <div className="min-h-dvh bg-ink text-paper">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-paper">
      <header className="relative z-40 border-b border-paper/5 bg-ink pt-[env(safe-area-inset-top)]">
        {user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
              <img src="/hex-seal.webp" alt="" className="size-9 shrink-0 object-contain" />
              <span className="font-sans text-[12px] font-semibold uppercase leading-tight tracking-wide">
                Divine
                <br />
                Molecule
                <br />
                Temple
              </span>
            </Link>
            <button
              type="button"
              className="ml-auto text-[10px] uppercase tracking-[0.14em] text-paper/55"
              onClick={() => {
                leaveTemple();
                void signOut("/").catch(() => {
                  window.location.href = "/";
                });
              }}
            >
              Log off
            </button>
          </div>
        ) : (
          <div className="relative overflow-visible">
            <Link
              to="/"
              className="temple-lockup mx-auto flex w-full max-w-full flex-col items-center justify-center px-2 pb-2 pt-1 text-center text-paper sm:px-4"
            >
              <img src="/hex-seal.webp" alt="" className="size-[4.5rem] bg-ink object-contain sm:size-28" />
              <span className="mt-1.5 block max-w-full px-3 text-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-gold sm:text-[12px]">
                {LATIN_FULL}
              </span>
              <span className="temple-wordmark mt-1 whitespace-nowrap font-lulo font-extrabold uppercase leading-none tracking-normal text-paper">
                The Divine Molecule Temple
              </span>
              <span className="mt-1.5 block max-w-[22rem] px-4 text-center text-[11px] font-medium uppercase leading-snug tracking-normal text-paper/70 sm:max-w-none sm:text-[12px]">
                {ACADEMY_LINE}
              </span>
            </Link>
            <div className="flex justify-end px-3 pb-2">
              <MyTempleButton />
            </div>
          </div>
        )}
        <div className="rainbow-bar h-1 w-full" />
        {!onHome || user ? <ChamberStrip force /> : null}
      </header>
      <div className="w-full flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <HouseGate>{children}</HouseGate>
      </div>
      <footer className="relative z-20 bg-ink pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-paper md:pb-0">
        <p className="overflow-hidden whitespace-nowrap px-3 pt-8 text-center font-sans font-medium uppercase leading-none tracking-[0.12em] text-lime [font-size:min(13px,calc((100vw-1.5rem)/42))]">
          Run light. Terminate darkness. Stay online.
        </p>
        <div className="mx-auto grid w-fit max-w-full grid-cols-4 items-start justify-items-center gap-x-4 px-3 py-8 text-center sm:gap-x-12 md:gap-x-16">
          {(
            [
              ["The Temple", FOOTER.temple],
              ["The Academy", FOOTER.academy],
              ["Nexus", FOOTER.nexus],
              ["Support", FOOTER.support],
            ] as const
          ).map(([title, items]) => (
            <div key={title} className="min-w-0 text-center">
              <p className="whitespace-nowrap text-[7px] font-semibold uppercase leading-none tracking-[0.04em] text-paper sm:text-[8px] sm:tracking-[0.18em]">{title}</p>
              <ul className="mt-3 flex flex-col items-center space-y-1.5">
                {items.map((item) => (
                  <li key={`${item.to}-${item.label}`}>
                    {item.to.startsWith("/legal/") ? (
                      <Link
                        to="/legal/$slug"
                        params={{ slug: item.to.split("/").pop() ?? "privacy" }}
                        className="inline-flex min-h-6 items-center whitespace-nowrap text-[7px] uppercase leading-none tracking-[0.02em] text-paper/45 hover:text-lime sm:text-[8px] sm:tracking-[0.16em]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <Link
                        to={item.to}
                        className="inline-flex min-h-6 items-center whitespace-nowrap text-[7px] uppercase leading-none tracking-[0.02em] text-paper/45 hover:text-lime sm:text-[8px] sm:tracking-[0.16em]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <nav className="flex flex-nowrap items-center justify-center gap-x-1 overflow-hidden whitespace-nowrap px-2 pb-6 text-center font-sans uppercase leading-none tracking-normal text-paper/50 [font-size:min(9px,calc((100vw-1rem)/58))]">
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
      </footer>
    </div>
  );
}

export function MyTempleButton() {
  const { user, isPending } = useCurrentUserState();
  const className =
    "peach-fire inline-flex h-6 items-center gap-1 px-1.5 text-[8px] font-medium uppercase leading-none tracking-wide";
  if (isPending) {
    return (
      <span className={className}>
        <Flame className="size-3" />
        My Temple
      </span>
    );
  }
  return (
    <a href={user ? "/dashboard" : "/login"} className={className}>
      <Flame className="size-3.5" />
      My Temple
    </a>
  );
}

function IconNav({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={cn("items-center gap-1", className)}>
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={cn(
              "grid size-9 place-items-center",
              active ? "bg-lime text-ink" : "text-lime hover:text-orange",
            )}
          >
            <ChamberIcon name={item.icon} className="size-4" />
          </Link>
        );
      })}
    </nav>
  );
}

export function ChamberStrip({ className, force = false }: { className?: string; force?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();
  const offerings = useTemple((s) => s.offerings);
  const given = givenTotal(offerings);
  const onHome = pathname === "/";
  const [openMenu, setOpenMenu] = useState<"academy" | "mission" | null>(null);

  function goChamber(e: React.MouseEvent, id: string, to: string) {
    if (!onHome) return;
    if (!document.getElementById("chamber-slides")) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("temple:chamber", { detail: id }));
    document.getElementById("chamber-slides")?.scrollIntoView({ behavior: "smooth", block: "start" });
    void to;
  }

  const missionItems = [
    ...(user && given > 0 ? [{ to: "/altar" as const, label: `Given $${given}` }] : []),
    ...MISSION_LINKS.map((l) => ({ to: l.to, label: l.label })),
  ];
  const academyItems = ACADEMY_LINKS.map((l) => ({ to: l.to, label: l.label }));
  const panel = openMenu === "academy" ? academyItems : openMenu === "mission" ? missionItems : null;

  return (
    <nav className={cn(force ? "block" : "hidden md:block", "bg-lime text-ink", className)}>
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] [scrollbar-width:none] sm:justify-between sm:overflow-x-visible sm:px-5 sm:text-[13px] [&::-webkit-scrollbar]:hidden">
        {STRIP.map((c) =>
          c.id === "academy" ? (
            <StripButton
              key={c.id}
              label="Academy"
              icon={c.icon}
              open={openMenu === "academy"}
              active={
                pathname.startsWith("/academy") ||
                pathname === "/enter" ||
                pathname === "/awakening" ||
                pathname === "/study" ||
                pathname === "/transmissions"
              }
              onClick={() => setOpenMenu((v) => (v === "academy" ? null : "academy"))}
            />
          ) : (
            <Link
              key={c.id}
              to={c.to}
              onClick={(e) => {
                setOpenMenu(null);
                if (c.id !== "shop" && c.id !== "classes") goChamber(e, c.id, c.to);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 hover:text-orange"
            >
              <ChamberIcon name={c.icon} className="size-3.5 shrink-0" />
              <span>{c.title}</span>
            </Link>
          ),
        )}
        <StripButton
          label="Give"
          icon="Rocket"
          open={openMenu === "mission"}
          active={pathname === "/works" || pathname === "/altar" || pathname === "/shop" || pathname.startsWith("/legal")}
          onClick={() => setOpenMenu((v) => (v === "mission" ? null : "mission"))}
        />
      </div>
      {panel ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/15 px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.08em]">
          {panel.map((item) =>
            item.to.startsWith("/legal/") ? (
              <Link
                key={`${item.to}-${item.label}`}
                to="/legal/$slug"
                params={{ slug: item.to.split("/").pop() ?? "privacy" }}
                className="whitespace-nowrap py-1.5 hover:text-orange"
                onClick={() => setOpenMenu(null)}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to as "/altar"}
                className="whitespace-nowrap py-1.5 hover:text-orange"
                onClick={() => setOpenMenu(null)}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </nav>
  );
}

function StripButton({
  label,
  icon,
  open,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  open: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 uppercase hover:text-orange",
        (open || active) && "text-orange",
      )}
    >
      <ChamberIcon name={icon} className="size-3.5 shrink-0" />
      <span>{label}</span>
      <ChevronDown className={cn("size-3", open && "rotate-180")} />
    </button>
  );
}

export function PhoneDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();
  const [more, setMore] = useState(false);
  if (user || pathname === "/login" || pathname === "/register") return null;
  const items = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/academy" as const, label: "Academy", icon: GraduationCap },
    { to: "/classes" as const, label: "Classes", icon: Sparkles },
    { to: "/library" as const, label: "Books", icon: Library },
    { to: "/nexus" as const, label: "Nexus", icon: Share2 },
  ];
  const moreItems = [
    { to: "/sanctuary" as const, label: "Temple" },
    { to: "/divinism" as const, label: "Divine" },
    { to: "/ceremonies" as const, label: "Rites" },
    { to: "/cos" as const, label: "COS" },
    { to: "/sessions" as const, label: "Guides" },
    { to: "/housing" as const, label: "House" },
    { to: "/shop" as const, label: "Shop" },
    { to: "/altar" as const, label: "Give" },
    { to: "/gates" as const, label: "Gates" },
  ];
  const moreActive = moreItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return (
    <>
      {more ? (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-lime/40 bg-ink px-2 py-2 md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {moreItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMore(false)}
                className="flex min-h-11 items-center justify-center text-[12px] font-medium uppercase tracking-wide text-lime"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <nav
        aria-label="Phone"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-lime/30 bg-ink/95 pb-[env(safe-area-inset-bottom)] text-paper backdrop-blur-xl md:hidden"
      >
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMore(false)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-wide",
                active ? "text-lime" : "text-paper/55",
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-wide",
            more || moreActive ? "text-lime" : "text-paper/55",
          )}
        >
          <Menu className="size-5" strokeWidth={1.75} />
          More
        </button>
      </nav>
    </>
  );
}
