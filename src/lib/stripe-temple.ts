import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { OFFERINGS } from "@/lib/temple-content";
import { shopSticker } from "@/lib/shop";
import { scholarshipCourse } from "@/lib/scholarship";
import { buildClassPdf } from "@/lib/class-pdf";
import electives from "@/lib/electives.json";

const PRICES = {
  initiate: 3300,
  patron: 10800,
} as const;

const LIVE_PRICES = {
  initiate: "price_1UL5PTFDEqpaC9skNKk5pqYQ",
  patron: "price_1UL5PQFDEqpaC9skFindkhe2",
} as const;

const PORTAL_CONFIGURATION = "bpc_1UL5gIFDEqpaC9skchIO5Fem";

const OFFERING_CENTS = new Set(OFFERINGS.map((o) => o.amount * 100));
const ELECTIVE_CENTS = new Set(electives.map((c) => Math.round(c.price * 100)));

async function assertChancellor(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role !== "chancellor") throw new Error("Chancellor only");
}

async function configValue(key: string) {
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`
    select value from integration_config where key = ${key} limit 1
  `;
  return row?.value?.trim() || "";
}

function readEnv(key: string) {
  const value = process.env[key]?.trim();
  return value || "";
}

export async function stripeSecret() {
  return (
    readEnv("STRIPE_SECRET_KEY") ||
    readEnv("STRIPE") ||
    readEnv("stripe") ||
    (await configValue("stripe_secret"))
  );
}

export async function stripeWebhookSecret() {
  return readEnv("STRIPE_WEBHOOK_SECRET") || (await configValue("stripe_webhook"));
}

function mask(secret: string) {
  if (!secret) return "";
  return `${secret.slice(0, 7)}…${secret.slice(-4)}`;
}

async function stripeForm(path: string, body: URLSearchParams) {
  const key = await stripeSecret();
  if (!key) throw new Error("Stripe is not connected. Open the Chancellor desk and paste the secret key.");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as { error?: { message?: string }; url?: string; id?: string };
  if (!res.ok) throw new Error(json.error?.message || "Stripe refused the request");
  return json;
}

async function stripeGet(path: string) {
  const key = await stripeSecret();
  if (!key) throw new Error("Stripe is not connected");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const json = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message || "Stripe refused the request");
  return json;
}

type Session = {
  id: string;
  payment_status?: string;
  status?: string;
  mode?: string;
  amount_total?: number;
  currency?: string;
  customer?: string | null;
  subscription?: string | null;
  customer_email?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string>;
  ship_name?: string;
  ship_email?: string;
  ship_line?: string;
  ship_city?: string;
  ship_region?: string;
  ship_zip?: string;
  ship_country?: string;
};

type StripeAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type ShipBlock = { name?: string | null; address?: StripeAddress | null } | null | undefined;

export function sessionShip(raw: {
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  shipping_details?: ShipBlock;
  shipping?: ShipBlock;
  collected_information?: { shipping_details?: ShipBlock } | null;
}) {
  const ship = raw.shipping_details || raw.shipping || raw.collected_information?.shipping_details || null;
  const address = ship?.address;
  return {
    ship_name: ship?.name || raw.customer_details?.name || "",
    ship_email: raw.customer_details?.email || raw.customer_email || "",
    ship_line: [address?.line1, address?.line2].filter(Boolean).join(", "),
    ship_city: address?.city || "",
    ship_region: address?.state || "",
    ship_zip: address?.postal_code || "",
    ship_country: address?.country || "",
  };
}

async function saveGoods(session: Session, userId: string) {
  const item = shopSticker(session.metadata?.sku || "");
  if (!item || !session.id) return;
  const sql = await getSql();
  const email = (session.ship_email || session.customer_email || "").slice(0, 200);
  await sql`
    insert into shop_order (
      id, user_id, email, name, sku, title, amount, ship_line, city, region, zip, country, status
    ) values (
      ${session.id},
      ${userId},
      ${email},
      ${(session.ship_name || "").slice(0, 120)},
      ${item.id},
      ${item.name},
      ${session.amount_total || item.price * 100},
      ${(session.ship_line || "").slice(0, 200)},
      ${(session.ship_city || "").slice(0, 80)},
      ${(session.ship_region || "").slice(0, 40)},
      ${(session.ship_zip || "").slice(0, 20)},
      ${(session.ship_country || "").slice(0, 8)},
      ${"paid"}
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into stripe_payment (id, user_id, email, kind, label, amount, currency, status)
    values (
      ${session.id},
      ${userId},
      ${email},
      ${"goods"},
      ${item.name},
      ${session.amount_total || item.price * 100},
      ${session.currency || "usd"},
      ${"paid"}
    )
    on conflict (id) do nothing
  `;
}

