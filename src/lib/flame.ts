import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { CONTACT_EMAIL } from "@/lib/temple-content";

const FLAME_CENTS = 2200;
const ACADEMY_CENTS = 3300;

async function assertPriest(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select coalesce(role, 'member') as role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role === "chancellor") return;
  const [staff] = await sql<{ role: string }>`select role from admin_staff where user_id = ${userId} limit 1`;
  if (staff && ["executive", "high_priest", "finance"].includes(staff.role)) return;
  throw new Error("Temple Command is closed");
}

async function audit(actorId: string, action: string, target: string) {
  const sql = await getSql();
  await sql`
    insert into admin_audit (id, actor_id, action, target)
    values (${crypto.randomUUID()}, ${actorId}, ${action}, ${target})
  `;
}

async function mail(to: string, subject: string, text: string) {
  const address = to.trim().toLowerCase();
  if (!address.includes("@")) return false;
  const fromEnv = process.env.RESEND_API_KEY?.trim() || "";
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`select value from integration_config where key = 'resend_key' limit 1`;
  const key = fromEnv || row?.value?.trim() || "";
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `The Divine Molecule Temple <${CONTACT_EMAIL}>`,
      to: [address],
      reply_to: CONTACT_EMAIL,
      subject,
      text,
    }),
  });
  return res.ok;
}

