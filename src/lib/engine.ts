import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { assertOwner, canComplete, tierAllows, withUnlock, type Viewer } from "@/lib/engine-rules";

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

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIERS = new Set(["public", "seeker", "initiate", "priestline"]);

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (!SLUG.test(slug)) throw new Error("The slug needs letters or numbers");
  return slug;
}

async function viewerOf(userId: string): Promise<Viewer> {
  if (!userId) return { signedIn: false, paid: false, role: "member" };
  const sql = await getSql();
  const [row] = await sql<{ role: string; tier: string; scholarship: boolean }>`
    select coalesce(role, 'member') as role,
           coalesce(tier, 'seeker') as tier,
           coalesce(scholarship, false) as scholarship
    from user_membership
    where user_id = ${userId}
    order by since desc
    limit 1
  `;
  const role = row?.role ?? "member";
  const tier = row?.tier ?? "seeker";
  const paid = Boolean(row?.scholarship) || tier === "initiate" || tier === "patron" || role === "chancellor";
  return { signedIn: true, paid, role };
}

async function assertChancellor(userId: string) {
  const view = await viewerOf(userId);
  if (view.role !== "chancellor") throw new Error("Chancellor only");
}

async function audit(actorId: string, action: string, target: string) {
  const sql = await getSql();
  await sql`
    insert into admin_audit (id, actor_id, action, target)
    values (${crypto.randomUUID()}, ${actorId}, ${action}, ${target})
  `;
}

type ArchiveRow = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  volume_number: number;
  chapter_number: number;
  sequence: number;
  subtitle: string;
  excerpt: string;
  body: string;
  access_tier: string;
  published: boolean;
  featured: boolean;
  tags: string;
  cover_image: string;
  download_url: string;
  seo_title: string;
  seo_description: string;
};

function card(row: ArchiveRow, viewer: Viewer) {
  const locked = !tierAllows(row.access_tier, viewer);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    contentType: row.content_type,
    volumeNumber: row.volume_number,
    chapterNumber: row.chapter_number,
    sequence: row.sequence,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    accessTier: row.access_tier,
    featured: row.featured,
    tags: row.tags,
    locked,
  };
}

export const browseArchive = createServerFn({ method: "POST" })
  .middleware([optionalAuth])
  .validator((q: { q?: string; type?: string; volume?: number }) => q ?? {})
  .handler(async ({ context, data }) => {
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const q = (data.q ?? "").trim().slice(0, 80);
    const type = (data.type ?? "").trim();
    const volume = Number(data.volume) || 0;
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const rows = await sql<ArchiveRow>`
      select id, title, slug, content_type, volume_number, chapter_number, sequence,
             subtitle, excerpt, '' as body, access_tier, published, featured, tags,
             '' as cover_image, '' as download_url, '' as seo_title, '' as seo_description
      from archive_item
      where published = true
        and (${type} = '' or content_type = ${type})
        and (${volume} = 0 or volume_number = ${volume})
        and (
          ${q} = ''
          or title ilike ${like}
          or subtitle ilike ${like}
          or excerpt ilike ${like}
          or tags ilike ${like}
        )
      order by volume_number asc, sequence asc, chapter_number asc, title asc
      limit 120
    `;
    return rows.map((row) => card(row, viewer));
  });

export const readArchive = createServerFn({ method: "POST" })
  .middleware([optionalAuth])
  .validator((slug: string) => slug)
  .handler(async ({ context, data }) => {
    const slug = slugify(data);
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const [row] = await sql<ArchiveRow>`
      select * from archive_item where slug = ${slug} and published = true limit 1
    `;
    if (!row) throw new Error("That record is not in the archive");
    const locked = !tierAllows(row.access_tier, viewer);
    const neighbors = await sql<{ slug: string; title: string; sequence: number }>`
      select slug, title, sequence
      from archive_item
      where published = true and content_type = ${row.content_type} and volume_number = ${row.volume_number}
      order by sequence asc, chapter_number asc
    `;
    const index = neighbors.findIndex((item) => item.slug === row.slug);
    const related = await sql<ArchiveRow>`
      select a.id, a.title, a.slug, a.content_type, a.volume_number, a.chapter_number, a.sequence,
             a.subtitle, a.excerpt, '' as body, a.access_tier, a.published, a.featured, a.tags,
             '' as cover_image, '' as download_url, '' as seo_title, '' as seo_description
      from archive_relation r
      join archive_item a on a.id = r.to_id
      where r.from_id = ${row.id} and a.published = true
      limit 8
    `;
    let saved = false;
    if (context.userId && !locked) {
      await sql`
        insert into reading_history (id, member_id, archive_item_id, last_opened_at)
        values (${crypto.randomUUID()}, ${context.userId}, ${row.id}, now())
        on conflict (member_id, archive_item_id)
        do update set last_opened_at = now()
      `;
      const [mark] = await sql<{ id: string }>`
        select id from saved_item where member_id = ${context.userId} and archive_item_id = ${row.id} limit 1
      `;
      saved = Boolean(mark);
    }
    return {
      locked,
      saved,
      seoTitle: row.seo_title || row.title,
      seoDescription: row.seo_description || row.excerpt,
      item: {
        ...card(row, viewer),
        body: locked ? "" : row.body,
        coverImage: locked ? "" : row.cover_image,
        downloadUrl: locked ? "" : row.download_url,
      },
      prev: index > 0 ? neighbors[index - 1] : null,
      next: index >= 0 && index < neighbors.length - 1 ? neighbors[index + 1] : null,
      related: related.map((item) => card(item, viewer)),
    };
  });

