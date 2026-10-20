import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { BLAST_TO, CONTACT_EMAIL, DRIP, TIERS } from "@/lib/temple-content";
import { stripeDesk } from "@/lib/stripe-temple";

const PHRASE = "MOLECULA-AETERNA";

async function assertChancellor(userId: string) {
  const sql = await getSql();
  const [row] = await sql<{ role: string }>`
    select role from user_membership where user_id = ${userId} order by since desc limit 1
  `;
  if (row?.role !== "chancellor") throw new Error("Chancellor only");
}

export const claimChancellor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((phrase: string) => phrase)
  .handler(async ({ context, data }) => {
    if (data.trim() !== PHRASE) throw new Error("Phrase rejected");
    const sql = await getSql();
    const holders = await sql<{ user_id: string }>`
      select user_id from user_membership where role = 'chancellor' limit 1
    `;
    if (holders[0] && holders[0].user_id !== context.userId) {
      throw new Error("A chancellor already holds the desk");
    }
    await sql`
      insert into member_profile (user_id, handle)
      values (${context.userId}, ${"CHANCELLOR"})
      on conflict (user_id) do nothing
    `;
    const existing = await sql<{ id: string }>`
      select id from user_membership where user_id = ${context.userId} limit 1
    `;
    if (!existing[0]) {
      await sql`
        insert into user_membership (id, user_id, tier, status, role, scholarship)
        values (${crypto.randomUUID()}, ${context.userId}, ${"initiate"}, ${"active"}, ${"chancellor"}, ${true})
      `;
    } else {
      await sql`
        update user_membership
        set role = 'chancellor', tier = 'initiate', scholarship = true, status = 'active'
        where user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

export const loadOffice = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    const members = await sql<{
      user_id: string;
      email: string;
      name: string;
      tier: string;
      status: string;
      scholarship: boolean;
      discount_pct: number;
      role: string;
      note: string;
      lists: string;
    }>`
      select
        u.id as user_id,
        u.email,
        coalesce(u.name, '') as name,
        coalesce(m.tier, 'seeker') as tier,
        coalesce(m.status, 'active') as status,
        coalesce(m.scholarship, false) as scholarship,
        coalesce(m.discount_pct, 0) as discount_pct,
        coalesce(m.role, 'member') as role,
        coalesce(m.note, '') as note,
        coalesce(m.lists, '') as lists
      from "user" u
      left join user_membership m on m.user_id = u.id
      order by u.email
      limit 200
    `;
    const requests = await sql<{
      id: string;
      name: string;
      email: string;
      message: string;
      created_at: string;
    }>`
      select id, name, email, message, created_at::text as created_at
      from contact_request
      order by created_at desc
      limit 80
    `;
    const blasts = await sql<{
      id: string;
      subject: string;
      audience: string;
      status: string;
      created_at: string;
    }>`
      select id, subject, audience, status, created_at::text as created_at
      from email_outbox
      order by created_at desc
      limit 40
    `;
    return { members, requests, blasts, stripe: await stripeDesk(), from: CONTACT_EMAIL, mail: Boolean(await mailKey()) };
  });

export const setMemberAccess = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: { userId: string; tier: string; scholarship: boolean; discountPct: number; note: string; lists?: string }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const tier = (TIERS as readonly string[]).includes(data.tier) ? data.tier : "seeker";
    const discount = Math.max(0, Math.min(100, Math.round(data.discountPct || 0)));
    const lists = ["guides", "investors", "grants"]
      .filter((id) => (data.lists || "").split(",").includes(id))
      .map((id) => `,${id},`)
      .join("");
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from user_membership where user_id = ${data.userId} limit 1
    `;
    if (!existing[0]) {
      await sql`
        insert into user_membership (id, user_id, tier, status, scholarship, discount_pct, note, lists)
        values (${crypto.randomUUID()}, ${data.userId}, ${tier}, ${"active"}, ${data.scholarship}, ${discount}, ${data.note.slice(0, 400)}, ${lists})
      `;
    } else {
      await sql`
        update user_membership
        set tier = ${tier},
            scholarship = ${data.scholarship},
            discount_pct = ${discount},
            note = ${data.note.slice(0, 400)},
            lists = ${lists},
            status = 'active'
        where user_id = ${data.userId}
      `;
    }
    return { ok: true as const };
  });

export const queueBlast = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { subject: string; body: string; audience: string }) => d)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const subject = data.subject.trim().slice(0, 140);
    const body = data.body.trim().slice(0, 8000);
    if (subject.length < 2 || body.length < 2) throw new Error("Write a subject and a body");
    const known = BLAST_TO.some((item) => item.id === data.audience);
    const audience = known ? data.audience : "all";
    const sql = await getSql();
    await sql`
      insert into email_outbox (id, subject, body, audience, created_by, status, sender)
      values (${crypto.randomUUID()}, ${subject}, ${body}, ${audience}, ${context.userId}, ${"queued"}, ${CONTACT_EMAIL})
    `;
    return { ok: true as const, status: "queued" as const };
  });

