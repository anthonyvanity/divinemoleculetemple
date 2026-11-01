import { createFileRoute, Link } from "@tanstack/react-router";
import { saveDesk } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/notices")({ component: Notices });

function Notices() {
  const notices = useTemple((s) => s.notices);
  const markNotice = useTemple((s) => s.markNotice);
  const markAllNotices = useTemple((s) => s.markAllNotices);
  const schedule = useTemple((s) => s.deskSchedule);
  const setDeskSchedule = useTemple((s) => s.setDeskSchedule);

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">What’s happening in your Temple</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">Your transmissions</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={() => markAllNotices()}>
            Mark all read
          </button>
          <button
            type="button"
            className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]"
            onClick={() => {
              const next = { ...schedule, reminders: !schedule.reminders };
              setDeskSchedule(next);
              void saveDesk({ data: { schedule: next } }).catch(() => {});
            }}
          >
            {schedule.reminders ? "Pause practice reminders" : "Allow practice reminders"}
          </button>
          <Link to="/dashboard" className="px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-lime">
            Dashboard
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-paper/10 border border-paper/15">
          {notices.length === 0 ? (
            <li className="px-4 py-8 font-mono text-[12px] normal-case text-paper/60">Nothing is waiting. The house is quiet.</li>
          ) : (
            notices.map((note) => (
              <li key={note.id} className="px-4 py-3">
                <a href={note.href} onClick={() => markNotice(note.id)} className="block">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-lime">
                    {note.kind} · {note.read ? "read" : "new"}
                  </p>
                  <p className="mt-1 text-[13px]">{note.title}</p>
                  <p className="mt-1 font-mono text-[11px] normal-case text-paper/60">{note.body}</p>
                </a>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