export async function applyStripeSession(session: Session) {
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) return { ok: false as const };
  const rawUser = session.metadata?.userId || "";
  const ref = session.client_reference_id || "";
  const userId = rawUser || (ref && ref !== "guest" ? ref : "");
  const kind = session.metadata?.kind || "offering";
  if (kind === "goods") {
    await saveGoods(session, userId);
    return { ok: true as const, tier: "" };
  }
  if (!userId) return { ok: false as const };
  const tier = session.metadata?.tier || "";
  const label = session.metadata?.label || kind;
  const sql = await getSql();
  if (kind === "membership" && (tier === "initiate" || tier === "patron")) {
    const existing = await sql<{ id: string; role: string }>`
      select id, coalesce(role, 'member') as role from user_membership where user_id = ${userId} limit 1
    `;
    const customer = session.customer || "";
    const subscription = session.subscription || "";
    if (!existing[0]) {
      await sql`
        insert into user_membership (id, user_id, tier, status, stripe_customer, stripe_subscription, billing_status, access_source)
        values (${crypto.randomUUID()}, ${userId}, ${tier}, ${"active"}, ${customer}, ${subscription}, ${"paying"}, ${"subscription"})
      `;
    } else if (existing[0].role !== "chancellor") {
      await sql`
        update user_membership
        set tier = ${tier},
            status = 'active',
            stripe_customer = ${customer},
            stripe_subscription = ${subscription},
            billing_status = 'paying',
            access_source = 'subscription'
        where user_id = ${userId}
      `;
    } else {
      await sql`
        update user_membership
        set stripe_customer = ${customer},
            stripe_subscription = ${subscription},
            billing_status = 'paying',
            access_source = 'subscription'
        where user_id = ${userId}
      `;
    }
  }
  const flame = session.metadata?.flame === "1" || kind === "flame";
  const membershipCents = kind === "membership" ? PRICES[tier as "initiate" | "patron"] || 0 : 0;
  if (kind === "membership" && membershipCents) {
    await sql`
      insert into stripe_payment (id, user_id, email, kind, label, amount, currency, status)
      values (${session.id}, ${userId}, ${session.customer_email || ""}, ${"membership"}, ${label.slice(0, 160)}, ${membershipCents}, ${session.currency || "usd"}, ${"paid"})
      on conflict (id) do nothing
    `;
  }
  if (flame) {
    await sql`
      insert into stripe_payment (id, user_id, email, kind, label, amount, currency, status)
      values (${`${session.id}:flame`}, ${userId}, ${session.customer_email || ""}, ${"flame"}, ${"Pass the Flame"}, ${2200}, ${session.currency || "usd"}, ${"paid"})
      on conflict (id) do nothing
    `;
    const { activateSponsorship } = await import("@/lib/flame");
    await activateSponsorship({ userId, subscription: session.subscription || "", sessionId: session.id });
  }
  if (kind !== "membership" && !flame) {
    await sql`
      insert into stripe_payment (id, user_id, email, kind, label, amount, currency, status)
      values (${session.id}, ${userId}, ${session.customer_email || ""}, ${kind}, ${label.slice(0, 160)}, ${Number(session.amount_total || 0)}, ${session.currency || "usd"}, ${"paid"})
      on conflict (id) do nothing
    `;
  }
  const bought = paidClassCode(session);
  if (bought) {
    await sql`
      insert into class_pass (user_id, code, payment_id)
      values (${userId}, ${bought}, ${session.id})
      on conflict (user_id, code) do nothing
    `;
  }
  return { ok: true as const, tier };
}

export function paidClassCode(session: {
  metadata?: Record<string, string> | null;
  amount_total?: number | string | null;
}) {
  const kind = session.metadata?.kind || "";
  const code = (session.metadata?.code || "").trim().toUpperCase();
  const cents = Number(session.amount_total || 0);
  if (kind !== "elective" || !code || !(cents >= 1000)) return "";
  if (scholarshipCourse(code)) return code;
  const elective = electives.find((item) => item.slug.toUpperCase() === code);
  if (elective && cents === Math.round(elective.price * 100)) return elective.slug.toUpperCase();
  return "";
}

