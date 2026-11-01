import { createFileRoute, Link } from "@tanstack/react-router";
import { CANONICAL_SEQUENCE, classUnlocked, syllabusCourse } from "@/lib/syllabus";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/my-classes")({ component: MyClasses });

function MyClasses() {
  const read = useTemple((s) => s.read) ?? [];
  const lastClass = useTemple((s) => s.lastClass);
  const paid = useTemple((s) => s.paid);
  const notes = useTemple((s) => s.classNotes);
  const done = CANONICAL_SEQUENCE.filter((id) => read.includes(id));
  const resume = lastClass && !done.includes(lastClass) ? lastClass : (CANONICAL_SEQUENCE.find((id) => !done.includes(id)) ?? "");
  const pct = CANONICAL_SEQUENCE.length ? Math.round((done.length / CANONICAL_SEQUENCE.length) * 100) : 0;

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">Your education. Your progress.</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">My scholarship</h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-paper/55">{pct}% of the installed sequence is complete. {done.length} sealed.</p>
        {!resume ? (
          <p className="mt-6 font-mono text-[12px] normal-case">Every scholar begins somewhere.</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {resume ? (
            classUnlocked(resume, paid, []) || paid ? (
              <Link to="/academy/$code" params={{ code: resume }} className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
                Continue class
              </Link>
            ) : (
              <Link to="/ascend" className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
                Ascend to unlock
              </Link>
            )
          ) : (
            <Link to="/academy/$code" params={{ code: "FM-101" }} className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
              Begin the scholarship
            </Link>
          )}
          <Link to="/academy" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            View syllabus
          </Link>
          <Link to="/monday" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            Ask Monday
          </Link>
        </div>
        <ul className="mt-8 divide-y divide-paper/10 border border-paper/15">
          {CANONICAL_SEQUENCE.map((id, index) => {
            const course = syllabusCourse(id);
            if (!course) return null;
            const sealed = done.includes(id);
            const open = sealed || id === resume;
            if (!open && index > done.length + 2) return null;
            const note = notes?.[id]?.[0]?.body;
            return (
              <li key={id} className="px-4 py-3">
                <Link to="/academy/$code" params={{ code: id }} className="block">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-lime">
                    {id} {sealed ? "· complete" : id === resume ? "· next" : ""}
                  </p>
                  <p className="mt-1 text-[13px] uppercase tracking-[0.08em]">{course.title}</p>
                  <p className="mt-1 font-mono text-[11px] normal-case text-paper/60">{course.thesis}</p>
                </Link>
                {note ? <p className="mt-2 font-mono text-[11px] normal-case text-paper/50">Note: {note}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