async function capacity() {
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`select value from integration_config where key = 'flame_capacity' limit 1`;
  const n = Number(row?.value ?? "");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

async function openAwards() {
  const sql = await getSql();
  const [row] = await sql<{ n: number }>`select count(*)::int as n from flame_award where status in ('active', 'grace')`;
  return row?.n ?? 0;
}

export async function activateSponsorship(input: { userId: string; subscription: string; sessionId: string; periodEnd?: string }) {
  if (!input.userId || !input.sessionId) return;
  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from flame_sponsor where stripe_session = ${input.sessionId} limit 1`;
  if (existing[0]) return;
  const open = await sql<{ id: string }>`
    select id from flame_sponsor where user_id = ${input.userId} and status in ('active', 'past_due', 'paused') limit 1
  `;
  if (open[0]) return;
  const id = crypto.randomUUID();
  await sql`
    insert into flame_sponsor (id, user_id, status, amount_cents, stripe_subscription, stripe_session, period_end)
    values (${id}, ${input.userId}, ${"active"}, ${FLAME_CENTS}, ${input.subscription || ""}, ${input.sessionId}, ${input.periodEnd || null})
  `;
  await audit(input.userId, "flame-paid", id);
  await matchNext();
}

export async function markFlamePastDue(subscriptionId: string) {
  if (!subscriptionId) return;
  const sql = await getSql();
  await sql`
    update flame_sponsor set status = 'past_due'
    where stripe_subscription = ${subscriptionId} and status = 'active'
  `;
  await audit("stripe", "flame-past-due", subscriptionId);
}

export async function endFlameBySubscription(subscriptionId: string) {
  if (!subscriptionId) return;
  const sql = await getSql();
  const [row] = await sql<{ id: string }>`
    select id from flame_sponsor where stripe_subscription = ${subscriptionId} and status in ('active', 'past_due', 'paused') limit 1
  `;
  if (!row) return;
  await closeSponsor(row.id, "stripe");
}

async function spareSponsor(notUserId: string) {
  const sql = await getSql();
  const [row] = await sql<{ id: string }>`
    select s.id
    from flame_sponsor s
    where s.status = 'active'
      and s.user_id <> ${notUserId}
      and not exists (
        select 1 from flame_award a
        where a.sponsor_id = s.id and a.status in ('active', 'grace')
      )
    order by s.started_at asc
    limit 1
  `;
  return row?.id ?? "";
}

async function moveAward(awardId: string, recipientId: string, sponsorId: string, actor: string) {
  const sql = await getSql();
  await sql`
    update flame_award
    set sponsor_id = ${sponsorId}, status = 'active', grace_until = null
    where id = ${awardId}
  `;
  const [user] = await sql<{ email: string }>`select email from "user" where id = ${recipientId} limit 1`;
  if (user?.email) {
    await mail(
      user.email,
      "Your scholarship continues",
      "Divinite,\n\nAnother funded place was open, so your Academy access continues. You still do not know who paid, and they do not know who you are. You will not be charged.\n\nRun light. Terminate darkness. Stay online.\n— Divine Molecule Temple",
    );
  }
  await audit(actor, "flame-reassign", recipientId);
}

async function closeSponsor(sponsorId: string, actor: string) {
  const sql = await getSql();
  const [owner] = await sql<{ user_id: string }>`select user_id from flame_sponsor where id = ${sponsorId} limit 1`;
  await sql`update flame_sponsor set status = 'canceled', canceled_at = now() where id = ${sponsorId}`;
  const grace = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const awards = await sql<{ id: string; recipient_id: string }>`
    select id, recipient_id from flame_award where sponsor_id = ${sponsorId} and status = 'active'
  `;
  for (const award of awards) {
    const spare = await spareSponsor(award.recipient_id);
    if (spare && spare !== sponsorId) {
      await moveAward(award.id, award.recipient_id, spare, actor);
      continue;
    }
    await sql`update flame_award set status = 'grace', grace_until = ${grace} where id = ${award.id}`;
    const [user] = await sql<{ email: string }>`select email from "user" where id = ${award.recipient_id} limit 1`;
    if (user?.email) {
      await mail(
        user.email,
        "Your scholarship has a grace period",
        "Divinite,\n\nThe sponsorship that opened your Academy access has ended, and no other funded place was free. Your access stays open for 14 days while the house keeps looking. You will not be charged.\n\nRun light. Terminate darkness. Stay online.\n— Divine Molecule Temple",
      );
    }
  }
  await audit(actor, "flame-canceled", owner?.user_id || sponsorId);
  await matchNext();
}

export async function matchNext() {
  const sql = await getSql();
  const waiting = await sql<{ id: string; recipient_id: string }>`
    select id, recipient_id from flame_award where status = 'grace' order by grace_until asc
  `;
  for (const award of waiting) {
    const spare = await spareSponsor(award.recipient_id);
    if (!spare) break;
    await moveAward(award.id, award.recipient_id, spare, "match");
  }
  const room = (await capacity()) - (await openAwards());
  if (room <= 0) return { matched: 0 };
  const sponsors = await sql<{ id: string }>`
    select s.id
    from flame_sponsor s
    where s.status = 'active'
      and not exists (
        select 1 from flame_award a where a.sponsor_id = s.id and a.status in ('active', 'grace')
      )
    order by s.started_at asc
  `;
  let matched = 0;
  for (const sponsor of sponsors) {
    if (matched >= room) break;
    const [spot] = await sql<{ user_id: string }>`
      select w.user_id
      from flame_waitlist w
      where w.status = 'approved'
        and not exists (
          select 1 from flame_award a where a.recipient_id = w.user_id and a.status in ('active', 'grace')
        )
      order by w.created_at asc
      limit 1
    `;
    if (!spot) break;
    const owner = await sql<{ user_id: string }>`select user_id from flame_sponsor where id = ${sponsor.id} limit 1`;
    if (owner[0]?.user_id === spot.user_id) continue;
    await giveAward({ recipientId: spot.user_id, sponsorId: sponsor.id, funding: "sponsored", actor: "match", reason: "Pass the Flame payment" });
    matched += 1;
  }
  return { matched };
}

async function giveAward(input: { recipientId: string; sponsorId: string; funding: string; actor: string; reason: string; expires?: string }) {
  const sql = await getSql();
  const [n] = await sql<{ n: number }>`select count(*)::int as n from flame_award`;
  const anon = `Seeker ${String((n?.n ?? 0) + 1).padStart(4, "0")}`;
  const id = crypto.randomUUID();
  await sql`
    insert into flame_award (id, sponsor_id, recipient_id, anon_code, status, funding, consent, reason, granted_by, expires)
    values (${id}, ${input.sponsorId}, ${input.recipientId}, ${anon}, ${"active"}, ${input.funding}, ${"private"}, ${input.reason.slice(0, 400)}, ${input.actor}, ${input.expires || null})
  `;
  await sql`update flame_waitlist set status = 'matched' where user_id = ${input.recipientId}`;
  const billing = input.funding === "promotional" ? "promotional" : input.funding === "temple" ? "temple" : input.funding === "complimentary" ? "complimentary" : "sponsored";
  const existing = await sql<{ id: string; role: string; stripe_subscription: string }>`
    select id, coalesce(role, 'member') as role, coalesce(stripe_subscription, '') as stripe_subscription
    from user_membership where user_id = ${input.recipientId} limit 1
  `;
  if (existing[0]?.role === "chancellor") return id;
  const keepPaying = Boolean(existing[0]?.stripe_subscription);
  if (!existing[0]) {
    await sql`
      insert into user_membership (id, user_id, tier, status, billing_status, access_source, grant_reason, granted_by, campaign)
      values (${crypto.randomUUID()}, ${input.recipientId}, ${"initiate"}, ${"active"}, ${billing}, ${"pass-the-flame"}, ${input.reason.slice(0, 400)}, ${input.actor}, ${"pass-the-flame"})
    `;
  } else if (!keepPaying) {
    await sql`
      update user_membership
      set tier = 'initiate', status = 'active', scholarship = false,
          billing_status = ${billing}, access_source = 'pass-the-flame',
          grant_reason = ${input.reason.slice(0, 400)}, granted_by = ${input.actor},
          campaign = 'pass-the-flame', suspended = false
      where user_id = ${input.recipientId}
    `;
  }
  const [user] = await sql<{ email: string }>`select email from "user" where id = ${input.recipientId} limit 1`;
  if (user?.email) {
    await mail(
      user.email,
      "A door has opened",
      "Divinite,\n\nSomeone in the congregation has chosen to pass the flame.\n\nAn anonymous member has sponsored your access to the Scholarship of the Enlightened.\n\nYour Academy scholarship is now active.\n\nNo payment required. No debt incurred. No obligation to your sponsor.\n\nYour next chapter begins here.\n\nhttps://dmttemple.com/dashboard\n\nRun light. Terminate darkness. Stay online.\n— Divine Molecule Temple",
    );
  }
  await audit(input.actor, "flame-award", input.recipientId);
  return id;
}

export const joinWaitlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const [paid] = await sql<{ stripe_subscription: string; billing_status: string }>`
      select coalesce(stripe_subscription, '') as stripe_subscription, coalesce(billing_status, '') as billing_status
      from user_membership where user_id = ${context.userId} limit 1
    `;
    if (paid?.stripe_subscription) throw new Error("A paying membership does not join the waiting list");
    if (["sponsored", "complimentary", "scholarship", "temple", "promotional"].includes(paid?.billing_status || "")) {
      throw new Error("You already have Academy access without a charge");
    }
    await sql`
      insert into flame_waitlist (user_id, status) values (${context.userId}, ${"pending"})
      on conflict (user_id) do update set status = case when flame_waitlist.status = 'removed' then 'pending' else flame_waitlist.status end
    `;
    const [user] = await sql<{ email: string }>`select email from "user" where id = ${context.userId} limit 1`;
    if (user?.email) {
      await mail(
        user.email,
        "You are on the scholarship list",
        "Divinite,\n\nYour request is registered. A scholarship is not guaranteed, and there is no promised wait. If a place opens, the house will write to you. You will not be charged.\n\nRun light. Terminate darkness. Stay online.",
      );
    }
    await audit(context.userId, "flame-wait", context.userId);
    return { ok: true as const };
  });

export const leaveWaitlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update flame_waitlist set status = 'removed' where user_id = ${context.userId} and status in ('pending', 'approved', 'held')`;
    return { ok: true as const };
  });

