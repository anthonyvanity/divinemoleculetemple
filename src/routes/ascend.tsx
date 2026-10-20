import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  const [err, setErr] = useState("");
  const started = useRef(false);

  function open() {
    if (gate !== "initiate" && gate !== "patron") {
      window.location.replace("/gates");
      return;
    }
    setErr("");
    void startStripeCheckout({
      data: { kind: "membership", tier: gate, label: gate, origin: window.location.origin },
    })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch((error: Error) => {
        started.current = false;
        setErr(error.message || "Stripe did not open");
      });
  }

  useEffect(() => {
    if (isPending || started.current) return;
    if (!user) {
      window.location.replace(gate ? `/register?gate=${gate}` : "/register");
      return;
    }
    started.current = true;
    open();
    // open reads the current gate once the session is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, user, gate]);

  return (
    <main className="grid min-h-[40dvh] place-items-center bg-ink px-4 text-center text-paper">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-lime">
          {err ? "The gate held" : "Opening the paid gate…"}
        </p>
        {err ? <p className="mt-3 max-w-md text-sm text-paper/70">{err}</p> : null}
        {err ? (
          <Button type="button" variant="lime" className="mt-6" onClick={open}>
            Try the card again
          </Button>
        ) : null}
      </div>
    </main>
  );
}
