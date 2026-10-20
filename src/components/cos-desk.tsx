import { Link, useRouterState } from "@tanstack/react-router";
import {
  Archive,
  Bell,
  BookOpen,
  BookText,
  Flame,
  Hexagon,
  LayoutGrid,
  LogOut,
  Moon,
  Radio,
  Settings,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NoticeBell } from "@/components/notice-bell";
import { signOut } from "@/lib/auth/client";
import { scholarshipCourse, scholarshipPreview } from "@/lib/scholarship";
import { degreeCourse } from "@/lib/degree-catalog";
import { daysActive, displayHandle, leaveTemple, useTemple, type TempleMode } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/academy", label: "Curriculum", icon: BookOpen },
  { to: "/library", label: "Archive", icon: Archive },
  { to: "/transmissions", label: "Transmissions", icon: Radio },
  { to: "/nexus", label: "Community", icon: Users },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/cos", label: "COS Manual", icon: BookText },
  { to: "/profile", label: "Settings", icon: Settings },
] as const;

const DeskCtx = createContext<{
  classOpen: boolean;
  setClassOpen: (v: boolean) => void;
}>({ classOpen: false, setClassOpen: () => {} });

export function useDesk() {
  return useContext(DeskCtx);
}

export function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M32 4c6 10 10 18 10 28 0 6-2 11-6 16 8-4 14-12 14-22 0-8-3-16-8-24 10 8 18 20 18 34 0 16-12 30-28 34-16-4-28-18-28-34C4 22 12 10 22 2c-5 8-8 16-8 24 0 10 6 18 14 22-4-5-6-10-6-16C22 22 26 14 32 4Z"
      />
    </svg>
  );
}

function cycleMode(mode: TempleMode): TempleMode {
  if (mode === "night") return "day";
  if (mode === "day") return "possessed";
  return "night";
}