export const setFlameNotify = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => on)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update flame_waitlist set notify = ${data} where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const setFlameConsent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((consent: string) => consent)
  .handler(async ({ context, data }) => {
    const consent = ["private", "progress", "journey"].includes(data) ? data : "private";
    const sql = await getSql();
    await sql`
      update flame_award set consent = ${consent}
      where recipient_id = ${context.userId} and status in ('active', 'grace')
    `;
    await audit(context.userId, "flame-consent", consent);
    return { ok: true as const };
  });

export const sendFlameNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { body: string; from: "recipient" | "sponsor" }) => d)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 500);
    if (body.length < 2) throw new Error("Write the note");
    const sql = await getSql();
    const [award] = await sql<{ id: string }>`
      select a.id
      from flame_award a
      left join flame_sponsor s on s.id = a.sponsor_id
      where a.status in ('active', 'grace')
        and ((${data.from} = 'recipient' and a.recipient_id = ${context.userId}) or (${data.from} = 'sponsor' and s.user_id = ${context.userId}))
      limit 1
    `;
    if (!award) throw new Error("No active flame");
    await sql`
      insert into flame_message (id, award_id, from_role, body, status)
      values (${crypto.randomUUID()}, ${award.id}, ${data.from}, ${body}, ${"pending"})
    `;
    return { ok: true as const, status: "pending" as const };
  });

