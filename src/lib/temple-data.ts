import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { CHANCELLOR_ID, HIGH_PRIEST_ID, isHouseFriend } from "@/lib/house";

const optionalAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);
    return next({ context: { userId: user?.id ?? "" } });
  });

function id() {
  return crypto.randomUUID();
}

export type MemberBundle = {
  profile: {
    user_id: string;
    handle: string;
    flame_name: string;
    bio: string;
    sigil: number;
    avatar_url: string;
    joined_at: string;
  };
  membership: {
    tier: string;
    status: string;
    since: string;
    scholarship: boolean;
    discount_pct: number;
    role: string;
    note: string;
  } | null;
  progress: { node_id: string; status: string }[];
  awakening: string[];
  rituals: { id: string; ritual: string; duration_min: number; notes: string; logged_at: string }[];
};

export const ensureMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const uid = context.userId;
    await sql`
      insert into member_profile (user_id, handle)
      values (${uid}, ${"SEEKER"})
      on conflict (user_id) do nothing
    `;
    const existing = await sql<{ id: string }>`
      select id from user_membership where user_id = ${uid} limit 1
    `;
    if (!existing[0]) {
      await sql`
        insert into user_membership (id, user_id, tier, status)
        values (${id()}, ${uid}, ${"seeker"}, ${"active"})
      `;
    }
    return loadMember(uid);
  });

async function loadMember(uid: string): Promise<MemberBundle> {
  const sql = await getSql();
  const [profile] = await sql<MemberBundle["profile"]>`
    select user_id, handle, flame_name, bio, sigil, coalesce(avatar_url, '') as avatar_url, joined_at::text as joined_at
    from member_profile where user_id = ${uid}
  `;
  const [membership] = await sql<{
    tier: string;
    status: string;
    since: string;
    scholarship: boolean;
    discount_pct: number;
    role: string;
    note: string;
  }>`
    select tier, status, since::text as since,
           coalesce(scholarship, false) as scholarship,
           coalesce(discount_pct, 0) as discount_pct,
           coalesce(role, 'member') as role,
           coalesce(note, '') as note
    from user_membership
    where user_id = ${uid} order by since desc limit 1
  `;
  const progress = await sql<{ node_id: string; status: string }>`
    select node_id, status from user_progress where user_id = ${uid}
  `;
  const [aw] = await sql<{ days_json: string }>`
    select days_json from awakening_enrollment where user_id = ${uid}
  `;
  const rituals = await sql<MemberBundle["rituals"][number]>`
    select id, ritual, duration_min, notes, logged_at::text as logged_at
    from daily_ritual_log where user_id = ${uid}
    order by logged_at desc limit 40
  `;
  let awakening: string[] = [];
  try {
    awakening = JSON.parse(aw?.days_json ?? "[]") as string[];
  } catch {
    awakening = [];
  }
  return {
    profile: profile ?? {
      user_id: uid,
      handle: "SEEKER",
      flame_name: "",
      bio: "",
      sigil: 1,
      avatar_url: "",
      joined_at: new Date().toISOString(),
    },
    membership: membership ?? null,
    progress,
    awakening,
    rituals,
  };
}

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { handle: string; flame_name: string; bio: string; sigil: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into member_profile (user_id, handle, flame_name, bio, sigil)
      values (${context.userId}, ${data.handle}, ${data.flame_name}, ${data.bio}, ${data.sigil})
      on conflict (user_id) do update set
        handle = excluded.handle,
        flame_name = excluded.flame_name,
        bio = excluded.bio,
        sigil = excluded.sigil
    `;
    return { ok: true };
  });

export const saveAvatar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((dataUrl: string) => {
    const value = String(dataUrl || "");
    if (!value.startsWith("data:image/") || value.length > 180_000) throw new Error("Use a smaller picture.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into member_profile (user_id, handle, avatar_url)
      values (${context.userId}, ${"SEEKER"}, ${data})
      on conflict (user_id) do update set avatar_url = ${data}
    `;
    return { ok: true };
  });