export const toggleSaved = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ context, data }) => {
    const slug = slugify(data);
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const [row] = await sql<{ id: string; access_tier: string }>`
      select id, access_tier from archive_item where slug = ${slug} and published = true limit 1
    `;
    if (!row || !tierAllows(row.access_tier, viewer)) throw new Error("That record is not yours to keep");
    const [existing] = await sql<{ id: string }>`
      select id from saved_item where member_id = ${context.userId} and archive_item_id = ${row.id} limit 1
    `;
    if (existing) {
      await sql`delete from saved_item where id = ${existing.id} and member_id = ${context.userId}`;
      return { saved: false };
    }
    await sql`
      insert into saved_item (id, member_id, archive_item_id)
      values (${crypto.randomUUID()}, ${context.userId}, ${row.id})
    `;
    return { saved: true };
  });

export const myLibrary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const saved = await sql<ArchiveRow>`
      select a.id, a.title, a.slug, a.content_type, a.volume_number, a.chapter_number, a.sequence,
             a.subtitle, a.excerpt, '' as body, a.access_tier, a.published, a.featured, a.tags,
             '' as cover_image, '' as download_url, '' as seo_title, '' as seo_description
      from saved_item s
      join archive_item a on a.id = s.archive_item_id
      where s.member_id = ${context.userId}
      order by s.created_at desc
      limit 24
    `;
    const recent = await sql<ArchiveRow>`
      select a.id, a.title, a.slug, a.content_type, a.volume_number, a.chapter_number, a.sequence,
             a.subtitle, a.excerpt, '' as body, a.access_tier, a.published, a.featured, a.tags,
             '' as cover_image, '' as download_url, '' as seo_title, '' as seo_description
      from reading_history h
      join archive_item a on a.id = h.archive_item_id
      where h.member_id = ${context.userId}
      order by h.last_opened_at desc
      limit 8
    `;
    return {
      saved: saved.filter((row) => tierAllows(row.access_tier, viewer)).map((row) => card(row, viewer)),
      recent: recent.filter((row) => tierAllows(row.access_tier, viewer)).map((row) => card(row, viewer)),
    };
  });

type StepRow = {
  id: string;
  step_number: number;
  title: string;
  subtitle: string;
  instruction: string;
  reflection_prompt: string;
  completion_label: string;
  required_input: boolean;
  published: boolean;
};

async function programState(slug: string, userId: string) {
  const viewer = await viewerOf(userId);
  const sql = await getSql();
  const [program] = await sql<{
    id: string;
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    access_tier: string;
    completion_title: string;
    completion_body: string;
  }>`
    select id, title, slug, subtitle, description, access_tier, completion_title, completion_body
    from program
    where slug = ${slug} and published = true
    limit 1
  `;
  if (!program) throw new Error("That sequence is not published");
  if (!tierAllows(program.access_tier, viewer)) {
    return {
      locked: true as const,
      program: {
        title: program.title,
        slug: program.slug,
        subtitle: program.subtitle,
        description: "",
        accessTier: program.access_tier,
        completionTitle: "",
        completionBody: "",
      },
      steps: [] as ReturnType<typeof shapeSteps>,
      completedCount: 0,
      totalSteps: 0,
      nextStep: null,
    };
  }
  const steps = await sql<StepRow>`
    select id, step_number, title, subtitle, instruction, reflection_prompt, completion_label, required_input, published
    from program_step
    where program_id = ${program.id} and published = true
    order by step_number asc
  `;
  const progress = userId
    ? await sql<{ step_number: number; reflection: string }>`
        select step_number, reflection
        from program_progress
        where member_id = ${userId} and program_id = ${program.id}
      `
    : [];
  progress.forEach((row) => assertOwner(userId, userId));
  const done = new Set(progress.map((row) => row.step_number));
  const reflections = new Map(progress.map((row) => [row.step_number, row.reflection]));
  const shaped = shapeSteps(steps, done, reflections);
  const next = shaped.find((step) => step.unlocked && !step.completed) ?? null;
  return {
    locked: false as const,
    program: {
      title: program.title,
      slug: program.slug,
      subtitle: program.subtitle,
      description: program.description,
      accessTier: program.access_tier,
      completionTitle: program.completion_title,
      completionBody: program.completion_body,
    },
    steps: shaped,
    completedCount: done.size,
    totalSteps: shaped.length,
    nextStep: next,
  };
}