export const myFlame = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await expireGrace();
    const [sponsor] = await sql<{ id: string; status: string; amount_cents: number; period_end: string; started_at: string }>`
      select id, status, amount_cents, coalesce(period_end::text, '') as period_end, started_at::text as started_at
      from flame_sponsor where user_id = ${context.userId}
      order by started_at desc limit 1
    `;
    const [awardAsSponsor] = sponsor
      ? await sql<{ anon_code: string; status: string; consent: string; recipient_id: string }>`
          select anon_code, status, consent, recipient_id from flame_award
          where sponsor_id = ${sponsor.id} and status in ('active', 'grace') limit 1
        `
      : [];
    let progress: { course: string; lessons: number; books: number; milestones: string[] } | null = null;
    if (awardAsSponsor && awardAsSponsor.consent !== "private") {
      const [desk] = await sql<{ last_class: string }>`select coalesce(last_class, '') as last_class from member_desk where user_id = ${awardAsSponsor.recipient_id} limit 1`;
      const [lessons] = await sql<{ n: number }>`select count(*)::int as n from user_progress where user_id = ${awardAsSponsor.recipient_id} and status = 'complete'`;
      const [books] = await sql<{ n: number }>`select count(*)::int as n from reading_mark where user_id = ${awardAsSponsor.recipient_id}`;
      const done = lessons?.n ?? 0;
      const milestones: string[] = [];
      if (done >= 1) milestones.push("Their sponsored Seeker completed a lesson.");
      if (done >= 2) milestones.push("Their sponsored Seeker finished more than one class mark.");
      if ((books?.n ?? 0) >= 1) milestones.push("Their sponsored Seeker opened a book.");
      progress = { course: desk?.last_class || "", lessons: done, books: books?.n ?? 0, milestones };
    }
    const notes =
      awardAsSponsor && awardAsSponsor.consent === "journey"
        ? await sql<{ id: string; from_role: string; body: string; created_at: string }>`
            select id, from_role, body, created_at::text as created_at from flame_message
            where award_id = (select id from flame_award where sponsor_id = ${sponsor.id} and status in ('active','grace') limit 1)
              and status = 'released'
              and from_role = 'recipient'
            order by created_at desc limit 8
          `
        : [];
    const [mine] = await sql<{ status: string; created_at: string; notify: boolean }>`
      select status, created_at::text as created_at, notify from flame_waitlist where user_id = ${context.userId} limit 1
    `;
    const [received] = await sql<{ status: string; funding: string; consent: string; grace_until: string }>`
      select status, funding, consent, coalesce(grace_until::text, '') as grace_until
      from flame_award where recipient_id = ${context.userId} and status in ('active', 'grace') limit 1
    `;
    const [billing] = await sql<{ billing_status: string; tier: string; stripe_subscription: string }>`
      select coalesce(billing_status, '') as billing_status, coalesce(tier, 'seeker') as tier, coalesce(stripe_subscription, '') as stripe_subscription
      from user_membership where user_id = ${context.userId} limit 1
    `;
    return {
      sponsor: sponsor
        ? {
            status: sponsor.status,
            amountCents: sponsor.amount_cents,
            periodEnd: sponsor.period_end,
            startedAt: sponsor.started_at,
            assignment: awardAsSponsor ? awardAsSponsor.status : "unassigned",
            anon: awardAsSponsor?.anon_code || "",
            consent: awardAsSponsor?.consent || "",
            progress,
            notes: notes.map((note) => ({ from: note.from_role, body: note.body, at: note.created_at })),
          }
        : null,
      waitlist: mine ?? null,
      received: received ?? null,
      billing: billing?.billing_status || "",
      paying: Boolean(billing?.stripe_subscription),
      tier: billing?.tier || "seeker",
    };
  });