export const startStripeCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: { kind: "membership" | "offering" | "elective" | "manual" | "flame"; tier?: string; amount?: number; label: string; origin: string; code?: string; flame?: boolean }) =>
      d,
  )
  .handler(async ({ context, data }) => {
    const origin = data.origin.replace(/\/$/, "");
    if (!/^https?:\/\/[a-z0-9.:-]+$/i.test(origin)) throw new Error("Bad return address");
    const sql = await getSql();
    const [user] = await sql<{ email: string }>`select email from "user" where id = ${context.userId} limit 1`;
    const kind = data.kind;
    const requested = (data.code || "").trim().toUpperCase();
    let cents = 0;
    let mode: "payment" | "subscription" = "payment";
    let name = data.label.slice(0, 80) || "Temple offering";
    let tier = "";
    let classCode = "";
    let successPath = kind === "manual" ? "/cos" : "/dashboard";
    let cancelPath = kind === "membership" ? "/dashboard" : kind === "manual" ? "/cos" : "/altar";
    if (kind === "membership") {
      if (data.tier !== "initiate" && data.tier !== "patron") throw new Error("Unknown gate");
      tier = data.tier;
      cents = PRICES[data.tier];
      mode = "subscription";
      name = tier === "initiate" ? "Academy membership" : "Patron membership";
    } else if (kind === "flame") {
      cents = 2200;
      mode = "subscription";
      name = "Pass the Flame";
    } else if (kind === "offering") {
      cents = Math.round(Number(data.amount) || 0) * 100;
      if (!OFFERING_CENTS.has(cents)) throw new Error("Unknown offering");
    } else if (kind === "manual") {
      cents = Math.round(Number(data.amount) || 0) * 100;
      if (cents < 100) throw new Error("Name at least $1");
      name = "The Cosmic Operating System";
    } else if (electives.some((item) => item.slug.toUpperCase() === requested)) {
      const elective = electives.find((item) => item.slug.toUpperCase() === requested);
      if (!elective) throw new Error("Unknown class");
      cents = Math.round(elective.price * 100);
      classCode = elective.slug.toUpperCase();
      name = elective.title.slice(0, 80);
      successPath = "/classes";
      cancelPath = "/classes";
    } else if (requested) {
      const course = scholarshipCourse(requested);
      if (!course) throw new Error("Unknown class");
      if (course.free) throw new Error("That class is already open");
      cents = 1000;
      classCode = course.id;
      name = `${course.id} ${course.title}`.slice(0, 80);
      successPath = `/academy/${course.id}`;
      cancelPath = `/academy/${course.id}`;
    } else {
      cents = Math.round(Number(data.amount) || 0) * 100;
      if (cents !== 1000 && !ELECTIVE_CENTS.has(cents)) throw new Error("Unknown class");
    }
    const body = new URLSearchParams();
    body.set("mode", mode);
    body.set("success_url", `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${origin}${cancelPath}`);
    body.set("client_reference_id", context.userId);
    body.set("metadata[userId]", context.userId);
    body.set("metadata[kind]", kind);
    body.set("metadata[tier]", tier);
    body.set("metadata[label]", name);
    if (classCode) body.set("metadata[code]", classCode);
    if (kind === "flame" || (kind === "membership" && data.flame && tier === "initiate")) body.set("metadata[flame]", "1");
    if (user?.email) body.set("customer_email", user.email);
    body.set("managed_payments[enabled]", "false");
    body.set("line_items[0][quantity]", "1");
    const key = await stripeSecret();
    const livePrice = mode === "subscription" && key.startsWith("sk_live_") ? LIVE_PRICES[tier as "initiate" | "patron"] : "";
    if (livePrice) {
      body.set("line_items[0][price]", livePrice);
    } else {
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(cents));
      body.set("line_items[0][price_data][product_data][name]", name);
      body.set("line_items[0][price_data][product_data][tax_code]", "txcd_10000000");
      if (mode === "subscription") body.set("line_items[0][price_data][recurring][interval]", "month");
    }
    if (kind === "membership" && data.flame && tier === "initiate") {
      body.set("line_items[1][quantity]", "1");
      body.set("line_items[1][price_data][currency]", "usd");
      body.set("line_items[1][price_data][unit_amount]", "2200");
      body.set("line_items[1][price_data][product_data][name]", "Pass the Flame");
      body.set("line_items[1][price_data][product_data][tax_code]", "txcd_10000000");
      body.set("line_items[1][price_data][recurring][interval]", "month");
    }
    const session = await stripeForm("checkout/sessions", body);
    if (!session.url) throw new Error("Stripe did not return a checkout link");
    return { url: session.url };
  });

