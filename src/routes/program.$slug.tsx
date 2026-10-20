import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { completeStep, readProgram } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/program/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === "7-day-awakening") throw redirect({ to: "/awakening" });
  },
  component: ProgramPage,
});

type State = Awaited<ReturnType<typeof readProgram>>;

function ProgramPage() {
  const { slug } = Route.useParams();
  const { user } = useCurrentUserState();
  const [state, setState] = useState<State | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void readProgram({ data: slug })
      .then(setState)
      .catch((error: Error) => setErr(error.message || "Missing"));
  }, [slug]);

  if (err) {
    return (
      <main className="bg-ink px-4 py-24 text-center text-paper">
        <p className="font-display text-3xl uppercase">{err}</p>
      </main>
    );
  }
  if (!state) {
    return (
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-micro uppercase tracking-[0.2em] text-lime">Opening the sequence…</p>
      </main>
    );
  }
  if (state.locked) {
    return (
      <main className="bg-ink px-4 py-24 text-center text-paper">
        <p className="text-[10px] uppercase tracking-[0.18em] text-lime">{state.program.accessTier}</p>
        <h1 className="mt-4 font-display text-4xl uppercase">{state.program.title}</h1>
        <p className="mx-auto mt-4 max-w-md font-mono text-[12px] normal-case text-paper/70">
          This sequence stays sealed until the gate that holds it is open.
        </p>
        <Button asChild variant="lime" className="mt-8">
          <Link to={user ? "/gates" : "/register"}>{user ? "Open the gate" : "Become a Seeker"}</Link>
        </Button>
      </main>
    );
  }

  const current = state.nextStep;
  const finished = state.totalSteps > 0 && state.completedCount >= state.totalSteps;
  const pad = String(state.totalSteps).length;

  return (
    <main className="bg-ink px-4 py-16 text-paper sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-lime">{state.program.subtitle || "Sequence"}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.2rem)] uppercase leading-[0.9]">{state.program.title}</h1>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/70">{state.program.description}</p>
        <p className="mt-8 font-display text-3xl text-lime">
          {String(Math.min(state.completedCount + (finished ? 0 : 1), state.totalSteps)).padStart(pad, "0")}
          <span className="text-paper/40"> / {String(state.totalSteps).padStart(pad, "0")}</span>
        </p>

        {finished ? (
          <section className="mt-8 border border-lime/50 p-5">
            <h2 className="font-display text-2xl uppercase">{state.program.completionTitle || "Complete"}</h2>
            <p className="mt-3 whitespace-pre-wrap font-mono text-[12px] normal-case leading-relaxed text-paper/75">
              {state.program.completionBody}
            </p>
          </section>
        ) : current ? (
          <section className="mt-8 border border-lime/40 p-5">
            <p className="text-[10px] uppercase tracking-wide text-lime">
              {current.subtitle || `Step ${String(current.stepNumber).padStart(pad, "0")}`}
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase">{current.title}</h2>
            <p className="mt-4 whitespace-pre-wrap font-mono text-[13px] normal-case leading-relaxed text-paper/80">
              {current.instruction}
            </p>
            {user ? (
              <form
                className="mt-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setBusy(true);
                  setErr("");
                  void completeStep({
                    data: { slug, stepNumber: current.stepNumber, reflection: note },
                  })
                    .then((next) => {
                      setState(next);
                      setNote("");
                    })
                    .catch((error: Error) => setErr(error.message || "The record did not seal"))
                    .finally(() => setBusy(false));
                }}
              >
                <label className="block text-[10px] uppercase tracking-wide text-paper/50">
                  {current.reflectionPrompt || "Reflection"}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    className="mt-2 w-full border border-paper/20 bg-transparent p-3 font-mono text-[13px] normal-case text-paper outline-none"
                  />
                </label>
                {err ? <p className="mt-2 text-micro text-orange">{err}</p> : null}
                <Button type="submit" variant="lime" className="mt-4" disabled={busy}>
                  {current.completionLabel}
                </Button>
              </form>
            ) : (
              <Button asChild variant="dark" className="mt-6">
                <Link to="/register">Sign in to seal the record</Link>
              </Button>
            )}
          </section>
        ) : null}

        <ol className="mt-10 divide-y divide-paper/10 border border-paper/15">
          {state.steps.map((step) => (
            <li key={step.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <span className={cn("font-display uppercase", step.unlocked ? "text-paper" : "text-paper/30")}>
                {String(step.stepNumber).padStart(pad, "0")} {step.title}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-paper/40">
                {step.completed ? "Sealed" : step.unlocked ? "Open" : "Locked"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
