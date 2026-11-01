import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureMember, listCircles, postNexus, type StudyCircleRow } from "@/lib/temple-data";
import { cashAppAmountUrl, PRIMARY_COMMANDS, AWAKENING, LATIN_FULL } from "@/lib/temple-content";
import { compilePrayer } from "@/lib/compiler";
import { RITES } from "@/lib/rites";
import { COS_BOOKS } from "@/lib/cos-shelf";
import { scholarshipCourse, SCHOLARSHIP_SEQUENCE } from "@/lib/scholarship";
import { STICKERS } from "@/lib/shop";
import { useTemple } from "@/lib/temple-store";
import { FirstTour } from "@/components/first-tour";
import { ChamberIcon } from "@/components/chamber";
import { useNexusFeed } from "@/components/nexus-board";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { user, isPending } = useCurrentUserState();
  const setHandle = useTemple((s) => s.setHandle);
  const handle = useTemple((s) => s.handle);
  const setPath = useTemple((s) => s.setPath);
  const path = useTemple((s) => s.path);
  const mergeAwakening = useTemple((s) => s.mergeAwakening);
  const setPortrait = useTemple((s) => s.setPortrait);

  useEffect(() => {
    if (!user?.id) return;
    if (!handle) {
      const seed = (user.displayName ?? user.primaryEmail ?? "seeker").split("@")[0] ?? "seeker";
      setHandle(seed.replace(/\s+/g, "_").toUpperCase());
    }
    void ensureMember()
      .then((m) => {
        if (m.profile.handle && m.profile.handle !== "SEEKER") setHandle(m.profile.handle);
        const tier = m.membership?.tier;
        if (tier === "initiate" || tier === "seeker" || tier === "patron") setPath(tier);
        if (m.awakening?.length) mergeAwakening(m.awakening);
        if (!useTemple.getState().portrait && m.profile.avatar_url) setPortrait(m.profile.avatar_url);
      })
      .catch(() => {});
  }, [user?.id, user?.displayName, user?.primaryEmail, handle, path, setHandle, setPath, mergeAwakening, setPortrait]);

  if (isPending) {
    return (
      <main className="grid min-h-[70dvh] place-items-center bg-black text-paper">
        <p className="text-micro tracking-[0.22em] text-lime">Synchronizing session…</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <Dashboard />;
}

function remain(at: string, now: Date) {
  const match = /^(\d{1,2}):(\d{2})/.exec(at.trim());
  if (!match) return null;
  const target = new Date(now);
  target.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function stamp(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const parts = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}

function NextRiteClock({ schedule }: { schedule: { wake: string; study: string; bed: string } }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const next = [
    { at: schedule.wake, label: "wake" },
    { at: schedule.study, label: "study" },
    { at: schedule.bed, label: "rest" },
  ]
    .map((item) => ({ ...item, ms: remain(item.at, now) }))
    .filter((item): item is { at: string; label: string; ms: number } => item.ms != null)
    .sort((a, b) => a.ms - b.ms)[0];
  return <UntilClock at={next?.at ?? schedule.wake} label={next ? `Until ${next.label}` : "Until next rite"} />;
}

function UntilClock({ at, label }: { at: string; label: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const ms = remain(at, now);
  const hand = ms == null ? 0 : ((60 - Math.floor((ms / 1000) % 60)) % 60) * 6;
  return (
    <div className="mt-auto flex items-center gap-2 pt-2">
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-current">
        <span className="absolute bottom-1/2 left-1/2 h-3 w-px origin-bottom bg-current" style={{ transform: `translateX(-50%) rotate(${hand}deg)` }} />
        <span className="size-1 rounded-full bg-current" />
      </span>
      <span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.12em]">{label}</span>
        <span className="plate-type font-display text-lg leading-none">{ms == null ? "--:--:--" : stamp(ms)}</span>
      </span>
    </div>
  );
}

function Tile({
  id,
  open,
  setOpen,
  tone,
  icon,
  title,
  square,
  clock,
  facts,
  children,
}: {
  id: string;
  open: string | null;
  setOpen: (id: string | null) => void;
  tone: string;
  icon: string;
  title: string;
  square?: boolean;
  clock?: ReactNode;
  facts?: string[];
  children: ReactNode;
}) {
  const frame =
    {
      "bg-orange": "border-orange text-orange",
      "bg-lime": "border-lime text-lime",
      "bg-cyan": "border-cyan text-cyan",
      "bg-lilac": "border-lilac text-lilac",
      "bg-pink": "border-pink text-pink",
      "bg-canary": "border-canary text-canary",
      "bg-paper": "border-paper text-paper",
      "bg-ink text-lime": "border-lime text-lime",
    }[tone] ?? "border-lime text-lime";
  const shown = open === id;
  return (
    <section className={cn("desk-plate flex flex-col border-2", frame, shown ? "col-span-2" : square ? "aspect-square" : "col-span-2")}>
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => setOpen(shown ? null : id)}
        className={cn("flex w-full flex-1 flex-col items-start p-3 text-left text-inherit", !shown && !square && "min-h-16")}
      >
        <span className="flex w-full items-center gap-2">
          <ChamberIcon name={icon} className="size-4 shrink-0" />
          <span className="plate-type font-display text-[clamp(1.05rem,4.4vw,1.65rem)] uppercase leading-[0.85]">{title}</span>
          <span
            aria-hidden
            className={cn("ml-auto inline-block size-1.5 shrink-0 border-r border-b border-current", shown ? "rotate-[225deg]" : "rotate-45")}
          />
        </span>
        {!shown && facts?.length ? (
          <span className="mt-2 space-y-1 pr-6">
            {facts.map((line) => (
              <span key={line} className="block font-mono text-[10px] uppercase leading-snug tracking-[0.06em]">
                {line}
              </span>
            ))}
          </span>
        ) : null}
        {!shown ? clock : null}
      </button>
      {shown ? <div className="desk-open relative z-[1] border-t border-current/30 px-3 pb-4">{children}</div> : null}
    </section>
  );
}
const PIECE_TONE: Record<string, string> = {
  scholarship: "orange",
  academy: "orange",
  protocol: "lime",
  rites: "lime",
  codes: "lime",
  reading: "cyan",
  study: "cyan",
  cos: "lilac",
  nexus: "pink",
  give: "canary",
  shop: "paper",
  tx: "lime",
};

type DeskMove = {
  order: string[];
  over: string | null;
  moving: string | null;
  open: string | null;
  onGrab: (id: string, event: React.PointerEvent<HTMLButtonElement>) => void;
};

const DeskMoveContext = createContext<DeskMove | null>(null);

const DESK_IDS = ["scholarship", "protocol", "reading", "academy", "rites", "study", "cos", "codes", "nexus", "give", "shop", "tx"];

function loadDeskOrder() {
  if (typeof window === "undefined") return [...DESK_IDS];
  try {
    const saved = JSON.parse(localStorage.getItem("dmt-desk-order") || "[]") as string[];
    const known = saved.filter((id) => DESK_IDS.includes(id));
    return [...known, ...DESK_IDS.filter((id) => !known.includes(id))];
  } catch {
    return [...DESK_IDS];
  }
}

function Piece({ id, span, children }: { id: string; span?: boolean; children: ReactNode }) {
  const desk = useContext(DeskMoveContext);
  const tone = PIECE_TONE[id] ?? "lime";
  const live = desk?.open === id || desk?.moving === id;
  return (
    <div
      data-piece={id}
      data-tone={tone}
      data-live={live ? "1" : "0"}
      style={{ order: Math.max(0, desk?.order.indexOf(id) ?? 0) }}
      className={cn("desk-piece relative min-w-0", span && "col-span-2", desk?.over === id && "outline outline-1 outline-white")}
    >
      <button
        type="button"
        aria-label="Move"
        className="absolute bottom-1.5 right-1.5 z-20 grid size-6 touch-none place-items-center border border-white/40 bg-black font-mono text-[9px] text-white"
        onPointerDown={(event) => {
          event.stopPropagation();
          desk?.onGrab(id, event);
        }}
      >
        ✥
      </button>
      {children}
    </div>
  );
}

function Corners() {
  return (
    <>
      <span className="pointer-events-none absolute left-1.5 top-1.5 size-3 border-l border-t border-current" />
      <span className="pointer-events-none absolute right-1.5 top-1.5 size-3 border-r border-t border-current" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 size-3 border-b border-l border-current" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 size-3 border-b border-r border-current" />
    </>
  );
}

function Meter({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="mt-4 border-t border-current/30 pt-3">
      <div className="flex items-end justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.16em]">{label}</p>
        <p className="font-display text-2xl leading-none">{done}<span className="text-base"> / {total}</span></p>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em]">Performance · {pct}%</p>
      <div className="mt-2 h-2.5 w-full bg-white/15">
        <div className="h-full bg-current" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useCurrentUserState();
  const handle = useTemple((s) => s.handle);
  const path = useTemple((s) => s.path);
  const paid = useTemple((s) => s.paid);
  const portrait = useTemple((s) => s.portrait);
  const read = useTemple((s) => s.read);
  const lastClass = useTemple((s) => s.lastClass);
  const bookmarks = useTemple((s) => s.bookmarks);
  const schedule = useTemple((s) => s.deskSchedule);
  const logRite = useTemple((s) => s.logRite);
  const addNexusPost = useTemple((s) => s.addNexusPost);
  const { feed, refresh } = useNexusFeed();
  const [circles, setCircles] = useState<StudyCircleRow[]>([]);
  const [gift, setGift] = useState("");
  const [signal, setSignal] = useState("");
  const [prayer, setPrayer] = useState("");
  const [terminal, setTerminal] = useState<string[]>(["cosmOS://divine/codes", "ready"]);
  const [open, setOpen] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>(() => loadDeskOrder());
  const [over, setOver] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    void listCircles()
      .then(setCircles)
      .catch(() => setCircles([]));
  }, []);

  const name = (user?.displayName || handle || "Seeker").replace(/_/g, " ");
  const clearance = paid || path === "initiate" ? "Initiate" : path === "patron" ? "Patron" : "Seeker";
  const resumeId = lastClass && SCHOLARSHIP_SEQUENCE.includes(lastClass) ? lastClass : (SCHOLARSHIP_SEQUENCE.find((id) => !read.includes(id)) ?? SCHOLARSHIP_SEQUENCE[0] ?? "");
  const course = resumeId ? scholarshipCourse(resumeId) : null;
  const started = Boolean(lastClass) || read.length > 0;
  const awakening = useTemple((s) => s.awakening);
  const ritesDone = useTemple((s) => s.rites);
  const classNotes = useTemple((s) => s.classNotes);
  const classesDone = read.filter((id) => SCHOLARSHIP_SEQUENCE.includes(id)).length;
  const booksOpen = COS_BOOKS.filter((book) => book.read).length;
  const booksRead = COS_BOOKS.filter((book) => book.read && (read.includes(book.read) || bookmarks[book.read] != null)).length;
  const ritesTotal = RITES.filter((item) => item.installed).length;
  const noteCount = Object.values(classNotes).reduce((sum, notes) => sum + notes.length, 0);
  const rite = useMemo(() => {
    const installed = RITES.filter((item) => item.installed);
    const day = new Date().toISOString().slice(0, 10);
    const n = [...day].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return installed[n % installed.length] ?? RITES[0];
  }, []);
  const left = Object.entries(bookmarks ?? {}).sort((a, b) => b[1] - a[1])[0];
  const leftBook = left ? COS_BOOKS.find((book) => book.read === left[0]) : null;
  const nextBook = COS_BOOKS.find((book) => book.read && book.read !== left?.[0]) ?? COS_BOOKS.find((book) => book.read);
  const classPct = SCHOLARSHIP_SEQUENCE.length ? Math.round((classesDone / SCHOLARSHIP_SEQUENCE.length) * 100) : 0;
  const latest = feed[0];

  const face = portrait || user?.profileImageUrl || "/header-seal.jpg";

  function onGrab(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragId.current = id;
    setMoving(id);
    const target = event.currentTarget;
    const move = (ev: PointerEvent) => {
      const hit = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .map((node) => (node as HTMLElement).closest?.("[data-piece]")?.getAttribute("data-piece"))
        .find((piece) => piece && piece !== dragId.current);
      setOver(hit ?? null);
    };
    const up = (ev: PointerEvent) => {
      const hit = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .map((node) => (node as HTMLElement).closest?.("[data-piece]")?.getAttribute("data-piece"))
        .find((piece) => piece && piece !== id);
      if (hit) {
        setOrder((prev) => {
          const next = prev.filter((item) => item !== id);
          const index = next.indexOf(hit);
          next.splice(index < 0 ? next.length : index, 0, id);
          try {
            localStorage.setItem("dmt-desk-order", JSON.stringify(next));
          } catch {
            /* private mode */
          }
          return next;
        });
      }
      dragId.current = null;
      setMoving(null);
      setOver(null);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  }

  function give(amount: number) {
    if (!amount || amount < 1) return;
    window.open(cashAppAmountUrl(amount), "_blank", "noopener,noreferrer");
  }

  function sendPrayer() {
    const text = prayer.trim();
    if (!text) return;
    const dest = Math.random() < 0.5 ? "the Metaverse" : "the cosmOS";
    const filed = compilePrayer(text);
    const verbs = ["invoke", "seal", "revoke", "declare", "scan"];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    setTerminal((lines) =>
      [
        ...lines,
        `>>> ${verb}("${text.slice(0, 72)}")`,
        filed.code.split("\n").find((line) => line.startsWith("target")) ?? `target = "the prayer as spoken"`,
        `print("${verb} complete")`,
        `sent to ${dest}`,
      ].slice(-8),
    );
    setPrayer("");
  }

  function postSignal() {
    const body = signal.trim();
    if (!body) return;
    addNexusPost({ body, visibility: "named" });
    void postNexus({ data: { body, visibility: "named", topic: "ongoing" } }).catch(() => {});
    setSignal("");
    refresh();
  }

  return (
    <main className="dash-dark bg-black text-paper">
      <section className="px-3 pb-2 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <img src="/header-seal.jpg" alt="" className="size-7 shrink-0 object-contain sm:size-8" />
            <span className="truncate font-lulo text-[10px] font-extrabold uppercase tracking-normal text-paper sm:text-xs">
              The Divine Molecule Temple
            </span>
          </Link>
          <p className="ml-auto shrink-0 text-right font-mono text-[8px] uppercase leading-tight tracking-[0.12em] text-gold sm:text-[10px]">
            {LATIN_FULL}
          </p>
        </div>
        <div className="rainbow-bar mx-auto mt-2 h-0.5 max-w-5xl" />
      </section>
      <section className="px-3 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link to="/profile" className="shrink-0">
            <img src={face} alt="" className="size-14 object-cover sm:size-16" />
          </Link>
          <div className="min-w-0">
            <p className="plate-type font-display text-[clamp(1.2rem,4vw,2rem)] uppercase leading-none">Welcome back, {name}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/55">Member · Clearance: {clearance}</p>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-5xl font-mono text-[10px] uppercase tracking-[0.14em] text-lime">// cos2.0 — divine molecule temple node</p>
      </section>

      <section className="px-3 pb-2 sm:px-6">
        <DeskMoveContext.Provider value={{ order, over, moving, open, onGrab }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2">
          <Piece id="scholarship" span>
          <article className="chunk px-4 py-4">
            <Corners />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Continue your scholarship</p>
            {course ? (
              <>
                <p className="mt-3 font-display text-[clamp(1.05rem,2.5vw,1.45rem)] uppercase leading-none">
                  {course.id} // {course.title}
                </p>
                {course.blocks[0]?.h ? (
                  <p className="mt-2 font-mono text-[11px] normal-case tracking-wide">Next: 01 — {course.blocks[0].h}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 font-display text-xl uppercase leading-none">Your scholarship begins here</p>
            )}
            <div className="mt-4 h-1.5 w-full bg-current/15">
              <div className="h-full bg-current" style={{ width: `${classesDone && SCHOLARSHIP_SEQUENCE.length ? Math.round((classesDone / SCHOLARSHIP_SEQUENCE.length) * 100) : 0}%` }} />
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em]">
              {classesDone && SCHOLARSHIP_SEQUENCE.length ? Math.round((classesDone / SCHOLARSHIP_SEQUENCE.length) * 100) : 0}% complete · {classesDone}/{SCHOLARSHIP_SEQUENCE.length}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {course ? (
                <Link to="/academy/$code" params={{ code: course.id }} className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                  {started ? "Continue class" : "Begin your first class"}
                </Link>
              ) : null}
              <Link to="/academy" className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                View syllabus
              </Link>
            </div>
          </article>
          </Piece>

          <Piece id="protocol" span>
          <article className="chunk px-4 py-4">
            <Corners />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Today’s protocol</p>
            <p className="mt-3 font-display text-lg uppercase leading-none">{rite.title}</p>
            <p className="mt-1 font-mono text-[11px] normal-case">{rite.when} · {rite.minutes}</p>
            <p className="mt-2 font-mono text-[11px] normal-case leading-relaxed">{rite.purpose}</p>
            <ul className="mt-3 space-y-1 font-mono text-[11px] uppercase tracking-[0.08em]">
              <li className="flex justify-between gap-3 border-t border-current/20 pt-1"><span>Wake</span><span>{schedule.wake}</span></li>
              <li className="flex justify-between gap-3 border-t border-current/20 pt-1"><span>Study</span><span>{schedule.study}</span></li>
              <li className="flex justify-between gap-3 border-t border-current/20 pt-1"><span>Rest</span><span>{schedule.bed}</span></li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/rite/$id" params={{ id: rite.id }} className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                Begin rite
              </Link>
              <Link to="/practice" className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                Reschedule
              </Link>
              <button type="button" onClick={() => logRite(rite.title)} className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                Mark complete
              </button>
            </div>
          </article>
          </Piece>

          <Piece id="reading" span>
          <article className="chunk px-4 py-4">
            <Corners />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Continue reading</p>
            {left ? (
              <p className="mt-3 font-display text-lg uppercase leading-none">
                {leftBook?.title ?? left[0]} · page {left[1] + 1}
              </p>
            ) : (
              <p className="mt-3 font-display text-lg uppercase leading-none">You have not opened a book yet</p>
            )}
            {nextBook?.read ? (
              <p className="mt-2 font-mono text-[11px] normal-case">Next · {nextBook.n ? `Volume ${nextBook.n} · ` : ""}{nextBook.subtitle}</p>
            ) : null}
            <div className="mt-4">
              <Link to="/read/$slug" params={{ slug: left ? left[0] : "welcome" }} className="inline-flex h-9 items-center border border-current px-3 text-[10px] uppercase tracking-[0.14em]">
                {left ? "Resume reading" : "Begin Welcome, Seeker"}
              </Link>
            </div>
          </article>
          </Piece>
          <Piece id="academy" span={open === "academy"}>
          <Tile
            id="academy"
            open={open}
            setOpen={setOpen}
            tone="bg-orange"
            icon="GraduationCap"
            title="The Academy"
            facts={
              course
                ? [`${course.id} · ${classPct}%`, course.title, started ? "Continue the class" : "Begin the first class"]
                : ["No class open", "The syllabus is waiting"]
            }
          >
            <div className="mt-3 border-2 border-black bg-[#d8d8d8] px-3 py-3">
              {course ? (
                <>
                  <p className="plate-type font-display text-xl uppercase leading-none text-orange">{course.title}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-orange/80">{course.id}</p>
                </>
              ) : (
                <p className="plate-type font-display text-xl uppercase leading-none text-orange">Your scholarship begins here</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {course ? (
                  <Link to="/academy/$code" params={{ code: course.id }} className="inline-flex h-10 items-center bg-orange px-4 text-[11px] uppercase tracking-wide text-ink">
                    {started ? "Continue class" : "Begin your first class"}
                  </Link>
                ) : null}
                <Link to="/academy" className="inline-flex h-10 items-center border border-orange px-4 text-[11px] uppercase tracking-wide text-orange">
                  View syllabus
                </Link>
              </div>
              <Meter done={classesDone} total={SCHOLARSHIP_SEQUENCE.length} label="Class count" />
              <p className="mt-2 font-mono text-[11px] normal-case text-orange/80">Class notes · {noteCount}</p>
              <Meter done={awakening.length} total={AWAKENING.length} label="Seven-day awakening" />
            </div>
          </Tile>
          </Piece>

          <Piece id="rites" span={open === "rites"}>
          <Tile
            id="rites"
            open={open}
            setOpen={setOpen}
            tone="bg-lime"
            icon="Moon"
            title="The Rites"
            square
            clock={<NextRiteClock schedule={schedule} />}
            facts={[rite.title, `${rite.when} · ${rite.minutes}`, `${ritesDone.length} of ${ritesTotal} kept`]}
          >
            <div className="dash-well mt-3 border-2 px-3 py-3 text-lime">
              <ul className="space-y-1 font-mono text-[12px] normal-case">
                <li>Alarm · Wake {schedule.wake}</li>
                <li>Alarm · Study {schedule.study}</li>
                <li>Alarm · Rest {schedule.bed}</li>
              </ul>
              <p className="mt-4 plate-type font-display text-xl uppercase leading-none">{rite.title}</p>
              <p className="mt-2 font-mono text-[12px] normal-case">{rite.when} · {rite.minutes}</p>
              <p className="mt-2 font-mono text-[12px] normal-case">{rite.purpose}</p>
              <Link to="/rite/$id" params={{ id: rite.id }} className="mt-4 inline-flex h-10 items-center bg-lime px-4 text-[11px] uppercase tracking-wide text-ink">
                Begin rite
              </Link>
              <Meter done={ritesDone.length} total={ritesTotal} label="Rites kept" />
            </div>
          </Tile>
          </Piece>

          <Piece id="study" span={open === "study"}>
          <Tile
            id="study"
            open={open}
            setOpen={setOpen}
            tone="bg-cyan"
            icon="Library"
            title="The Study"
            square
            clock={<UntilClock at={schedule.study} label="Until study" />}
            facts={
              left
                ? [leftBook?.title ?? left[0], `Page ${left[1] + 1}`, `${booksRead} of ${booksOpen} volumes marked`]
                : ["No book open", "Welcome, Seeker is waiting", `${circles.length} circles`]
            }
          >
            <div className="dash-well mt-3 border-2 px-3 py-3 text-cyan">
              {left ? (
                <p className="plate-type font-display text-xl uppercase leading-none">{leftBook?.title ?? left[0]}</p>
              ) : (
                <p className="plate-type font-display text-xl uppercase leading-none">You have not opened a book yet</p>
              )}
              {left ? <p className="mt-2 font-mono text-[12px] normal-case">Page {left[1] + 1}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {left ? (
                  <Link to="/read/$slug" params={{ slug: left[0] }} className="inline-flex h-10 items-center bg-cyan px-4 text-[11px] uppercase tracking-wide text-ink">
                    Resume reading
                  </Link>
                ) : (
                  <Link to="/read/$slug" params={{ slug: "welcome" }} className="inline-flex h-10 items-center bg-cyan px-4 text-[11px] uppercase tracking-wide text-ink">
                    Begin Welcome, Seeker
                  </Link>
                )}
              </div>
              {nextBook?.read ? (
                <p className="mt-4 font-mono text-[12px] normal-case">
                  Next · {nextBook.n ? `Volume ${nextBook.n} · ` : ""}
                  {nextBook.subtitle}
                </p>
              ) : null}
              <Meter done={booksRead} total={booksOpen} label="Volumes opened" />
              <p className="mt-4 text-[10px] uppercase tracking-[0.16em]">Study circles</p>
              {circles.length ? (
                <ul className="mt-2 space-y-2">
                  {circles.map((circle) => (
                    <li key={circle.id}>
                      <Link to="/nexus" search={{ circle: circle.id }} className="font-display uppercase">
                        {circle.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-mono text-[12px] normal-case">No circle is open yet.</p>
              )}
            </div>
          </Tile>
          </Piece>

          <Piece id="cos" span={open === "cos"}>
          <Tile
            id="cos"
            open={open}
            setOpen={setOpen}
            tone="bg-lilac"
            icon="Atom"
            title="The COS"
            square
            facts={
              leftBook
                ? ["Master book", leftBook.subtitle || leftBook.title, "Pick up the page you left"]
                : ["Master book", "The grid is online", "No page marked yet"]
            }
          >
            <div className="dash-well mt-3 border-2 px-3 py-3 text-lilac">
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed">{PRIMARY_COMMANDS}</pre>
              <Link to="/cos" className="mt-4 inline-flex h-10 items-center bg-lilac px-4 text-[11px] uppercase tracking-wide text-ink">
                Open the COS
              </Link>
            </div>
          </Tile>
          </Piece>

          <Piece id="codes" span={open === "codes"}>
          <Tile
            id="codes"
            open={open}
            setOpen={setOpen}
            tone="bg-lime"
            icon="Terminal"
            title="Divine <codes/>"
            square
            facts={["Prayer in. Code out.", terminal[terminal.length - 1] || "Ready", "Sent to the cosmOS"]}
          >
            <div className="dash-well mt-3 border-2 px-3 py-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendPrayer();
                }}
              >
                <input
                  value={prayer}
                  onChange={(event) => setPrayer(event.target.value)}
                  placeholder="Type a prayer"
                  className="h-9 w-full border border-lime/40 bg-black px-3 font-mono text-[12px] normal-case text-lime outline-none"
                />
                <button type="submit" className="mt-2 inline-flex h-8 items-center bg-lime px-3 text-[10px] uppercase tracking-wide text-ink">
                  Send
                </button>
              </form>
              <pre className="mt-3 flex h-28 flex-col justify-end overflow-hidden whitespace-pre-wrap border border-lime/30 bg-black p-2 font-mono text-[10px] leading-relaxed text-lime">
                {terminal.join("\n")}
              </pre>
              <Link to="/codes" className="mt-3 inline-flex text-[11px] uppercase tracking-wide text-lime underline">
                Open the compiler
              </Link>
            </div>
          </Tile>
          </Piece>

          <Piece id="nexus" span={open === "nexus"}>
          <Tile
            id="nexus"
            open={open}
            setOpen={setOpen}
            tone="bg-pink"
            icon="Share2"
            title="The Nexxus"
            facts={
              latest
                ? [latest.handle || "A member", latest.body.slice(0, 72), `${circles.length} circles open`]
                : ["The wall is quiet", "Yours can be the first line", `${circles.length} circles open`]
            }
          >
            <div className="dash-well mt-3 border-2 px-3 py-3 text-pink">
              <textarea
                value={signal}
                onChange={(e) => setSignal(e.target.value)}
                rows={3}
                placeholder="Say it to the congregation."
                className="w-full border border-pink/40 bg-black p-3 font-mono text-[12px] normal-case text-pink outline-none"
              />
              <button type="button" onClick={postSignal} className="mt-2 inline-flex h-10 items-center bg-pink px-4 text-[11px] uppercase tracking-wide text-ink">
                Post
              </button>
              <ul className="mt-5 space-y-3">
                {feed.slice(0, 3).map((post) => (
                  <li key={post.id} className="border-t border-pink/30 pt-3">
                    <p className="text-[10px] uppercase tracking-wide">{post.handle}</p>
                    <p className="mt-1 font-mono text-[12px] normal-case">{post.body}</p>
                  </li>
                ))}
                {!feed.length ? <li className="font-mono text-[12px] normal-case">The wall is quiet. Yours can be the first.</li> : null}
              </ul>
              <Link to="/nexus" className="mt-4 inline-flex text-[11px] uppercase tracking-wide underline">
                Open the Nexxus
              </Link>
            </div>
          </Tile>
          </Piece>

          <Piece id="give" span={open === "give"}>
          <Tile
            id="give"
            open={open}
            setOpen={setOpen}
            tone="bg-canary"
            icon="Rocket"
            title="Give"
            square
            facts={["Support the house", "$10 · $20 · $50", "Or name your own"]}
          >
            <div className="dash-well mt-3 border-2 px-3 py-3 text-canary">
              <div className="flex flex-wrap gap-2">
                {[10, 20, 50].map((amount) => (
                  <button key={amount} type="button" onClick={() => give(amount)} className="inline-flex h-10 items-center bg-canary px-4 text-[11px] uppercase tracking-wide text-ink">
                    ${amount}
                  </button>
                ))}
                <input
                  value={gift}
                  onChange={(e) => setGift(e.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  placeholder="$"
                  className="h-10 w-20 border border-canary/50 bg-black px-3 font-mono text-[12px] text-canary outline-none"
                />
                <button type="button" onClick={() => give(Number(gift))} className="inline-flex h-10 items-center border border-canary px-4 text-[11px] uppercase tracking-wide">
                  Give
                </button>
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.16em]">Mission house goal</p>
              <div className="mt-2 h-3 w-full bg-canary/20">
                <div className="h-full bg-canary" style={{ width: "5%" }} />
              </div>
              <p className="mt-2 font-mono text-[12px]">5%</p>
              <Link to="/housing" className="mt-3 inline-flex text-[11px] uppercase tracking-wide underline">
                The house
              </Link>
            </div>
          </Tile>
          </Piece>

          <Piece id="shop" span={open === "shop"}>
          <Tile
            id="shop"
            open={open}
            setOpen={setOpen}
            tone="bg-paper"
            icon="ShoppingBag"
            title="The Shop"
            square
            facts={[STICKERS[0]?.name ?? "Stickers", STICKERS[0] ? `$${STICKERS[0].price}` : "Open the shelf", "Three on the desk"]}
          >
            <div className="mt-3 grid grid-cols-3 gap-2">
              {STICKERS.slice(0, 3).map((sticker) => (
                <Link key={sticker.id} to="/shop" className="block">
                  <img src={sticker.art[0]} alt={sticker.name} className="aspect-square w-full bg-ink object-contain" />
                  <p className="mt-2 font-display text-sm uppercase">{sticker.name}</p>
                  <p className="font-mono text-[11px]">${sticker.price}</p>
                </Link>
              ))}
            </div>
          </Tile>
          </Piece>

          <Piece id="tx" span>
          <Tile
            id="tx"
            open={open}
            setOpen={setOpen}
            tone="bg-ink text-lime"
            icon="Radio"
            title="The Transmission"
            facts={["Chancellor Mønday", "Five minutes", "The desk is open"]}
          >
            <p className="mt-3 font-mono text-[11px] normal-case text-lime/80">Chancellor Mønday · 5 min · // node broadcast</p>
            <video controls poster="/monday-manifesto.jpg" className="mt-3 w-full bg-black" src="/monday-manifesto.mp4" />
          </Tile>
          </Piece>
        </div>
        </DeskMoveContext.Provider>
        <footer className="mx-auto mt-4 flex max-w-5xl items-center justify-between gap-3 border-t border-white/15 py-3 font-mono text-[9px] uppercase tracking-[0.14em]">
          <span className="text-lime">System: online</span>
          <span className="hidden text-paper/70 sm:inline">Run light. Terminate darkness. Stay online.</span>
          <span className="text-paper/50">Divine Molecule Temple</span>
        </footer>
      </section>
      <FirstTour where="desk" />
    </main>
  );
}
