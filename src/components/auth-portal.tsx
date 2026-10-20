import { type FormEvent, type ReactNode, useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { SentenceLines } from "@/components/chamber";
import { cn } from "@/lib/utils";

export function AuthPortal({
  kicker,
  sector,
  status,
  title,
  lede,
  submit,
  children,
  footer,
}: {
  kicker: string;
  sector: string;
  status: string;
  title: string;
  lede: string;
  submit?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative mx-auto w-full max-w-md text-paper">
      <div className="relative w-full border border-lime/40 bg-ink/95 p-8">
        <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-lime">
          <span>{kicker}</span>
          <span>Encrypted · TLS</span>
        </div>
        <p className="mt-2 text-[10px] tracking-[0.2em] text-paper/45">
          {sector}
          <span className="mx-2 text-lime">/</span>
          {status}
        </p>
        <img src="/hex-seal.webp" alt="" className="mx-auto mt-8 size-16 object-contain" />
        <p className="mt-4 text-center font-lulo text-[10px] font-extrabold tracking-wide text-gold">
          The Divine Molecule Temple
        </p>
        <h1 className="mt-6 text-center font-display text-3xl leading-none">{title}</h1>
        <p className="mt-4 text-center text-sm text-paper/65">
          <SentenceLines text={lede} />
        </p>
        {children}
        {submit}
        {footer}
      </div>
    </main>
  );
}

export function ProviderButtons({ callbackURL, before }: { callbackURL: string; before?: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!authEnabled) {
    return <p className="mt-6 text-center text-sm text-paper/50">Clearance is offline on this node.</p>;
  }
  return (
    <div className="mt-8 space-y-2">
      {GROK_PROVIDERS.map((p) => (
        <button
          key={p.providerId}
          type="button"
          disabled={busy !== null}
          onClick={() => {
            before?.();
            setErr(null);
            setBusy(p.providerId);
            void signIn(p.providerId, { callbackURL, errorCallbackURL: "/login" }).catch((e: Error) => {
              setErr(e.message);
              setBusy(null);
            });
          }}
          className="flex h-11 w-full items-center justify-center border border-lime/50 text-[11px] tracking-[0.16em] hover:bg-lime hover:text-ink disabled:opacity-50"
        >
          {busy === p.providerId ? "Opening…" : `Continue with ${p.label}`}
        </button>
      ))}
      {err ? <p className="text-center text-[11px] text-pink">{err}</p> : null}
    </div>
  );
}

export function AuthField({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      {label ? <span className="text-[10px] tracking-[0.2em] text-paper/45">{label}</span> : null}
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-2 h-12 w-full border border-lime/40 bg-transparent px-4 text-base outline-none focus:border-lime",
          type === "password" ? "normal-case" : "",
        )}
        style={type === "password" ? { textTransform: "none" } : undefined}
      />
    </label>
  );
}

export async function signInEmail(email: string, password: string) {
  const { error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message ?? "Clearance denied");
}

export async function signUpEmail(email: string, password: string, name: string) {
  const { error } = await authClient.signUp.email({ email, password, name });
  if (error) throw new Error(error.message ?? "Initiation failed");
}

export function onAuthSubmit(
  run: () => Promise<void>,
  setErr: (s: string | null) => void,
  setBusy: (b: boolean) => void,
  dest = "/dashboard",
) {
  return (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    void run()
      .then(() => {
        window.location.href = dest;
      })
      .catch((err: Error) => {
        setErr(err.message);
        setBusy(false);
      });
  };
}

export function AuthFooter({ to, prompt, action }: { to: string; prompt: string; action: string }) {
  return (
    <p className="mt-8 text-center text-[11px] tracking-[0.16em] text-paper/50">
      {prompt}{" "}
      <a href={to} className="text-lime hover:text-paper">
        {action}
      </a>
    </p>
  );
}
