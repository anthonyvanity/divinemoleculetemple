import { createFileRoute } from "@tanstack/react-router";
import {
  applyStripeSession,
  cancelStripeSubscription,
  sessionShip,
  stripeWebhookSecret,
  syncStripeSubscription,
} from "@/lib/stripe-temple";
import { verifyStripeSignature } from "@/lib/stripe-sign";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = await stripeWebhookSecret();
        const raw = await request.text();
        const header = request.headers.get("stripe-signature") || "";
        if (!secret || !verifyStripeSignature(raw, header, secret)) {
          return new Response("Unsigned", { status: 400 });
        }
        const event = JSON.parse(raw) as {
          type?: string;
          data?: { object?: Record<string, unknown> };
        };
        const object = event.data?.object ?? {};
        if (event.type === "checkout.session.completed") {
          const ship = sessionShip(object as Parameters<typeof sessionShip>[0]);
          await applyStripeSession({
            id: String(object.id ?? ""),
            payment_status: String(object.payment_status ?? ""),
            status: String(object.status ?? ""),
            mode: String(object.mode ?? ""),
            amount_total: Number(object.amount_total ?? 0),
            currency: String(object.currency ?? "usd"),
            customer: (object.customer as string | null) ?? null,
            subscription: (object.subscription as string | null) ?? null,
            customer_email:
              (object.customer_email as string | null) ??
              ((object.customer_details as { email?: string } | undefined)?.email ?? null),
            client_reference_id: (object.client_reference_id as string | null) ?? null,
            metadata: (object.metadata as Record<string, string>) ?? {},
            ...ship,
          });
        }
        if (event.type === "customer.subscription.deleted") {
          const id = String(object.id ?? "");
          await cancelStripeSubscription(id);
          const { endFlameBySubscription } = await import("@/lib/flame");
          await endFlameBySubscription(id);
        }
        if (event.type === "invoice.payment_failed") {
          const id = String(object.subscription ?? "");
          const { markFlamePastDue } = await import("@/lib/flame");
          await markFlamePastDue(id);
        }
        if (event.type === "customer.subscription.updated") {
          const items = object.items as { data?: { price?: { id?: string } }[] } | undefined;
          const priceId = items?.data?.[0]?.price?.id || "";
          await syncStripeSubscription(String(object.id ?? ""), priceId);
        }
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
