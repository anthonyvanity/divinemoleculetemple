import { createFileRoute, Link } from "@tanstack/react-router";
import { saveDesk } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/orientation")({ component: Orientation });

const STEPS = [
  { n: "01", title: "Discover", line: "Learn what the Temple believes and how its rooms connect.", to: "/divinism" as const, cta: "Explore the Temple" },
  { n: "02", title: "Establish your practice", line: "Choose a few moments for prayer, reflection, and study.", to: "/practice" as const, cta: "Build my daily practice" },
  { n: "03", title: "Begin your scholarship", line: "Your education begins with a single lesson.", to: "/academy/FM-101" as const, cta: "Start my first class" },
  { n: "04", title: "Meet your congregation", line: "Introduce yourself when you are ready.", to: "/nexus" as const, cta: "Enter the Nexxus" },
];

function Orientation() {
  const schedule = useTemple((s) => s.deskSchedule);
  const setDeskSchedule = useTemple((s) => s.setDeskSchedule);

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">Welcome, seeker</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">You have entered the Divine Molecule Temple.</h1>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/70">
          There is no need to understand everything on the first visit. The house unfolds as you walk it.
        </p>
        <ol className="mt-8 space-y-4">
          {STEPS.map((step) => (
            <li key={step.n} className="border border-paper/15 p-4">
              <p className="text-[10px] text-lime">{step.n}</p>
              <p className="mt-1 text-[13px] uppercase tracking-[0.12em]">{step.title}</p>
              <p className="mt-2 font-mono text-[12px] normal-case text-paper/65">{step.line}</p>
              {step.to === "/academy/FM-101" ? (
                <Link to="/academy/$code" params={{ code: "FM-101" }} className="mt-3 inline-flex text-[10px] uppercase tracking-[0.14em] text-lime">
                  {step.cta}
                </Link>
              ) : (
                <Link to={step.to} className="mt-3 inline-flex text-[10px] uppercase tracking-[0.14em] text-lime">
                  {step.cta}
                </Link>
              )}
            </li>
          ))}
        </ol>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink"
          onClick={() => {
            const next = { ...schedule, setupSkipped: true };
            setDeskSchedule(next);
            void saveDesk({ data: { schedule: next } }).catch(() => {});
          }}
        >
          Enter my dashboard
        </Link>
      </section>
    </main>
  );
}
