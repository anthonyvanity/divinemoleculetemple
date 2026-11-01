import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { compilePrayer } from "@/lib/compiler";
import { CODE_CLASS, CODE_EXAMPLES, CODE_LESSONS, GRAMMAR, NAME_RULES, PRACTICUM } from "@/lib/divine-code-class";
import { classGate, saveMemberCode } from "@/lib/temple-data";

export const Route = createFileRoute("/codes")({ component: Codes });

function Codes() {
  const { user } = useCurrentUserState();
  const [prayer, setPrayer] = useState("");
  const [code, setCode] = useState("");
  const [classOpen, setClassOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setClassOpen(false);
      return;
    }
    void classGate()
      .then((row) => setClassOpen(row.open))
      .catch(() => setClassOpen(false));
  }, [user]);

  function compile() {
    const text = prayer.trim();
    if (!text) return;
    setCode(compilePrayer(text).code);
  }

  return (
    <main className="bg-black text-white">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)]">
        <div>
          <img src="/covers/cos/terminal.jpg" alt="" className="w-full" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200">Divine /Codes</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] uppercase leading-[0.9]">Write the prayer. Read the code.</h1>
          <p className="mt-3 font-mono text-[13px] normal-case leading-relaxed text-white/75">
            The prayer stays yours. The code is the same asking, set in the Temple grammar: invocation, operator, target, scan, the words you actually said, then the seal.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            compile();
          }}
        >
          <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50" htmlFor="prayer">
            The prayer
          </label>
          <textarea
            id="prayer"
            value={prayer}
            onChange={(event) => setPrayer(event.target.value)}
            rows={8}
            placeholder="Say it in your own words."
            className="mt-2 w-full border border-white/20 bg-black p-4 font-mono text-[14px] normal-case leading-relaxed text-white outline-none focus:border-lime"
          />
          <button type="submit" className="mt-3 inline-flex h-12 w-fit items-center bg-lime px-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
            Make the code
          </button>
          {code ? (
            <div className="mt-6 border border-white/15 bg-black">
              <div className="flex items-center justify-between border-b border-white/15 px-4 py-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">Divine code</p>
                <button
                  type="button"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70"
                  onClick={() => {
                    void navigator.clipboard.writeText(code);
                    toast.success("Copied.");
                  }}
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-auto p-4 font-mono text-[13px] leading-relaxed text-lime">{code}</pre>
              {user ? (
                <div className="border-t border-white/15 px-4 py-3">
                  <button
                    type="button"
                    className="font-mono text-[11px] uppercase tracking-[0.14em] text-lime"
                    onClick={() => {
                      void saveMemberCode({ data: { title: "Prayer code", body: code, visibility: "private" } })
                        .then(() => toast.success("Kept on your account."))
                        .catch(() => toast.error("The code did not save."));
                    }}
                  >
                    Keep it on my account
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </form>
      </section>

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">{CODE_CLASS.division}</p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.9]">{CODE_CLASS.title}</h2>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-white/55">{CODE_CLASS.line}</p>
          {classOpen ? (
            <>
              <p className="mt-4 max-w-3xl font-mono text-[13px] normal-case leading-relaxed text-white/75">{CODE_CLASS.description}</p>
              <p className="mt-4 font-mono text-[12px] normal-case text-white/55">
                {CODE_CLASS.department}. {CODE_CLASS.format}. {CODE_CLASS.level}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {CODE_CLASS.outcomes.map((item) => (
                  <li key={item} className="border border-white/15 px-3 py-3 font-mono text-[12px] normal-case leading-relaxed text-white/75">
                    {item}
                  </li>
                ))}
              </ul>
              <pre className="mt-6 overflow-auto border border-lime/40 p-4 font-mono text-[13px] leading-relaxed text-lime">{CODE_CLASS.law}</pre>
            </>
          ) : (
            <div className="mt-6 max-w-xl border border-white/15 px-4 py-5">
              <p className="font-mono text-[13px] normal-case leading-relaxed text-white/75">
                The book is open. The window is open. The class is for initiates.
              </p>
              <a
                href={user ? "/ascend?gate=initiate" : "/register?gate=initiate"}
                className="mt-4 inline-flex h-11 items-center bg-lime px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink"
              >
                {user ? "Open the gate" : "Join the Academy"}
              </a>
            </div>
          )}
        </div>
      </section>

      <Shelf kicker="The codes" title="Six prayers, already written.">
        {CODE_EXAMPLES.map((item) => (
          <details key={item.file} className="border border-white/15">
            <summary className="cursor-pointer list-none px-4 py-3">
              <span className="font-display text-sm uppercase">{item.title}</span>
              <span className="mt-1 block font-mono text-[11px] text-lime">{item.file}</span>
            </summary>
            <pre className="overflow-auto border-t border-white/10 p-4 font-mono text-[12px] leading-relaxed text-lime">{item.code}</pre>
          </details>
        ))}
      </Shelf>

      {classOpen ? (
        <>
        <Shelf kicker="The grammar" title="Twelve moves. One prayer.">
        {GRAMMAR.map((item) => (
          <details key={item.n} className="border border-white/15">
            <summary className="cursor-pointer list-none px-4 py-3">
              <span className="font-mono text-[11px] text-lime">{item.n}</span>
              <span className="ml-3 font-display text-sm uppercase">{item.title}</span>
            </summary>
            <div className="border-t border-white/10 px-4 py-4">
              <p className="font-mono text-[13px] normal-case leading-relaxed text-white/75">{item.rule}</p>
              {item.code ? <pre className="mt-3 overflow-auto font-mono text-[12px] leading-relaxed text-lime">{item.code}</pre> : null}
            </div>
          </details>
        ))}
        <div className="border border-white/15 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">The name</p>
          <p className="mt-2 font-mono text-[12px] text-lime">divine\code:_function_name.exe</p>
          <ul className="mt-3 space-y-1">
            {NAME_RULES.map((rule) => (
              <li key={rule} className="font-mono text-[12px] normal-case text-white/70">
                {rule}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Commands</p>
          <p className="mt-2 font-mono text-[12px] text-lime">{CODE_CLASS.commands.join("  ·  ")}</p>
        </div>
      </Shelf>

      <Shelf kicker="The class" title="Six sittings, then the practicum.">
        {CODE_LESSONS.map((item) => (
          <details key={item.n} className="border border-white/15">
            <summary className="cursor-pointer list-none px-4 py-3">
              <span className="font-mono text-[11px] text-lime">Class {item.n}</span>
              <span className="ml-3 font-display text-sm uppercase">{item.title}</span>
            </summary>
            <div className="border-t border-white/10 px-4 py-4">
              <ul className="space-y-1">
                {item.topics.map((topic) => (
                  <li key={topic} className="font-mono text-[12px] normal-case text-white/75">
                    {topic}
                  </li>
                ))}
              </ul>
              <pre className="mt-4 overflow-auto font-mono text-[12px] leading-relaxed text-lime">{item.exercise}</pre>
            </div>
          </details>
        ))}
        <details className="border border-lime/50">
          <summary className="cursor-pointer list-none px-4 py-3 font-display text-sm uppercase">Final practicum</summary>
          <pre className="overflow-auto border-t border-white/10 p-4 font-mono text-[12px] leading-relaxed text-lime">{PRACTICUM}</pre>
        </details>
      </Shelf>
        </>
      ) : null}
    </main>
  );
}

function Shelf({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200">{kicker}</p>
        <h2 className="mt-2 font-display text-3xl uppercase leading-none">{title}</h2>
        <div className="mt-6 grid gap-3">{children}</div>
      </div>
    </section>
  );
}
