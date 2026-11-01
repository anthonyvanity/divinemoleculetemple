import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logDailyRitual, saveDesk, saveMemberCode } from "@/lib/temple-data";
import { readHouseDocument } from "@/lib/command";
import { riteById, riteIcs, UNINSTALLED } from "@/lib/rites";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/rite/$id")({ component: RitePage });

function dayKey(zone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function RitePage() {
  const { id } = Route.useParams();
  const rite = riteById(id);
  const missing = UNINSTALLED.find((row) => row.id === id);
  const schedule = useTemple((s) => s.deskSchedule);
  const practice = useTemple((s) => s.deskPractice);
  const setDeskPractice = useTemple((s) => s.setDeskPractice);
  const setDeskSchedule = useTemple((s) => s.setDeskSchedule);
  const logRite = useTemple((s) => s.logRite);
  const [step, setStep] = useState(0);
  const [intention, setIntention] = useState("");
  const [house, setHouse] = useState<Awaited<ReturnType<typeof readHouseDocument>> | null>(null);
  const today = dayKey(schedule.zone || "UTC");
  const done = Boolean(rite && practice[today]?.[rite.key]);

  useEffect(() => {
    if (rite) return;
    void readHouseDocument({ data: id })
      .then(setHouse)
      .catch(() => setHouse(null));
  }, [id, rite]);

  if (!rite) {
    if (house) {
      return (
        <main className="bg-ink px-4 py-16 text-paper">
          <Link to="/sanctuary" className="text-[10px] uppercase tracking-[0.16em] text-lime">
            The Sanctuary
          </Link>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-gold">{house.kind}</p>
          <h1 className="mt-2 font-display text-4xl uppercase">{house.title}</h1>
          <p className="mt-3 font-mono text-[12px] normal-case text-paper/70">{house.purpose}</p>
          {house.locked ? (
            <p className="mt-6 border border-paper/15 p-4 font-mono text-[12px] normal-case">
              This text is held for {house.accessTier}. Your current access does not open it.
            </p>
          ) : (
            <p className="mt-6 whitespace-pre-wrap font-mono text-[13px] normal-case leading-relaxed">{house.body}</p>
          )}
        </main>
      );
    }
    return (
      <main className="bg-ink px-4 py-16 text-paper">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">Ritual archive</p>
        <h1 className="mt-2 font-display text-3xl uppercase">{missing?.title ?? "This rite is not in the archive"}</h1>
        <p className="mt-4 max-w-xl font-mono text-[12px] normal-case leading-relaxed text-paper/70">
          {missing
            ? `${missing.line} The full ceremonial text has not been installed. It will not be paraphrased.`
            : "That page is not a rite of this house."}
        </p>
        <Link to="/sanctuary" className="text-[10px] uppercase tracking-[0.14em] text-lime mt-6 inline-flex">
          Back to the sanctuary
        </Link>
      </main>
    );
  }

  const current = rite;
  const leaf = current.steps[step];

  function complete() {
    const next = { ...practice, [today]: { ...practice[today], [current.key]: true } };
    setDeskPractice(next);
    logRite(current.title);
    void saveDesk({ data: { practice: next } }).catch(() => {});
    void logDailyRitual({ data: { ritual: current.title, duration_min: 5, notes: intention.slice(0, 500) } }).catch(() => {});
    toast.success(`${current.title} sealed.`);
  }

  function saveIntention() {
    const text = intention.trim();
    if (!text) return;
    void saveMemberCode({ data: { title: `${current.title} intention`, body: text, visibility: "private" } })
      .then(() => toast.success("Saved to your private record."))
      .catch(() => toast.error("Sign in to save it."));
  }

  function remind() {
    const next = { ...schedule, reminders: true };
    setDeskSchedule(next);
    void saveDesk({ data: { schedule: next } }).catch(() => {});
    if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
    toast.success("Reminders are on. You can pause them from the schedule.");
  }

  function calendar() {
    const start = current.key === "evening" ? schedule.bed : schedule.wake;
    const file = new Blob([riteIcs(current, start)], { type: "text/calendar" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <Link to="/sanctuary" className="text-[10px] uppercase tracking-[0.16em] text-lime">
          The Sanctuary
        </Link>
        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-gold">{rite.kicker}</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">{rite.title}</h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-paper/55">
          {rite.when} · {rite.minutes}
        </p>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">{rite.purpose}</p>
        {rite.preparation ? <p className="mt-3 font-mono text-[12px] normal-case leading-relaxed text-paper/60">{rite.preparation}</p> : null}

        <article className="mt-8 border border-paper/15 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-lime">
            {leaf.n} — {leaf.title}
          </p>
          <p className="mt-4 whitespace-pre-wrap font-mono text-[13px] normal-case leading-relaxed">{leaf.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" disabled={step === 0} onClick={() => setStep((n) => Math.max(0, n - 1))}>
              Previous
            </button>
            {step < rite.steps.length - 1 ? (
              <button type="button" className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink" onClick={() => setStep((n) => n + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink" onClick={() => setStep(0)}>
                Restart
              </button>
            )}
          </div>
        </article>

        {rite.closing ? <p className="mt-6 text-[12px] uppercase tracking-[0.14em] text-lime">{rite.closing}</p> : null}

        {rite.intention ? (
          <label className="mt-6 block text-[10px] uppercase tracking-[0.14em] text-paper/50">
            {rite.intention}
            <textarea value={intention} onChange={(e) => setIntention(e.target.value)} rows={4} className="mt-2 w-full border border-paper/15 bg-transparent p-3 font-mono text-[12px] normal-case text-paper outline-none" />
          </label>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink" onClick={complete}>
            {done ? "Sealed today" : `Complete ${rite.title}`}
          </button>
          {rite.intention ? (
            <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={saveIntention}>
              Save privately
            </button>
          ) : null}
          <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={remind}>
            Set daily reminder
          </button>
          <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={calendar}>
            Add to calendar
          </button>
          <Link to="/practice" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            Edit my schedule
          </Link>
          {rite.related ? (
            <a href={rite.related.href} className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-lime">
              {rite.related.label}
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