async function mailKey() {
  const fromEnv = process.env.RESEND_API_KEY?.trim() || "";
  if (fromEnv) return fromEnv;
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`
    select value from integration_config where key = 'resend_key' limit 1
  `;
  return row?.value?.trim() || "";
}

async function audienceEmails(audience: string) {
  const sql = await getSql();
  if (audience === "flame") {
    const rows = await sql<{ email: string }>`
      select email from flame_list where email <> ''
    `;
    return rows.map((row) => row.email);
  }
  if (audience === "grants") {
    const rows = await sql<{ email: string }>`
      select distinct email from (
        select u.email
        from "user" u
        join user_membership m on m.user_id = u.id
        where m.lists like '%,grants,%' and u.email <> ''
        union
        select email from contact_request
        where message ilike '%grant%' and email <> ''
      ) recipients
    `;
    return rows.map((row) => row.email);
  }
  if (audience === "office") {
    const rows = await sql<{ email: string }>`
      select u.email
      from "user" u
      join user_membership m on m.user_id = u.id
      where m.role = 'chancellor' and u.email <> ''
    `;
    return rows.map((row) => row.email);
  }
  if (audience === "guides" || audience === "investors") {
    const rows = await sql<{ email: string }>`
      select u.email
      from "user" u
      join user_membership m on m.user_id = u.id
      where m.status = 'active' and m.lists like ${`%,${audience},%`} and u.email <> ''
    `;
    return rows.map((row) => row.email);
  }
  const rows = await sql<{ email: string }>`
    select u.email
    from "user" u
    join user_membership m on m.user_id = u.id
    where m.status = 'active'
      and u.email <> ''
      and (
        ${audience} = 'all'
        or m.tier = ${audience}
        or (${audience} = 'initiate' and m.tier = 'patron')
      )
  `;
  return rows.map((row) => row.email);
}

async function deliver(bcc: string[], subject: string, body: string) {
  const key = await mailKey();
  const clean = [...new Set(bcc.map((email) => email.trim().toLowerCase()).filter((email) => email.includes("@")))];
  if (!key || clean.length === 0) return { sent: false as const, count: 0 };
  const from = `The Divine Molecule Temple <${CONTACT_EMAIL}>`;
  let count = 0;
  for (let i = 0; i < clean.length; i += 40) {
    const slice = clean.slice(i, i + 40);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [CONTACT_EMAIL],
        bcc: slice,
        reply_to: CONTACT_EMAIL,
        subject,
        text: body,
      }),
    });
    if (res.ok) count += slice.length;
  }
  return { sent: count > 0, count };
}

export const saveMailKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((key: string) => key)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const key = data.trim();
    if (key && !key.startsWith("re_")) throw new Error("The mail key should start with re_");
    if (!key) return { ok: true as const };
    const sql = await getSql();
    await sql`
      insert into integration_config (key, value) values ('resend_key', ${key})
      on conflict (key) do update set value = excluded.value
    `;
    return { ok: true as const };
  });

export const sendBlast = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    const [blast] = await sql<{ id: string; subject: string; body: string; audience: string; status: string }>`
      select id, subject, body, audience, status from email_outbox where id = ${data} limit 1
    `;
    if (!blast) throw new Error("That letter is gone");
    if (blast.status === "sent") return { ok: true as const, status: "sent" as const };
    const result = await deliver(await audienceEmails(blast.audience), blast.subject, blast.body);
    const status = result.sent ? "sent" : "held";
    await sql`update email_outbox set status = ${status}, sender = ${CONTACT_EMAIL} where id = ${blast.id}`;
    return { ok: true as const, status };
  });

export const runDrip = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(() => true)
  .handler(async ({ context }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    const members = await sql<{ id: string; email: string; tier: string; since: string }>`
      select u.id, u.email, m.tier, m.since::text as since
      from "user" u
      join user_membership m on m.user_id = u.id
      where m.status = 'active'
    `;
    let letters = 0;
    for (const letter of DRIP) {
      const due = members.filter((member) => {
        const tierOk =
          letter.tier === "seeker"
            ? member.tier === "seeker"
            : member.tier === "initiate" || member.tier === "patron";
        const days = Math.floor((Date.now() - new Date(member.since).getTime()) / 86_400_000);
        return tierOk && days >= letter.day && member.email.includes("@");
      });
      const fresh: string[] = [];
      for (const member of due) {
        const inserted = await sql<{ id: string }>`
          insert into email_sequence_log (id, user_id, letter_key)
          values (${crypto.randomUUID()}, ${member.id}, ${letter.key})
          on conflict (user_id, letter_key) do nothing
          returning id
        `;
        if (inserted[0]) fresh.push(member.email);
      }
      if (!fresh.length) continue;
      const result = await deliver(fresh, letter.subject, letter.body);
      await sql`
        insert into email_outbox (id, subject, body, audience, created_by, status, sender)
        values (
          ${crypto.randomUUID()},
          ${letter.subject},
          ${letter.body},
          ${letter.tier},
          ${context.userId},
          ${result.sent ? "sent" : "held"},
          ${CONTACT_EMAIL}
        )
      `;
      letters += 1;
    }
    return { ok: true as const, letters };
  });

