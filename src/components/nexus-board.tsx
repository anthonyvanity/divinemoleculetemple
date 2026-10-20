import { Link } from "@tanstack/react-router";
import { NameLink } from "@/components/name-link";
import { Hexagon, Lock, Send, Users } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { listCircleMessages, listCircles, listNexus, listNexusComments, postCircleMessage, postNexus, postNexusComment, listCircleMembers, addCircleMember, removeCircleMember, toggleNexusLike } from "@/lib/temple-data";
import { LATIN_FULL, TEMPLE_NAME } from "@/lib/temple-content";
import { displayHandle, useTemple, type NexusPost } from "@/lib/temple-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export type FeedPost = {
  id: string;
  body: string;
  visibility: NexusPost["visibility"];
  at: string;
  handle: string;
  userId?: string;
  likes?: number;
  liked?: boolean;
};

const CRESTS = [
  { id: "silver", src: "/crest-wings-silver.webp", label: "Silver" },
] as const;

const TEMPLE_URL = "dmtemple.com";

export function TempleShareCard({
  excerpt,
  handle,
  crestId,
  onCrest,
}: {
  excerpt?: string;
  handle?: string;
  crestId?: string;
  onCrest?: (id: string) => void;
}) {
  const crest = CRESTS.find((c) => c.id === crestId) ?? CRESTS[0];
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--desk-line)" }}>
      <div className="relative bg-paper px-4 pt-4">
        <img src={crest.src} alt="" className="mx-auto h-28 w-auto object-contain sm:h-36" />
        {onCrest ? (
          <div className="absolute right-2 top-2 flex gap-1">
            {CRESTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCrest(c.id)}
                className="size-8 overflow-hidden rounded-full border"
                style={{
                  borderColor: c.id === crest.id ? "var(--desk-accent)" : "var(--desk-line)",
                }}
                aria-label={c.label}
              >
                <img src={c.src} alt="" className="size-full object-cover object-center" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="px-4 py-3">
        <p className="text-[9px] tracking-[0.18em]" style={{ color: "var(--desk-muted)" }}>
          {handle ?? "Seeker"} · {LATIN_FULL}
        </p>
        <p className="mt-1 font-display text-sm leading-tight">{TEMPLE_NAME}</p>
        {excerpt ? (
          <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed" style={{ color: "var(--desk-muted)" }}>
            {excerpt}
          </p>
        ) : (
          <p className="mt-2 text-[11px] tracking-[0.14em]" style={{ color: "var(--desk-muted)" }}>
            Digital sanctuary and modern divinity academy
          </p>
        )}
        <Link
          to="/"
          className="mt-3 inline-flex min-h-8 items-center text-[10px] tracking-[0.18em]"
          style={{ color: "var(--desk-accent)" }}
        >
          {TEMPLE_URL} →
        </Link>
      </div>
    </div>
  );
}

export type FeedComment = {
  id: string;
  entryId: string;
  userId: string;
  handle: string;
  body: string;
  at: string;
};

