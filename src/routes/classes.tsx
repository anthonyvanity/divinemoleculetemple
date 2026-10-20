import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ELECTIVES } from "@/lib/degree-catalog";
import { startStripeCheckout } from "@/lib/stripe-temple";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/classes")({ component: Classes });

function Classes() {
  const { user } = useCurrentUserState();
  const [cat, setCat] = useState("all");
  const categories = ["all", ...Array.from(new Set(ELECTIVES.map((c) => c.category)))];
  const shown = cat === "all" ? ELECTIVES : ELECTIVES.filter((c) => c.category === cat);

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="lime"
        icon="Sparkles"
        kicker="Single classes"
        title="Classes"
        lede={`One session.
Pay for that class.
No monthly bill.`}
      />
      <section className="border-b border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>$35 · one price · sold one at a time</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Take the class you want</h2>
          <p className="mt-3 max-w-xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            These electives sit outside the Scholarship. Every class on this page is $35. The full syllabus is the Academy, $33 a month.
          </p>
          <div className="mt-4">
            <Link to="/academy" className="text-[11px] uppercase tracking-wide text-lime">
              The syllabus is in the Academy
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCat(id)}
                className={cn(
                  "border px-3 py-2 font-mono text-[10px] uppercase",
                  cat === id ? "border-lime bg-lime text-ink" : "border-paper/20 text-paper/70",
                )}
              >
                {id === "all" ? "All" : ELECTIVES.find((c) => c.category === id)?.categoryLabel}
              </button>
            ))}
          </div>
          <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
            {shown.map((item) => (
              <li key={item.slug} className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase text-lime">
                    {item.categoryLabel} · {item.minutes} min · {item.instructor}
                  </p>
                  <h3 className="mt-1 font-display uppercase">{item.title}</h3>
                  <p className="mt-2 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
                    {item.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="lime"
                  className="shrink-0"
                  onClick={() => {
                    if (!user) {
                      window.location.href = "/login";
                      return;
                    }
                    void startStripeCheckout({
                      data: {
                        kind: "elective",
                        amount: item.price,
                        label: item.title,
                        origin: window.location.origin,
                      },
                    })
                      .then((r) => {
                        window.location.href = r.url;
                      })
                      .catch(() => {
                        toast.message("Stripe is not connected. Opening Cash App.");
                        window.open(`https://cash.app/$DMTTEMPLE/${item.price}`, "_blank", "noopener,noreferrer");
                      });
                  }}
                >
                  Buy · ${item.price}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
