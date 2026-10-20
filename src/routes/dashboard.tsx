import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Check, Flame, Hexagon, Home, Library, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CANONICAL_SEQUENCE, syllabusCourse } from "@/lib/syllabus";
import { degreeCourse } from "@/lib/degree-catalog";
import { PHASES, AWAKENING } from "@/lib/temple-content";
import { ensureMember, listClassNotes } from "@/lib/temple-data";
import { myLibrary, mySequences } from "@/lib/engine";
import { openBillingPortal, ownedClassCodes, startStripeCheckout } from "@/lib/stripe-temple";
import { daysActive, useTemple } from "@/lib/temple-store";
import { FirstTour } from "@/components/first-tour";
import { SignalComposer } from "@/components/nexus-board";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

const STAGES = ["Seeker", "Initiate", "Intermediary", "Elder"] as const;

const NAV = [
  { to: "/dashboard" as const, label: "Home", icon: Home },
  { to: "/academy" as const, label: "Academy", icon: BookOpen },
  { to: "/library" as const, label: "Library", icon: Library },
  { to: "/nexus" as const, label: "Nexus", icon: Hexagon },
  { to: "/ceremonies" as const, label: "Rituals", icon: Flame },
  { to: "/profile" as const, label: "Profile", icon: UserRound },
];

type Skin = "ink" | "day" | "lime";

const SKIN: Record<
  Skin,
  {
    page: string;
    rail: string;
    card: string;
    muted: string;
    accent: string;
    cta: string;
    navOn: string;
    ink: string;
    chart: string;
    wash: string;
  }
> = {
  ink: {
    page: "bg-[#070707] text-[#f3f0e6]",
    rail: "border-[#2c2c26] bg-[#0b0b0b]",
    card: "border border-[#3a3a32] bg-[#101010]",
    muted: "text-[#9c978c]",
    accent: "text-[#c6ff00]",
    cta: "bg-[#c6ff00] text-[#111]",
    navOn: "bg-[#c6ff00] text-[#111]",
    ink: "#c6ff00",
    chart: "#c6ff00",
    wash: "from-black/80",
  },
  day: {
    page: "bg-[#f4f1e6] text-[#1a1a16]",
    rail: "border-[#e0d8c4] bg-[#f7f4ea]",
    card: "border border-[#e4dcc8] bg-[#fbfaf4]",
    muted: "text-[#7a7468]",
    accent: "text-[#6d8f00]",
    cta: "bg-[#c6ff00] text-[#111]",
    navOn: "bg-[#c6ff00] text-[#111]",
    ink: "#6d8f00",
    chart: "#8fbf00",
    wash: "from-[#f4f1e6]/85",
  },
  lime: {
    page: "bg-[#d6ff3a] text-[#111]",
    rail: "border-[#111]/20 bg-[#d6ff3a]",
    card: "border border-[#111] bg-[#d6ff3a]",
    muted: "text-[#111]/70",
    accent: "text-[#111]",
    cta: "bg-[#111] text-[#d6ff3a]",
    navOn: "bg-[#111] text-[#d6ff3a]",
    ink: "#111",
    chart: "#111",
    wash: "from-[#d6ff3a]/80",
  },
};

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
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-micro tracking-[0.22em] text-lime">Synchronizing session…</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <Dashboard />;
}

