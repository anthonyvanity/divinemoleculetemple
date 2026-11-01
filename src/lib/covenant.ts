import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const COVENANT_TEXT = [
  "Within these walls, people may share experiences they have never felt safe discussing elsewhere.",
  "We protect that trust.",
  "What is shared in confidence must not be carried outside the congregation without permission.",
  "We agree to respect the privacy and identities of fellow Divinites.",
  "We agree never to screenshot, record, repost, or disclose another member’s private experiences without explicit consent.",
  "We agree never to expose another member’s identity, location, personal circumstances, or spiritual disclosures.",
  "We agree to discuss unusual experiences respectfully, without ridicule, coercion, or claiming authority over another person’s reality.",
  "We agree to report harassment, exploitation, threats, or privacy violations to Temple moderators.",
  "Confidentiality is a sacred responsibility, but it is not absolute. The Temple may act on credible safety threats, abuse, legal obligations, or emergencies.",
  "This covenant is a community rule. It is not a promise of legally privileged communication, and it is not a guarantee that a screen cannot be captured.",
].join("\n\n");

async function version() {
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`select value from integration_config where key = 'covenant_version' limit 1`;
  return row?.value || "2026-10-23";
}

async function priest(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select coalesce(role, 'member') as role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role === "chancellor") return;
  const [staff] = await sql<{ role: string }>`select role from admin_staff where user_id = ${userId} limit 1`;
  if (staff && ["executive", "high_priest", "moderator", "chancellor"].includes(staff.role)) return;
  throw new Error("Temple Command is closed");
}

async function audit(actor: string, action: string, target: string) {
  const sql = await getSql();
  await sql`insert into admin_audit (id, actor_id, action, target) values (${crypto.randomUUID()}, ${actor}, ${action}, ${target})`;
}

export async function assertNexxus(userId: string) {
  const sql = await getSql();
  const current = await version();
  const [accepted] = await sql<{ ok: number }>`
    select 1 as ok from covenant_acceptance where user_id = ${userId} and version = ${current} limit 1
  `;
  if (!accepted) throw new Error("Accept the Sacred Confidence Covenant before entering the Nexxus.");
  const [limit] = await sql<{ until: string }>`
    select coalesce(until::text, '') as until from nexxus_limit where user_id = ${userId} limit 1
  `;
  if (!limit) return;
  if (!limit.until || new Date(limit.until).getTime() > Date.now()) {
    throw new Error("Your Nexxus access is restricted. You can appeal from the covenant page.");
  }
}

export const covenantState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const current = await version();
    const [accepted] = await sql<{ accepted_at: string }>`
      select accepted_at::text as accepted_at from covenant_acceptance
      where user_id = ${context.userId} and version = ${current} limit 1
    `;
    const [limit] = await sql<{ until: string; reason: string }>`
      select coalesce(until::text, '') as until, reason from nexxus_limit where user_id = ${context.userId} limit 1
    `;
    const [warning] = await sql<{ body: string }>`
      select body from member_warning where user_id = ${context.userId} order by created_at desc limit 1
    `;
    const [profile] = await sql<{ listed: boolean }>`select listed from member_profile where user_id = ${context.userId} limit 1`;
    const restricted = Boolean(limit) && (!limit?.until || new Date(limit.until).getTime() > Date.now());
    return {
      version: current,
      accepted: Boolean(accepted),
      acceptedAt: accepted?.accepted_at || "",
      restricted,
      until: limit?.until || "",
      reason: limit?.reason || "",
      warning: warning?.body || "",
      listed: profile?.listed !== false,
      text: COVENANT_TEXT,
    };
  });

export const acceptCovenant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((agreed: boolean) => agreed)
  .handler(async ({ context, data }) => {
    if (data !== true) throw new Error("The box has to be checked by you");
    const sql = await getSql();
    const current = await version();
    await sql`
      insert into covenant_acceptance (user_id, version) values (${context.userId}, ${current})
      on conflict (user_id, version) do nothing
    `;
    await audit(context.userId, "covenant-accept", current);
    return { ok: true as const, version: current };
  });

