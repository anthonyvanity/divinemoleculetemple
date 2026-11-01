import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { saveDesk, type DeskSchedule } from "@/lib/temple-data";
import { RITES } from "@/lib/rites";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/practice")({ component: Practice });

function ics(schedule: DeskSchedule) {
  const stamp = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map((n) => Number(n) || 0);
    return `20260101T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
  };
  const rows = [
    ["Morning Seal", schedule.wake],
    ["Daily Scholarship", schedule.study],
    ["Evening Closure", schedule.bed],
  ];
  const events = rows.map(([title, start]) =>
    ["BEGIN:VEVENT", `UID:${title}@divinemoleculetemple.com`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(start)}`, "RRULE:FREQ=DAILY", `SUMMARY:${title}`, "END:VEVENT"].join("\r\n"),
  );
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Divine Molecule Temple//Practice//EN", ...events, "END:VCALENDAR"].join("\r\n");
}

function Practice() {
  const schedule = useTemple((s) => s.deskSchedule);
  const setDeskSchedule = useTemple((s) => s.setDeskSchedule);
  const [draft, setDraft] = useState<DeskSchedule>({
    ...schedule,
    zone: schedule.zone === "UTC" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : schedule.zone,
  });
  const [saved, setSaved] = useState(false);

  function save(next: DeskSchedule) {
    setDeskSchedule(next);
    setDraft(next);
    setSaved(true);
    void saveDesk({ data: { schedule: next } })
      .then(() => toast.success("Schedule saved."))
      .catch(() => toast.error("Sign in to keep this schedule."));
  }

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <Link to="/sanctuary" className="text-[10px] uppercase tracking-[0.16em] text-lime">
          The Sanctuary
        </Link>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none">My sacred schedule</h1>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/70">
          Your practice should fit your life. Nothing here is active until you save it. Times use {draft.zone}.
        </p>
        <form
          className="mt-6 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            save(draft);
          }}
        >
          {(
            [
              ["wake", "When does your day begin?"],
              ["study", "When would you like to study?"],
              ["bed", "When do you usually rest?"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-[10px] uppercase tracking-[0.14em] text-paper/55">
              {label}
              <input type="time" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="mt-1 block w-full border border-paper/15 bg-transparent px-3 py-2 text-paper" />
            </label>
          ))}
          <label className="text-[10px] uppercase tracking-[0.14em] text-paper/55">
            Time zone
            <input value={draft.zone} onChange={(e) => setDraft({ ...draft, zone: e.target.value })} className="mt-1 block w-full border border-paper/15 bg-transparent px-3 py-2 text-paper" />
          </label>
          <fieldset>
            <legend className="text-[10px] uppercase tracking-[0.14em] text-paper/55">How should we remind you?</legend>
            <label className="mt-2 flex items-center gap-2 text-[12px] uppercase tracking-[0.12em]">
              <input type="checkbox" checked={draft.reminders} onChange={(e) => setDraft({ ...draft, reminders: e.target.checked })} />
              In-app reminder. Off until you save this.
            </label>
          </fieldset>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
              Build my schedule
            </button>
            <button
              type="button"
              className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]"
              onClick={() => {
                const file = new Blob([ics(draft)], { type: "text/calendar" });
                const url = URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = "temple-practice.ics";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Add all to calendar
            </button>
            <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={() => save({ ...draft, reminders: false })}>
              Pause reminders
            </button>
          </div>
        </form>
        {saved ? <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-lime">Saved. These hours are yours until you change them.</p> : null}
        <ul className="mt-8 space-y-2">
          {RITES.map((rite) => (
            <li key={rite.id}>
              <Link to="/rite/$id" params={{ id: rite.id }} className="text-[11px] uppercase tracking-[0.12em] text-paper/80 hover:text-lime">
                {rite.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
