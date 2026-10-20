import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adoptBearer, authClient } from "@/lib/auth/client";
import { issueBridge, redeemBridge } from "@/lib/auth/bridge";
import { houseReturnUrl } from "@/lib/vault-gate";

export const Route = createFileRoute("/auth/bridge")({ component: BridgePage });

function safePath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function BridgePage() {
  const [note, setNote] = useState("Returning you to the Temple…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("ticket");
    const to = params.get("to");
    if (ticket) {
      void redeemBridge({ data: ticket })
        .then(async (res) => {
          if (res.token) adoptBearer(res.token);
          try {
            await authClient.getSession();
          } catch {
            /* cookie or bearer will be read on the next page */
          }
          window.location.replace(safePath(to));
        })
        .catch(() => {
          setNote("The handoff expired. Sign in again on this domain.");
          window.setTimeout(() => window.location.replace("/login"), 900);
        });
      return;
    }
    const target = houseReturnUrl(to);
    if (!target) {
      window.location.replace(safePath(to));
      return;
    }
    if (target.origin === window.location.origin) {
      window.location.replace(`${target.pathname}${target.search}`);
      return;
    }
    void issueBridge({ data: true })
      .then(({ ticket: id }) => {
        const dest = new URL("/auth/bridge", target.origin);
        dest.searchParams.set("ticket", id);
        dest.searchParams.set("to", `${target.pathname}${target.search}`);
        window.location.replace(dest.href);
      })
      .catch(() => {
        setNote("Sign-in did not stick on this host.");
        window.location.replace(`${target.origin}/login`);
      });
  }, []);

  return (
    <main className="grid min-h-[40dvh] place-items-center bg-ink px-6 text-paper">
      <p className="text-[11px] uppercase tracking-[0.22em] text-lime">{note}</p>
    </main>
  );
}
