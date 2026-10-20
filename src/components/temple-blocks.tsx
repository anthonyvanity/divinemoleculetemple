import { Check, Send } from "lucide-react";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { SpamFields, useSpamSeal, withRecaptcha } from "@/components/spam-fields";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { OFFERINGS, PATHS, cashAppAmountUrl } from "@/lib/temple-content";
import { joinFlame } from "@/lib/temple-data";
import { startStripeCheckout } from "@/lib/stripe-temple";
import { useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

export function MembershipGrid() {
  const path = useTemple((s) => s.path);
  const { user } = useCurrentUserState();

  function openGate(tier: "initiate" | "patron") {
    void startStripeCheckout({
      data: { kind: "membership", tier, label: tier, origin: window.location.origin },
    })
      .then((r) => {
        window.location.href = r.url;
      })
      .catch((error: Error) => toast.error(error.message || "Stripe did not open"));
  }

  return (
    <section className="bg-night text-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-center text-micro font-medium uppercase tracking-wide text-canary">
          Two doors
        </p>
        <h2 className="mt-3 text-center font-display text-title uppercase">Belong free. Study for $33.</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-paper/70">
          The congregation does not require tuition. The Academy does not require belief. It bills every month until you cancel.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PATHS.map((p) => {
            const rec = p.recommended;
            const current = path === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex min-h-[22rem] flex-col border p-8",
                  rec ? "border-canary" : "border-canary/40",
                )}
              >
                {rec ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-canary px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-ink">
                    Recommended
                  </span>
                ) : null}
                <h3 className="font-display text-2xl uppercase">{p.name}</h3>
                <p className="page-title mt-1 font-display text-3xl uppercase text-canary">{p.cadence}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-paper/80">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-canary" strokeWidth={2} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-paper/70">{p.summary}</p>
                {p.id === "seeker" ? (
                  <a href={user ? "/dashboard" : "/register"} className={cn(buttonVariants({ variant: "dark" }), "mt-8 w-full")}>
                    {user ? "Open the dashboard" : "Sign up free"}
                  </a>
                ) : !user ? (
                  <a
                    href={`/register?gate=${p.id}`}
                    className={cn(buttonVariants({ variant: rec ? "lime" : "dark" }), "mt-8 w-full")}
                  >
                    {p.id === "patron" ? "Join as Patron" : "Join the Academy"}
                  </a>
                ) : (
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: rec ? "lime" : "dark" }), "mt-8 w-full")}
                    onClick={() => openGate(p.id === "patron" ? "patron" : "initiate")}
                  >
                    {current ? "Current path" : "Ascend"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const subscribed = useTemple((s) => s.subscribed);
  const setSubscribed = useTemple((s) => s.setSubscribed);
  const [email, setEmail] = useState("");
  const spam = useSpamSeal();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("A true address, or none.");
      return;
    }
    void withRecaptcha(spam, "newsletter")
      .then((seal) => {
        if (seal.company.trim()) return;
        return joinFlame({ data: { email, ...seal } });
      })
      .then((saved) => {
        if (!saved) return;
        setSubscribed(true);
        toast.success("The flame has your name.");
      })
      .catch(() => toast.error("The gate did not open."));
  }

  return (
    <section className="relative overflow-hidden border-y border-pink/40 bg-night text-paper">
      <Send
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-8 size-[36vw] max-w-none text-pink/15"
        strokeWidth={0.6}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-title uppercase leading-none">Follow the flame</h2>
        <div className="mx-auto mt-6 h-px w-16 bg-pink" />
        <p className="mt-6 text-sm uppercase tracking-wide text-paper/70">
          New rites, sacred texts, academy releases, mission updates, and invitations—sent directly to your
          sanctuary.
        </p>
        {subscribed ? (
          <p className="mt-10 text-sm text-lime">You are on the wall.</p>
        ) : (
          <form onSubmit={submit} className="relative mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
            <SpamFields company={spam.company} setCompany={spam.setCompany} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR@EMAIL.COM"
              className="h-16 flex-1 border-2 border-pink bg-transparent px-5 text-base uppercase tracking-wide text-paper outline-none placeholder:text-paper/35"
              aria-label="Email"
            />
            <Button type="submit" variant="pink" className="h-16 px-8">
              Follow the flame
            </Button>
          </form>
        )}
        <p className="mt-4 text-[10px] uppercase tracking-wide text-paper/40">
          No spam. No fluff. Only flame.
        </p>
      </div>
    </section>
  );
}

export function AltarBlock() {
  const addOffering = useTemple((s) => s.addOffering);
  const flameName = useTemple((s) => s.flameName);
  const [picked, setPicked] = useState<(typeof OFFERINGS)[number]["id"]>("ember");
  const [custom, setCustom] = useState("");
  const gift = OFFERINGS.find((o) => o.id === picked) ?? OFFERINGS[0];
  const named = Math.round(Number(custom));
  const usingCustom = custom.trim() !== "";

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <p className="text-micro font-medium uppercase tracking-wide text-orange">◆ The offering altar ◆</p>
        <h2 className="mt-6 font-display text-title uppercase leading-none">
          Cast your offering into the flame.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-sm uppercase tracking-wide text-paper">
          Choose the weight. Nothing opens until you cast it.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OFFERINGS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setPicked(o.id)}
              className={cn(
                "border px-2 py-3 text-paper",
                picked === o.id ? "border-orange bg-orange text-white" : "border-orange/70 hover:border-orange",
              )}
            >
              <span className="block font-sans text-[11px] font-light uppercase">{o.name}</span>
              <span className="mt-1 block font-mono text-sm">${o.amount}</span>
            </button>
          ))}
        </div>
        <label className="mx-auto mt-4 block max-w-xs text-left">
          <span className="text-[10px] uppercase tracking-wide text-orange">Or name your amount</span>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="font-mono text-lg text-orange">$</span>
            <input
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="1"
              aria-label="Your amount"
              className="h-12 w-28 border border-orange bg-transparent px-3 text-center font-mono text-lg text-paper outline-none"
            />
          </div>
        </label>
        <div className="mt-6">
          <Button
            variant="lime"
            className="border-orange bg-orange text-white hover:bg-white hover:text-ink"
            onClick={() => {
              if (usingCustom && (!Number.isFinite(named) || named < 1)) {
                toast.error("Name at least $1.");
                return;
              }
              const amount = usingCustom ? named : gift.amount;
              const label = usingCustom ? "Your amount" : gift.name;
              addOffering({
                tier: label,
                amount,
                note: flameName.trim() || "Anonymous flame",
              });
              window.open(cashAppAmountUrl(amount), "_blank", "noopener,noreferrer");
            }}
          >
            Cast into the flame
          </Button>
          <p className="mt-2 text-[10px] font-normal tracking-wide text-paper">(Cashapp donations only)</p>
        </div>
      </div>
    </section>
  );
}
