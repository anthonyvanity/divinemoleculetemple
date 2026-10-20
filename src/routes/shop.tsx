import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { STICKERS } from "@/lib/shop";
import { confirmShopSession, startShopCheckout } from "@/lib/stripe-temple";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  const [busy, setBusy] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (!id) return;
    void confirmShopSession({ data: id })
      .then(() => setPaid(true))
      .catch((error: Error) => toast.error(error.message || "The order did not land"))
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.pathname);
      });
  }, []);

  function buy(sku: string) {
    setBusy(sku);
    void startShopCheckout({ data: { sku, origin: window.location.origin } })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch((error: Error) => {
        setBusy("");
        toast.error(error.message || "Stripe did not open");
      });
  }

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="orange"
        icon="Sparkles"
        kicker="The shop"
        title="Stickers"
        lede={`The house marks, in vinyl.
Mailed in the United States.`}
      />

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionKicker>The shelf</SectionKicker>
          <p className="mt-3 max-w-2xl text-sm text-paper/70">
            What you pay supports the Temple. Five dollars. The full pack, forty. Postage is in the price.
          </p>
          {paid ? (
            <p className="mt-6 border border-lime/40 px-4 py-3 text-sm text-lime">Paid. It goes in the mail.</p>
          ) : null}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {STICKERS.map((item) => (
              <li key={item.id} className="flex flex-col border border-paper/15 p-5">
                <div className={item.art.length > 1 ? "grid grid-cols-3 gap-2" : ""}>
                  {item.art.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className={item.art.length > 1 ? "h-24 w-full object-contain" : "mx-auto h-52 w-full object-contain"}
                    />
                  ))}
                </div>
                <h2 className="mt-4 font-display text-2xl uppercase">{item.name}</h2>
                <p className="mt-2 flex-1 text-sm text-paper/70">{item.line}</p>
                <p className="mt-4 font-mono text-lg text-orange">${item.price}</p>
                <Button
                  type="button"
                  variant="lime"
                  className="mt-4"
                  disabled={busy === item.id}
                  onClick={() => buy(item.id)}
                >
                  {busy === item.id ? "Opening…" : "Buy"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