export function CosDesk({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = useTemple((s) => s.mode);
  const setMode = useTemple((s) => s.setMode);
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const path = useTemple((s) => s.path);
  const joinedAt = useTemple((s) => s.joinedAt);
  const name = displayHandle(handle, flameName);
  const initials = name.slice(0, 1);
  const rank = path === "none" ? "seeker" : path;
  const lvl = path === "patron" ? 4 : path === "initiate" ? 2 : 1;
  const lastClass = useTemple((s) => s.lastClass);
  const classCode = lastClass || "FM-101";
  const classTitle = scholarshipCourse(classCode)?.title ?? degreeCourse(classCode)?.course.title ?? "Introduction";
  const [classOpen, setClassOpen] = useState(true);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const stamp = `${String(clock.getMonth() + 1).padStart(2, "0")}.${String(clock.getDate()).padStart(2, "0")}.${clock.getFullYear()} // ${clock.toISOString().slice(11, 19)}`;

  return (
    <DeskCtx.Provider value={{ classOpen, setClassOpen }}>
      <div className={cn("min-h-dvh", `desk-${mode}`)} style={{ background: "var(--desk-bg)", color: "var(--desk-fg)" }}>
        <header
          className="flex h-12 items-center justify-between gap-3 border-b px-3 sm:px-4"
          style={{ borderColor: "var(--desk-line)" }}
        >
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 place-items-center text-[11px]" style={{ color: "var(--desk-accent)" }}>
              ✦
            </span>
            <span className="truncate font-display text-[13px] tracking-wide">The Divine Molecule Temple</span>
          </Link>
          <p className="hidden text-[10px] tracking-[0.2em] md:block" style={{ color: "var(--desk-muted)" }}>
            Divine Molecule Temple // C.O.S. V4.2
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              className="flex min-h-9 items-center px-2 text-[10px] tracking-[0.14em] lg:hidden"
              style={{ color: "var(--desk-muted)" }}
              onClick={() => {
                leaveTemple();
                void signOut("/").catch(() => {
                  window.location.href = "/";
                });
              }}
            >
              Log off
            </button>
            <button
              type="button"
              onClick={() => setMode(cycleMode(mode))}
              className="hidden items-center gap-1.5 px-2 text-[10px] tracking-[0.16em] sm:flex"
              style={{ color: "var(--desk-accent)" }}
            >
              {mode === "day" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              {mode === "night" ? "Night" : mode === "day" ? "Light" : "Meta"}
            </button>
            <NoticeBell />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border pl-1 pr-2.5"
              style={{ borderColor: "var(--desk-line)" }}
            >
              <span
                className="grid size-7 place-items-center rounded-full text-[11px]"
                style={{ background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }}
              >
                {initials}
              </span>
              <span className="hidden py-1 text-[9px] tracking-[0.14em] sm:block">
                {rank} // Lvl {lvl}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setClassOpen(true)}
              className="hidden items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[9px] tracking-[0.16em] md:flex"
              style={{ borderColor: "var(--desk-accent)", color: "var(--desk-accent)" }}
            >
              <BookOpen className="size-3" /> Continue class
            </button>
          </div>
        </header>
        <div className="rainbow-bar h-0.5 w-full" />

        <div className="flex min-h-[calc(100dvh-3rem)]">
          <aside
            className="hidden w-[13.5rem] shrink-0 flex-col border-r lg:flex"
            style={{ borderColor: "var(--desk-line)" }}
          >
            <nav className="flex flex-1 flex-col gap-0.5 p-3">
              {LINKS.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-[11px] tracking-[0.16em]"
                    style={
                      active
                        ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }
                        : { color: "var(--desk-muted)" }
                    }
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto space-y-3 border-t p-3" style={{ borderColor: "var(--desk-line)" }}>
              <p className="text-[8px] tracking-[0.2em]" style={{ color: "var(--desk-muted)" }}>
                Daily seals
              </p>
              <div className="grid grid-cols-2 gap-2">
                <SealChip label="Day" open />
                <SealChip label="Night" open />
              </div>
              <p className="flex items-center gap-2 text-[8px] tracking-[0.16em]" style={{ color: "var(--desk-accent)" }}>
                <Flame className="size-3" /> Black flame: active
              </p>
              <p className="text-[8px] tracking-[0.14em]" style={{ color: "var(--desk-muted)" }}>
                System status: online
                <br />
                Last sync: {stamp}
                <br />
                {daysActive(joinedAt)} days in field
              </p>
              <button
                type="button"
                className="flex min-h-9 items-center gap-2 text-[10px] tracking-[0.16em]"
                style={{ color: "var(--desk-muted)" }}
                onClick={() => {
                  leaveTemple();
                  void signOut("/").catch(() => {
                    window.location.href = "/";
                  });
                }}
              >
                <LogOut className="size-3.5" /> Logout
              </button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
          <nav
            className="flex gap-1 overflow-x-auto border-b px-2 py-2 lg:hidden"
            style={{ borderColor: "var(--desk-line)" }}
          >
            {LINKS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-sm px-2 text-[9px] tracking-[0.14em]"
                  style={active ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" } : undefined}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
          </div>

          {classOpen ? (
            <aside
              className="hidden w-[22rem] shrink-0 flex-col border-l xl:flex"
              style={{ borderColor: "var(--desk-line)", background: "var(--desk-panel)" }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--desk-line)" }}>
                <p className="flex items-center gap-2 text-[10px] tracking-[0.18em]" style={{ color: "var(--desk-accent)" }}>
                  <BookOpen className="size-3.5" /> Continue class
                </p>
                <button type="button" onClick={() => setClassOpen(false)} aria-label="Close class">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-[9px] tracking-[0.2em]" style={{ color: "var(--desk-muted)" }}>
                  {classCode}
                </p>
                <h2 className="mt-2 font-display text-xl leading-tight">{classTitle}</h2>
                <div className="mt-6 space-y-4 text-[12px] leading-relaxed" style={{ color: "var(--desk-muted)" }}>
                  {(scholarshipPreview(classCode, 2).length
                    ? scholarshipPreview(classCode, 2)
                    : [degreeCourse(classCode)?.course.lecture ?? ""]
                  )
                    .filter((p) => p.length > 0)
                    .map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <a
                  href={`/academy/${classCode}`}
                  className="mt-8 inline-flex min-h-10 items-center border px-4 text-[10px] tracking-[0.16em]"
                  style={{ borderColor: "var(--desk-accent)", color: "var(--desk-accent)" }}
                >
                  Open full lesson →
                </a>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </DeskCtx.Provider>
  );
}

function SealChip({ label, open }: { label: string; open?: boolean }) {
  return (
    <div className="rounded-sm border px-2 py-2 text-center" style={{ borderColor: "var(--desk-line)" }}>
      <p className="text-[9px] tracking-[0.16em]">{label}</p>
      <p className="mt-1 text-[8px] tracking-[0.14em]" style={{ color: open ? "var(--desk-accent)" : "var(--desk-muted)" }}>
        {open ? "Open" : "Due"}
      </p>
    </div>
  );
}

export function HexMark({ className }: { className?: string }) {
  return <Hexagon className={className} />;
}