export const sealAwakeningDay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((dayId: string) => dayId)
  .handler(async ({ context, data: dayId }) => {
    const sql = await getSql();
    const [row] = await sql<{ id: string; days_json: string }>`
      select id, days_json from awakening_enrollment where user_id = ${context.userId}
    `;
    let days: string[] = [];
    try {
      days = JSON.parse(row?.days_json ?? "[]") as string[];
    } catch {
      days = [];
    }
    if (!days.includes(dayId)) days = [...days, dayId];
    const payload = JSON.stringify(days);
    if (row) {
      await sql`update awakening_enrollment set days_json = ${payload} where user_id = ${context.userId}`;
    } else {
      await sql`
        insert into awakening_enrollment (id, user_id, days_json)
        values (${id()}, ${context.userId}, ${payload})
      `;
    }
    return { days };
  });

export const saveClassNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; body: string }) => ({
    code: String(d.code || "").slice(0, 40).toUpperCase(),
    body: String(d.body || "").slice(0, 8000),
  }))
  .handler(async ({ context, data }) => {
    if (!data.code) return { ok: false };
    const sql = await getSql();
    await sql`
      insert into class_note (user_id, code, body, updated_at)
      values (${context.userId}, ${data.code}, ${data.body}, now())
      on conflict (user_id, code) do update
      set body = ${data.body}, updated_at = now()
    `;
    return { ok: true };
  });

export const listClassNotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ code: string; body: string }>`
      select code, body
      from class_note
      where user_id = ${context.userId} and length(trim(body)) > 0
      order by updated_at desc
    `;
  });

export const logDailyRitual = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { ritual: string; duration_min: number; notes: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = {
      id: id(),
      ritual: data.ritual,
      duration_min: data.duration_min,
      notes: data.notes,
      logged_at: new Date().toISOString(),
    };
    await sql`
      insert into daily_ritual_log (id, user_id, ritual, duration_min, notes)
      values (${row.id}, ${context.userId}, ${row.ritual}, ${row.duration_min}, ${row.notes})
    `;
    return row;
  });

export const logMeditation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { duration_min: number; notes: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into meditation_session (id, user_id, duration_min, notes)
      values (${id()}, ${context.userId}, ${data.duration_min}, ${data.notes})
    `;
    return { ok: true };
  });

export const saveReading = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { work: string; page: number }) => ({
    work: String(d.work || "").slice(0, 40),
    page: Math.max(0, Math.min(9999, Math.floor(Number(d.page) || 0))),
  }))
  .handler(async ({ context, data }) => {
    if (!data.work) return { ok: false };
    const sql = await getSql();
    await sql`
      insert into reading_mark (user_id, work, page, updated_at)
      values (${context.userId}, ${data.work}, ${data.page}, now())
      on conflict (user_id, work) do update set page = ${data.page}, updated_at = now()
    `;
    return { ok: true };
  });

export const listReadings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ work: string; page: number }>`
      select work, page from reading_mark where user_id = ${context.userId}
    `;
  });

export const saveMemberCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { title: string; body: string; visibility: string }) => ({
    title: String(d.title || "").slice(0, 80),
    body: String(d.body || "").slice(0, 4000),
    visibility: d.visibility === "named" ? "named" : "private",
  }))
  .handler(async ({ context, data }) => {
    if (!data.body.trim()) return { ok: false as const };
    const sql = await getSql();
    const rowId = id();
    await sql`
      insert into member_code (id, user_id, title, body, visibility)
      values (${rowId}, ${context.userId}, ${data.title || "Untitled code"}, ${data.body}, ${data.visibility})
    `;
    return { ok: true as const, id: rowId };
  });

export const listMemberCodes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; title: string; body: string; visibility: string; created_at: string }>`
      select id, title, body, visibility, created_at::text as created_at
      from member_code
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
  });

