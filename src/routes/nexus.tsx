import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CosDesk } from "@/components/cos-desk";
import { CircleChat, NexusFeed, SignalComposer, useNexusFeed } from "@/components/nexus-board";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptCovenant, covenantState, fileAppeal } from "@/lib/covenant";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nexus")({
  validateSearch: (search: Record<string, unknown>): { circle?: number } => {
    const n = Number(search.circle);
    return Number.isFinite(n) && n > 0 ? { circle: n } : {};
  },
  component: NexusPage,
});

function Veil({
  title,
  line,
  action,
  bare,
  children,
}: {
  title?: string;
  line?: string;
  action?: ReactNode;
  bare?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="relative min-h-[78vh] overflow-hidden">
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden>
        <NexusShape />
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 grid place-items-center overflow-y-auto px-4 py-10">
        {bare ? (
          children
        ) : (
          <div className="max-w-md bg-ink/80 px-6 py-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-lime">The Nexxus</p>
            <h1 className="mt-2 font-display text-3xl uppercase">{title}</h1>
            <p className="mt-3 font-mono text-[12px] normal-case leading-relaxed text-paper/80">{line}</p>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

function NexusShape() {
  const bars = ["w-full", "w-11/12", "w-3/4", "w-5/6", "w-2/3"];
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-8 text-paper">
      <div className="h-3 w-24 bg-pink/70" />
      <div className="h-9 w-72 max-w-full bg-white/25" />
      <div className="h-3 w-96 max-w-full bg-white/15" />
      <div className="border border-white/20 p-4">
        <div className="h-2.5 w-20 bg-lime/70" />
        <div className="mt-3 h-3 w-4/5 bg-white/20" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {["write", "wall"].map((side) => (
          <div key={side} className="border border-white/20 p-4">
            <div className="h-2.5 w-24 bg-white/30" />
            <div className="mt-4 space-y-3">
              {bars.map((width, index) => (
                <div key={`${side}-${index}`} className={`h-2.5 bg-white/20 ${width}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NexusPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-ink text-paper">
        <p className="text-micro tracking-[0.22em] text-lime">Synchronizing session…</p>
      </main>
    );
  }
  if (!user) {
    return (
      <Veil
        title="Members only"
        line="The congregation is not a public feed. A free account is enough. Your story is yours. Their story is sacred."
        action={
          <Link to="/register" className="mt-6 inline-flex bg-lime px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink">
            Join free
          </Link>
        }
      />
    );
  }
  return (
    <CosDesk>
      <CovenantGate />
    </CosDesk>
  );
}

function CovenantGate() {
  const [state, setState] = useState<Awaited<ReturnType<typeof covenantState>> | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [appeal, setAppeal] = useState("");
  const [err, setErr] = useState("");

  function load() {
    void covenantState().then(setState).catch((error: Error) => setErr(error.message));
  }

  useEffect(() => {
    load();
  }, []);

  if (!state) return <p className="text-[11px] uppercase tracking-[0.16em] text-lime">{err || "Reading the covenant…"}</p>;
  if (!state.accepted || state.restricted) {
    return (
      <Veil bare>
        <section className="mx-auto max-w-xl bg-ink/80 p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-lime">Divine Molecule Temple · Congregational privacy</p>
        <h1 className="mt-2 font-display text-3xl uppercase">The Sacred Confidence Covenant</h1>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/80 whitespace-pre-wrap">{state.text}</p>
        <p className="mt-4 font-mono text-[12px] normal-case text-paper/60">Your story is yours. Their story is sacred.</p>
        {state.warning ? <p className="mt-4 border border-white/15 p-3 text-[12px]">A steward wrote: {state.warning}</p> : null}
        {state.restricted ? (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              void fileAppeal({ data: appeal }).then(() => setAppeal("")).catch((error: Error) => setErr(error.message));
            }}
          >
            <p className="text-[12px]">Nexxus access is restricted{state.until ? ` until ${state.until.slice(0, 10)}` : ""}. {state.reason}</p>
            <textarea value={appeal} onChange={(e) => setAppeal(e.target.value)} className="mt-3 w-full border border-white/15 bg-transparent p-2 text-[12px]" rows={3} placeholder="Appeal, in your own words" />
            <button type="submit" className="mt-2 text-[10px] uppercase tracking-[0.14em] text-lime">Send the appeal</button>
          </form>
        ) : (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              void acceptCovenant({ data: agreed })
                .then(load)
                .catch((error: Error) => setErr(error.message));
            }}
          >
            <label className="flex items-start gap-3 text-[12px]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              I have read and agree to protect the privacy and confidentiality of my fellow congregants.
            </label>
            {err ? <p className="mt-2 text-[12px] text-pink">{err}</p> : null}
            <button type="submit" className="mt-4 bg-lime px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink">
              I accept the covenant — enter the Nexxus
            </button>
          </form>
        )}
        </section>
      </Veil>
    );
  }
  return <NexusDesk />;
}

const WEEK = [
  "Ten quiet minutes. Write one sentence: what was signal today, and what was noise.",
  "Read ten minutes of Volume I. Post the one line that stayed.",
  "Name one pattern you keep repeating. Do not fix it. Name it here.",
  "Read one public entry. Reply with one honest sentence. That is the congregation.",
] as const;

function thisWeek() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WEEK[week % WEEK.length];
}

function NexusDesk() {
  const { user } = useCurrentUserState();
  const { circle } = Route.useSearch();
  const { feed, comments, refresh } = useNexusFeed();
  const [tab, setTab] = useState<"wall" | "circles">(circle ? "circles" : "wall");
  const practice = thisWeek();

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="desk-kicker">The Nexus</p>
          <h1 className="mt-1 font-display text-3xl leading-none">
            The congregation
            <br />
            talks here.
          </h1>
          <p className="mt-2 max-w-md font-mono text-[11px] normal-case leading-relaxed text-paper/60">
            Free for every registered Seeker. Read, write, reply, and sit in the public rooms. You do not need to have taken anything to belong. Accounts of entities are personal experiences, not verified facts. Do not source or sell.
          </p>
        </div>
        <div className="flex rounded-full border p-0.5" style={{ borderColor: "var(--desk-line)" }}>
          {(["wall", "circles"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("min-h-10 rounded-full px-4 text-[10px] tracking-[0.16em]")}
              style={
                tab === t
                  ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }
                  : { color: "var(--desk-muted)" }
              }
            >
              {t === "wall" ? "Journal" : "Rooms"}
            </button>
          ))}
        </div>
      </div>

      <article className="desk-card p-4">
        <p className="desk-kicker">This week</p>
        <p className="mt-2 font-mono text-[12px] normal-case leading-relaxed">{practice}</p>
      </article>

      {tab === "wall" ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="desk-card p-4">
            {user ? (
              <SignalComposer onPosted={refresh} />
            ) : (
              <div>
                <p className="font-display text-xl uppercase">The journal is open</p>
                <p className="mt-2 text-sm text-paper/60">
                  Read what the congregation has shared. A free account lets you write, privately or in public, and enter the circles.
                </p>
                <div className="mt-4">
                  <Link to="/register" className="inline-flex h-8 items-center text-[10px] uppercase tracking-wide text-lime">
                    Join free
                  </Link>
                </div>
              </div>
            )}
          </article>
          <article className="desk-card flex max-h-[32rem] flex-col p-4">
            <p className="desk-kicker mb-3">What the house is sharing</p>
            <NexusFeed posts={feed} comments={comments} onPosted={refresh} />
          </article>
        </div>
      ) : (
        <CircleChat openId={circle} />
      )}
    </div>
  );
}