export const startShopCheckout = createServerFn({ method: "POST" })
  .validator((d: { sku: string; origin: string }) => d)
  .handler(async ({ data }) => {
    const item = shopSticker(data.sku);
    if (!item) throw new Error("That piece is not on the shelf");
    const origin = data.origin.replace(/\/$/, "");
    if (!/^https?:\/\/[a-z0-9.:-]+$/i.test(origin)) throw new Error("Bad return address");
    let userId = "";
    let email = "";
    try {
      const { getSessionUser } = await import("@/lib/auth/verify.server");
      const user = await getSessionUser();
      userId = user?.id ?? "";
      email = user?.email ?? "";
    } catch {
      userId = "";
    }
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${origin}/shop?session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${origin}/shop`);
    body.set("client_reference_id", userId || "guest");
    body.set("metadata[userId]", userId);
    body.set("metadata[kind]", "goods");
    body.set("metadata[sku]", item.id);
    body.set("metadata[label]", item.name);
    if (email) body.set("customer_email", email);
    body.set("managed_payments[enabled]", "false");
    body.set("shipping_address_collection[allowed_countries][0]", "US");
    body.set("phone_number_collection[enabled]", "true");
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(item.price * 100));
    body.set("line_items[0][price_data][product_data][name]", `${item.name} sticker`);
    body.set("line_items[0][price_data][product_data][tax_code]", "txcd_99999999");
    const session = await stripeForm("checkout/sessions", body);
    if (!session.url) throw new Error("Stripe did not return a checkout link");
    return { url: session.url };
  });

export const confirmShopSession = createServerFn({ method: "POST" })
  .validator((sessionId: string) => sessionId)
  .handler(async ({ data }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data)) throw new Error("Bad session");
    const raw = (await stripeGet(`checkout/sessions/${data}`)) as Session & Parameters<typeof sessionShip>[0];
    return applyStripeSession({ ...raw, ...sessionShip(raw) });
  });

export const listShopOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    return sql<{
      id: string;
      email: string;
      name: string;
      title: string;
      amount: number;
      ship_line: string;
      city: string;
      region: string;
      zip: string;
      country: string;
      status: string;
      created_at: string;
    }>`
      select id, email, name, title, amount, ship_line, city, region, zip, country, status, created_at::text as created_at
      from shop_order
      order by created_at desc
      limit 80
    `;
  });

export const markShopMailed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    await sql`update shop_order set status = 'mailed' where id = ${data}`;
    return { ok: true as const };
  });

export const confirmStripeSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sessionId: string) => sessionId)
  .handler(async ({ context, data }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data)) throw new Error("Bad session");
    const session = (await stripeGet(`checkout/sessions/${data}`)) as Session;
    const owner = session.metadata?.userId || session.client_reference_id;
    if (owner !== context.userId) throw new Error("That receipt belongs to another seeker");
    return applyStripeSession(session);
  });

export const openBillingPortal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((origin: string) => origin)
  .handler(async ({ context, data }) => {
    const origin = data.replace(/\/$/, "");
    if (!/^https?:\/\/[a-z0-9.:-]+$/i.test(origin)) throw new Error("Bad return address");
    const sql = await getSql();
    const [row] = await sql<{ stripe_customer: string }>`
      select coalesce(stripe_customer, '') as stripe_customer
      from user_membership
      where user_id = ${context.userId}
      order by since desc
      limit 1
    `;
    const customer = row?.stripe_customer?.trim() || "";
    if (!customer.startsWith("cus_")) throw new Error("A paid gate has to open before the billing portal does.");
    const body = new URLSearchParams();
    body.set("customer", customer);
    body.set("return_url", `${origin}/dashboard`);
    body.set("configuration", PORTAL_CONFIGURATION);
    const session = await stripeForm("billing_portal/sessions", body);
    if (!session.url) throw new Error("Stripe did not open the portal");
    return { url: session.url };
  });

export const saveStripeKeys = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { secret: string; webhook: string }) => d)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    const secret = data.secret.trim();
    const webhook = data.webhook.trim();
    if (secret && !/^sk_(test|live)_/.test(secret)) throw new Error("The secret key should start with sk_test_ or sk_live_");
    if (webhook && !webhook.startsWith("whsec_")) throw new Error("The webhook secret should start with whsec_");
    if (secret) {
      await sql`
        insert into integration_config (key, value) values ('stripe_secret', ${secret})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (webhook) {
      await sql`
        insert into integration_config (key, value) values ('stripe_webhook', ${webhook})
        on conflict (key) do update set value = excluded.value
      `;
    }
    return { ok: true as const };
  });

export async function syncStripeSubscription(subscriptionId: string, priceId: string) {
  if (!subscriptionId) return;
  const tier = priceId === LIVE_PRICES.patron ? "patron" : priceId === LIVE_PRICES.initiate ? "initiate" : "";
  if (!tier) return;
  const sql = await getSql();
  await sql`
    update user_membership
    set tier = ${tier}, status = 'active', billing_status = 'paying', access_source = 'subscription'
    where stripe_subscription = ${subscriptionId}
      and coalesce(role, 'member') <> 'chancellor'
  `;
}