export function useNexusFeed() {
  const local = useTemple((s) => s.nexusPosts);
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const { user } = useCurrentUserState();
  const name = displayHandle(handle, flameName);
  const [remote, setRemote] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<FeedComment[]>([]);

  function refresh() {
    void listNexus()
      .then((rows) =>
        setRemote(
          rows.map((r) => ({
            id: r.id,
            body: r.body,
            visibility: r.visibility as NexusPost["visibility"],
            at: r.created_at,
            handle: r.handle || "Seeker",
            userId: r.user_id,
            likes: Number(r.likes ?? 0),
            liked: Boolean(r.liked),
          })),
        ),
      )
      .catch(() => {});
    void listNexusComments()
      .then((rows) =>
        setComments(
          rows.map((row) => ({
            id: row.id,
            entryId: row.entry_id,
            userId: row.user_id,
            handle: row.handle || "Seeker",
            body: row.body,
            at: row.created_at,
          })),
        ),
      )
      .catch(() => {});
  }

  useEffect(() => {
    refresh();
  }, []);

  const feed: FeedPost[] = [
    ...remote.filter((p) => p.visibility !== "private"),
    ...local
      .filter((p) => p.visibility !== "private" && !remote.some((r) => r.body === p.body))
      .map((p) => ({
        id: p.id,
        body: p.body,
        visibility: p.visibility,
        at: p.at,
        handle: p.visibility === "named" ? name : "Anonymous",
        userId: p.visibility === "named" ? user?.id : undefined,
      })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return { feed, comments, refresh, name };
}

export function SignalComposer({
  compact,
  onPosted,
}: {
  compact?: boolean;
  onPosted?: () => void;
}) {
  const addNexusPost = useTemple((s) => s.addNexusPost);
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const name = displayHandle(handle, flameName);
  const [body, setBody] = useState("");
  const [pub, setPub] = useState(false);
  const [signed, setSigned] = useState(true);
  const [busy, setBusy] = useState(false);
  const [crest, setCrest] = useState("silver");

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      toast.error("Write the signal first.");
      return;
    }
    const visibility: NexusPost["visibility"] = !pub ? "private" : signed ? "named" : "anonymous";
    setBusy(true);
    addNexusPost({ body: text, visibility });
    void postNexus({ data: { body: text, visibility, topic: "ongoing" } })
      .catch(() => {})
      .finally(() => setBusy(false));
    setBody("");
    onPosted?.();
    toast.success(pub ? "Posted for the congregation." : "Kept in your private journal.");
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] tracking-[0.16em]">
          <Hexagon className="size-3.5" /> Nexus signal
        </p>
        <div className="flex rounded-full border p-0.5" style={{ borderColor: "var(--desk-line)" }}>
          <button
            type="button"
            onClick={() => setPub(false)}
            className={cn("flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[9px] tracking-[0.14em]")}
            style={
              !pub
                ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }
                : { color: "var(--desk-muted)" }
            }
          >
            <Lock className="size-3" /> Private
          </button>
          <button
            type="button"
            onClick={() => setPub(true)}
            className={cn("flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[9px] tracking-[0.14em]")}
            style={
              pub
                ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }
                : { color: "var(--desk-muted)" }
            }
          >
            Public
          </button>
        </div>
      </div>
      {pub ? (
        <div className="mt-2 flex justify-end gap-2 text-[9px] tracking-[0.14em]">
          <button type="button" onClick={() => setSigned(false)} className={cn("min-h-8 px-2", !signed && "text-lime")}>
            Anonymous
          </button>
          <button type="button" onClick={() => setSigned(true)} className={cn("min-h-8 px-2", signed && "text-lime")}>
            Signed
          </button>
        </div>
      ) : null}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 5 : 7}
        placeholder="Write the entry. What you lived, what you are still sitting with, what you want the house to know."
        className="mt-3 min-h-[7rem] w-full flex-1 resize-none rounded-md border bg-transparent p-3 text-sm leading-relaxed outline-none"
        style={{ borderColor: "var(--desk-line)", color: "var(--desk-fg)" }}
      />
      {pub || body.trim() ? (
        <div className="mt-3">
          <p className="mb-2 text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
            Sample card
          </p>
          <TempleShareCard excerpt={body.trim()} handle={name} crestId={crest} onCrest={setCrest} />
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
          {pub ? (signed ? "Public. Your name is on it." : "Public. No name.") : "Private. Only you can read this."}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-[11px] tracking-[0.18em]"
          style={{ background: "var(--desk-cta)", color: "var(--desk-cta-fg)" }}
        >
          {busy ? "Sealing…" : pub ? "Post" : "Seal"}
          <Send className="size-3.5" />
        </button>
      </div>
    </form>
  );
}

export function NexusFeed({
  posts,
  comments = [],
  onPosted,
  limit,
}: {
  posts: FeedPost[];
  comments?: FeedComment[];
  onPosted?: () => void;
  limit?: number;
}) {
  const rows = limit ? posts.slice(0, limit) : posts;
  return (
    <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      {rows.length === 0 ? (
        <li className="py-8 text-center text-[11px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
          The wall is quiet. Be the first signal.
        </li>
      ) : (
        rows.map((p) => (
          <li key={p.id} className="border-b pb-3 last:border-b-0" style={{ borderColor: "var(--desk-line)" }}>
            <p className="flex items-center justify-between gap-2 text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
              {p.userId ? (
                <NameLink userId={p.userId} style={{ color: "var(--desk-accent)" }}>
                  {p.handle}
                </NameLink>
              ) : (
                <span style={{ color: "var(--desk-accent)" }}>{p.handle}</span>
              )}
              <span>{new Date(p.at).toLocaleString()}</span>
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.body}</p>
            {typeof p.likes === "number" ? <LikeButton post={p} /> : null}
            {typeof p.likes === "number" ? (
              <CommentBox postId={p.id} comments={comments.filter((c) => c.entryId === p.id)} onPosted={onPosted} />
            ) : null}
            {p.visibility !== "private" ? (
              <div className="mt-3">
                <TempleShareCard excerpt={p.body} handle={p.handle} />
              </div>
            ) : null}
          </li>
        ))
      )}
    </ul>
  );
}

