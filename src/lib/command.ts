import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const TIERS = new Set(["seeker", "initiate", "patron"]);
const KINDS = new Set(["rite", "prayer", "code", "announcement"]);
const STATUSES = new Set(["draft", "scheduled", "published", "archived"]);
const MODES = new Set(["complimentary_indefinite", "complimentary_until", "scholarship", "sponsored", "founding"]);

async function assertPriest(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select coalesce(role, 'member') as role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role === "chancellor") return "high_priest" as const;
  const [staff] = await sql<{ role: string }>`
    select role from admin_staff where user_id = ${userId} limit 1
  `;
  if (staff?.role === "executive" || staff?.role === "high_priest") return staff.role as "executive" | "high_priest";
  throw new Error("Temple Command is closed");
}

async function assertEditor(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select coalesce(role, 'member') as role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role === "chancellor") return;
  const [staff] = await sql<{ role: string }>`
    select role from admin_staff where user_id = ${userId} limit 1
  `;
  if (staff && ["executive", "high_priest", "editor", "academy"].includes(staff.role)) return;
  throw new Error("Temple Command is closed");
}

async function audit(actorId: string, action: string, target: string, detail = "") {
  const sql = await getSql();
  await sql`
    insert into admin_audit (id, actor_id, action, target)
    values (${crypto.randomUUID()}, ${actorId}, ${detail ? `${action} | ${detail}` : action}, ${target})
  `;
}

function billingOf(mode: string) {
  if (mode === "scholarship") return { billing: "scholarship", source: "scholarship" };
  if (mode === "sponsored") return { billing: "sponsored", source: "sponsorship" };
  if (mode === "founding") return { billing: "complimentary", source: "high_priest_grant" };
  return { billing: "complimentary", source: "high_priest_grant" };
}

export const loadCommand = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    const [counts] = await sql<{
      members: number;
      seekers: number;
      initiates: number;
      paying: number;
      complimentary: number;
      scholarship: number;
      sponsored: number;
      past_due: number;
      canceled: number;
      founding: number;
      suspended: number;
    }>`
      select
        count(*)::int as members,
        count(*) filter (where coalesce(tier, 'seeker') = 'seeker' and not suspended)::int as seekers,
        count(*) filter (where tier in ('initiate', 'patron') and not suspended)::int as initiates,
        count(*) filter (where coalesce(stripe_subscription, '') <> '' and status = 'active' and not suspended)::int as paying,
        count(*) filter (where billing_status = 'complimentary' and coalesce(stripe_subscription, '') = '' and not suspended)::int as complimentary,
        count(*) filter (where billing_status = 'scholarship' and coalesce(stripe_subscription, '') = '' and not suspended)::int as scholarship,
        count(*) filter (where billing_status = 'sponsored' and coalesce(stripe_subscription, '') = '' and not suspended)::int as sponsored,
        count(*) filter (where status = 'past_due')::int as past_due,
        count(*) filter (where status = 'canceled' or billing_status = 'canceled')::int as canceled,
        count(*) filter (where founding)::int as founding,
        count(*) filter (where suspended)::int as suspended
      from user_membership
    `;
    const [money] = await sql<{ collected: number; charges: number }>`
      select coalesce(sum(amount), 0)::int as collected, count(*)::int as charges
      from stripe_payment
      where status = 'paid'
    `;
    const [asks] = await sql<{ n: number }>`select count(*)::int as n from contact_request`;
    const [drafts] = await sql<{ n: number }>`select count(*)::int as n from temple_document where status <> 'published'`;
    const members = await sql<{
      user_id: string;
      email: string;
      name: string;
      handle: string;
      tier: string;
      status: string;
      role: string;
      billing_status: string;
      access_source: string;
      grant_reason: string;
      granted_by: string;
      grant_expires: string;
      founding: boolean;
      suspended: boolean;
      campaign: string;
      stripe_subscription: string;
      scholarship: boolean;
    }>`
      select
        u.id as user_id,
        u.email,
        coalesce(u.name, '') as name,
        coalesce(p.handle, '') as handle,
        coalesce(m.tier, 'seeker') as tier,
        coalesce(m.status, '') as status,
        coalesce(m.role, 'member') as role,
        coalesce(m.billing_status, '') as billing_status,
        coalesce(m.access_source, '') as access_source,
        coalesce(m.grant_reason, '') as grant_reason,
        coalesce(m.granted_by, '') as granted_by,
        coalesce(m.grant_expires::text, '') as grant_expires,
        coalesce(m.founding, false) as founding,
        coalesce(m.suspended, false) as suspended,
        coalesce(m.campaign, '') as campaign,
        coalesce(m.stripe_subscription, '') as stripe_subscription,
        coalesce(m.scholarship, false) as scholarship
      from "user" u
      left join user_membership m on m.user_id = u.id
      left join member_profile p on p.user_id = u.id
      order by u.email
      limit 300
    `;
    const documents = await sql<{
      id: string;
      kind: string;
      title: string;
      purpose: string;
      access_tier: string;
      status: string;
      publish_at: string;
      updated_at: string;
    }>`
      select id, kind, title, purpose, access_tier, status,
             coalesce(publish_at::text, '') as publish_at,
             updated_at::text as updated_at
      from temple_document
      order by updated_at desc
      limit 80
    `;
    const activity = await sql<{ id: string; action: string; target: string; created_at: string }>`
      select id, action, target, created_at::text as created_at
      from admin_audit
      order by created_at desc
      limit 30
    `;
    const campaigns = await sql<{ id: string; name: string; tier: string; mode: string }>`
      select id, name, tier, mode from ascension_campaign order by created_at desc limit 20
    `;
    const [preview] = await sql<{ as_tier: string }>`
      select as_tier from admin_preview where user_id = ${context.userId} limit 1
    `;
    const [recovery] = await sql<{ value: string }>`
      select value from integration_config where key = 'recovery_admin' limit 1
    `;
    const paying = counts?.paying ?? 0;
    const initiates = counts?.initiates ?? 0;
    return {
      counts: counts ?? { members: 0, seekers: 0, initiates: 0, paying: 0, complimentary: 0, scholarship: 0, sponsored: 0, past_due: 0, canceled: 0, founding: 0, suspended: 0 },
      ratio: initiates ? Math.round((paying / initiates) * 100) : 0,
      collectedCents: money?.collected ?? 0,
      charges: money?.charges ?? 0,
      requests: asks?.n ?? 0,
      unpublished: drafts?.n ?? 0,
      members,
      documents,
      activity,
      campaigns,
      preview: preview?.as_tier ?? "",
      recovery: recovery?.value ?? "",
    };
  });

