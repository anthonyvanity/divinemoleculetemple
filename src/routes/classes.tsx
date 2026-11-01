import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ELECTIVES } from "@/lib/degree-catalog";
import { downloadElectivePdf, ownedClassCodes, startStripeCheckout, confirmStripeSession } from "@/lib/stripe-temple";

const POSTERS: Record<string, string> = {
  "ELEC-AI-101": "/classes/ai.jpg",
  "ELEC-DS-101": "/classes/watched.jpg",
  "ELEC-MM-101": "/classes/wealth.jpg",
  "ELEC-EA-101": "/classes/alchemy.jpg",
  "ELEC-WL-101": "/classes/biohacking.jpg",
  "ELEC-CE-101": "/classes/channeling.jpg",
  "ELEC-RL-101": "/classes/dating.jpg",
  "ELEC-MH-101": "/classes/anxiety.jpg",
};

export const Route = createFileRoute("/classes")({ component: Classes });

function Classes() {
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState<string | null>(null);
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setOwned([]);
      return;
    }
    let stop = false;
    void (async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (sessionId) {
        await confirmStripeSession({ data: sessionId }).catch(() => {});
      }
      const codes = await ownedClassCodes().catch(() => [] as string[]);
      if (!stop) setOwned(codes.map((code) => code.toUpperCase()));
    })();
    return () => {
      stop = true;
    };
  }, [user]);

  function buy(item: (typeof ELECTIVES)[number]) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    void startStripeCheckout({
      data: {
        kind: "elective",
        code: item.slug,
        amount: item.price,
        label: item.title,
        origin: window.location.origin,
      },
    })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch(() => toast.error("Stripe did not open."));
  }

  function download(slug: string) {
    void downloadElectivePdf({ data: slug })
      .then((file) => {
        const binary = atob(file.pdf);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("The PDF did not open."));
  }

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="lime"
        icon="Sparkles"
        kicker="Single classes"
        title="Classes"
        lede={`Single instruments
of the same school.
One class. Then you leave.`}
      />
      <section className="border-b border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Outside the degree · sold one at a time</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Electives</h2>
          <p className="mt-3 max-w-xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            These are single classes from the same metaphysical engineering program. A class is a tool, not a mood. It does not confer the degree, and it does not ordain. The full divinity school, including the clergy track, is the Academy.
          </p>
          <div className="mt-4">
            <Link to="/academy" className="text-[11px] uppercase tracking-wide text-lime">
              The syllabus is in the Academy
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {ELECTIVES.map((item) => {
              const shownOpen = open === item.slug;
              const hasIt = owned.includes(item.slug.toUpperCase());
              return (
                <li key={item.slug} className="border border-paper/15 bg-black">
                  <button
                    type="button"
                    aria-expanded={shownOpen}
                    onClick={() => setOpen(shownOpen ? null : item.slug)}
                    className="block w-full"
                  >
                    <img src={POSTERS[item.slug]} alt={item.title} className="w-full bg-black" />
                  </button>
                  {shownOpen ? (
                    <div className="border-t border-paper/15 p-4 sm:p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime">
                        {item.categoryLabel} · {item.minutes} min · PDF
                      </p>
                      <h3 className="mt-2 font-display text-2xl uppercase leading-none">{item.title}</h3>
                      <p className="mt-3 font-mono text-[13px] normal-case leading-relaxed text-paper/80">{item.description}</p>
                      {hasIt ? (
                        <button
                          type="button"
                          onClick={() => download(item.slug)}
                          className="mt-5 inline-flex h-12 w-fit items-center justify-center bg-lime px-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink"
                        >
                          Download the PDF
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => buy(item)}
                          className="mt-5 inline-flex h-12 w-fit items-center justify-center bg-lime px-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink"
                        >
                          Buy · ${item.price}
                        </button>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