export const markNode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((nodeId: string) => nodeId)
  .handler(async ({ context, data: nodeId }) => {
    const sql = await getSql();
    await sql`
      insert into user_progress (id, user_id, node_id, status, percent)
      values (${id()}, ${context.userId}, ${nodeId}, ${"complete"}, ${100})
      on conflict (user_id, node_id) do update set status = ${"complete"}, percent = ${100}
    `;
    return { ok: true };
  });

export const postNexus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { body: string; visibility: string; topic?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = {
      id: id(),
      body: data.body,
      visibility: data.visibility,
      topic: data.topic ?? "ongoing",
      created_at: new Date().toISOString(),
    };
    await sql`
      insert into nexus_entry (id, user_id, body, visibility, topic)
      values (${row.id}, ${context.userId}, ${row.body}, ${row.visibility}, ${row.topic})
    `;
    return row;
  });

export const listNexus = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId || "";
    return sql<{
      id: string;
      user_id: string;
      body: string;
      visibility: string;
      topic: string;
      created_at: string;
      handle: string;
      likes: number;
      liked: boolean;
    }>`
      select
        n.id,
        n.user_id,
        n.body,
        n.visibility,
        n.topic,
        n.created_at::text as created_at,
        coalesce(nullif(p.handle, ''), 'Seeker') as handle,
        (select count(*)::int from nexus_like l where l.entry_id = n.id) as likes,
        exists(
          select 1 from nexus_like l
          where l.entry_id = n.id and ${userId} <> '' and l.user_id = ${userId}
        ) as liked
      from nexus_entry n
      left join member_profile p on p.user_id = n.user_id
      where n.visibility <> ${"private"}
      order by n.created_at desc
      limit 80
    `;
  });

export const toggleNexusLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((entryId: string) => String(entryId || "").slice(0, 80))
  .handler(async ({ context, data: entryId }) => {
    if (!entryId) throw new Error("That post is gone.");
    const sql = await getSql();
    const [entry] = await sql<{ id: string }>`
      select id from nexus_entry where id = ${entryId} and visibility <> ${"private"}
    `;
    if (!entry) throw new Error("That post is gone.");
    const [mine] = await sql<{ ok: number }>`
      select 1 as ok from nexus_like where entry_id = ${entryId} and user_id = ${context.userId}
    `;
    if (mine) {
      await sql`delete from nexus_like where entry_id = ${entryId} and user_id = ${context.userId}`;
    } else {
      await sql`
        insert into nexus_like (entry_id, user_id)
        values (${entryId}, ${context.userId})
        on conflict (entry_id, user_id) do nothing
      `;
    }
    const [row] = await sql<{ likes: number }>`
      select count(*)::int as likes from nexus_like where entry_id = ${entryId}
    `;
    return { liked: !mine, likes: Number(row?.likes ?? 0) };
  });

export const listNexusComments = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{
    id: string;
    entry_id: string;
    user_id: string;
    body: string;
    created_at: string;
    handle: string;
  }>`
    select
      c.id,
      c.entry_id,
      c.user_id,
      c.body,
      c.created_at::text as created_at,
      coalesce(nullif(p.handle, ''), 'Seeker') as handle
    from nexus_comment c
    join nexus_entry n on n.id = c.entry_id
    left join member_profile p on p.user_id = c.user_id
    where n.visibility <> ${"private"}
    order by c.created_at asc
    limit 400
  `;
});

export const postNexusComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { entryId: string; body: string }) => ({
    entryId: String(d.entryId || "").slice(0, 80),
    body: String(d.body || "").trim().slice(0, 500),
  }))
  .handler(async ({ context, data }) => {
    if (!data.entryId || !data.body) throw new Error("Write the comment.");
    const sql = await getSql();
    const [entry] = await sql<{ id: string }>`
      select id from nexus_entry where id = ${data.entryId} and visibility <> ${"private"}
    `;
    if (!entry) throw new Error("That post is gone.");
    const row = {
      id: id(),
      body: data.body,
      created_at: new Date().toISOString(),
    };
    await sql`
      insert into nexus_comment (id, entry_id, user_id, body)
      values (${row.id}, ${data.entryId}, ${context.userId}, ${row.body})
    `;
    return row;
  });