function shapeSteps(steps: StepRow[], done: Set<number>, reflections: Map<number, string>) {
  return withUnlock(
    steps.map((step) => ({
      id: step.id,
      stepNumber: step.step_number,
      title: step.title,
      subtitle: step.subtitle,
      instruction: step.instruction,
      reflectionPrompt: step.reflection_prompt,
      completionLabel: step.completion_label || "Seal record",
      requiredInput: step.required_input,
      reflection: reflections.get(step.step_number) ?? "",
    })),
    done,
  ).map((step) => ({
    ...step,
    instruction: step.unlocked ? step.instruction : "",
    reflectionPrompt: step.unlocked ? step.reflectionPrompt : "",
    reflection: step.completed ? step.reflection : "",
  }));
}

export const readProgram = createServerFn({ method: "POST" })
  .middleware([optionalAuth])
  .validator((slug: string) => slug)
  .handler(async ({ context, data }) => programState(slugify(data), context.userId));

export const completeStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { slug: string; stepNumber: number; reflection: string }) => d)
  .handler(async ({ context, data }) => {
    const slug = slugify(data.slug);
    const stepNumber = Math.round(Number(data.stepNumber));
    const reflection = (data.reflection ?? "").trim().slice(0, 4000);
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const [program] = await sql<{ id: string; access_tier: string }>`
      select id, access_tier from program where slug = ${slug} and published = true limit 1
    `;
    if (!program || !tierAllows(program.access_tier, viewer)) throw new Error("This gate is closed");
    const [step] = await sql<{ id: string; required_input: boolean; published: boolean }>`
      select id, required_input, published
      from program_step
      where program_id = ${program.id} and step_number = ${stepNumber}
      limit 1
    `;
    if (!step || !step.published) throw new Error("That step is not in the sequence");
    if (step.required_input && reflection.length < 2) throw new Error("The record needs a reflection");
    const progress = await sql<{ step_number: number }>`
      select step_number from program_progress
      where member_id = ${context.userId} and program_id = ${program.id}
    `;
    const done = new Set(progress.map((row) => row.step_number));
    if (!canComplete(stepNumber, done)) throw new Error("The previous record is still open");
    await sql`
      insert into program_progress (id, member_id, program_id, step_id, step_number, reflection)
      values (${crypto.randomUUID()}, ${context.userId}, ${program.id}, ${step.id}, ${stepNumber}, ${reflection})
      on conflict (member_id, program_id, step_id) do nothing
    `;
    return programState(slug, context.userId);
  });

export const mySequences = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const viewer = await viewerOf(context.userId);
    const sql = await getSql();
    const programs = await sql<{ id: string; title: string; slug: string; access_tier: string }>`
      select id, title, slug, access_tier from program where published = true order by title asc
    `;
    const open = programs.filter((program) => tierAllows(program.access_tier, viewer));
    const counts = await sql<{ program_id: string; total: number }>`
      select program_id, count(*)::int as total
      from program_step
      where published = true
      group by program_id
    `;
    const mine = await sql<{ program_id: string; done: number }>`
      select program_id, count(*)::int as done
      from program_progress
      where member_id = ${context.userId}
      group by program_id
    `;
    const totalOf = new Map(counts.map((row) => [row.program_id, row.total]));
    const doneOf = new Map(mine.map((row) => [row.program_id, row.done]));
    return open.map((program) => ({
      slug: program.slug,
      title: program.title,
      completed: Number(doneOf.get(program.id) ?? 0),
      total: Number(totalOf.get(program.id) ?? 0),
    }));
  });

type ArchiveInput = {
  id?: string;
  title: string;
  slug?: string;
  contentType?: string;
  volumeNumber?: number;
  chapterNumber?: number;
  sequence?: number;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  accessTier?: string;
  published?: boolean;
  featured?: boolean;
  tags?: string;
};

