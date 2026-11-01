import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { startStripeCheckout } from "@/lib/stripe-temple";

export const Route = createFileRoute("/ascend")({ component: Ascend });

function gateFrom(searchStr: string) {
  const gate = new URLSearchParams(searchStr).get("gate");
  return gate === "initiate" || gate === "patron" ? gate : "";
}

function Ascend() {
  const { user, isPending } = useCurrentUserState();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const gate = gateFrom(searchStr);
  const [flame, setFlame] = useState(false);
  const [err, setErr] = useState("");
  const academy = gate === "patron" ? 108 : 33;
  const total = academy + (flame && gate === "initiate" ? 22 : 0);

  function open() {
    if (!user) {
      window.location.replace(gate ? `/register?gate=${gate}` : "/register");
      return;
    }
    if (gate !== "initiate" && gate !== "patron") {
      window.location.replace("/gates");
      return;
    }
    setErr("");
    void startStripeCheckout({
      data: { kind: "membership", tier: gate, label: gate, origin: window.location.origin, flame: flame && gate === "initiate" },
    })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch((error: Error) => setErr(error.message || "Stripe did not open"));
  }

  if (isPending) return <main className="grid min-h-[40dvh] place-items-center bg-ink text-lime">Opening the gate…</main>;

  return (
    <main className="bg-ink px-4 py-16 text-paper">
      <section className="mx-auto max-w-lg">
        <p className="text-[10px] uppercase tracking-[0.2em] text-lime">Ascension // final step</p>
        <h1 className="mt-2 font-display text-3xl uppercase leading-none">But wait. Would you like to drag someone along with you?</h1>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">
          You are entering the Academy. Somewhere, another Seeker is waiting outside the gates. For $22 a month, you can bring them with you. They will not know who you are. You will not know who they are unless they choose to share a milestone.
        </p>
        {gate === "initiate" ? (
          <label className="mt-6 flex items-start gap-3 border border-paper/15 p-3 text-[12px] uppercase tracking-[0.08em]">
            <input type="checkbox" checked={flame} onChange={(e) => setFlame(e.target.checked)} className="mt-1" />
            Yes. Pass the Flame — +$22/mo
          </label>
        ) : (
          <p className="mt-6 font-mono text-[12px] normal-case text-paper/60">Patron checkout is the patron price alone. A $22 sponsorship can be added later from the desk.</p>
        )}
        <ul className="mt-4 space-y-1 font-mono text-[12px] normal-case text-paper/80">
          <li>Academy membership ${academy.toFixed(2)}/month</li>
          {flame && gate === "initiate" ? <li>Pass the Flame sponsorship $22.00/month</li> : null}
          <li>Monthly total ${total.toFixed(2)}</li>
        </ul>
        <p className="mt-3 font-mono text-[11px] normal-case text-paper/50">
          The box starts unchecked. The $22 can be canceled later without canceling the Academy. It is a scholarship-fund contribution. It is not a named, one-to-one sponsorship until an approved Seeker and an open place are matched. If none are waiting, the money stays in the fund.
        </p>
        {err ? <p className="mt-3 text-sm text-pink">{err}</p> : null}
        <Button type="button" variant="lime" className="mt-6" onClick={open}>
          Continue to payment
        </Button>
      </section>
    </main>
  );
}