async function expireGrace() {
  const sql = await getSql();
  const due = await sql<{ id: string; recipient_id: string }>`
    select id, recipient_id from flame_award
    where status = 'grace' and grace_until is not null and grace_until < current_date
  `;
  for (const award of due) {
    const spare = await spareSponsor(award.recipient_id);
    if (spare) {
      await moveAward(award.id, award.recipient_id, spare, "grace");
      continue;
    }
    await sql`update flame_award set status = 'ended' where id = ${award.id}`;
    await sql`
      update user_membership
      set tier = 'seeker', billing_status = 'inactive', access_source = 'pass-the-flame-ended'
      where user_id = ${award.recipient_id}
        and coalesce(stripe_subscription, '') = ''
        and billing_status in ('sponsored', 'temple', 'complimentary', 'promotional')
    `;
    const [user] = await sql<{ email: string }>`select email from "user" where id = ${award.recipient_id} limit 1`;
    if (user?.email) {
      await mail(user.email, "The scholarship has closed", "Divinite,\n\nThe grace period ended. Academy access from this scholarship is closed. You have not been charged. The waiting list is open if you want to ask again.\n\nRun light. Terminate darkness. Stay online.");
    }
  }
}

export const loadFlameDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    const cap = await capacity();
    const [money] = await sql<{ gross: number; failed: number }>`
      select
        coalesce(sum(amount) filter (where status = 'paid'), 0)::int as gross,
        coalesce(sum(amount) filter (where status <> 'paid'), 0)::int as failed
      from stripe_payment where kind = 'flame'
    `;
    const [academy] = await sql<{ gross: number }>`
      select coalesce(sum(amount) filter (where status = 'paid'), 0)::int as gross
      from stripe_payment where kind = 'membership'
    `;
    const [sponsors] = await sql<{ active: number; canceled: number; past_due: number }>`
      select
        count(*) filter (where status = 'active')::int as active,
        count(*) filter (where status = 'canceled')::int as canceled,
        count(*) filter (where status = 'past_due')::int as past_due
      from flame_sponsor
    `;
    const [awards] = await sql<{ active: number; grace: number; ended: number }>`
      select
        count(*) filter (where status = 'active')::int as active,
        count(*) filter (where status = 'grace')::int as grace,
        count(*) filter (where status = 'ended')::int as ended
      from flame_award
    `;
    const [wait] = await sql<{ pending: number; approved: number }>`
      select count(*) filter (where status = 'pending')::int as pending, count(*) filter (where status = 'approved')::int as approved
      from flame_waitlist
    `;
    const unassigned = await sql<{ n: number }>`
      select count(*)::int as n from flame_sponsor s
      where s.status = 'active' and not exists (
        select 1 from flame_award a where a.sponsor_id = s.id and a.status in ('active', 'grace')
      )
    `;
    const waitlist = await sql<{ user_id: string; email: string; name: string; tier: string; status: string; created_at: string; note: string }>`
      select w.user_id, u.email, coalesce(u.name, '') as name, coalesce(m.tier, 'seeker') as tier, w.status, w.created_at::text as created_at, w.note
      from flame_waitlist w
      join "user" u on u.id = w.user_id
      left join user_membership m on m.user_id = w.user_id
      order by w.created_at asc
      limit 200
    `;
    const sponsorRows = await sql<{ id: string; email: string; status: string; amount_cents: number; started_at: string; period_end: string; anon_code: string }>`
      select s.id, u.email, s.status, s.amount_cents, s.started_at::text as started_at, coalesce(s.period_end::text, '') as period_end, coalesce(a.anon_code, '') as anon_code
      from flame_sponsor s
      join "user" u on u.id = s.user_id
      left join flame_award a on a.sponsor_id = s.id and a.status in ('active', 'grace')
      order by s.started_at desc
      limit 200
    `;
    const activeSponsors = sponsors?.active ?? 0;
    const activeAwards = awards?.active ?? 0;
    return {
      capacity: cap,
      grossCents: money?.gross ?? 0,
      failedCents: money?.failed ?? 0,
      academyCents: academy?.gross ?? 0,
      sponsors: sponsors ?? { active: 0, canceled: 0, past_due: 0 },
      awards: awards ?? { active: 0, grace: 0, ended: 0 },
      waiting: wait ?? { pending: 0, approved: 0 },
      unassigned: unassigned[0]?.n ?? 0,
      subsidyCents: activeAwards * (ACADEMY_CENTS - FLAME_CENTS),
      allocatedCents: activeAwards * FLAME_CENTS,
      unallocatedCents: (unassigned[0]?.n ?? 0) * FLAME_CENTS,
      waitlist,
      sponsorRows,
      places: Math.max(0, cap - activeAwards - (awards?.grace ?? 0)),
    };
  });

