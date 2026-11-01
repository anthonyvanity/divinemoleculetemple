import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlameCard } from "@/components/flame-card";
import { NoticeBell } from "@/components/notice-bell";
import { SignalComposer } from "@/components/nexus-board";
import { logDailyRitual, saveDesk, type DeskSchedule } from "@/lib/temple-data";
import { CANONICAL_SEQUENCE, classUnlocked, syllabusCourse } from "@/lib/syllabus";
import { useTemple } from "@/lib/temple-store";
import { ownedClassCodes, openBillingPortal } from "@/lib/stripe-temple";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const ROOMS = [
  { to: "/sanctuary" as const, kicker: "The Sanctuary", line: "Your prayers. Rites. Daily practice." },
  { to: "/my-classes" as const, kicker: "The Academy", line: "Your classes. Your curriculum. Your progress." },
  { to: "/library" as const, kicker: "The Study", line: "Books. Divine codes. Your library." },
  { to: "/nexus" as const, kicker: "The Nexxus", line: "Your congregation. Your conversations." },
  { to: "/works" as const, kicker: "The Mission", line: "Service. Community. Real-world impact." },
  { to: "/shop" as const, kicker: "The Shop", line: "Books. Merchandise. Temple supplies." },
  { to: "/altar" as const, kicker: "Donate", line: "Support the Temple's mission." },
];

const PRACTICES = [
  {
    id: "morning" as const,
    n: "01",
    name: "Morning Seal",
    minutes: 5,
    purpose: "Grounding, prayer, and intention.",
    text: "Light a candle, or see one. Name what was signal. Name what was noise. Leave the flame on.",
  },
  {
    id: "study" as const,
    n: "02",
    name: "Daily Scholarship",
    minutes: 15,
    purpose: "Continue your education.",
    text: "Open the class where you stopped. Read one block. Do not skip ahead to feel finished.",
  },
  {
    id: "evening" as const,
    n: "03",
    name: "Evening Closure",
    minutes: 7,
    purpose: "Reflection and prayer.",
    text: "Read the day back once. Write one unedited line. Close the lamp.",
  },
];

type CanonRow = { slug: string; title: string; pages: number };