export const listHouseAudio = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ id: string; title: string; path_label: string; mime: string; created_at: string }>`
    select id, title, path_label, mime, created_at::text as created_at
    from house_audio
    order by created_at desc
    limit 80
  `;
});

const AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/x-m4a",
  "audio/m4a",
]);

export const uploadHouseAudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { title: string; pathLabel: string; mime: string; base64: string }) => d)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const title = data.title.trim().slice(0, 120);
    if (title.length < 2) throw new Error("Name the transmission");
    const mime = AUDIO_MIME.has(data.mime) ? data.mime : data.mime.startsWith("audio/") ? "audio/mpeg" : "";
    if (!mime) throw new Error("Use mp3, m4a, wav, ogg, or webm");
    if (data.base64.length > 5_600_000) throw new Error("Keep the file under 4 MB");
    const raw = Buffer.from(data.base64, "base64");
    if (raw.byteLength < 32 || raw.byteLength > 4_000_000) throw new Error("Keep the file under 4 MB");
    const pathLabel = ["seeker", "initiate", "patron", "house"].includes(data.pathLabel)
      ? data.pathLabel
      : "house";
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into house_audio (id, title, path_label, mime, bytes, created_by)
      values (${id}, ${title}, ${pathLabel}, ${mime}, ${raw}, ${context.userId})
    `;
    return { id, title, path_label: pathLabel };
  });

export const deleteHouseAudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    await sql`delete from house_audio where id = ${data}`;
    return { ok: true as const };
  });

const FILE_GATE = new Set(["public", "seeker", "initiate", "patron", "priestline"]);
const FILE_MIME = new Set(["application/pdf", "text/plain", "application/epub+zip"]);

export const listVault = createServerFn({ method: "GET" })
  .validator((kind: string) => (kind === "ritual" ? "ritual" : "book"))
  .handler(async ({ data }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { vaultAllowed, vaultRank } = await import("@/lib/vault-gate");
    const user = await getSessionUser().catch(() => null);
    const sql = await getSql();
    let rank = 0;
    if (user) {
      const [m] = await sql<{ tier: string; role: string; scholarship: boolean }>`
        select coalesce(tier, 'seeker') as tier, coalesce(role, 'member') as role, coalesce(scholarship, false) as scholarship
        from user_membership where user_id = ${user.id} limit 1
      `;
      rank = vaultRank(m?.role ?? "", m?.tier ?? "seeker", Boolean(m?.scholarship));
    }
    const rows = await sql<{
      id: string;
      title: string;
      body: string;
      gate: string;
      filename: string;
      mime: string;
      created_at: string;
    }>`
      select id, title, body, gate, filename, mime, created_at::text as created_at
      from house_file
      where kind = ${data}
      order by created_at desc
      limit 80
    `;
    return rows.map((row) => {
      const open = vaultAllowed(row.gate, rank);
      return {
        id: row.id,
        title: row.title,
        body: open ? row.body : "",
        gate: row.gate,
        hasFile: Boolean(row.filename),
        mime: open ? row.mime : "",
        open,
        created_at: row.created_at,
      };
    });
  });

export const uploadHouseFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: { kind: string; title: string; body: string; gate: string; filename: string; mime: string; base64: string }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const title = data.title.trim().slice(0, 160);
    const body = (data.body || "").trim().slice(0, 20000);
    if (title.length < 2) throw new Error("Name the work");
    const kind = data.kind === "ritual" ? "ritual" : "book";
    const gate = FILE_GATE.has(data.gate) ? data.gate : "initiate";
    let filename = "";
    let mime = "";
    let raw: Buffer | null = null;
    if (data.base64) {
      if (data.base64.length > 4_400_000) throw new Error("Keep the file under 3 MB");
      const bytes = Buffer.from(data.base64, "base64");
      if (bytes.byteLength < 32 || bytes.byteLength > 3_200_000) throw new Error("Keep the file under 3 MB");
      mime = FILE_MIME.has(data.mime) ? data.mime : data.filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";
      if (!mime) throw new Error("Use a PDF");
      filename = (data.filename || "temple.pdf").replace(/[^\w.\- ]+/g, "").slice(0, 120) || "temple.pdf";
      raw = bytes;
    } else if (body.length < 8) {
      throw new Error("Add a PDF or write the text");
    }
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into house_file (id, kind, title, body, gate, filename, mime, bytes, created_by)
      values (${id}, ${kind}, ${title}, ${body}, ${gate}, ${filename}, ${mime}, ${raw}, ${context.userId})
    `;
    return { id, title };
  });

export const deleteHouseFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    await sql`delete from house_file where id = ${data}`;
    return { ok: true as const };
  });