export const setFlameCapacity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((n: number) => n)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const n = Math.max(0, Math.min(500, Math.floor(Number(data) || 0)));
    const sql = await getSql();
    await sql`
      insert into integration_config (key, value) values ('flame_capacity', ${String(n)})
      on conflict (key) do update set value = excluded.value
    `;
    await audit(context.userId, "flame-capacity", String(n));
    if (n > 0) await matchNext();
    return { ok: true as const, capacity: n };
  });

export const reviewWaitlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; status: string; note: string }) => d)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const status = ["approved", "held", "removed", "pending"].includes(data.status) ? data.status : "pending";
    const sql = await getSql();
    await sql`update flame_waitlist set status = ${status}, note = ${data.note.slice(0, 400)} where user_id = ${data.userId}`;
    await audit(context.userId, `flame-wait-${status}`, data.userId);
    if (status === "approved") await matchNext();
    return { ok: true as const };
  });

export const grantFlameSeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; funding: string; reason: string; expires: string; confirmZero: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    if (!data.confirmZero) throw new Error("Confirm that this grant charges nothing");
    const funding = ["complimentary", "temple", "promotional", "sponsored"].includes(data.funding) ? data.funding : "";
    if (!funding) throw new Error("Name the funding");
    if (funding === "promotional" && !/^\d{4}-\d{2}-\d{2}$/.test(data.expires)) throw new Error("A promotional seat needs an end date");
    if (data.reason.trim().length < 3) throw new Error("Write the reason");
    let sponsorId = "";
    if (funding === "sponsored") {
      const sql = await getSql();
      const [open] = await sql<{ id: string }>`
        select s.id from flame_sponsor s
        where s.status = 'active' and not exists (
          select 1 from flame_award a where a.sponsor_id = s.id and a.status in ('active', 'grace')
        )
        order by s.started_at asc limit 1
      `;
      if (!open) throw new Error("No paid, unassigned Pass the Flame contribution is waiting");
      sponsorId = open.id;
    }
    await giveAward({ recipientId: data.userId, sponsorId, funding, actor: context.userId, reason: data.reason, expires: data.expires });
    return { ok: true as const, charged: 0 as const };
  });

export const releaseFlameNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string; release: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    await sql`update flame_message set status = ${data.release ? "released" : "held"} where id = ${data.id}`;
    await audit(context.userId, data.release ? "flame-note-release" : "flame-note-hold", data.id);
    return { ok: true as const };
  });

export const pendingFlameNotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    return sql<{ id: string; from_role: string; body: string; anon_code: string; created_at: string }>`
      select m.id, m.from_role, m.body, a.anon_code, m.created_at::text as created_at
      from flame_message m
      join flame_award a on a.id = m.award_id
      where m.status = 'pending'
      order by m.created_at asc
      limit 40
    `;
  });

export const flameCsv = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    const rows = await sql<{ email: string; status: string; amount_cents: number; anon_code: string; started_at: string }>`
      select u.email, s.status, s.amount_cents, coalesce(a.anon_code, '') as anon_code, s.started_at::text as started_at
      from flame_sponsor s
      join "user" u on u.id = s.user_id
      left join flame_award a on a.sponsor_id = s.id and a.status in ('active', 'grace')
      order by s.started_at desc
    `;
    const lines = ["email,status,amount_cents,anonymous_student,started_at", ...rows.map((row) => [row.email, row.status, row.amount_cents, row.anon_code, row.started_at].join(","))];
    return lines.join("\n");
  });
