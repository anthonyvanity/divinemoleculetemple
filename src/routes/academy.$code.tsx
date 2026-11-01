import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ClassLayer } from "@/components/class-layer";
import { Button } from "@/components/ui/button";
import { ChamberHero } from "@/components/chamber";
import { asksForSeat, classUnlocked } from "@/lib/syllabus";
import { scholarshipCourse, SCHOLARSHIP_SEQUENCE } from "@/lib/scholarship";
import { degreeCourse } from "@/lib/degree-catalog";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { markNode, saveDesk, submitContact } from "@/lib/temple-data";
import { SpamFields, useSpamSeal, withRecaptcha } from "@/components/spam-fields";
import { codeById } from "@/lib/temple-content";
import { useTemple } from "@/lib/temple-store";
import { confirmStripeSession, ownedClassCodes, startStripeCheckout } from "@/lib/stripe-temple";

export const Route = createFileRoute("/academy/$code")({ component: CodePage });

function videoFor(id: string) {
  if (id === "FM-101") return "/class/fm-101.mp4";
  return undefined;
}

function useClassPasses(userId: string | undefined) {
  const [owned, setOwned] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!userId) {
      setOwned([]);
      setReady(true);
      return;
    }
    let stop = false;
    setReady(false);
    void (async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id") || "";
      if (/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
        try {
          await confirmStripeSession({ data: sessionId });
        } catch {
          /* the webhook can still write the pass */
        }
      }
      try {
        const codes = await ownedClassCodes();
        if (!stop) setOwned(codes);
      } catch {
        if (!stop) setOwned([]);
      } finally {
        if (!stop) setReady(true);
      }
    })();
    return () => {
      stop = true;
    };
  }, [userId]);
  return { owned, ready };
}