export type StudyCircleRow = {
  id: number;
  name: string;
  description: string;
  last_body: string | null;
  last_at: string | null;
  kind: string;
};

export const listCircles = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId || "";
    return sql<StudyCircleRow>`
      select
        c.id,
        c.name,
        c.description,
        c.kind,
        (
          select m.body from circle_message m
          where m.circle_id = c.id
          order by m.created_at desc
          limit 1
        ) as last_body,
        (
          select m.created_at::text from circle_message m
          where m.circle_id = c.id
          order by m.created_at desc
          limit 1
        ) as last_at
      from study_circle c
      where c.kind <> ${"private"}
         or (${userId} <> '' and exists (
           select 1 from circle_member mem
           where mem.circle_id = c.id and mem.user_id = ${userId}
         ))
      order by case when c.name = 'Congregation' then 0 when c.kind = 'private' then 2 else 1 end, c.id
    `;
  });

export const listCircleMessages = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .validator((circleId: number) => circleId)
  .handler(async ({ context, data: circleId }) => {
    const sql = await getSql();
    const [circle] = await sql<{ kind: string }>`
      select kind from study_circle where id = ${circleId}
    `;
    if (!circle) return [];
    if (circle.kind === "private") {
      if (!context.userId) return [];
      const [mem] = await sql<{ ok: number }>`
        select 1 as ok from circle_member where circle_id = ${circleId} and user_id = ${context.userId}
      `;
      if (!mem) return [];
    }
    return sql<{ id: string; user_id: string; body: string; created_at: string; handle: string }>`
      select
        m.id,
        m.user_id,
        m.body,
        m.created_at::text as created_at,
        coalesce(nullif(p.handle, ''), 'Seeker') as handle
      from circle_message m
      left join member_profile p on p.user_id = m.user_id
      where m.circle_id = ${circleId}
      order by m.created_at asc
      limit 200
    `;
  });

export const postCircleMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { circleId: number; body: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [circle] = await sql<{ kind: string }>`
      select kind from study_circle where id = ${data.circleId}
    `;
    if (!circle) throw new Error("That circle is gone.");
    if (circle.kind === "private") {
      const [mem] = await sql<{ ok: number }>`
        select 1 as ok from circle_member where circle_id = ${data.circleId} and user_id = ${context.userId}
      `;
      if (!mem) throw new Error("This circle is closed.");
    }
    const row = {
      id: id(),
      body: data.body,
      created_at: new Date().toISOString(),
    };
    await sql`
      insert into circle_message (id, circle_id, user_id, body)
      values (${row.id}, ${data.circleId}, ${context.userId}, ${row.body})
    `;
    return row;
  });

async function friendPair(a: string, b: string) {
  if (!a || !b || a === b) return false;
  if (isHouseFriend(a) || isHouseFriend(b)) return true;
  const sql = await getSql();
  const [row] = await sql<{ id: string }>`
    select id from friendship
    where status = ${"friend"}
      and (
        (user_id = ${a} and other_user_id = ${b})
        or (user_id = ${b} and other_user_id = ${a})
      )
    limit 1
  `;
  return Boolean(row);
}

async function friendsOf(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ user_id: string; handle: string; avatar_url: string }>`
    select
      ids.user_id,
      coalesce(nullif(p.handle, ''), 'Seeker') as handle,
      coalesce(p.avatar_url, '') as avatar_url
    from (
      select other_user_id as user_id from friendship
      where user_id = ${userId} and status = ${"friend"}
      union
      select user_id from friendship
      where other_user_id = ${userId} and status = ${"friend"}
    ) ids
    left join member_profile p on p.user_id = ids.user_id
  `;
  const seen = new Set(rows.map((row) => row.user_id));
  const houses = [
    { user_id: HIGH_PRIEST_ID, handle: "HIGHPRIEST", avatar_url: "/crest-portrait.jpg" },
    { user_id: CHANCELLOR_ID, handle: "CHANCELLORMONDAY", avatar_url: "/monday.jpg" },
  ];
  for (const house of houses) {
    if (house.user_id !== userId && !seen.has(house.user_id)) rows.push(house);
  }
  return rows
    .filter((row) => row.user_id && row.user_id !== userId)
    .map((row) => ({ userId: row.user_id, handle: row.handle, avatarUrl: row.avatar_url }));
}

