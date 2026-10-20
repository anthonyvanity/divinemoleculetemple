import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { CASH_TAG, OFFERINGS, cashAppAmountUrl } from "@/lib/temple-content";
import { startStripeCheckout } from "@/lib/stripe-temple";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useTemple } from "@/lib/temple-store";
import { addContribution } from "@/lib/temple-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/altar")({ component: Altar });

function Altar() {
  const { user } = useCurrentUserState();
  const addOffering = useTemple((s) => s.addOffering);
  const offerings = useTemple((s) => s.offerings);
  const flameName = useTemple((s) => s.flameName);
  const setFlameName = useTemple((s) => s.setFlameName);
  const total = offerings.reduce((n, o) => n + o.amount, 0);
  const [picked, setPicked] = useState<(typeof OFFERINGS)[number]["id"]>("ember");
  const [custom, setCustom] = useState("");
  const gift = OFFERINGS.find((o) => o.id === picked) ?? OFFERINGS[0];
  const named = Math.round(Number(custom));
  const usingCustom = custom.trim() !== "";
  const amount = usingCustom ? named : gift.amount;
  const label = usingCustom ? "Your amount" : gift.name;

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="ink"
        icon="Sparkles"
        kicker="The offering"
        title={`Give to the work
of the Temple.`}
        lede={`The Temple does not sell rank.
Not equal gifts,
but equal sacrifice.`}
      />

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <label className="block max-w-md">
            <span className="text-micro uppercase tracking-wide text-orange">Name on the flame</span>
            <input
              value={flameName}
              onChange={(e) => setFlameName(e.target.value)}
              className="mt-2 h-12 w-full border border-orange/40 bg-transparent px-4 text-sm uppercase outline-none focus:border-orange"
              placeholder="Anonymous"
            />
          </label>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {OFFERINGS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setPicked(o.id)}
                className={cn(
                  "border px-2 py-3",
                  picked === o.id ? "border-lime text-lime" : "border-paper/20 text-paper hover:border-lime",
                )}
              >
                <span className="block font-sans text-[11px] font-light uppercase">{o.name}</span>
                <span className="mt-1 block font-mono text-sm">${o.amount}</span>
              </button>
            ))}
          </div>
          <label className="mt-4 block max-w-xs">
            <span className="text-micro uppercase tracking-wide text-orange">Or name your amount</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-lg text-orange">$</span>
              <input
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="1"
                className="h-12 w-28 border border-orange/50 bg-transparent px-3 font-mono text-lg text-paper outline-none focus:border-orange"
                aria-label="Your amount"
              />
            </div>
          </label>
          <div className="mt-8">
            <Button
              variant="lime"
              onClick={() => {
                if (usingCustom && (!Number.isFinite(named) || named < 1)) {
                  toast.error("Name at least $1.");
                  return;
                }
                const note = flameName.trim() || "Anonymous flame";
                const giveCash = () => {
                  addOffering({ tier: label, amount, note });
                  toast.message(`${label} — opening Cash App $${CASH_TAG}.`);
                  window.open(cashAppAmountUrl(amount), "_blank", "noopener,noreferrer");
                };
                if (!user || usingCustom) {
                  giveCash();
                  return;
                }
                void startStripeCheckout({
                  data: {
                    kind: "offering",
                    amount,
                    label,
                    origin: window.location.origin,
                  },
                })
                  .then((r) => {
                    window.location.href = r.url;
                  })
                  .catch(() => {
                    void addContribution({
                      data: { tier: label, amount, note },
                    }).catch(() => {});
                    giveCash();
                  });
              }}
            >
              Cast into the flame
            </Button>
            <p className="mt-2 text-[10px] font-normal tracking-wide text-paper/50">
              Stripe. Cash App only if the desk is not connected.
            </p>
          </div>

          <div className="mt-16">
            <SectionKicker>Ledger · ${total} intended</SectionKicker>
            {offerings.length === 0 ? (
              <p className="mt-4 text-sm uppercase tracking-wide text-paper/50">The wall is dark. Cast the first spark.</p>
            ) : (
              <ul className="mt-4 divide-y divide-paper/10 border border-paper/10">
                {offerings.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                    <span>
                      {o.tier} · {o.note}
                    </span>
                    <span className="text-orange tabular-nums">${o.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