export const saveArchive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: ArchiveInput) => d)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const title = data.title.trim().slice(0, 180);
    if (!title) throw new Error("A record needs a title");
    const slug = slugify(data.slug?.trim() || title);
    const tier = TIERS.has(data.accessTier ?? "") ? data.accessTier! : "seeker";
    const id = data.id?.trim() || crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into archive_item (
        id, title, slug, content_type, volume_number, chapter_number, sequence,
        subtitle, excerpt, body, access_tier, published, featured, tags, updated_at, published_at
      ) values (
        ${id}, ${title}, ${slug}, ${(data.contentType || "COS").slice(0, 40)},
        ${Math.round(Number(data.volumeNumber) || 0)},
        ${Math.round(Number(data.chapterNumber) || 0)},
        ${Math.round(Number(data.sequence) || 0)},
        ${(data.subtitle || "").slice(0, 240)},
        ${(data.excerpt || "").slice(0, 500)},
        ${(data.body || "").slice(0, 20000)},
        ${tier},
        ${Boolean(data.published)},
        ${Boolean(data.featured)},
        ${(data.tags || "").slice(0, 240)},
        now(),
        ${data.published ? new Date().toISOString() : null}
      )
      on conflict (id) do update set
        title = excluded.title,
        slug = excluded.slug,
        content_type = excluded.content_type,
        volume_number = excluded.volume_number,
        chapter_number = excluded.chapter_number,
        sequence = excluded.sequence,
        subtitle = excluded.subtitle,
        excerpt = excluded.excerpt,
        body = excluded.body,
        access_tier = excluded.access_tier,
        published = excluded.published,
        featured = excluded.featured,
        tags = excluded.tags,
        updated_at = now()
    `;
    await audit(context.userId, "save-archive", slug);
    return { id, slug };
  });

type ProgramInput = {
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  accessTier?: string;
  published?: boolean;
  completionTitle?: string;
  completionBody?: string;
};

export const saveProgram = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: ProgramInput) => d)
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const title = data.title.trim().slice(0, 180);
    if (!title) throw new Error("A sequence needs a title");
    const slug = slugify(data.slug?.trim() || title);
    const tier = TIERS.has(data.accessTier ?? "") ? data.accessTier! : "seeker";
    const id = data.id?.trim() || crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into program (
        id, title, slug, program_type, description, access_tier, published,
        completion_title, completion_body, updated_at, published_at
      ) values (
        ${id}, ${title}, ${slug}, 'SEQUENCE', ${(data.description || "").slice(0, 2000)},
        ${tier}, ${Boolean(data.published)},
        ${(data.completionTitle || "").slice(0, 180)},
        ${(data.completionBody || "").slice(0, 2000)},
        now(),
        ${data.published ? new Date().toISOString() : null}
      )
      on conflict (id) do update set
        title = excluded.title,
        slug = excluded.slug,
        description = excluded.description,
        access_tier = excluded.access_tier,
        published = excluded.published,
        completion_title = excluded.completion_title,
        completion_body = excluded.completion_body,
        updated_at = now()
    `;
    await audit(context.userId, "save-program", slug);
    return { id, slug };
  });

export const saveStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      id?: string;
      programId: string;
      stepNumber: number;
      title: string;
      instruction?: string;
      reflectionPrompt?: string;
      requiredInput?: boolean;
      published?: boolean;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertChancellor(context.userId);
    const title = data.title.trim().slice(0, 180);
    if (!title) throw new Error("A step needs a title");
    const stepNumber = Math.max(1, Math.round(Number(data.stepNumber) || 1));
    const id = data.id?.trim() || crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into program_step (
        id, program_id, step_number, title, instruction, reflection_prompt, required_input, published, updated_at
      ) values (
        ${id}, ${data.programId}, ${stepNumber}, ${title},
        ${(data.instruction || "").slice(0, 8000)},
        ${(data.reflectionPrompt || "").slice(0, 500)},
        ${Boolean(data.requiredInput)},
        ${data.published !== false},
        now()
      )
      on conflict (id) do update set
        step_number = excluded.step_number,
        title = excluded.title,
        instruction = excluded.instruction,
        reflection_prompt = excluded.reflection_prompt,
        required_input = excluded.required_input,
        published = excluded.published,
        updated_at = now()
    `;
    await audit(context.userId, "save-step", id);
    return { id };
  });

export const deskEngine = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertChancellor(context.userId);
    const sql = await getSql();
    const archives = await sql<ArchiveRow>`
      select id, title, slug, content_type, volume_number, chapter_number, sequence,
             subtitle, excerpt, body, access_tier, published, featured, tags,
             cover_image, download_url, seo_title, seo_description
      from archive_item
      order by volume_number, sequence, title
      limit 200
    `;
    const programs = await sql<{
      id: string;
      title: string;
      slug: string;
      description: string;
      access_tier: string;
      published: boolean;
      completion_title: string;
      completion_body: string;
    }>`
      select id, title, slug, description, access_tier, published, completion_title, completion_body
      from program
      order by title
    `;
    const steps = await sql<{
      id: string;
      program_id: string;
      step_number: number;
      title: string;
      instruction: string;
      reflection_prompt: string;
      required_input: boolean;
      published: boolean;
    }>`
      select id, program_id, step_number, title, instruction, reflection_prompt, required_input, published
      from program_step
      order by program_id, step_number
    `;
    return { archives, programs, steps };
  });