export const listFriends = createServerFn({ method: "GET" })
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ data }) => friendsOf(data));

export const resolveHouse = createServerFn({ method: "GET" })
  .validator((name: string) => String(name || "").slice(0, 40))
  .handler(async ({ data }) => {
    const key = data.toLowerCase().replace(/[^a-z]/g, "");
    const sql = await getSql();
    if (key === "anthonyvanity" || key === "highpriest") {
      const [row] = await sql<{ user_id: string }>`
        select user_id from member_profile
        where user_id <> ${HIGH_PRIEST_ID}
          and upper(replace(handle, '_', '')) in ('ANTHONYVANITY', 'HIGHPRIEST')
        limit 1
      `;
      return row?.user_id || HIGH_PRIEST_ID;
    }
    if (key === "chancellormonday") {
      const [row] = await sql<{ user_id: string }>`
        select user_id from member_profile
        where user_id <> ${CHANCELLOR_ID}
          and upper(replace(handle, '_', '')) = 'CHANCELLORMONDAY'
        limit 1
      `;
      return row?.user_id || CHANCELLOR_ID;
    }
    return "";
  });

export const memberCard = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ context, data: userId }) => {
    if (!userId) return null;
    const sql = await getSql();
    const [profile] = await sql<{
      user_id: string;
      handle: string;
      flame_name: string;
      bio: string;
      sigil: number;
      avatar_url: string;
      joined_at: string;
    }>`
      select user_id, handle, flame_name, bio, sigil, coalesce(avatar_url, '') as avatar_url, joined_at::text as joined_at
      from member_profile
      where user_id = ${userId}
    `;
    const [posted] = profile
      ? [profile]
      : await sql<{ user_id: string }>`
          select user_id from nexus_entry where user_id = ${userId} limit 1
        `;
    if (!profile && !posted) return null;
    const me = context.userId || "";
    return {
      userId,
      handle: profile?.handle?.trim() || "Seeker",
      flameName: profile?.flame_name ?? "",
      bio: profile?.bio ?? "",
      sigil: profile?.sigil ?? 1,
      avatarUrl: profile?.avatar_url ?? "",
      joinedAt: profile?.joined_at ?? "",
      house: isHouseFriend(userId),
      self: Boolean(me) && me === userId,
      friend: Boolean(me) && me !== userId ? await friendPair(me, userId) : false,
      friends: await friendsOf(userId),
    };
  });

export const addFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ context, data: other }) => {
    if (!other || other === context.userId) throw new Error("That is you.");
    const sql = await getSql();
    await sql`
      insert into friendship (id, user_id, other_user_id, status)
      values (${id()}, ${context.userId}, ${other}, ${"friend"})
      on conflict (user_id, other_user_id) do update set status = ${"friend"}
    `;
    return { ok: true };
  });

export const removeFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ context, data: other }) => {
    if (isHouseFriend(other)) throw new Error("That friendship stays.");
    const sql = await getSql();
    await sql`
      delete from friendship
      where (user_id = ${context.userId} and other_user_id = ${other})
         or (user_id = ${other} and other_user_id = ${context.userId})
    `;
    return { ok: true };
  });