export const setListed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((listed: boolean) => listed)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into member_profile (user_id, handle, listed) values (${context.userId}, ${"SEEKER"}, ${data})
      on conflict (user_id) do update set listed = ${data}
    `;
    return { ok: true as const };
  });

export const blockMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ context, data }) => {
    if (!data || data === context.userId) throw new Error("You cannot block yourself");
    const sql = await getSql();
    await sql`
      insert into member_block (user_id, blocked_id) values (${context.userId}, ${data})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const deleteOwnPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id || "").slice(0, 80))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from nexus_entry where id = ${data} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const fileAppeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((body: string) => String(body || "").trim().slice(0, 800))
  .handler(async ({ context, data }) => {
    if (data.length < 8) throw new Error("Say what you are asking");
    const sql = await getSql();
    await sql`
      insert into covenant_appeal (id, user_id, body) values (${crypto.randomUUID()}, ${context.userId}, ${data})
    `;
    await audit(context.userId, "covenant-appeal", context.userId);
    return { ok: true as const };
  });

export const loadCovenantDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await priest(context.userId);
    const sql = await getSql();
    const current = await version();
    const [count] = await sql<{ n: number }>`select count(*)::int as n from covenant_acceptance where version = ${current}`;
    const reports = await sql<{ id: string; target_kind: string; target_id: string; reason: string; created_at: string; handle: string }>`
      select r.id, r.target_kind, r.target_id, r.reason, r.created_at::text as created_at, coalesce(p.handle, 'Seeker') as handle
      from nexus_report r
      left join member_profile p on p.user_id = r.reporter_id
      order by r.created_at desc
      limit 40
    `;
    const appeals = await sql<{ id: string; user_id: string; body: string; status: string; handle: string }>`
      select a.id, a.user_id, a.body, a.status, coalesce(p.handle, 'Seeker') as handle
      from covenant_appeal a
      left join member_profile p on p.user_id = a.user_id
      where a.status = 'open'
      order by a.created_at asc
      limit 40
    `;
    return { version: current, accepted: count?.n ?? 0, reports, appeals };
  });

export const moderateCovenant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { action: string; userId: string; postId: string; reason: string; days: number; appealId: string }) => d)
  .handler(async ({ context, data }) => {
    await priest(context.userId);
    const sql = await getSql();
    const reason = data.reason.trim().slice(0, 400);
    if (data.action === "remove" && data.postId) {
      await sql`delete from nexus_entry where id = ${data.postId}`;
      await audit(context.userId, "covenant-remove", data.postId);
    } else if (data.action === "warn" && data.userId) {
      if (reason.length < 3) throw new Error("Write the warning");
      await sql`insert into member_warning (id, user_id, body) values (${crypto.randomUUID()}, ${data.userId}, ${reason})`;
      await audit(context.userId, "covenant-warn", data.userId);
    } else if (data.action === "restrict" && data.userId) {
      const days = Math.max(1, Math.min(365, Math.floor(Number(data.days) || 7)));
      const until = new Date(Date.now() + days * 86400000).toISOString();
      await sql`
        insert into nexxus_limit (user_id, until, reason, set_by)
        values (${data.userId}, ${until}, ${reason || "Restricted"}, ${context.userId})
        on conflict (user_id) do update set until = ${until}, reason = ${reason || "Restricted"}, set_by = ${context.userId}
      `;
      await audit(context.userId, "covenant-restrict", data.userId);
    } else if (data.action === "ban" && data.userId) {
      if (reason.length < 3) throw new Error("Write why the ban is permanent");
      await sql`
        insert into nexxus_limit (user_id, until, reason, set_by)
        values (${data.userId}, ${null}, ${reason}, ${context.userId})
        on conflict (user_id) do update set until = null, reason = ${reason}, set_by = ${context.userId}
      `;
      await audit(context.userId, "covenant-ban", data.userId);
    } else if (data.action === "lift" && data.userId) {
      await sql`delete from nexxus_limit where user_id = ${data.userId}`;
      await audit(context.userId, "covenant-lift", data.userId);
    } else if (data.action === "appeal" && data.appealId) {
      await sql`update covenant_appeal set status = 'closed', decision = ${reason || "Reviewed"} where id = ${data.appealId}`;
      await audit(context.userId, "covenant-appeal-close", data.appealId);
    } else if (data.action === "revise") {
      const next = reason || new Date().toISOString().slice(0, 10);
      await sql`
        insert into integration_config (key, value) values ('covenant_version', ${next})
        on conflict (key) do update set value = excluded.value
      `;
      await audit(context.userId, "covenant-revise", next);
    } else {
      throw new Error("Unknown action");
    }
    return { ok: true as const };
  });
