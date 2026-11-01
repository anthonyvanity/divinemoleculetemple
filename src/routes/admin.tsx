import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadCovenantDesk, moderateCovenant } from "@/lib/covenant";
import { flameCsv, grantFlameSeat, loadFlameDesk, pendingFlameNotes, releaseFlameNote, reviewWaitlist, setFlameCapacity } from "@/lib/flame";
import { grantAscension, loadCommand, readDocument, saveCampaign, saveDocument, setPreviewTier, setRecoveryAdmin, setSuspension } from "@/lib/command";
import { claimChancellor } from "@/lib/temple-admin";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/admin")({ component: AdminGate });

type Desk = Awaited<ReturnType<typeof loadCommand>>;

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <main className="grid min-h-dvh place-items-center bg-black text-[#c6ff00]">Opening the desk…</main>;
  if (!user) return <RedirectToSignIn to="/login" />;
  return <Command />;
}

function Command() {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"command" | "members" | "documents" | "audit" | "flame" | "covenant">("command");
  const [q, setQ] = useState("");

  async function refresh() {
    const data = await loadCommand();
    setDesk(data);
    setErr("");
  }

  useEffect(() => {
    void refresh().catch((error: Error) => setErr(error.message || "This desk is closed"));
  }, []);

  if (err && !desk) {
    return (
      <main className="min-h-dvh bg-black px-4 py-16 text-[#f3f0e6]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c6ff00]">Temple Command</p>
        <h1 className="mt-2 font-display text-3xl uppercase">Back door</h1>
        <p className="mt-3 max-w-md font-mono text-[12px] normal-case text-white/70">
          Sign in on this browser, then speak the house phrase. It opens this panel for the account you are using. {err}
        </p>
        <PhraseDoor onOpen={() => void refresh()} />
      </main>
    );
  }
  if (!desk) return <main className="min-h-dvh bg-black text-[#c6ff00]">Reading the records…</main>;

  const members = desk.members.filter((member) => {
    const hay = `${member.email} ${member.name} ${member.handle} ${member.tier} ${member.billing_status}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <main className="min-h-dvh bg-black text-[#f3f0e6]">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c6ff00]">Command center // High Priest access</p>
          <h1 className="font-display text-3xl uppercase leading-none">Temple Command</h1>
        </div>
        <p className="text-[12px] uppercase tracking-[0.12em]">
          Paying {desk.counts.paying} / Initiates {desk.counts.initiates}
        </p>
      </header>
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 text-[10px] uppercase tracking-[0.14em]">
        {(["command", "members", "documents", "flame", "covenant", "audit"] as const).map((name) => (
          <button key={name} type="button" onClick={() => setTab(name)} className={tab === name ? "bg-[#c6ff00] px-3 py-2 text-black" : "border border-white/15 px-3 py-2"}>
            {name}
          </button>
        ))}
        <Link to="/chancellor" className="border border-white/15 px-3 py-2">
          Mail and treasury
        </Link>
        <Link to="/dashboard" className="border border-white/15 px-3 py-2">
          My desk
        </Link>
      </nav>

      {tab === "command" ? <Home desk={desk} onPreview={refresh} /> : null}
      {tab === "members" ? <Members members={members} campaigns={desk.campaigns} q={q} setQ={setQ} onDone={refresh} /> : null}
      {tab === "documents" ? <Documents documents={desk.documents} preview={desk.preview} onDone={refresh} /> : null}
      {tab === "flame" ? <FlameDesk /> : null}
      {tab === "covenant" ? <CovenantDesk /> : null}
      {tab === "audit" ? <Audit desk={desk} onDone={refresh} /> : null}
    </main>
  );
}

function PhraseDoor({ onOpen }: { onOpen: () => void }) {
  const path = useTemple((s) => s.path);
  const setAccess = useTemple((s) => s.setAccess);
  const [phrase, setPhrase] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="mt-6 max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setErr("");
        void claimChancellor({ data: phrase })
          .then(() => {
            setAccess({ paid: true, role: "chancellor", path: path === "none" ? "initiate" : path });
            onOpen();
          })
          .catch((error: Error) => setErr(error.message || "Rejected"));
      }}
    >
      <input
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        autoComplete="off"
        placeholder="HOUSE PHRASE"
        className="w-full border border-[#c6ff00]/40 bg-transparent px-3 py-3 font-mono text-[13px] uppercase tracking-wide outline-none"
      />
      <button type="submit" className="mt-3 bg-[#c6ff00] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-black">
        Open the panel
      </button>
      {err ? <p className="mt-3 font-mono text-[12px] normal-case text-orange-300">{err}</p> : null}
    </form>
  );
}

function Home({ desk, onPreview }: { desk: Desk; onPreview: () => Promise<void> }) {
  const c = desk.counts;
  const cards = [
    ["Members", c.members, "Every account with a membership row"],
    ["Seekers", c.seekers, "Rank, not a payment"],
    ["Initiates", c.initiates, "Access tier. Not revenue."],
    ["Paying", c.paying, "A Stripe subscription is on the record"],
    ["Complimentary", c.complimentary, "Access granted. Nothing charged."],
    ["Scholarship", c.scholarship, "Tracked apart from a gift"],
    ["Sponsored", c.sponsored, "A third party is the recorded source"],
    ["Founding", c.founding, "The mark stays if the tier changes"],
    ["Recorded charges", `$${(desk.collectedCents / 100).toFixed(2)}`, `${desk.charges} paid Stripe rows. Not a forecast.`],
    ["Open requests", desk.requests, "Messages received. Not a support queue status."],
  ] as const;
  return (
    <section className="px-4 pb-16">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#c6ff00]">Paying members / initiate members · {desk.ratio}%</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value, line]) => (
          <article key={label} className="border border-white/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</p>
            <p className="mt-2 font-display text-2xl">{value}</p>
            <p className="mt-2 font-mono text-[11px] normal-case text-white/55">{line}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="border border-white/20 px-3 py-2 text-[10px] uppercase" onClick={() => void setPreviewTier({ data: "seeker" }).then(onPreview)}>
          Preview as seeker
        </button>
        <button type="button" className="border border-white/20 px-3 py-2 text-[10px] uppercase" onClick={() => void setPreviewTier({ data: "initiate" }).then(onPreview)}>
          Preview as initiate
        </button>
        <button type="button" className="border border-white/20 px-3 py-2 text-[10px] uppercase" onClick={() => void setPreviewTier({ data: "" }).then(onPreview)}>
          Leave preview
        </button>
        {desk.preview ? <span className="px-2 py-2 text-[10px] uppercase text-[#c6ff00]">Previewing {desk.preview}</span> : null}
      </div>
    </section>
  );
}

function Members({
  members,
  campaigns,
  q,
  setQ,
  onDone,
}: {
  members: Desk["members"];
  campaigns: Desk["campaigns"];
  q: string;
  setQ: (value: string) => void;
  onDone: () => Promise<void>;
}) {
  const [open, setOpen] = useState("");
  const [tier, setTier] = useState("initiate");
  const [mode, setMode] = useState("complimentary_indefinite");
  const [reason, setReason] = useState("");
  const [expires, setExpires] = useState("");
  const [campaign, setCampaign] = useState("");
  const [campName, setCampName] = useState("");

  return (
    <section className="px-4 pb-16">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, name, handle, tier" className="w-full border border-white/15 bg-black px-3 py-2 text-[12px] outline-none" />
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void saveCampaign({ data: { name: campName, tier, mode, note: "" } })
            .then(() => {
              setCampName("");
              toast.success("Campaign recorded.");
              return onDone();
            })
            .catch((error: Error) => toast.error(error.message));
        }}
      >
        <input value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="Campaign name, such as Founding Initiates" className="min-w-[16rem] flex-1 border border-white/15 bg-black px-3 py-2 text-[12px]" />
        <button className="border border-white/20 px-3 text-[10px] uppercase" type="submit">
          Save campaign
        </button>
      </form>
      <ul className="mt-4 divide-y divide-white/10 border border-white/10">
        {members.map((member) => (
          <li key={member.user_id} className="px-3 py-3">
            <button type="button" className="w-full text-left" onClick={() => setOpen(open === member.user_id ? "" : member.user_id)}>
              <p className="text-[12px] uppercase tracking-[0.08em]">{member.email || member.user_id}</p>
              <p className="mt-1 font-mono text-[11px] normal-case text-white/60">
                Rank {member.tier} · Billing {member.billing_status || "none"} · Source {member.access_source || "none"}
                {member.founding ? " · Founding" : ""}
                {member.suspended ? " · Suspended" : ""}
                {member.stripe_subscription ? " · Stripe on file" : " · No subscription"}
              </p>
            </button>
            {open === member.user_id ? (
              <form
                className="mt-3 grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const line = `Grant ${tier} access to this member at $0.00? No subscription or charge will be created.`;
                  if (!window.confirm(line)) return;
                  void grantAscension({
                    data: { userId: member.user_id, tier, mode, reason, expires, campaign, confirmZero: true },
                  })
                    .then(() => {
                      toast.success("Access granted. Nothing was charged.");
                      return onDone();
                    })
                    .catch((error: Error) => toast.error(error.message));
                }}
              >
                <p className="font-mono text-[11px] normal-case text-white/55">
                  {member.grant_reason ? `Last reason: ${member.grant_reason}. ` : ""}
                  Expires {member.grant_expires || "not set"}. Campaign {member.campaign || "none"}.
                </p>
                <div className="flex flex-wrap gap-2">
                  <select value={tier} onChange={(e) => setTier(e.target.value)} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
                    <option value="initiate">Initiate</option>
                    <option value="patron">Patron</option>
                  </select>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
                    <option value="complimentary_indefinite">Complimentary, indefinite</option>
                    <option value="complimentary_until">Complimentary, until a date</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="sponsored">Sponsored</option>
                    <option value="founding">Founding Divinite</option>
                  </select>
                  <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
                    <option value="">No campaign</option>
                    {campaigns.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {mode === "complimentary_until" ? <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="border border-white/15 bg-black px-2 py-2 text-[12px]" /> : null}
                </div>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, recorded in the audit" className="border border-white/15 bg-black px-2 py-2 text-[12px]" />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="bg-[#c6ff00] px-3 py-2 text-[10px] uppercase text-black">
                    Grant at $0.00
                  </button>
                  <button
                    type="button"
                    className="border border-white/20 px-3 py-2 text-[10px] uppercase"
                    onClick={() =>
                      void setSuspension({ data: { userId: member.user_id, suspended: !member.suspended, reason } })
                        .then(onDone)
                        .catch((error: Error) => toast.error(error.message))
                    }
                  >
                    {member.suspended ? "Restore access" : "Suspend access"}
                  </button>
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Documents({ documents, preview, onDone }: { documents: Desk["documents"]; preview: string; onDone: () => Promise<void> }) {
  const blank = { id: "", kind: "prayer", title: "", purpose: "", body: "", accessTier: "initiate", status: "draft", publishAt: "", category: "" };
  const [form, setForm] = useState(blank);
  const shown = useMemo(() => documents, [documents]);
  return (
    <section className="grid gap-6 px-4 pb-16 lg:grid-cols-[1fr_1fr]">
      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void saveDocument({ data: form })
            .then((saved) => {
              toast.success(form.status === "published" ? "Published." : "Saved as draft.");
              setForm({ ...form, id: saved.id });
              return onDone();
            })
            .catch((error: Error) => toast.error(error.message));
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#c6ff00]">Draft, then publish. Nothing here replaces a canonical rite.</p>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border border-white/15 bg-black px-2 py-2 text-[12px]" />
        <div className="flex flex-wrap gap-2">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
            <option value="prayer">Prayer</option>
            <option value="rite">Rite</option>
            <option value="code">Divine code</option>
            <option value="announcement">Announcement</option>
          </select>
          <select value={form.accessTier} onChange={(e) => setForm({ ...form, accessTier: e.target.value })} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
            <option value="public">Public</option>
            <option value="seeker">Seeker</option>
            <option value="initiate">Initiate</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border border-white/15 bg-black px-2 py-2 text-[12px]">
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose" className="border border-white/15 bg-black px-2 py-2 text-[12px]" />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={10} placeholder="The text, in the house voice. Do not paste a generated substitute for a canon." className="border border-white/15 bg-black px-2 py-2 font-mono text-[12px] normal-case" />
        {form.status === "scheduled" ? <input type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} className="border border-white/15 bg-black px-2 py-2 text-[12px]" /> : null}
        <button type="submit" className="bg-[#c6ff00] px-3 py-2 text-[10px] uppercase text-black">
          Save document
        </button>
        <p className="font-mono text-[11px] normal-case text-white/55">
          Preview is {preview || "off"}. A draft is visible only while you are previewing. A seeker preview locks an Initiate text. An initiate preview opens it. Publish before the congregation can read it.
        </p>
      </form>
      <ul className="divide-y divide-white/10 border border-white/10">
        {shown.length === 0 ? <li className="px-3 py-6 font-mono text-[12px] normal-case text-white/50">No documents yet.</li> : null}
        {shown.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              className="w-full px-3 py-3 text-left"
              onClick={() => {
                void readDocument({ data: doc.id }).then((loaded) => {
                  const row = loaded.doc;
                  if (!row) return;
                  setForm({
                    id: row.id,
                    kind: row.kind,
                    title: row.title,
                    purpose: row.purpose,
                    body: row.body,
                    accessTier: row.access_tier,
                    status: row.status,
                    publishAt: row.publish_at ? row.publish_at.slice(0, 16) : "",
                    category: "",
                  });
                });
              }}
            >
              <p className="text-[12px] uppercase">{doc.title}</p>
              <p className="mt-1 text-[10px] uppercase text-white/50">
                {doc.kind} · {doc.status} · {doc.access_tier}
              </p>
            </button>
            <Link to="/rite/$id" params={{ id: doc.id }} className="px-3 pb-3 text-[10px] uppercase text-[#c6ff00]">
              Open on the member side
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CovenantDesk() {
  const [desk, setDesk] = useState<Awaited<ReturnType<typeof loadCovenantDesk>> | null>(null);
  const [reason, setReason] = useState("");
  const [who, setWho] = useState("");

  function load() {
    void loadCovenantDesk().then(setDesk).catch((error: Error) => toast.error(error.message));
  }

  useEffect(() => {
    load();
  }, []);

  if (!desk) return <p className="px-4 text-[12px]">Reading the covenant…</p>;

  function act(action: string, extra: { userId?: string; postId?: string; appealId?: string; days?: number }) {
    void moderateCovenant({
      data: { action, userId: extra.userId || who, postId: extra.postId || "", reason, days: extra.days || 7, appealId: extra.appealId || "" },
    })
      .then(load)
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <section className="px-4 pb-16">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#c6ff00]">Sacred Confidence Covenant · version {desk.version}</p>
      <p className="mt-2 font-mono text-[12px] normal-case text-white/70">{desk.accepted} members have accepted this version. Changing the version asks everyone to accept again.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, warning, or new version" className="min-w-0 flex-1 border border-white/15 bg-black px-2 py-2 text-[12px]" />
        <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Member id" className="border border-white/15 bg-black px-2 py-2 text-[12px]" />
        <button type="button" className="border border-white/20 px-2 text-[10px] uppercase" onClick={() => act("warn", {})}>Warn</button>
        <button type="button" className="border border-white/20 px-2 text-[10px] uppercase" onClick={() => act("restrict", { days: 7 })}>Restrict 7 days</button>
        <button type="button" className="border border-white/20 px-2 text-[10px] uppercase" onClick={() => { if (window.confirm("Permanent Nexxus ban?")) act("ban", {}); }}>Ban</button>
        <button type="button" className="border border-white/20 px-2 text-[10px] uppercase" onClick={() => act("lift", {})}>Lift</button>
        <button type="button" className="border border-white/20 px-2 text-[10px] uppercase" onClick={() => { if (window.confirm("This makes every member accept the covenant again.")) act("revise", {}); }}>New version</button>
      </div>
      <h2 className="mt-6 text-[12px] uppercase">Reports</h2>
      <ul className="mt-2 divide-y divide-white/10 border border-white/10">
        {desk.reports.map((row) => (
          <li key={row.id} className="px-3 py-2 text-[12px]">
            <p>{row.handle} reported a {row.target_kind}: {row.reason}</p>
            {row.target_kind === "post" ? (
              <button type="button" className="mt-2 border border-white/20 px-2 py-1 text-[10px] uppercase" onClick={() => act("remove", { postId: row.target_id })}>Remove post</button>
            ) : null}
          </li>
        ))}
      </ul>
      <h2 className="mt-6 text-[12px] uppercase">Open appeals</h2>
      <ul className="mt-2 divide-y divide-white/10 border border-white/10">
        {desk.appeals.map((row) => (
          <li key={row.id} className="px-3 py-2 text-[12px]">
            <p>{row.handle}: {row.body}</p>
            <button type="button" className="mt-2 border border-white/20 px-2 py-1 text-[10px] uppercase" onClick={() => act("appeal", { appealId: row.id })}>Close appeal</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FlameDesk() {
  const [desk, setDesk] = useState<Awaited<ReturnType<typeof loadFlameDesk>> | null>(null);
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof pendingFlameNotes>>>([]);
  const [cap, setCap] = useState("0");
  const [reason, setReason] = useState("");

  function load() {
    void loadFlameDesk().then((data) => {
      setDesk(data);
      setCap(String(data.capacity));
    });
    void pendingFlameNotes().then(setNotes).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  if (!desk) return <p className="px-4 text-[12px]">Reading Pass the Flame…</p>;

  return (
    <section className="px-4 pb-16">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#c6ff00]">One paid $22 supports one place. The $11 gap is foregone tuition, not cash spent.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Active sponsors", desk.sponsors.active],
            ["Sponsorship collected", `$${(desk.grossCents / 100).toFixed(2)}`],
            ["Academy collected", `$${(desk.academyCents / 100).toFixed(2)}`],
            ["Active students", desk.awards.active],
            ["Waiting, approved", desk.waiting.approved],
            ["Waiting, not approved", desk.waiting.pending],
            ["Open places", desk.places],
            ["Unassigned $22", desk.unassigned],
            ["Foregone tuition", `$${(desk.subsidyCents / 100).toFixed(2)}`],
            ["Past due", desk.sponsors.past_due],
            ["Canceled", desk.sponsors.canceled],
            ["In grace", desk.awards.grace],
          ] as const
        ).map(([label, value]) => (
          <article key={label} className="border border-white/10 p-3">
            <p className="text-[10px] uppercase text-white/45">{label}</p>
            <p className="mt-2 font-display text-2xl">{value}</p>
          </article>
        ))}
      </div>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void setFlameCapacity({ data: Number(cap) }).then(load).catch((error: Error) => toast.error(error.message));
        }}
      >
        <label className="text-[10px] uppercase text-white/50">
          Scholarship places allowed
          <input value={cap} onChange={(e) => setCap(e.target.value)} className="ml-2 border border-white/15 bg-black px-2 py-2 text-[12px]" />
        </label>
        <button type="submit" className="border border-white/20 px-3 text-[10px] uppercase">
          Save capacity
        </button>
        <button
          type="button"
          className="border border-white/20 px-3 text-[10px] uppercase"
          onClick={() =>
            void flameCsv().then((csv) => {
              const file = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(file);
              const a = document.createElement("a");
              a.href = url;
              a.download = "pass-the-flame.csv";
              a.click();
              URL.revokeObjectURL(url);
            })
          }
        >
          Export sponsors
        </button>
      </form>
      <p className="mt-2 font-mono text-[11px] normal-case text-white/45">Capacity starts at 0. No student is matched until you set a number. Collected money still sits here as unassigned.</p>
      <h2 className="mt-6 text-[12px] uppercase">Waiting list</h2>
      <ul className="mt-2 divide-y divide-white/10 border border-white/10">
        {desk.waitlist.map((row) => (
          <li key={row.user_id} className="px-3 py-2 text-[12px]">
            <p>{row.email} · {row.tier} · {row.status} · {row.created_at.slice(0, 10)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["approved", "held", "removed"].map((status) => (
                <button key={status} type="button" className="border border-white/20 px-2 py-1 text-[10px] uppercase" onClick={() => void reviewWaitlist({ data: { userId: row.user_id, status, note: row.note } }).then(load)}>
                  {status}
                </button>
              ))}
              <button
                type="button"
                className="border border-white/20 px-2 py-1 text-[10px] uppercase"
                onClick={() => {
                  if (!window.confirm("Grant this seat at $0.00? No subscription will be created.")) return;
                  void grantFlameSeat({ data: { userId: row.user_id, funding: "sponsored", reason: reason || "Assigned from the waiting list", expires: "", confirmZero: true } })
                    .then(load)
                    .catch((error: Error) => toast.error(error.message));
                }}
              >
                Assign paid flame
              </button>
            </div>
          </li>
        ))}
      </ul>
      <label className="mt-4 block text-[10px] uppercase text-white/50">
        Reason for a manual seat
        <input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block w-full border border-white/15 bg-black px-2 py-2 text-[12px]" />
      </label>
      <h2 className="mt-6 text-[12px] uppercase">Sponsors</h2>
      <ul className="mt-2 divide-y divide-white/10 border border-white/10">
        {desk.sponsorRows.map((row) => (
          <li key={row.id} className="px-3 py-2 font-mono text-[11px] normal-case">
            {row.email} · ${(row.amount_cents / 100).toFixed(2)} · {row.status} · {row.anon_code || "unassigned"}
          </li>
        ))}
      </ul>
      <h2 className="mt-6 text-[12px] uppercase">Notes waiting to be released</h2>
      <ul className="mt-2 divide-y divide-white/10 border border-white/10">
        {notes.map((note) => (
          <li key={note.id} className="px-3 py-2">
            <p className="font-mono text-[12px] normal-case">{note.anon_code} · {note.from_role}: {note.body}</p>
            <button type="button" className="mt-2 border border-white/20 px-2 py-1 text-[10px] uppercase" onClick={() => void releaseFlameNote({ data: { id: note.id, release: true } }).then(load)}>
              Release
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Audit({ desk, onDone }: { desk: Desk; onDone: () => Promise<void> }) {
  const [email, setEmail] = useState(desk.recovery);
  return (
    <section className="px-4 pb-16">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void setRecoveryAdmin({ data: email })
            .then(() => {
              toast.success("Recovery account recorded. It can open this desk. It cannot erase you.");
              return onDone();
            })
            .catch((error: Error) => toast.error(error.message));
        }}
      >
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Recovery administrator email" className="min-w-[16rem] flex-1 border border-white/15 bg-black px-3 py-2 text-[12px]" />
        <button type="submit" className="border border-white/20 px-3 text-[10px] uppercase">
          Name recovery account
        </button>
      </form>
      <p className="mt-2 font-mono text-[11px] normal-case text-white/50">MFA is not installed. Do not treat this desk as if a second factor exists.</p>
      <ul className="mt-4 divide-y divide-white/10 border border-white/10">
        {desk.activity.map((row) => (
          <li key={row.id} className="px-3 py-2 font-mono text-[11px] normal-case">
            <span className="text-[#c6ff00]">{row.action}</span> · {row.target} · {row.created_at}
          </li>
        ))}
      </ul>
    </section>
  );
}
