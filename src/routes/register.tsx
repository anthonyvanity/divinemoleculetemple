import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AuthField,
  AuthFooter,
  AuthPortal,
  ProviderButtons,
  onAuthSubmit,
  signUpEmail,
} from "@/components/auth-portal";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Popup } from "@/components/popup";
import { armFirstTour } from "@/lib/first-tour";

export const Route = createFileRoute("/register")({ component: Register });

function paidGate(searchStr: string) {
  const gate = new URLSearchParams(searchStr).get("gate");
  return gate === "initiate" || gate === "patron" ? gate : "";
}

function classBuy(searchStr: string) {
  const buy = (new URLSearchParams(searchStr).get("buy") || "").toUpperCase();
  return /^[A-Z]{1,6}-\d{2,4}$/.test(buy) ? buy : "";
}

function Register() {
  const { user, isPending } = useCurrentUserState();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const gate = paidGate(searchStr);
  const buy = classBuy(searchStr);
  const tour = gate === "initiate" ? "/dashboard?tour=1&gate=initiate" : "/dashboard?tour=1";
  const next = gate === "patron" ? "/ascend?gate=patron" : buy ? `/academy/${buy}?buy=1` : tour;
  const firstTime = next.startsWith("/dashboard?tour=1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    window.location.replace(next);
  }, [isPending, user, next]);

  if (!isPending && user) {
    return (
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-[10px] uppercase tracking-[0.22em] text-lime">Opening the gate…</p>
      </main>
    );
  }

  const title = gate === "patron" ? "Become a Patron" : gate === "initiate" ? "Join the Academy" : buy ? "This class is $10" : "Become a Seeker";
  const lede =
    gate === "patron"
      ? "Create the account. Stripe opens next. Patron is $108 a month."
      : gate === "initiate"
        ? "Create the account. A short tour of your desk, then the seven days. Academy is $33 a month when you open it."
        : buy
          ? "Create the account. The $10 charge for this class opens next."
          : "Create the account. Seeker is free. A short tour opens, then the seven days.";

  return (
    <Popup>
    <AuthPortal
      kicker="Initiation protocol"
      sector="Academy"
      status="Status · Awaiting credentials"
      title={title}
      lede={lede}
    >
      <ProviderButtons
        callbackURL={next}
        before={() => {
          if (firstTime) armFirstTour();
        }}
      />
      <p className="mt-6 text-center text-[10px] tracking-[0.3em] text-paper/35">Or</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={onAuthSubmit(async () => {
          if (password !== confirm) throw new Error("Passwords do not match");
          if (password.length < 8) throw new Error("Password must be at least 8 characters");
          await signUpEmail(email, password, email.split("@")[0] || "Seeker");
          if (firstTime) armFirstTour();
        }, setErr, setBusy, next)}
      >
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {err ? <p className="text-[11px] text-pink">{err}</p> : null}
        <Button type="submit" variant="lime" className="w-full" disabled={busy || !authEnabled}>
          {busy ? "Transmitting…" : gate || buy ? "Create account and pay" : "Request initiation"}
        </Button>
      </form>
      <AuthFooter
        to={buy ? `/login?next=${encodeURIComponent(`/academy/${buy}?buy=1`)}` : "/login"}
        prompt="Already initiated?"
        action="Return to the Temple"
      />
    </AuthPortal>
    </Popup>
  );
}