export const grantAscension = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      userId: string;
      tier: string;
      mode: string;
      reason: string;
      expires: string;
      campaign: string;
      confirmZero: boolean;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    if (!data.confirmZero) throw new Error("Confirm the zero-charge grant before it is saved");
    if (!MODES.has(data.mode)) throw new Error("That grant is not a Temple Command mode");
    if (!TIERS.has(data.tier) || data.tier === "seeker") throw new Error("Choose the tier being granted");
    const reason = data.reason.trim().slice(0, 400);
    if (reason.length < 3) throw new Error("Write why this access is being granted");
    const expires = /^\d{4}-\d{2}-\d{2}$/.test(data.expires) ? data.expires : "";
    if (data.mode === "complimentary_until" && !expires) throw new Error("A time-limited grant needs a date");
    const sql = await getSql();
    const [existing] = await sql<{ id: string; role: string; stripe_subscription: string }>`
      select id, coalesce(role, 'member') as role, coalesce(stripe_subscription, '') as stripe_subscription
      from user_membership where user_id = ${data.userId} limit 1
    `;
    if (existing?.role === "chancellor") throw new Error("The High Priest record is not granted from this form");
    const { billing, source } = billingOf(data.mode);
    const keepPaying = Boolean(existing?.stripe_subscription);
    const scholarship = data.mode === "scholarship";
    const founding = data.mode === "founding";
    const campaign = data.campaign.trim().slice(0, 80);
    if (!existing) {
      await sql`
        insert into user_membership (
          id, user_id, tier, status, scholarship, billing_status, access_source,
          grant_reason, granted_by, grant_expires, founding, campaign
        ) values (
          ${crypto.randomUUID()}, ${data.userId}, ${data.tier}, ${"active"}, ${scholarship},
          ${keepPaying ? "paying" : billing}, ${keepPaying ? "subscription" : source},
          ${reason}, ${context.userId}, ${expires || null}, ${founding}, ${campaign}
        )
      `;
    } else {
      await sql`
        update user_membership
        set tier = ${data.tier},
            status = 'active',
            scholarship = ${scholarship},
            billing_status = ${keepPaying ? "paying" : billing},
            access_source = ${keepPaying ? "subscription" : source},
            grant_reason = ${reason},
            granted_by = ${context.userId},
            grant_expires = ${expires || null},
            founding = founding or ${founding},
            campaign = ${campaign},
            suspended = false
        where user_id = ${data.userId}
      `;
    }
    await audit(context.userId, "grant", data.userId, `${data.mode} ${data.tier} $0 ${reason}`);
    return { ok: true as const, charged: 0 as const };
  });