export const openCircleWith = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: string) => String(userId || "").slice(0, 120))
  .handler(async ({ context, data: other }) => {
    if (!other || other === context.userId) throw new Error("That is you.");
    if (!(await friendPair(context.userId, other))) throw new Error("Add them as a friend first.");
    const sql = await getSql();
    const [existing] = await sql<{ id: number }>`
      select c.id
      from study_circle c
      where c.kind = ${"private"}
        and exists (select 1 from circle_member m where m.circle_id = c.id and m.user_id = ${context.userId})
        and exists (select 1 from circle_member m where m.circle_id = c.id and m.user_id = ${other})
      order by c.id asc
      limit 1
    `;
    if (existing) return { id: existing.id };
    const people = await sql<{ user_id: string; handle: string }>`
      select user_id, coalesce(nullif(handle, ''), 'Seeker') as handle
      from member_profile
      where user_id in (${context.userId}, ${other})
    `;
    const mine = people.find((p) => p.user_id === context.userId)?.handle || "Seeker";
    const theirs = people.find((p) => p.user_id === other)?.handle || "Seeker";
    const [created] = await sql<{ id: number }>`
      insert into study_circle (name, description, kind, owner_id)
      values (${`${mine} · ${theirs}`}, ${"A private circle."}, ${"private"}, ${context.userId})
      returning id
    `;
    await sql`
      insert into circle_member (circle_id, user_id) values
      (${created.id}, ${context.userId}),
      (${created.id}, ${other})
    `;
    return { id: created.id };
  });

export const listCircleMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((circleId: number) => Math.round(Number(circleId)))
  .handler(async ({ context, data: circleId }) => {
    const sql = await getSql();
    const [mem] = await sql<{ ok: number }>`
      select 1 as ok from circle_member where circle_id = ${circleId} and user_id = ${context.userId}
    `;
    if (!mem) return [];
    return sql<{ user_id: string; handle: string }>`
      select mem.user_id, coalesce(nullif(p.handle, ''), 'Seeker') as handle
      from circle_member mem
      left join member_profile p on p.user_id = mem.user_id
      where mem.circle_id = ${circleId}
      order by handle
    `;
  });

export const addCircleMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { circleId: number; handle: string }) => ({
    circleId: Math.round(Number(d.circleId)),
    handle: String(d.handle || "").trim().slice(0, 40),
  }))
  .handler(async ({ context, data }) => {
    if (!data.handle) throw new Error("Name the person.");
    const sql = await getSql();
    const [mem] = await sql<{ ok: number }>`
      select 1 as ok from circle_member where circle_id = ${data.circleId} and user_id = ${context.userId}
    `;
    if (!mem) throw new Error("This circle is closed.");
    const [person] = await sql<{ user_id: string }>`
      select user_id from member_profile
      where upper(handle) = upper(${data.handle})
      limit 1
    `;
    if (!person) throw new Error("No one in the house uses that name.");
    await sql`
      insert into circle_member (circle_id, user_id)
      values (${data.circleId}, ${person.user_id})
      on conflict (circle_id, user_id) do nothing
    `;
    return { ok: true };
  });

export const removeCircleMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { circleId: number; userId: string }) => ({
    circleId: Math.round(Number(d.circleId)),
    userId: String(d.userId || "").slice(0, 120),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [mem] = await sql<{ ok: number }>`
      select 1 as ok from circle_member where circle_id = ${data.circleId} and user_id = ${context.userId}
    `;
    if (!mem) throw new Error("This circle is closed.");
    await sql`
      delete from circle_member
      where circle_id = ${data.circleId} and user_id = ${data.userId}
    `;
    const [left] = await sql<{ n: number }>`
      select count(*)::int as n from circle_member where circle_id = ${data.circleId}
    `;
    if (!left || Number(left.n) === 0) {
      await sql`delete from study_circle where id = ${data.circleId} and kind = ${"private"}`;
    }
    return { ok: true };
  });

