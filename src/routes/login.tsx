import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthFooter,
  AuthPortal,
  ProviderButtons,
  onAuthSubmit,
  signInEmail,
} from "@/components/auth-portal";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Popup } from "@/components/popup";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const asked = new URLSearchParams(searchStr).get("next") || "";
  const next = asked.startsWith("/") && !asked.startsWith("//") ? asked : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isPending && user) return <Navigate to={next} />;

  return (
    <Popup>
    <AuthPortal
      kicker="Clearance point"
      sector="Academy"
      status="Status · Awaiting authorization"
      title="Academy clearance"
      lede={next.includes("buy=1") ? "Sign in. The $10 charge for this class opens next." : "Present credentials to enter the sanctuary."}
    >
      <ProviderButtons callbackURL={next} />
      <p className="mt-6 text-center text-[10px] tracking-[0.3em] text-paper/35">Or</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={onAuthSubmit(() => signInEmail(email, password), setErr, setBusy, next)}
      >
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] text-paper/45">Password</span>
            <button
              type="button"
              className="text-[10px] tracking-[0.2em] text-paper/45 hover:text-lime"
              onClick={() =>
                setErr("If an account exists with that email, a reset link is sent from the Temple.")
              }
            >
              Forgot?
            </button>
          </div>
          <AuthField label="" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {err ? <p className="text-[11px] text-pink">{err}</p> : null}
        <Button type="submit" variant="lime" className="w-full" disabled={busy || !authEnabled}>
          {busy ? "Transmitting…" : "Request clearance"}
        </Button>
      </form>
      <AuthFooter to="/register" prompt="No clearance?" action="Become a Seeker" />
    </AuthPortal>
    </Popup>
  );
}