export const setSuspension = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; suspended: boolean; reason: string }) => d)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const sql = await getSql();
    await sql`
      update user_membership
      set suspended = ${data.suspended}
      where user_id = ${data.userId} and coalesce(role, 'member') <> 'chancellor'
    `;
    await audit(context.userId, data.suspended ? "suspend" : "restore", data.userId, data.reason.slice(0, 200));
    return { ok: true as const };
  });

export const saveDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      id?: string;
      kind: string;
      title: string;
      purpose: string;
      body: string;
      accessTier: string;
      status: string;
      publishAt: string;
      category: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertEditor(context.userId);
    const title = data.title.trim().slice(0, 160);
    const body = data.body.trim().slice(0, 20000);
    if (title.length < 2 || body.length < 2) throw new Error("A document needs a title and a text");
    const kind = KINDS.has(data.kind) ? data.kind : "prayer";
    const status = STATUSES.has(data.status) ? data.status : "draft";
    const access = TIERS.has(data.accessTier) || data.accessTier === "public" ? data.accessTier : "initiate";
    const publishAt = data.publishAt ? new Date(data.publishAt).toISOString() : null;
    const sql = await getSql();
    const id = data.id || crypto.randomUUID();
    await sql`
      insert into temple_document (id, kind, title, purpose, body, access_tier, status, publish_at, category, updated_by, updated_at)
      values (
        ${id}, ${kind}, ${title}, ${data.purpose.slice(0, 500)}, ${body}, ${access}, ${status},
        ${publishAt}, ${data.category.slice(0, 80)}, ${context.userId}, now()
      )
      on conflict (id) do update set
        kind = excluded.kind,
        title = excluded.title,
        purpose = excluded.purpose,
        body = excluded.body,
        access_tier = excluded.access_tier,
        status = excluded.status,
        publish_at = excluded.publish_at,
        category = excluded.category,
        updated_by = excluded.updated_by,
        updated_at = now()
    `;
    await sql`
      insert into document_revision (id, document_id, title, body, status, access_tier, actor_id)
      values (${crypto.randomUUID()}, ${id}, ${title}, ${body}, ${status}, ${access}, ${context.userId})
    `;
    await audit(context.userId, status === "published" ? "publish" : "save-document", id, title);
    return { ok: true as const, id };
  });

export const readDocument = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    await assertEditor(context.userId);
    const sql = await getSql();
    const [doc] = await sql<{
      id: string;
      kind: string;
      title: string;
      purpose: string;
      body: string;
      access_tier: string;
      status: string;
      publish_at: string;
      category: string;
    }>`
      select id, kind, title, purpose, body, access_tier, status, coalesce(publish_at::text, '') as publish_at, category
      from temple_document where id = ${data} limit 1
    `;
    const revisions = await sql<{ id: string; status: string; created_at: string }>`
      select id, status, created_at::text as created_at
      from document_revision where document_id = ${data}
      order by created_at desc limit 12
    `;
    return { doc: doc ?? null, revisions };
  });