function LikeButton({ post }: { post: FeedPost }) {
  const { user } = useCurrentUserState();
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [count, setCount] = useState(Number(post.likes ?? 0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(Boolean(post.liked));
    setCount(Number(post.likes ?? 0));
  }, [post.id, post.liked, post.likes]);

  if (!user) {
    return (
      <Link to="/register" className="mt-2 inline-flex text-[10px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
        Like{count ? ` · ${count}` : ""}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void toggleNexusLike({ data: post.id })
          .then((row) => {
            setLiked(row.liked);
            setCount(row.likes);
          })
          .catch(() => toast.error("The like did not land."))
          .finally(() => setBusy(false));
      }}
      className="mt-2 text-[10px] tracking-[0.16em]"
      style={{ color: liked ? "var(--desk-accent)" : "var(--desk-muted)" }}
    >
      {liked ? "Liked" : "Like"}
      {count ? ` · ${count}` : ""}
    </button>
  );
}

function CommentBox({
  postId,
  comments,
  onPosted,
}: {
  postId: string;
  comments: FeedComment[];
  onPosted?: () => void;
}) {
  const { user } = useCurrentUserState();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-2">
      {comments.length ? (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li key={comment.id}>
              <NameLink userId={comment.userId} className="text-[9px] tracking-[0.14em]" style={{ color: "var(--desk-accent)" }}>
                {comment.handle}
              </NameLink>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{comment.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {user ? (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = body.trim();
            if (!text) return;
            setBusy(true);
            void postNexusComment({ data: { entryId: postId, body: text } })
              .then(() => {
                setBody("");
                onPosted?.();
              })
              .catch((error: Error) => toast.error(error.message || "The comment did not land."))
              .finally(() => setBusy(false));
          }}
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Comment"
            maxLength={500}
            className="h-9 min-w-0 flex-1 rounded-md border bg-transparent px-2 text-[12px] outline-none"
            style={{ borderColor: "var(--desk-line)" }}
          />
          <button type="submit" disabled={busy} className="h-9 px-3 text-[10px] tracking-[0.14em]" style={{ color: "var(--desk-accent)" }}>
            Send
          </button>
        </form>
      ) : (
        <Link to="/register" className="mt-2 inline-flex text-[10px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
          Join to comment
        </Link>
      )}
    </div>
  );
}

