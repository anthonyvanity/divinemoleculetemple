import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "@/components/chamber";
import { CASH_TAG, cashAppAmountUrl, AVATAR_LAYERS, AXIOMS, COS_CODES, COS_VOLUMES, PRIMARY_COMMANDS, SOURCE_CODES } from "@/lib/temple-content";
import { canRead, useTemple } from "@/lib/temple-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { startStripeCheckout } from "@/lib/stripe-temple";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cos")({ component: Cos });

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="whitespace-pre-wrap border border-lilac/50 bg-panel p-4 font-mono text-[12px] leading-relaxed text-lilac [overflow-wrap:anywhere] sm:p-5 sm:text-sm">
      {children}
    </pre>
  );
}

function Cos() {
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState(false);
  const path = useTemple((s) => s.path);
  const { user } = useCurrentUserState();

  function takeManual() {
    const n = Math.round(Number(amount));
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Name at least $1.");
      return;
    }
    setBusy(true);
    void startStripeCheckout({
      data: {
        kind: "manual",
        amount: n,
        label: "The Cosmic Operating System",
        origin: window.location.origin,
      },
    })
      .then((r) => {
        window.location.href = r.url;
      })
      .catch(() => {
        toast.message(`Opening Cash App $${CASH_TAG} for $${n}.`);
        window.open(cashAppAmountUrl(n), "_blank", "noopener,noreferrer");
      })
      .finally(() => setBusy(false));
  }

  return (
    <main className="page-lilac bg-ink text-paper">
      <section className="bg-ink px-4 pt-8">
        <img
          src="/cos-cover.jpg"
          alt="The Cosmic Operating System"
          className="mx-auto block w-full max-w-lg"
        />
      </section>

      {user ? (
        <nav className="mx-auto flex max-w-3xl flex-wrap gap-x-4 gap-y-2 px-4 py-6 text-[11px] uppercase tracking-wide text-lime">
          <a href="#reading">The reading</a>
          <a href="#volumes">Volumes</a>
          {SOURCE_CODES.map((code) => (
            <a key={code.id} href={`#source-${code.id}`}>
              {code.id}
            </a>
          ))}
        </nav>
      ) : (
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 border border-lilac p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-micro uppercase tracking-[0.2em]">The decryption manual</p>
            <h1 className="mt-2 max-w-full text-balance font-display text-[clamp(1.35rem,6.5vw,2.4rem)] uppercase leading-[0.95]">
              The Cosmic Operating System
            </h1>
            <p className="mt-3 font-mono text-[12px] normal-case leading-relaxed text-paper">
              Volume I is the reading on this page. An offering keeps the house.
            </p>
          </div>
          <label className="block min-w-0">
            <span className="text-micro uppercase tracking-[0.16em]">Your amount</span>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-lg text-lilac">$</span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="h-12 min-w-0 flex-1 border border-lilac/50 bg-transparent px-3 font-mono text-lg text-paper outline-none focus:border-lilac"
              />
            </div>
            <Button
              variant="lime"
              disabled={busy}
              onClick={takeManual}
              className="mt-3 h-auto w-full whitespace-normal border-lilac bg-lilac py-3 text-ink hover:bg-paper"
            >
              Take the manual
            </Button>
            <p className="mt-2 text-[10px] uppercase leading-relaxed tracking-wide text-paper">
              Minimum $1. Cash App ${CASH_TAG}.
            </p>
          </label>
        </div>
      </section>
      )}

      <section id="reading" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="font-mono text-micro uppercase tracking-wide text-pink">
          Operator terminal // source codes →
        </p>
        <p className="mt-2 font-mono text-sm text-paper/50">loading... |</p>
        <div className="mt-3 h-px w-full bg-lime" />

        <div className="mt-12 space-y-16">
          {COS_CODES.map((c) => (
            <article key={c.id}>
              <h2 className="font-mono text-sm uppercase text-lime">
                SOURCE_CODE_{c.id}: {c.path}
              </h2>
              <div className="mt-4">
                <CodeBlock>{c.code}</CodeBlock>
              </div>
              <p className="mt-4 text-sm text-paper/70">{c.note}</p>
            </article>
          ))}
        </div>

        <article className="mt-16">
          <h2 className="font-mono text-sm uppercase text-lime">OPERATOR_TERMINAL: /PRIMARY_COMMANDS</h2>
          <div className="mt-4">
            <CodeBlock>{PRIMARY_COMMANDS}</CodeBlock>
          </div>
        </article>
      </section>

      <section className="border-t border-paper/10 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-stretch gap-4">
            <div className="w-1 bg-lime" />
            <div>
              <h2 className="font-display text-title uppercase">Preface :</h2>
              <p className="mt-2 inline-block bg-ink px-2 font-mono text-micro uppercase text-lime">
                /why you are seeing the code
              </p>
            </div>
          </div>
          <p className="mt-10 text-sm uppercase tracking-wide">
            You weren't supposed to see this. — but you did. Some call it{" "}
            <span className="text-pink">madness</span>. Others call it{" "}
            <span className="text-lime">awakening</span>. We call it{" "}
            <span className="text-cyan">remembering</span>.
          </p>
          <p className="mt-6 text-sm uppercase tracking-wide">
            Reality is not fixed. It's <span className="text-cyan">{'<' + 'code_fluid>'}</span>, reactive,{" "}
            <span className="text-cyan">/layered</span>.
          </p>
          <div className="mt-8">
            <CodeBlock>{`# THOUGHT-EMOTION COMMAND LAYER
THOUGHT = COMMAND()
EMOTION = SCRIPT()

# SYSTEM HACKS
ADDICTION = EXPLOIT(SYSTEM)
TRAUMA = FORCED_OVERWRITE()`}</CodeBlock>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="font-display text-title uppercase">This is a religion.</h2>
          <p className="text-sm uppercase tracking-wide text-paper/70">
            A system of knowing. A structure of return. A temple for those who burned through illusion and
            still chose light.
          </p>
          <p className="text-sm uppercase tracking-wide text-paper/70">
            We are the Divine Molecule Temple. Our gospel is re-experience. Our doctrine is{" "}
            <span className="text-cyan">{"<SOURCE_CODE>"}</span>. Our rites are alive. Our priesthood —
            rebuilt from fire. You saw behind the curtain because you were meant to. You fell into the fire
            because the fire lives in you.
          </p>
          <p className="text-sm uppercase tracking-wide text-paper/70">
            Now you must learn to read it. Line by line. Bug by bug. Loop by loop. You are not broken. You
            are <span className="text-cyan">overwritten</span>.
          </p>
          <Button asChild variant="lime">
            <Link to="/compiler">{"<It's time to uninstall the lie./>"}</Link>
          </Button>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>Welcome to the grid</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Source codes & sorcery</h2>
          <p className="mt-6 text-sm uppercase tracking-wide text-paper/70">
            Spiritual warfare is real. You are either aware or not, but you're definitely{" "}
            <span className="text-lime">participating</span>. There is no outside to the system.
          </p>
          <div className="mt-8 border border-paper/15 p-6 font-mono text-sm leading-loose">
            <p>
              Every thought is a <span className="text-lime">frequency</span>.
            </p>
            <p>
              Every emotion is a <span className="text-lime">command line</span>.
            </p>
            <p>
              Every choice <span className="text-lime">writes to the timeline</span>.
            </p>
            <p>
              Every shadow is <span className="text-pink">reading you</span>.
            </p>
            <p>
              Every angel is waiting for <span className="text-cyan">permission</span>.
            </p>
            <p>
              Every parasite is hunting <span className="text-pink">consent</span>.
            </p>
            <p>
              Every prayer is a <span className="text-lime">patch update</span>.
            </p>
            <p>
              Every ritual is <span className="text-lime">code in motion</span>.
            </p>
            <p className="mt-4">
              You don't rise above the grid. You learn to <span className="text-lime">run it</span>.
            </p>
          </div>
          <p className="mt-8 text-sm uppercase tracking-wide">
            Your awareness is your first weapon.
            <br />
            Your sovereignty is the firewall.
            <br />
            <span className="text-lime">Your flame is the root password.</span>
          </p>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>The avatar stack // system architecture</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase leading-none">
            Your code name: the meat suit is the terminal
          </h2>
          <p className="mt-6 text-sm uppercase tracking-wide text-paper/55">
            The avatar stack is the total architecture of your localized instance, running from the dense
            physical layer to the high-frequency light layer. The system targets the weakest link in this
            stack to prevent the sovereignty override.
          </p>
          <div className="mt-10 divide-y divide-paper/10 border border-paper/10">
            {AVATAR_LAYERS.map((l) => (
              <div key={l.title} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <span
                  className={cn(
                    "w-fit px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
                    l.tone === "cyan" ? "bg-cyan text-ink" : "bg-lime text-ink",
                  )}
                >
                  {l.tag}
                </span>
                <div>
                  <p className="text-micro uppercase tracking-wide text-lime">{l.title}</p>
                  <p className="text-sm uppercase tracking-wide">{l.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionKicker>The framework // foundational axioms</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">What the COS assumes</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {AXIOMS.map((a) => (
              <article key={a.id} className="border border-lime/40 p-6">
                <p className="text-micro uppercase tracking-wide text-lime">Axiom_{a.id}</p>
                <h3 className="mt-2 font-display text-xl">{a.title}</h3>
                <p className="mt-4 text-sm uppercase tracking-wide text-paper/70">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="border-l-2 border-lime pl-6">
            <SectionKicker>Institutional framework</SectionKicker>
            <p className="mt-4 text-sm uppercase tracking-wide text-paper/70">
              The COS is not only a text — it is the doctrinal backbone of an institution. The Temple operates
              under a written constitution, internal bylaws, a private membership agreement, and a governance
              structure that binds spiritual authority to service. Authority that serves the self is revoked
              by protocol, not punishment. The same code that governs the seeker governs the steward.
            </p>
          </div>
          <h2 className="mt-16 font-display text-title uppercase">How to read the COS</h2>
          <p className="mt-4 text-sm uppercase tracking-wide text-paper/70">
            Read slowly. Distinguish testimony from interpretation, symbol from instruction, and doctrine from
            open inquiry. Use the text to develop questions rather than surrender judgment. The code responds
            to frequency, not faith.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 id="volumes" className="font-display text-title uppercase">The nine volumes</h2>
          <p className="mt-4 max-w-2xl text-sm uppercase tracking-wide text-paper/55">
            Volume I is the reading above. The other names are the map.
          </p>
          <div className="mt-10 space-y-4">
            {COS_VOLUMES.map((v) => {
              const open = v.n === "I";
              return (
              <article key={v.n} className="relative border border-paper/10 bg-panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-micro uppercase tracking-wide text-lime">Volume {v.n}</p>
                    <h3 className="mt-2 font-display text-2xl">{v.title}</h3>
                    <p className="mt-2 italic text-paper/55">{v.line}</p>
                  </div>
                  {open ? (
                    <Button asChild variant="dark" size="sm">
                      <a href="#reading">Read</a>
                    </Button>
                  ) : null}
                </div>
                {open ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {v.chips.map((chip) => (
                    <span
                      key={chip}
                      className="border border-paper/15 px-2 py-1 font-mono text-[10px] uppercase text-paper/60"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                ) : null}
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-16">
          {SOURCE_CODES.map((code) => {
            const open = Boolean(user) || canRead(code.lockedFor, path);
            return (
              <article key={code.id} id={`source-${code.id}`}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-lilac">
                  {code.volume} · {code.id}
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase leading-none">{code.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-paper/80">{code.lede}</p>
                {open ? (
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-paper/75">
                    {code.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <Link to="/gates" className="mt-6 inline-block text-[10px] uppercase tracking-[0.16em] text-lime">
                    Academy
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