async function viewerTier(userId: string) {
  if (!userId) return { rank: 0, preview: "" };
  const sql = await getSql();
  const [row] = await sql<{ role: string; tier: string; scholarship: boolean; suspended: boolean; billing_status: string; grant_expires: string; stripe_subscription: string }>`
    select coalesce(role, 'member') as role,
           coalesce(tier, 'seeker') as tier,
           coalesce(scholarship, false) as scholarship,
           coalesce(suspended, false) as suspended,
           coalesce(billing_status, '') as billing_status,
           coalesce(grant_expires::text, '') as grant_expires,
           coalesce(stripe_subscription, '') as stripe_subscription
    from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  const [preview] = await sql<{ as_tier: string }>`
    select as_tier from admin_preview where user_id = ${userId} limit 1
  `;
  if (row?.role === "chancellor" && preview?.as_tier) {
    const as = preview.as_tier;
    return { rank: as === "initiate" || as === "patron" ? 2 : as === "seeker" ? 1 : 0, preview: as };
  }
  if (!row || row.suspended) return { rank: row ? 1 : 0, preview: "" };
  const expired =
    row.grant_expires &&
    row.grant_expires.slice(0, 10) < new Date().toISOString().slice(0, 10) &&
    !row.stripe_subscription &&
    ["complimentary", "scholarship", "sponsored"].includes(row.billing_status);
  if (expired) return { rank: 1, preview: "" };
  if (row.role === "chancellor") return { rank: 5, preview: "" };
  if (row.scholarship || row.tier === "initiate" || row.tier === "patron") return { rank: 2, preview: "" };
  return { rank: 1, preview: "" };
}

function needRank(tier: string) {
  if (tier === "public") return 0;
  if (tier === "seeker") return 1;
  return 2;
}

export const listHouseDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const view = await viewerTier(context.userId);
    const sql = await getSql();
    const rows = await sql<{ id: string; kind: string; title: string; purpose: string; body: string; access_tier: string; status: string }>`
      select id, kind, title, purpose, body, access_tier, status
      from temple_document
      where status = 'published'
         or (status = 'scheduled' and publish_at is not null and publish_at <= now())
         or (${view.preview !== ""} and status = 'draft')
      order by sort_order, title
    `;
    return rows.map((row) => {
      const locked = view.rank < needRank(row.access_tier);
      return {
        id: row.id,
        kind: row.kind,
        title: row.title,
        purpose: row.purpose,
        accessTier: row.access_tier,
        status: row.status,
        locked,
        body: locked ? "" : row.body,
      };
    });
  });

export const readHouseDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    const view = await viewerTier(context.userId);
    const sql = await getSql();
    const [row] = await sql<{ id: string; title: string; purpose: string; body: string; access_tier: string; status: string; kind: string; publish_at: string }>`
      select id, title, purpose, body, access_tier, status, kind, coalesce(publish_at::text, '') as publish_at
      from temple_document where id = ${data} limit 1
    `;
    if (!row) return null;
    const scheduledLive = row.status === "scheduled" && row.publish_at && row.publish_at <= new Date().toISOString();
    const live = row.status === "published" || scheduledLive || (view.preview !== "" && row.status === "draft");
    if (!live && view.rank < 5) return null;
    const locked = view.rank < needRank(row.access_tier);
    return {
      id: row.id,
      title: row.title,
      purpose: row.purpose,
      kind: row.kind,
      accessTier: row.access_tier,
      locked,
      body: locked ? "" : row.body,
      preview: view.preview,
    };
  });

export const setPreviewTier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((tier: string) => tier)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const tier = ["", "seeker", "initiate"].includes(data) ? data : "";
    const sql = await getSql();
    await sql`
      insert into admin_preview (user_id, as_tier) values (${context.userId}, ${tier})
      on conflict (user_id) do update set as_tier = excluded.as_tier
    `;
    await audit(context.userId, "preview", tier || "self", "");
    return { ok: true as const, tier };
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string; tier: string; mode: string; note: string }) => d)
  .handler(async ({ context, data }) => {
    await assertPriest(context.userId);
    const name = data.name.trim().slice(0, 80);
    if (name.length < 2) throw new Error("Name the campaign");
    const sql = await getSql();
    await sql`
      insert into ascension_campaign (id, name, tier, mode, note, created_by)
      values (${crypto.randomUUID()}, ${name}, ${TIERS.has(data.tier) ? data.tier : "initiate"}, ${MODES.has(data.mode) ? data.mode : "complimentary_indefinite"}, ${data.note.slice(0, 400)}, ${context.userId})
    `;
    await audit(context.userId, "campaign", name, data.mode);
    return { ok: true as const };
  });

export const setRecoveryAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((email: string) => email)
  .handler(async ({ context, data }) => {
    const role = await assertPriest(context.userId);
    if (role !== "high_priest") throw new Error("Only the High Priest names the recovery account");
    const email = data.trim().toLowerCase();
    const sql = await getSql();
    const [user] = await sql<{ id: string }>`select id from "user" where lower(email) = ${email} limit 1`;
    if (!user) throw new Error("That email has no account yet");
    await sql`
      insert into admin_staff (user_id, role, granted_by) values (${user.id}, ${"executive"}, ${context.userId})
      on conflict (user_id) do update set role = 'executive', granted_by = excluded.granted_by
    `;
    await sql`
      insert into integration_config (key, value) values ('recovery_admin', ${email})
      on conflict (key) do update set value = excluded.value
    `;
    await audit(context.userId, "recovery-admin", user.id, email);
    return { ok: true as const };
  });