function CodePage() {
  const { code: id } = Route.useParams();
  const seminar = codeById(id);
  const reading = scholarshipCourse(id);
  const lesson = degreeCourse(id);
  const readList = useTemple((s) => s.read);
  const paid = useTemple((s) => s.paid);
  const markRead = useTemple((s) => s.markRead);
  const setLastClass = useTemple((s) => s.setLastClass);
  const { user } = useCurrentUserState();
  const member = Boolean(user);
  const { owned, ready } = useClassPasses(user?.id);
  const done = Array.isArray(readList) && readList.includes(id);
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const buyNow = new URLSearchParams(searchStr).get("buy") === "1";
  const charged = useRef(false);

  useEffect(() => {
    if (reading || seminar || lesson) {
      setLastClass(id);
      void saveDesk({ data: { lastClass: id } }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    const code = (reading?.id || "").toUpperCase();
    if (charged.current || !buyNow || !user || !ready || !code) return;
    if (asksForSeat(code) || classUnlocked(code, paid, owned)) return;
    charged.current = true;
    void startStripeCheckout({
      data: {
        kind: "elective",
        amount: 10,
        code,
        label: `${code} ${reading?.title || ""}`.trim(),
        origin: window.location.origin,
      },
    })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch(() => {
        charged.current = false;
      });
  }, [buyNow, user, ready, paid, owned, reading?.id, reading?.title]);

  if (!seminar && !reading && !lesson) {
    return (
      <main className="bg-ink px-4 py-24 text-center text-paper">
        <p className="font-display text-3xl uppercase">This class is not on the board</p>
        <Link to="/academy" className="mt-6 inline-flex min-h-11 items-center text-lime">
          Return to the Academy
        </Link>
      </main>
    );
  }

  if (reading) {
    const open = classUnlocked(reading.id, paid, owned);
    const waiting = member && !open && !ready;
    return (
      <main className="bg-ink text-paper">
        <ChamberHero
          compact
          ghost={false}
          tone="lime"
          kicker={`${reading.dept.track} · ${reading.dept.code} · ${reading.id}`}
          title={reading.title}
          lede={reading.thesis}
        />
        <ClassLayer code={reading.id} videoSrc={videoFor(reading.id)}>
          <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            {waiting || (buyNow && member && !open) ? (
              <p className="mt-8 border border-lime/40 p-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                {buyNow && member && !open ? "Account open. The $10 charge is next…" : "Opening the receipt…"}
              </p>
            ) : open ? (
              <article className="space-y-8 text-paper/80">
                {reading.blocks.map((block, index) => (
                  <div key={`${reading.id}-${index}`} className="space-y-4">
                    {block.h ? (
                      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">{block.h}</h2>
                    ) : null}
                    {block.p.map((paragraph, paragraphIndex) => (
                      <p key={`${index}-${paragraphIndex}`} className="font-mono text-[12px] normal-case leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </article>
            ) : (
              <Gate
                member={member}
                ask={asksForSeat(reading.id)}
                buy={asksForSeat(reading.id) ? undefined : { code: reading.id, title: reading.title }}
              />
            )}
            {open ? <Examined id={reading.id} done={done} markRead={markRead} /> : null}
          </section>
        </ClassLayer>
      </main>
    );
  }

  if (seminar) {
    const open = classUnlocked(seminar.id, paid, owned);
    const waiting = member && !open && !ready;
    return (
      <main className="bg-ink text-paper">
        <ChamberHero
          compact
          ghost={false}
          tone="orange"
          kicker={`${seminar.volume} · Core seminar ${seminar.id}`}
          title={seminar.title}
          lede={seminar.lede}
        />
        <ClassLayer code={seminar.id} videoSrc={videoFor(seminar.id)}>
          <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            {waiting ? (
              <p className="mt-8 border border-lime/40 p-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                Opening the receipt…
              </p>
            ) : open ? (
              <article className="space-y-5 text-paper/75">
                {seminar.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </article>
            ) : (
              <Gate member={member} ask={false} />
            )}
            {open ? <Examined id={seminar.id} done={done} markRead={markRead} /> : null}
          </section>
        </ClassLayer>
      </main>
    );
  }

  if (lesson) {
    const open = classUnlocked(lesson.course.code, paid, owned);
    const waiting = member && !open && !ready;
    return (
      <main className="bg-ink text-paper">
        <ChamberHero
          compact
          ghost={false}
          tone="lime"
          kicker={`${lesson.dept.level} · ${lesson.dept.code}`}
          title={lesson.course.title}
          lede={lesson.course.thesis}
        />
        <ClassLayer code={lesson.course.code} videoSrc={videoFor(lesson.course.code)}>
          <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            {waiting ? (
              <p className="mt-8 border border-lime/40 p-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                Opening the receipt…
              </p>
            ) : open ? (
              <article className="space-y-6 text-paper/80">
                <p className="font-mono text-[12px] normal-case leading-relaxed">{lesson.course.lecture}</p>
                <p className="text-lime">{lesson.course.takeaway}</p>
              </article>
            ) : (
              <Gate member={member} ask={asksForSeat(lesson.course.code)} />
            )}
            {open ? <Examined id={lesson.course.code} done={done} markRead={markRead} /> : null}
          </section>
        </ClassLayer>
      </main>
    );
  }

  return (
    <main className="bg-ink px-4 py-24 text-center text-paper">
      <p className="font-display text-3xl uppercase">This class is not on the board</p>
      <Link to="/academy" className="mt-6 inline-flex min-h-11 items-center text-lime">
        Return to the Academy
      </Link>
    </main>
  );
}

function Gate({ member, ask, buy }: { member: boolean; ask: boolean; buy?: { code: string; title: string } }) {
  const [sent, setSent] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const spam = useSpamSeal();
  return (
    <div className="mt-6 border border-lime/40 px-4 py-4 text-center">
      <p className="font-display text-lg uppercase leading-none">{member ? "The school opens this" : buy ? "Study this, or all of it" : "Free to look"}</p>
      <p className="mt-2 text-[11px] normal-case leading-relaxed text-paper/70">
        {member
          ? buy
            ? "The Academy is $33 a month and opens every class. Or take this class alone for $10."
            : "This track asks for a seat. The Academy is $33 a month."
          : buy
            ? "Take this class for $10. Or the Academy, $33 a month, opens every class."
            : "The congregation is free. The Academy is the school."}
      </p>
      {member && ask ? (
        <form
          className="relative mx-auto mt-6 max-w-md text-left"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            const email = String(data.get("email") ?? "").trim();
            const note = String(data.get("note") ?? "").trim();
            if (!name || !email) return;
            void withRecaptcha(spam, "academy")
              .then((seal) =>
                submitContact({
                  data: {
                    name,
                    email,
                    message: `ACADEMY SEAT · exorcism / doctorate · ${note}`,
                    ...seal,
                  },
                }),
              )
              .then(() => setSent(true));
          }}
        >
          <SpamFields company={spam.company} setCompany={spam.setCompany} />
          <p className="text-center text-[11px] uppercase tracking-wide text-lime">Request a seat in this class</p>
          <input name="name" required placeholder="NAME" className="mt-3 h-12 w-full border border-paper/20 bg-transparent px-3 text-base uppercase" />
          <input name="email" type="email" required placeholder="EMAIL" className="mt-3 h-12 w-full border border-paper/20 bg-transparent px-3 text-base" />
          <textarea name="note" placeholder="WHY THIS CLASS" className="mt-3 min-h-24 w-full border border-paper/20 bg-transparent px-3 py-2 text-base uppercase" />
          <Button type="submit" variant="lime" className="mt-3 w-full">
            {sent ? "Received" : "Send request"}
          </Button>
          <Button asChild variant="dark" className="mt-2 w-full">
            <a href="/ascend?gate=initiate">Academy · $33/mo</a>
          </Button>
        </form>
      ) : (
        <div className="mx-auto mt-4 grid max-w-xs gap-2">
          {member ? (
            <Button asChild variant="lime" className="w-full">
              <a href="/ascend?gate=initiate">Academy · $33/mo</a>
            </Button>
          ) : (
            <Button asChild variant="lime" className="w-full">
              <a href="/register?gate=initiate">Academy · $33/mo</a>
            </Button>
          )}
          {buy ? (
            member ? (
              <Button
                type="button"
                variant="dark"
                className="w-full"
                disabled={buying}
                onClick={() => {
                  setBuying(true);
                  setError("");
                  void startStripeCheckout({
                    data: {
                      kind: "elective",
                      amount: 10,
                      code: buy.code,
                      label: `${buy.code} ${buy.title}`,
                      origin: window.location.origin,
                    },
                  })
                    .then((session) => {
                      window.location.href = session.url;
                    })
                    .catch((err: Error) => {
                      setBuying(false);
                      setError(err.message || "Checkout did not open");
                    });
                }}
              >
                {buying ? "Opening…" : "This class · $10"}
              </Button>
            ) : (
              <Button asChild variant="dark" className="w-full">
                <a href={`/register?buy=${encodeURIComponent(buy.code)}`}>This class · $10</a>
              </Button>
            )
          ) : null}
          {!member ? (
            <Button asChild variant="dark" className="w-full">
              <Link to="/register">Congregation free</Link>
            </Button>
          ) : null}
        </div>
      )}
      {error ? <p className="mt-4 text-[11px] uppercase tracking-wide text-orange">{error}</p> : null}
    </div>
  );
}

function Examined({
  id,
  done,
  markRead,
}: {
  id: string;
  done: boolean;
  markRead: (id: string) => void;
}) {
  const index = SCHOLARSHIP_SEQUENCE.indexOf(id);
  const next = index >= 0 ? SCHOLARSHIP_SEQUENCE[index + 1] : undefined;
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {next ? (
        <Button asChild variant="lime">
          <Link to="/academy/$code" params={{ code: next }}>
            Next
          </Link>
        </Button>
      ) : null}
      <Button
        type="button"
        variant={done ? "dark" : "dark"}
        onClick={() => {
          markRead(id);
          void markNode({ data: id }).catch(() => {});
        }}
      >
        {done ? "Examined" : "Mark examined"}
      </Button>
    </div>
  );
}
