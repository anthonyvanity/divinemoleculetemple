import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CosDesk } from "@/components/cos-desk";
import { CircleChat, NexusFeed, SignalComposer, useNexusFeed } from "@/components/nexus-board";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nexus")({
  validateSearch: (search: Record<string, unknown>): { circle?: number } => {
    const n = Number(search.circle);
    return Number.isFinite(n) && n > 0 ? { circle: n } : {};
  },
  component: NexusPage,
});

function NexusPage() {
  const { isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-ink text-paper">
        <p className="text-micro tracking-[0.22em] text-lime">Synchronizing session…</p>
      </main>
    );
  }
  return (
    <CosDesk>
      <NexusDesk />
    </CosDesk>
  );
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
            The congregation is this room. Day: ten quiet minutes, one line. Week: say what actually happened, and read someone else. The Academy is the school. It is not required to stand here.
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
              {t === "wall" ? "Journal" : "Study circles"}
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
                  Read what the congregation has shared. A free account lets you write, privately or in public, and enter the circles. The school, if you want it, is $33 a month.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link to="/register" className="inline-flex min-h-11 items-center text-sm uppercase tracking-wide text-lime">
                    Join the congregation
                  </Link>
                  <a href="/register?gate=initiate" className="inline-flex min-h-11 items-center text-sm uppercase tracking-wide">
                    Academy · $33/mo
                  </a>
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