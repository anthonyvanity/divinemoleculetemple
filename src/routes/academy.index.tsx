import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SCHOLARSHIP, SCHOLARSHIP_COUNT } from "@/lib/scholarship";
import { ownedClassCodes } from "@/lib/stripe-temple";
import { ACADEMY_FAQ, ACADEMY_PHASES, asksForSeat, classUnlocked } from "@/lib/syllabus";
import { SOURCE_CODES } from "@/lib/temple-content";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/academy/")({ component: Academy });

function Academy() {
  const paid = useTemple((s) => s.paid);
  const read = useTemple((s) => s.read);
  const open = SOURCE_CODES.filter((c) => c.id === "FM-101" || c.id === "SD-101" || paid).length;
  const { user } = useCurrentUserState();
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    void ownedClassCodes()
      .then(setOwned)
      .catch(() => {});
  }, [user?.id]);

  return (
    <main className="page-orange bg-ink text-paper">
      <ChamberHero
        tone="orange"
        icon="GraduationCap"
        kicker="The Academy"
        title="The Scholarship"
        lede={`A rigorous education
in consciousness
and sacred architecture.
The educational ministry
of the Divine Molecule Temple.`}
      />

      <section className="hidden px-4 py-16 sm:px-6 md:block">
        <div className="mx-auto grid max-w-6xl gap-px bg-paper/10 md:grid-cols-4">
          {ACADEMY_PHASES.map((p) => (
            <article key={p.id} className="bg-ink p-6">
              <p className="font-display text-4xl text-lime">{p.id}</p>
              <h3 className="mt-3 font-display uppercase">Phase {p.id}</h3>
              <p className="mt-3 text-sm text-paper/60">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <div>
            <SectionKicker>The full syllabus // {SCHOLARSHIP_COUNT} classes</SectionKicker>
            <h2 className="mt-3 font-display text-title uppercase">Every class. Every department.</h2>
            <p className="mt-3 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
              {paid
                ? "The Scholarship of the Enlightened. Your Academy is open. Read the class, then Next."
                : "The Scholarship of the Enlightened, as written. FM-101 and the awakening are open. The price is at the end of the list, not the beginning."}
            </p>
          </div>
          {SCHOLARSHIP.departments.map((dept) => (
            <div key={dept.code}>
              <SectionKicker>
                {dept.track} · {dept.code}
              </SectionKicker>
              <h2 className="mt-2 font-display text-2xl uppercase">{dept.name}</h2>
              <p className="mt-2 max-w-2xl text-sm text-paper/55">{dept.line}</p>
              <ul className="mt-6 divide-y divide-paper/10 border border-paper/10">
                {dept.courses.map((c) => {
                  const unlocked = classUnlocked(c.id, paid, owned);
                  const seat = asksForSeat(c.id);
                  return (
                    <li key={c.id}>
                      <Link
                        to="/academy/$code"
                        params={{ code: c.id }}
                        className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-panel"
                      >
                        <span>
                          <span className="text-[10px] uppercase tracking-wide text-lime">
                            {c.id} · {c.tier} · {c.level}
                          </span>
                          <span className="mt-1 block font-display uppercase">{c.title}</span>
                          <span className="mt-1 block font-mono text-[11px] normal-case text-paper/60">{c.thesis}</span>
                        </span>
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-paper/40">
                          {unlocked ? (read.includes(c.id) ? "Examined" : "Open") : seat ? "Sealed" : "Academy"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {!paid ? (
        <section className="border-t border-orange px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange">The school · billed monthly</p>
              <h2 className="mt-2 font-display text-3xl uppercase leading-none">The whole syllabus. $33 a month.</h2>
              <p className="mt-3 max-w-xl font-mono text-[12px] normal-case leading-relaxed text-paper/75">
                You do not have to join the religion to enroll. The bill renews until you cancel. A single class is $35, under Classes.
              </p>
            </div>
            <Button asChild variant="lime">
              <a href={user ? "/ascend?gate=initiate" : "/register?gate=initiate"}>Academy · $33/mo</a>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionKicker>Canon · {open} documents unsealed</SectionKicker>
          <dl className="mt-8 space-y-6">
            {ACADEMY_FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-display uppercase">{item.q}</dt>
                <dd className="mt-2 text-sm text-paper/65">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