export const addContribution = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { tier: string; amount: number; note: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into contribution (id, user_id, tier, amount, note)
      values (${id()}, ${context.userId}, ${data.tier}, ${data.amount}, ${data.note})
    `;
    return { ok: true };
  });

export const requestCardMail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string; country: string; street: string; city: string; region: string; zip: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into card_mail_request (id, user_id, name, country, street, city, region, zip)
      values (${id()}, ${context.userId}, ${data.name}, ${data.country}, ${data.street}, ${data.city}, ${data.region}, ${data.zip})
    `;
    return { ok: true };
  });

const spamHits = new Map<string, number[]>();

function assertHuman(data: {
  company?: string;
  opened?: number;
  email?: string;
  name?: string;
  message?: string;
  token?: string;
  action?: string;
}) {
  if ((data.company ?? "").trim()) throw new Error("Rejected.");
  const age = Date.now() - Number(data.opened);
  if (!Number.isFinite(age) || age < 2500 || age > 12 * 60 * 60 * 1000) throw new Error("Rejected.");
  const name = data.name ?? "";
  const message = data.message ?? "";
  if (name.length > 120 || message.length > 4000) throw new Error("Rejected.");
  if ((message.match(/https?:\/\//gi) ?? []).length > 2) throw new Error("Rejected.");
  const key = (data.email || "anon").trim().toLowerCase();
  const now = Date.now();
  const hits = (spamHits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (hits.length >= 4) throw new Error("Rejected.");
  hits.push(now);
  spamHits.set(key, hits);
  return verifyRecaptcha(data.token ?? "", data.action || "contact");
}

async function verifyRecaptcha(token: string, action: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) return;
  if (!token) throw new Error("Rejected.");
  const body = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body });
  const json = (await res.json()) as { success?: boolean; score?: number; action?: string };
  if (!json.success || json.action !== action || (json.score ?? 0) < 0.5) throw new Error("Rejected.");
}

export const submitContact = createServerFn({ method: "POST" })
  .validator(
    (d: { name: string; email: string; message: string; company?: string; opened?: number; token?: string; action?: string }) => d,
  )
  .handler(async ({ data }) => {
    await assertHuman(data);
    const sql = await getSql();
    await sql`
      insert into contact_request (id, name, email, message)
      values (${id()}, ${data.name}, ${data.email}, ${data.message})
    `;
    return { ok: true };
  });

export const joinFlame = createServerFn({ method: "POST" })
  .validator((d: { email: string; company?: string; opened?: number; token?: string; action?: string }) => d)
  .handler(async ({ data }) => {
    await assertHuman({ ...data, action: data.action || "newsletter" });
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      throw new Error("A true address, or none.");
    }
    const sql = await getSql();
    await sql`
      insert into flame_list (email) values (${email})
      on conflict (email) do nothing
    `;
    return { ok: true as const };
  });

export const bookGuide = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { guide: string; slot: string; notes: string; company?: string; opened?: number; token?: string; action?: string }) => d)
  .handler(async ({ context, data }) => {
    await assertHuman({ ...data, message: data.notes, email: context.userId, action: data.action || "book" });
    const sql = await getSql();
    await sql`
      insert into video_guide_booking (id, user_id, guide, slot, notes)
      values (${id()}, ${context.userId}, ${data.guide}, ${data.slot}, ${data.notes})
    `;
    return { ok: true };
  });

export const listCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const courses = await sql<{
    id: number;
    code: string;
    title: string;
    department: string;
    access_level: string;
    description: string;
    kind: string;
  }>`select id, code, title, department, access_level, description, kind from course order by code`;
  const ceremonies = await sql<{
    slug: string;
    title: string;
    when_label: string;
    line: string;
  }>`select slug, title, when_label, line from ceremony order by id`;
  const transmissions = await sql<{
    slug: string;
    title: string;
    path_label: string;
    body: string;
  }>`select slug, title, path_label, body from transmission order by id`;
  const library = await sql<{
    slug: string;
    title: string;
    kicker: string;
    line: string;
    access_level: string;
  }>`select slug, title, kicker, line, access_level from library_work order by id`;
  return { courses, ceremonies, transmissions, library };
});