export function CircleChat({ preview, openId }: { preview?: boolean; openId?: number }) {
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const name = displayHandle(handle, flameName);
  const { user } = useCurrentUserState();
  const [circles, setCircles] = useState<{ id: number; name: string; description: string; last_body: string | null; kind: string }[]>([]);
  const [active, setActive] = useState<number | null>(openId ?? null);
  const [messages, setMessages] = useState<{ id: string; user_id: string; body: string; created_at: string; handle: string }[]>([]);
  const [members, setMembers] = useState<{ user_id: string; handle: string }[]>([]);
  const [addWho, setAddWho] = useState("");
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  function loadCircles() {
    void listCircles()
      .then((rows) => {
        setCircles(rows);
        setActive((cur) => cur ?? openId ?? rows[0]?.id ?? null);
      })
      .catch(() => {});
  }

  function loadMessages(id: number) {
    void listCircleMessages({ data: id })
      .then(setMessages)
      .catch(() => {});
  }

  useEffect(() => {
    loadCircles();
  }, []);

  useEffect(() => {
    if (active == null) return;
    loadMessages(active);
    const t = window.setInterval(() => loadMessages(active), 4000);
    return () => window.clearInterval(t);
  }, [active]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  function send(e: FormEvent) {
    e.preventDefault();
    if (active == null || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), user_id: user?.id ?? "", body, created_at: new Date().toISOString(), handle: name }]);
    void postCircleMessage({ data: { circleId: active, body } }).catch(() => toast.error("Signal did not land."));
  }

  const current = circles.find((c) => c.id === active);
  const mine = current?.kind === "private";

  useEffect(() => {
    if (!mine || active == null || !user) {
      setMembers([]);
      return;
    }
    void listCircleMembers({ data: active })
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [mine, active, user]);

  if (preview) {
    return (
      <article className="desk-card flex flex-col p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] tracking-[0.16em]">
            <Users className="size-3.5" /> Study circles
          </p>
          <Link to="/nexus" className="text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
            Open chats
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {circles.slice(0, 4).map((c) => (
            <li key={c.id}>
              <Link
                to="/nexus"
                className="block rounded-md border px-3 py-2 hover:opacity-80"
                style={{ borderColor: "var(--desk-line)" }}
              >
                <p className="text-[11px] tracking-wide">{c.name}</p>
                <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--desk-muted)" }}>
                  {c.last_body || c.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <div className="desk-card grid min-h-[28rem] overflow-hidden md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="border-b md:border-b-0 md:border-r" style={{ borderColor: "var(--desk-line)" }}>
        <p className="flex items-center gap-1.5 px-4 py-3 text-[10px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
          <Users className="size-3.5" /> Circles
        </p>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {circles.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className="min-h-11 shrink-0 rounded-md px-3 py-2 text-left text-[11px] tracking-wide"
              style={
                c.id === active
                  ? { background: "var(--desk-nav)", color: "var(--desk-nav-fg)" }
                  : undefined
              }
            >
              <span className="block truncate">{c.name}</span>
              <span className="mt-0.5 block truncate text-[9px] opacity-70">{c.last_body || c.description}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-0 flex-col">
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--desk-line)" }}>
          <p className="font-display text-lg leading-none">{current?.name ?? "Select a circle"}</p>
          <p className="mt-1 text-[10px] tracking-[0.14em]" style={{ color: "var(--desk-muted)" }}>
            {current?.description ?? "Group chat for the chamber"}
          </p>
          {mine && user ? (
            <div className="mt-3">
              <ul className="flex flex-wrap gap-2">
                {members.map((person) => (
                  <li key={person.user_id} className="flex items-center gap-1 text-[10px] tracking-[0.12em]">
                    <NameLink userId={person.user_id} style={{ color: "var(--desk-accent)" }}>
                      {person.handle}
                    </NameLink>
                    <button
                      type="button"
                      className="text-paper/40"
                      aria-label={`Remove ${person.handle}`}
                      onClick={() => {
                        void removeCircleMember({ data: { circleId: active ?? 0, userId: person.user_id } })
                          .then(() => {
                            if (person.user_id === user.id) {
                              setActive(null);
                              loadCircles();
                              return;
                            }
                            setMembers((list) => list.filter((row) => row.user_id !== person.user_id));
                          })
                          .catch((error: Error) => toast.error(error.message || "They stayed."));
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const who = addWho.trim();
                  if (!who || active == null) return;
                  void addCircleMember({ data: { circleId: active, handle: who } })
                    .then(() => {
                      setAddWho("");
                      return listCircleMembers({ data: active }).then(setMembers);
                    })
                    .catch((error: Error) => toast.error(error.message || "They were not added."));
                }}
              >
                <input
                  value={addWho}
                  onChange={(e) => setAddWho(e.target.value)}
                  placeholder="Add by name"
                  className="h-9 min-w-0 flex-1 rounded-md border bg-transparent px-2 text-[12px] outline-none"
                  style={{ borderColor: "var(--desk-line)" }}
                />
                <button type="submit" className="h-9 px-3 text-[10px] tracking-[0.14em]" style={{ color: "var(--desk-accent)" }}>
                  Add
                </button>
              </form>
            </div>
          ) : null}
        </div>
        <div ref={scroller} className="min-h-[16rem] flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-[11px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
              No traffic yet. Open the channel.
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id}>
                <p className="text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-accent)" }}>
                  {m.user_id ? (
                    <NameLink userId={m.user_id}>{m.handle}</NameLink>
                  ) : (
                    m.handle
                  )}
                  <span className="ml-2" style={{ color: "var(--desk-muted)" }}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{m.body}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t p-3" style={{ borderColor: "var(--desk-line)" }}>
          {user ? (
            <>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Transmit to the circle…"
                className="h-11 min-w-0 flex-1 rounded-md border bg-transparent px-3 text-sm outline-none"
                style={{ borderColor: "var(--desk-line)" }}
              />
              <button
                type="submit"
                className="grid size-11 place-items-center rounded-md"
                style={{ background: "var(--desk-cta)", color: "var(--desk-cta-fg)" }}
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </>
          ) : (
            <Link to="/register" className="inline-flex min-h-11 items-center text-[11px] uppercase tracking-wide" style={{ color: "var(--desk-accent)" }}>
              Join free to speak in this room
            </Link>
          )}
        </form>
      </div>
    </div>
  );
}