function dayKey(zone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function clockIn(zone: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
}

function memberName(display: string | null | undefined, handle: string) {
  const raw = (display ?? "").trim();
  if (raw && !raw.includes("@")) return raw;
  const named = handle.replaceAll("_", " ").trim();
  return named || "Seeker";
}

function ics(schedule: DeskSchedule) {
  const stamp = (hhmm: string, plus: number) => {
    const [h, m] = hhmm.split(":").map((n) => Number(n) || 0);
    const total = h * 60 + m + plus;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return `20260101T${hh}${mm}00`;
  };
  const events = PRACTICES.map((rite) => {
    const start = rite.id === "morning" ? schedule.wake : rite.id === "study" ? schedule.study : schedule.bed;
    return [
      "BEGIN:VEVENT",
      `UID:${rite.id}@divinemoleculetemple.com`,
      `DTSTART:${stamp(start, 0)}`,
      `DTEND:${stamp(start, rite.minutes)}`,
      "RRULE:FREQ=DAILY",
      `SUMMARY:${rite.name}`,
      `DESCRIPTION:${rite.text}`,
      "END:VEVENT",
    ].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Divine Molecule Temple//Desk//EN", ...events, "END:VCALENDAR"].join("\r\n");
}

export function DeskCommand() {
  const path = useTemple((s) => s.path);
  const handle = useTemple((s) => s.handle);
  const read = useTemple((s) => s.read);
  const lastClass = useTemple((s) => s.lastClass);
  const paid = useTemple((s) => s.paid);
  const role = useTemple((s) => s.role);
  const schedule = useTemple((s) => s.deskSchedule);
  const practice = useTemple((s) => s.deskPractice);
  const setDeskSchedule = useTemple((s) => s.setDeskSchedule);
  const setDeskPractice = useTemple((s) => s.setDeskPractice);
  const notices = useTemple((s) => s.notices);
  const logRite = useTemple((s) => s.logRite);
  const bookmarks = useTemple((s) => s.bookmarks);
  const { user } = useCurrentUserState();
  const [owned, setOwned] = useState<string[]>([]);
  const [clock, setClock] = useState("");
  const [openRite, setOpenRite] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(schedule);
  const [canon, setCanon] = useState<CanonRow[]>([]);
  const [chapter, setChapter] = useState("");
  const [billingError, setBillingError] = useState("");

  const zone = schedule.zone || "UTC";
  const today = dayKey(zone);
  const doneToday = practice[today] ?? {};
  const finished = (read ?? []).filter((id) => CANONICAL_SEQUENCE.includes(id));
  const resume =
    lastClass && !finished.includes(lastClass)
      ? lastClass
      : (CANONICAL_SEQUENCE.find((id) => !finished.includes(id)) ?? "");
  const course = resume ? syllabusCourse(resume) : null;
  const started = finished.length > 0 || Boolean(lastClass);
  const lessonNo = resume ? CANONICAL_SEQUENCE.indexOf(resume) + 1 : 0;
  const pct = CANONICAL_SEQUENCE.length ? Math.round((finished.length / CANONICAL_SEQUENCE.length) * 100) : 0;
  const unlocked = resume ? classUnlocked(resume, paid, owned) : false;
  const name = memberName(user?.displayName, handle);
  const clearance = path === "none" ? "SEEKER" : path.toUpperCase();
  const level = clearance === "SEEKER" ? "Seeker" : clearance === "INITIATE" ? "Initiate" : clearance === "PATRON" ? "Patron" : clearance;
  const activity = notices.filter((n) => !n.read && (n.kind === "wall" || n.kind === "circle"));
  const mark = Object.entries(bookmarks ?? {}).sort((a, b) => b[1] - a[1])[0];
  const book = mark ? canon.find((row) => row.slug === mark[0]) : undefined;
  const fresh = !started && !schedule.setupSkipped;

  useEffect(() => {
    if (paid) return;
    void ownedClassCodes().then(setOwned).catch(() => {});
  }, [paid]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void fetch("/canon/index.json")
      .then((res) => (res.ok ? (res.json() as Promise<CanonRow[]>) : []))
      .then(setCanon)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mark) return;
    void fetch(`/canon/${mark[0]}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc: { pages?: { title: string }[] } | null) => {
        const title = doc?.pages?.[mark[1]]?.title ?? "";
        setChapter(title);
      })
      .catch(() => {});
  }, [mark?.[0], mark?.[1]]);

  useEffect(() => {
    if (!schedule.reminders) return;
    const fire = () => {
      const now = clockIn(zone);
      const map: Record<string, string> = { morning: schedule.wake, study: schedule.study, evening: schedule.bed };
      for (const rite of PRACTICES) {
        if (map[rite.id] !== now) continue;
        if (doneToday[rite.id]) continue;
        useTemple.getState().pushNotice({
          id: `rite:${today}:${rite.id}`,
          kind: "rite",
          title: rite.name,
          body: `${rite.minutes} minutes. ${rite.purpose}`,
          href: "/dashboard",
          at: new Date().toISOString(),
        });
      }
    };
    fire();
    const id = window.setInterval(fire, 30000);
    return () => window.clearInterval(id);
  }, [schedule.reminders, schedule.wake, schedule.study, schedule.bed, zone, today, doneToday.morning, doneToday.study, doneToday.evening]);

  function saveSchedule(next: DeskSchedule, remindersTouched = false) {
    setDeskSchedule(next);
    void saveDesk({ data: { schedule: next } }).catch(() => {});
    if (remindersTouched && next.reminders && typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => {});
    }
  }

  function complete(id: "morning" | "study" | "evening", title: string, minutes: number) {
    const next = { ...practice, [today]: { ...doneToday, [id]: true } };
    setDeskPractice(next);
    logRite(title);
    void saveDesk({ data: { practice: next } }).catch(() => {});
    void logDailyRitual({ data: { ritual: title, duration_min: minutes, notes: "Confirmed on the desk." } }).catch(() => {});
    setOpenRite(null);
  }

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/desk-eye.jpg" alt="" className="hidden size-12 shrink-0 object-contain sm:block" />
          <div className="min-w-0">
            <h1 className="truncate font-sans text-sm font-semibold uppercase tracking-[0.16em] sm:text-base">Welcome back, {name}</h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#9c978c]">
              Member // Clearance: <span className="text-[#c6ff00]">{clearance}</span>
              {role === "chancellor" ? (
                <Link to="/chancellor" className="ml-3 underline">
                  Office
                </Link>
              ) : null}
              {paid ? (
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
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#9c978c]">
          <Link to="/library" aria-label="Search the study" className="hover:text-[#c6ff00]">
            ⌕
          </Link>
          <NoticeBell />
        </div>
      </header>

      {fresh ? (
        <section className="mt-4 border border-[#c6ff00]/40 bg-[#101014] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#c6ff00]">Welcome to your Temple</p>
          <h2 className="mt-1 font-sans text-xl font-semibold uppercase tracking-[0.06em]">Three steps to begin</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Step n="01" title="Explore your sanctuary" to="/sanctuary" cta="Discover the sanctuary" />
            <button type="button" onClick={() => setEditing(true)} className="border border-white/10 p-3 text-left">
              <p className="text-[10px] text-[#c6ff00]">02</p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.12em]">Set your daily practice</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#c6ff00]">Build my schedule</p>
            </button>
            <Step n="03" title="Begin your scholarship" to="/academy/FM-101" cta="Start my first class" />
          </div>
          <Link to="/orientation" className="mt-3 inline-flex text-[10px] uppercase tracking-[0.14em] text-[#c6ff00]">
            Begin orientation
          </Link>
        </section>
      ) : null}

      <FlameCard />

      <section id="scholarship" className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
        <article className="border border-white/10 bg-[#101014] p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9c978c]">{started ? "Continue your scholarship" : "Your scholarship begins here"}</p>
          {started && course ? (
            <>
              <h2 className="mt-2 font-sans text-2xl font-semibold uppercase leading-tight tracking-[0.04em]">
                {resume} // {course.title}
              </h2>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#c6ff00]">
                Next: {lessonNo} — {course.title}
              </p>
              <p className="mt-3 font-sans text-3xl font-semibold text-[#c6ff00]">{pct}% complete</p>
              <div className="mt-2 h-1.5 w-full bg-white/10">
                <div className="h-full bg-[#c6ff00]" style={{ width: `${pct}%` }} />
              </div>
            </>
          ) : (
            <h2 className="mt-2 font-sans text-2xl font-semibold uppercase leading-tight">The first class is FM-101.</h2>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {started && course && unlocked ? (
              <Link to="/academy/$code" params={{ code: resume }} className="bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
                Continue class
              </Link>
            ) : started && course && !unlocked ? (
              <Link to="/ascend" className="bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
                Ascend to unlock
              </Link>
            ) : (
              <Link to="/academy/$code" params={{ code: "FM-101" }} className="bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
                Begin your first class
              </Link>
            )}
            <Link to="/academy" className="border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
              View syllabus
            </Link>
          </div>
        </article>
        <article className="relative min-h-[140px] overflow-hidden border border-white/10 bg-black">
          <img src="/crest-wide.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <p className="relative p-4 font-sans text-lg font-semibold uppercase leading-[0.95] tracking-[0.04em]">
            Run light.
            <br />
            Terminate darkness.
            <br />
            Stay online.
          </p>
        </article>
      </section>

      <section id="practice" className="mt-3 border border-white/10 bg-[#101014] p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em]">Your daily practice</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9c978c]">{zone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]" onClick={() => {
              const zone = schedule.zone === "UTC" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : schedule.zone;
              setDraft({ ...schedule, zone });
              setEditing((v) => !v);
            }}>
              {editing ? "Close schedule" : "Build my schedule"}
            </button>
            <button
              type="button"
              className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]"
              onClick={() => {
                const file = new Blob([ics(schedule)], { type: "text/calendar" });
                const url = URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = "temple-practice.ics";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Add to calendar
            </button>
            <button
              type="button"
              className={cn("px-2 py-1 text-[10px] uppercase tracking-[0.12em]", schedule.reminders ? "bg-[#c6ff00] text-[#111]" : "border border-white/20")}
              onClick={() => saveSchedule({ ...schedule, reminders: !schedule.reminders }, true)}
            >
              {schedule.reminders ? "Reminders on" : "Set daily reminder"}
            </button>
          </div>
        </div>
        {editing ? (
          <form
            className="mt-3 grid gap-2 sm:grid-cols-5"
            onSubmit={(event) => {
              event.preventDefault();
              saveSchedule({ ...draft, setupSkipped: true });
              setEditing(false);
            }}
          >
            {(
              [
                ["wake", "Waking"],
                ["work", "Work"],
                ["study", "Study"],
                ["bed", "Bed"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-[10px] uppercase tracking-[0.12em] text-[#9c978c]">
                {label}
                <input
                  type="time"
                  value={draft[key]}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                  className="mt-1 block w-full border border-white/15 bg-black px-2 py-1 text-[#f3f0e6]"
                />
              </label>
            ))}
            <label className="text-[10px] uppercase tracking-[0.12em] text-[#9c978c]">
              Zone
              <input
                value={draft.zone}
                onChange={(event) => setDraft({ ...draft, zone: event.target.value })}
                className="mt-1 block w-full border border-white/15 bg-black px-2 py-1 text-[#f3f0e6]"
              />
            </label>
            <button type="submit" className="sm:col-span-5 mt-1 bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
              Save this schedule
            </button>
          </form>
        ) : null}
        <ul className="mt-3 divide-y divide-white/10">
          {PRACTICES.map((rite) => {
            const when = rite.id === "morning" ? schedule.wake : rite.id === "study" ? schedule.study : schedule.bed;
            const sealed = Boolean(doneToday[rite.id]);
            return (
              <li key={rite.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.12em]">
                      {rite.n} // {rite.name}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9c978c]">
                      {when} · {rite.minutes} minutes // {rite.purpose}
                    </p>
                  </div>
                  <span className={sealed ? "text-[10px] uppercase text-[#c6ff00]" : "text-[10px] uppercase text-[#9c978c]"}>{sealed ? "Complete" : "Open"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {rite.id === "study" && resume && unlocked ? (
                    <Link to="/academy/$code" params={{ code: resume }} className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                      Continue class
                    </Link>
                  ) : rite.id === "morning" ? (
                    <Link to="/rite/$id" params={{ id: "morning-seal" }} className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                      Begin rite
                    </Link>
                  ) : rite.id === "evening" ? (
                    <Link to="/rite/$id" params={{ id: "evening-closure" }} className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                      Begin rite
                    </Link>
                  ) : (
                    <button type="button" className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]" onClick={() => setOpenRite(openRite === rite.id ? null : rite.id)}>
                      Begin rite
                    </button>
                  )}
                  <button type="button" className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]" onClick={() => setEditing(true)}>
                    Reschedule
                  </button>
                  {!sealed ? (
                    <button type="button" className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]" onClick={() => complete(rite.id, rite.name, rite.minutes)}>
                      Mark complete
                    </button>
                  ) : null}
                </div>
                {openRite === rite.id ? (
                  <div className="mt-3 border border-white/10 p-3">
                    <p className="font-mono text-[12px] normal-case leading-relaxed text-[#f3f0e6]">{rite.text}</p>
                    {!sealed ? (
                      <button type="button" className="mt-3 bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]" onClick={() => complete(rite.id, rite.name, rite.minutes)}>
                        I completed this
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-2">
        <article className="border border-white/10 bg-[#101014] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9c978c]">Pick up where you left off</p>
          {book && mark ? (
            <>
              <h2 className="mt-2 font-sans text-xl font-semibold uppercase leading-tight">{book.title}</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#c6ff00]">{chapter || `Leaf ${mark[1] + 1}`}</p>
              <Link to="/read/$slug" params={{ slug: mark[0] }} className="mt-4 inline-flex bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
                Continue reading
              </Link>
            </>
          ) : (
            <>
              <h2 className="mt-2 font-sans text-xl font-semibold uppercase">Your library is waiting.</h2>
              <Link to="/read/$slug" params={{ slug: "cos-original" }} className="mt-4 inline-flex bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
                Read the COS
              </Link>
              {!paid ? (
                <Link to="/nexus" className="mt-4 ml-2 inline-flex border border-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#c6ff00]">
                  Enter the Nexxus
                </Link>
              ) : null}
            </>
          )}
        </article>
        <article className="border border-white/10 bg-[#101014] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9c978c]">Your congregation</p>
          {activity.length ? (
            <ul className="mt-2 space-y-2">
              {activity.slice(0, 3).map((note) => (
                <li key={note.id}>
                  <a href={note.href} className="block text-[12px] leading-snug">
                    <span className="uppercase tracking-[0.12em] text-[#c6ff00]">{note.title}</span>
                    <span className="mt-1 block text-[#9c978c]">{note.body}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12px] uppercase tracking-[0.08em]">All caught up. Your congregation is still here.</p>
          )}
          <Link to="/nexus" className="mt-3 inline-flex bg-[#c6ff00] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#111]">
            Enter the Nexxus
          </Link>
          <div className="mt-4 border-t border-white/10 pt-3">
            <SignalComposer compact />
          </div>
        </article>
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROOMS.map((room) => (
          <Link key={room.kicker} to={room.to} className="block border border-white/10 bg-[#101014] p-4 hover:border-[#c6ff00]/50">
            <p className="text-[12px] uppercase tracking-[0.16em]">{room.kicker}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#9c978c]">{room.line}</p>
            <p className="mt-4 text-right text-[#9c978c]">›</p>
          </Link>
        ))}
        <article className="border border-white/10 bg-[#101014] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9c978c]">Your path of ascension</p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.12em]">Current level: {level}</p>
          <Link to="/gates" className="mt-4 inline-flex border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            Explore ascension
          </Link>
        </article>
      </div>

      <footer className="mt-3 flex flex-col gap-3 border border-white/10 bg-[#101014] px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#9c978c] sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-[#c6ff00]">
          <span className="size-1.5 rounded-full bg-[#c6ff00]" /> System: online
        </p>
        <img src="/desk-wings.jpg" alt="" className="h-8 w-auto object-contain opacity-80" />
        <p>Server time: {clock || "—"} UTC</p>
      </footer>
    </div>
  );
}

function Step({ n, title, to, cta }: { n: string; title: string; to: "/sanctuary" | "/academy/FM-101"; cta: string }) {
  if (to === "/academy/FM-101") {
    return (
      <Link to="/academy/$code" params={{ code: "FM-101" }} className="block border border-white/10 p-3">
        <p className="text-[10px] text-[#c6ff00]">{n}</p>
        <p className="mt-1 text-[12px] uppercase tracking-[0.12em]">{title}</p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#c6ff00]">{cta}</p>
      </Link>
    );
  }
  return (
    <Link to={to} className="block border border-white/10 p-3">
      <p className="text-[10px] text-[#c6ff00]">{n}</p>
      <p className="mt-1 text-[12px] uppercase tracking-[0.12em]">{title}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#c6ff00]">{cta}</p>
    </Link>
  );
}