export async function cancelStripeSubscription(subscriptionId: string) {
  if (!subscriptionId) return;
  const sql = await getSql();
  await sql`
    update user_membership
    set tier = 'seeker', status = 'canceled', stripe_subscription = '', billing_status = 'canceled'
    where stripe_subscription = ${subscriptionId}
      and coalesce(role, 'member') <> 'chancellor'
      and coalesce(scholarship, false) = false
  `;
}

export const ownedClassCodes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const passes = await sql<{ code: string }>`
      select code from class_pass where user_id = ${context.userId}
    `;
    const legacy = await sql<{ id: string; label: string }>`
      select id, label from stripe_payment
      where user_id = ${context.userId} and kind = 'elective' and amount >= 1000 and status = 'paid'
    `;
    const codes = new Set(passes.map((row) => row.code.toUpperCase()));
    for (const row of legacy) {
      const token = row.label.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
      if (!scholarshipCourse(token) || codes.has(token)) continue;
      codes.add(token);
      await sql`
        insert into class_pass (user_id, code, payment_id)
        values (${context.userId}, ${token}, ${row.id})
        on conflict (user_id, code) do nothing
      `;
    }
    return [...codes];
  });

export const downloadElectivePdf = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((code: string) => code)
  .handler(async ({ context, data }) => {
    const slug = data.trim().toUpperCase();
    const item = electives.find((row) => row.slug.toUpperCase() === slug);
    if (!item) throw new Error("Unknown class");
    const sql = await getSql();
    const [pass] = await sql<{ code: string }>`
      select code from class_pass where user_id = ${context.userId} and upper(code) = ${slug} limit 1
    `;
    if (!pass) throw new Error("Buy the class first");
    const pdf = buildClassPdf(item.title, item.description);
    const bytes = new TextEncoder().encode(pdf);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return { name: `${item.slug}.pdf`, pdf: btoa(binary) };
  });

export const myClassPurchases = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const [row] = await sql<{ n: number }>`
      select count(*)::int as n
      from stripe_payment
      where user_id = ${context.userId}
        and kind = 'elective'
        and amount >= 1000
        and amount < 3500
        and status = 'paid'
    `;
    return row?.n ?? 0;
  });

export async function stripeDesk() {
  const secret = await stripeSecret();
  const webhook = await stripeWebhookSecret();
  const sql = await getSql();
  const payments = await sql<{
    id: string;
    email: string;
    kind: string;
    label: string;
    amount: number;
    status: string;
    created_at: string;
  }>`
    select id, email, kind, label, amount, status, created_at::text as created_at
    from stripe_payment
    order by created_at desc
    limit 40
  `;
  return {
    connected: Boolean(secret),
    webhook: Boolean(webhook),
    masked: mask(secret),
    initiate: PRICES.initiate,
    patron: PRICES.patron,
    payments,
  };
}

export const cancelFlame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const [row] = await sql<{ stripe_subscription: string }>`
      select stripe_subscription from flame_sponsor
      where user_id = ${context.userId} and status in ('active', 'past_due', 'paused')
      limit 1
    `;
    if (!row?.stripe_subscription) throw new Error("No active sponsorship to cancel");
    const [membership] = await sql<{ stripe_subscription: string }>`
      select coalesce(stripe_subscription, '') as stripe_subscription from user_membership where user_id = ${context.userId} limit 1
    `;
    const same = membership?.stripe_subscription === row.stripe_subscription;
    const key = await stripeSecret();
    if (!key) throw new Error("Stripe is not connected");
    if (same) {
      const sub = (await stripeGet(`subscriptions/${row.stripe_subscription}`)) as {
        items?: { data?: { id: string; price?: { unit_amount?: number } }[] };
      };
      const item = sub.items?.data?.find((entry) => entry.price?.unit_amount === 2200);
      if (!item) throw new Error("The $22 item was not on the subscription. The Academy charge was left untouched.");
      const res = await fetch(`https://api.stripe.com/v1/subscription_items/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error("Stripe did not remove the sponsorship");
    } else {
      const res = await fetch(`https://api.stripe.com/v1/subscriptions/${row.stripe_subscription}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error("Stripe did not cancel the sponsorship");
    }
    const { endFlameBySubscription } = await import("@/lib/flame");
    await endFlameBySubscription(row.stripe_subscription);
    return { ok: true as const };
  });