function Dashboard() {
  const path = useTemple((s) => s.path);
  const read = useTemple((s) => s.read);
  const rites = useTemple((s) => s.rites);
  const joinedAt = useTemple((s) => s.joinedAt);
  const journal = useTemple((s) => s.journal);
  const classNotes = useTemple((s) => s.classNotes);
  const sealedDays = useTemple((s) => s.awakening);
  const awakening = Array.isArray(sealedDays) ? sealedDays : [];
  const lastClass = useTemple((s) => s.lastClass);
  const orientationDone = useTemple((s) => s.orientationDone);
  const role = useTemple((s) => s.role);
  const { user } = useCurrentUserState();
  const portrait = useTemple((s) => s.portrait) || user?.profileImageUrl || "/monday.jpg";
  const rank = path === "none" ? "seeker" : path;
  const [skin, setSkin] = useState<Skin>("ink");
  const [clock, setClock] = useState("");
  const [owned, setOwned] = useState<string[]>([]);
  const [billingError, setBillingError] = useState("");
  const [sequences, setSequences] = useState<{ slug: string; title: string; completed: number; total: number }[]>([]);
  const [kept, setKept] = useState<{ slug: string; title: string }[]>([]);
  const [serverNotes, setServerNotes] = useState<{ code: string; body: string }[]>([]);
  const tone = SKIN[skin];
  const paidGate = path === "initiate" || path === "patron";
  const phaseIndex = Math.min(
    PHASES.length - 1,
    path === "patron" ? 3 : path === "initiate" ? 1 : Math.floor(read.length / 4),
  );
  const stage = role === "chancellor" ? 3 : path === "patron" ? 2 : path === "initiate" ? 1 : Math.min(phaseIndex, 3);
  const nextCode = lastClass || "FM-101";
  const nextLesson = degreeCourse(nextCode);
  const next = syllabusCourse(nextCode);
  const nextTitle = next?.title ?? nextLesson?.course.title ?? "Introduction";
  const doneCount = CANONICAL_SEQUENCE.filter((c) => read.includes(c)).length;
  const coursePct = sequences[0]?.total
    ? Math.round((sequences[0].completed / sequences[0].total) * 100)
    : Math.round((doneCount / CANONICAL_SEQUENCE.length) * 100);
  const pathPct = Math.max(coursePct, Math.round((stage / (STAGES.length - 1)) * 100));
  const journalCount = journal.trim() ? journal.split(/\n+/).filter(Boolean).length : 0;
  const notes = noteList(classNotes, serverNotes);

  useEffect(() => {
    void listClassNotes()
      .then(setServerNotes)
      .catch(() => {});
    void mySequences()
      .then(setSequences)
      .catch(() => setSequences([]));
    void myLibrary()
      .then((lib) => {
        const seen = new Set<string>();
        const rows = [...lib.recent, ...lib.saved].filter((row) => {
          if (seen.has(row.slug)) return false;
          seen.add(row.slug);
          return true;
        });
        setKept(rows.slice(0, 4).map((row) => ({ slug: row.slug, title: row.title })));
      })
      .catch(() => setKept([]));
  }, []);

  useEffect(() => {
    if (paidGate) return;
    void ownedClassCodes().then(setOwned).catch(() => {});
  }, [paidGate]);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const protocol = [
    { n: "01", label: "Ground", done: orientationDone },
    { n: "02", label: "Study", done: read.length > 0 },
    { n: "03", label: "Integrate", done: rites.length > 0 },
  ];
  const awakeningDone = AWAKENING.filter((day) => awakening.includes(day.id)).length;
  const awakeningPct = Math.round((awakeningDone / AWAKENING.length) * 100);

  return (
    <main className={cn("relative min-h-[70dvh]", tone.page)}>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.18]"
        style={{ backgroundImage: "url(/desk-board.jpg)" }}
      />
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent", tone.wash)} />
      <div className="relative lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className={cn("hidden border-r px-4 py-6 lg:flex lg:flex-col", tone.rail)}>
          <img src="/flame-gold.webp" alt="" className="h-14 w-14 object-contain" />
          <p className="mt-4 font-sans text-[15px] font-semibold leading-tight tracking-wide">
            Divine
            <br />
            Molecule
            <br />
            Temple
          </p>
          <p className={cn("mt-3 text-[9px] leading-relaxed tracking-[0.14em]", tone.muted)}>
            Sacred science.
            <br />
            Higher consciousness.
            <br />
            Service to all.
          </p>
          <nav className="mt-8 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = item.to === "/dashboard";
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.16em]",
                    on ? tone.navOn : tone.muted,
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className={cn("mt-auto flex items-center gap-2 pt-10 text-[10px] tracking-[0.16em]", tone.accent)}>
            <span className="size-2 rounded-full bg-current" />
            System: active
          </p>
        </aside>

        <div className="px-3 py-4 sm:px-5 sm:py-6">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-sans text-[15px] font-semibold tracking-[0.18em] sm:text-lg">Welcome back, {rank}</h1>
              <p className={cn("mt-1 text-[10px] tracking-[0.18em]", tone.muted)}>
                Clearance // <span className={tone.accent}>Member</span>
                {role === "chancellor" ? (
                  <Link to="/chancellor" className="ml-3 underline">
                    Office
                  </Link>
                ) : null}
                {paidGate ? (
                  <button
                    type="button"
                    className="ml-3 underline"
                    onClick={() => {
                      setBillingError("");
                      void openBillingPortal({ data: window.location.origin })
                        .then((session) => window.location.assign(session.url))
                        .catch((error: Error) => setBillingError(error.message || "The portal did not open"));
                    }}
                  >
                    Billing
                  </button>
                ) : null}
              </p>
              {billingError ? <p className="mt-1 text-[10px] text-orange">{billingError}</p> : null}
              <div className="mt-4 max-w-xl">
                <div className={cn("mb-1 flex items-center justify-between text-[10px] tracking-[0.16em]", tone.muted)}>
                  <span>Progress</span>
                  <span>{coursePct}%</span>
                </div>
                <div
                  className="h-2 w-full bg-current/10"
                  role="progressbar"
                  aria-valuenow={coursePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Course progress"
                >
                  <div className="h-full" style={{ width: `${coursePct}%`, background: tone.chart }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden border border-current/20">
                {(["ink", "day", "lime"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`${id} desk`}
                    onClick={() => setSkin(id)}
                    className={cn("size-6", id === "ink" && "bg-[#111]", id === "day" && "bg-[#f4f1e6]", id === "lime" && "bg-[#d6ff3a]", skin === id && "ring-1 ring-inset ring-current")}
                  />
                ))}
              </div>
              <Link
                to="/profile"
                aria-label="Open profile"
                className={cn("grid size-11 place-items-center overflow-hidden rounded-full border", tone.card)}
              >
                <img src={portrait} alt="" className="size-full object-cover" />
              </Link>
            </div>
          </header>

          <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
            <article className={cn("p-4 sm:p-5", tone.card)}>
              <div className="flex items-start justify-between">
                <p className={cn("text-[10px] tracking-[0.18em]", tone.muted)}>Current path</p>
                <Hexagon className={cn("size-5", tone.muted)} strokeWidth={1.25} />
              </div>
              <h2 className="mt-3 max-w-md font-sans text-[1.7rem] font-semibold leading-[0.95] tracking-tight sm:text-4xl">
                Scholarship of the Enlightened
              </h2>
              <PathChart stage={stage} color={tone.chart} />
              <div className="mt-2 flex items-end justify-between text-[10px] tracking-[0.14em]">
                <p className={tone.muted}>
                  Stage {stage + 1} of 4 // <span className={tone.accent}>{STAGES[stage]}</span>
                </p>
                <p className={tone.muted}>{pathPct}% complete</p>
              </div>
            </article>

            <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
              <Stat card={tone.card} muted={tone.muted} accent={tone.accent} k="Course progress" v={`${coursePct}%`} note="Overall completion" />
              <Stat card={tone.card} muted={tone.muted} accent={tone.accent} k="Library" v={String(kept.length).padStart(2, "0")} note="Texts unlocked" />
              <Stat card={tone.card} muted={tone.muted} accent={tone.accent} k="Journal" v={String(journalCount).padStart(2, "0")} note="Entries recorded" />
            </div>
          </div>

          <article className={cn("mt-3 p-4 sm:p-5", tone.card)}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.16em]">Continue study</p>
              <Link to="/academy" className={tone.muted} aria-label="Academy">
                ›
              </Link>
            </div>
            <p className={cn("mt-3 text-[10px] tracking-[0.16em]", tone.muted)}>
              {paidGate ? "Academy · Full access" : "Seeker · Free path"}
            </p>
            <p className="mt-1 font-sans text-lg font-semibold leading-tight tracking-wide sm:text-xl">
              {nextCode} // {nextTitle}
            </p>
            <div className="mt-3 h-2 w-full bg-current/10">
              <div className="h-full" style={{ width: `${Math.max(coursePct, 8)}%`, background: tone.chart }} />
            </div>
            <div className="mt-1 text-right text-[10px] tracking-wide">{coursePct}%</div>
            {!paidGate ? (
              <p className={cn("mt-2 text-[10px] tracking-[0.12em]", tone.accent)}>
                The Academy is $33 a month and opens every class. Four single classes cost more.
              </p>
            ) : null}
            {paidGate || next?.free || owned.some((code) => code.toUpperCase() === nextCode.toUpperCase()) ? (
              <div className="mt-3 grid gap-2">
                <a href={`/academy/${nextCode}`} className={cn("flex h-9 items-center justify-center gap-2 px-2 text-center text-[10px] leading-tight tracking-[0.08em]", paidGate ? tone.cta : "border border-current")}>
                  Continue <span aria-hidden>›</span>
                </a>
                {!paidGate ? (
                  <button
                    type="button"
                    className={cn("h-9 px-2 text-[10px] leading-tight tracking-[0.08em]", tone.cta)}
                    onClick={() => {
                      void startStripeCheckout({
                        data: { kind: "membership", tier: "initiate", label: "Academy", origin: window.location.origin },
                      })
                        .then((r) => {
                          window.location.href = r.url;
                        })
                        .catch(() => {
                          window.location.href = "/gates";
                        });
                    }}
                  >
                    Academy · $33/mo
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn("h-9 px-2 text-[10px] leading-tight tracking-[0.08em]", tone.cta)}
                  onClick={() => {
                    void startStripeCheckout({
                      data: { kind: "membership", tier: "initiate", label: "Academy", origin: window.location.origin },
                    })
                      .then((r) => {
                        window.location.href = r.url;
                      })
                      .catch(() => {
                        window.location.href = "/gates";
                      });
                  }}
                >
                  Academy · $33/mo
                </button>
                <button
                  type="button"
                  className="h-9 border border-current px-2 text-[10px] leading-tight tracking-[0.08em]"
                  onClick={() => {
                    void startStripeCheckout({
                      data: { kind: "elective", amount: 10, code: nextCode, label: `${nextCode} ${nextTitle}`, origin: window.location.origin },
                    })
                      .then((r) => {
                        window.location.href = r.url;
                      })
                      .catch(() => {
                        window.location.href = "/academy";
                      });
                  }}
                >
                  This class · $10
                </button>
              </div>
            )}
            <p className={cn("mt-3 text-[10px] tracking-[0.12em]", tone.muted)}>
              Congregation: ten quiet minutes a day, then one true sentence in the <Link to="/nexus" className="underline">Nexus</Link>.
            </p>
          </article>

          <article className="desk-night mt-3 border border-lime/30 p-4 text-paper">
            <SignalComposer compact />
          </article>

          <article className={cn("mt-3 p-4 sm:p-5", tone.card)}>
            <p className="text-[11px] tracking-[0.16em]">Class notes</p>
            {notes.length === 0 ? (
              <p className={cn("mt-3 text-[12px]", tone.muted)}>Nothing kept yet. Open a class and write under Class notes.</p>
            ) : (
              <ul className="mt-3 divide-y divide-current/10">
                {notes.map((row) => (
                  <li key={row.code} className="py-3">
                    <Link to="/academy/$code" params={{ code: row.code }} className="text-[11px] tracking-[0.14em]">
                      {row.code}
                      <span className={cn("ml-2", tone.muted)}>{row.title}</span>
                    </Link>
                    <p className="mt-1 whitespace-pre-wrap font-mono text-[12px] normal-case leading-relaxed">{row.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={cn("mt-3 p-4 sm:p-5", tone.card)}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.16em]">Awakening</p>
              <Link to="/awakening" className={cn("text-[10px] tracking-[0.14em]", tone.muted)}>
                {awakeningDone} / 7
              </Link>
            </div>
            <div className="mt-3 h-2 w-full bg-current/10">
              <div className="h-full" style={{ width: `${awakeningPct}%`, background: tone.chart }} />
            </div>
            <ul className="mt-3 divide-y divide-current/10">
              {AWAKENING.map((day) => {
                const done = awakening.includes(day.id);
                return (
                  <li key={day.id} className="flex items-center justify-between py-2.5 text-[12px] tracking-[0.12em]">
                    <span>
                      Day {day.day} · {day.title}
                    </span>
                    <span className={cn("text-[10px]", done ? tone.accent : tone.muted)}>{done ? "Done" : "Open"}</span>
                  </li>
                );
              })}
            </ul>
          </article>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <article className={cn("p-4", tone.card)}>
              <div className="flex items-center justify-between text-[10px] tracking-[0.14em]">
                <p className="flex items-center gap-2">
                  <Hexagon className="size-3.5" /> Nexus signal
                </p>
                <p className={tone.muted}>Private by default</p>
              </div>
              <Wave color={tone.chart} />
              <div className="mt-2 flex items-center justify-between text-[10px] tracking-[0.14em]">
                <p className={tone.muted}>
                  Signal strength: <span className={tone.accent}>Stable</span>
                </p>
                <p className="flex items-center gap-1">
                  Live <span className="size-2 rounded-full" style={{ background: tone.chart }} />
                </p>
              </div>
            </article>

            <article className={cn("p-4", tone.card)}>
              <p className="flex items-center gap-2 text-[10px] tracking-[0.14em]">
                <span className="size-3 rounded-full border border-current" /> Today's protocol
              </p>
              <ul className="mt-3 divide-y divide-current/10">
                {protocol.map((step) => (
                  <li key={step.n} className="flex items-center justify-between py-2.5 text-[12px] tracking-[0.12em]">
                    <span className="flex items-center gap-2">
                      <span className={cn("grid size-4 place-items-center border", step.done ? tone.cta : "border-current/40")}>
                        {step.done ? <Check className="size-3" /> : null}
                      </span>
                      {step.n} {step.label}
                    </span>
                    <span className={cn("text-[10px]", step.done ? tone.accent : tone.muted)}>{step.done ? "Complete" : "Pending"}</span>
                  </li>
                ))}
              </ul>
              <p className={cn("mt-2 text-[10px] tracking-[0.14em]", tone.muted)}>
                Protocol status: <span className={tone.accent}>{protocol.every((s) => s.done) ? "Sealed" : "In progress"}</span>
              </p>
            </article>

            <article className={cn("p-4", tone.card)}>
              <div className="flex items-center justify-between text-[10px] tracking-[0.14em]">
                <p>Recent library</p>
                <Link to="/library" className={tone.muted}>
                  View all
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-current/10">
                {(kept.length ? kept : [{ slug: "", title: "No texts kept yet" }]).map((item) => (
                  <li key={item.slug || item.title} className="flex items-center justify-between gap-3 py-2.5 text-[11px] leading-tight tracking-[0.06em]">
                    {item.slug ? (
                      <Link to="/archive/$slug" params={{ slug: item.slug }} className="min-w-0">
                        {item.title}
                      </Link>
                    ) : (
                      <span className={tone.muted}>{item.title}</span>
                    )}
                    <span className={tone.muted}>›</span>
                  </li>
                ))}
              </ul>
              {kept.length ? (
                <p className={cn("mt-2 text-[10px] tracking-[0.14em]", tone.accent)}>{kept.length} on the desk</p>
              ) : null}
            </article>
          </div>

          <footer className={cn("mt-3 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between", tone.card)}>
            <div className="flex items-center gap-4">
              <img src="/hex-seal.webp" alt="" className="size-14 object-contain" />
              <p className="font-sans text-sm font-semibold leading-tight tracking-[0.12em] sm:text-base">
                Run light.
                <br />
                Terminate darkness.
                <br />
                Stay online.
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[10px] tracking-[0.14em]">
              <dt className={tone.muted}>Server time:</dt>
              <dd>{clock || "—"} UTC</dd>
              <dt className={tone.muted}>Grid:</dt>
              <dd>DMT-Prime</dd>
              <dt className={tone.muted}>Node:</dt>
              <dd className={tone.accent}>Online · {daysActive(joinedAt)} days</dd>
            </dl>
          </footer>
        </div>
      </div>
      <FirstTour where="desk" />
    </main>
  );
}

function Stat({ card, muted, accent, k, v, note }: { card: string; muted: string; accent: string; k: string; v: string; note: string }) {
  return (
    <article className={cn("p-3 sm:p-4", card)}>
      <p className={cn("text-[9px] tracking-[0.14em] sm:text-[10px]", muted)}>{k}</p>
      <p className={cn("mt-2 font-sans text-3xl font-semibold leading-none sm:text-4xl", accent)}>{v}</p>
      <p className={cn("mt-2 text-[9px] tracking-[0.12em]", muted)}>{note}</p>
    </article>
  );
}

function noteList(
  local: Record<string, { body?: string }[] | undefined> | undefined,
  server: { code: string; body: string }[],
) {
  const map = new Map<string, string>();
  for (const [code, list] of Object.entries(local ?? {})) {
    const body = list?.[0]?.body?.trim() ?? "";
    if (body) map.set(code.toUpperCase(), body);
  }
  for (const row of server) {
    const body = row.body.trim();
    if (body) map.set(row.code.toUpperCase(), body);
  }
  return [...map.entries()].map(([code, body]) => ({
    code,
    title: syllabusCourse(code)?.title ?? "",
    body,
  }));
}

function PathChart({ stage, color }: { stage: number; color: string }) {
  const pts = [
    [28, 108],
    [118, 78],
    [210, 52],
    [300, 22],
  ];
  const line = pts
    .slice(0, stage + 1)
    .map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`)
    .join(" ");
  const area = `${line} L${pts[stage][0]} 128 L${pts[0][0]} 128 Z`;
  return (
    <div className="mt-4">
      <svg viewBox="0 0 330 140" className="h-36 w-full" role="img" aria-label="Path from seeker to elder">
        <path d={area} fill={color} opacity="0.18" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" />
        {pts.map((p, i) => (
          <g key={STAGES[i]}>
            <circle cx={p[0]} cy={p[1]} r={i === stage ? 6 : 4} fill={i <= stage ? color : "transparent"} stroke={color} strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-4 text-center text-[8px] tracking-[0.12em] sm:text-[10px]">
        {STAGES.map((label, i) => (
          <span key={label} style={{ color: i === stage ? color : undefined }} className={i === stage ? "" : "opacity-60"}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Wave({ color }: { color: string }) {
  const bars = [8, 14, 10, 22, 16, 28, 12, 34, 18, 42, 20, 16, 30, 12, 24, 10, 18, 8];
  return (
    <svg viewBox="0 0 220 70" className="mt-4 h-16 w-full" aria-hidden>
      {bars.map((h, i) => (
        <rect key={i} x={8 + i * 12} y={58 - h} width="3" height={h} fill={i > 11 ? color : "currentColor"} opacity={i > 11 ? 1 : 0.35} />
      ))}
    </svg>
  );
}
