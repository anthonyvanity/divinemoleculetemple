import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimChancellor, deleteHouseAudio, deleteHouseFile, listHouseAudio, listVault, loadOffice, queueBlast, runDrip, saveMailKey, sendBlast, setMemberAccess, uploadHouseAudio, uploadHouseFile } from "@/lib/temple-admin";
import { BLAST_TO, CONTACT_EMAIL, DRIP } from "@/lib/temple-content";
import { listShopOrders, markShopMailed, saveStripeKeys } from "@/lib/stripe-temple";
import { useRadio, withHouseAudio } from "@/lib/radio-store";
import { useTemple } from "@/lib/temple-store";
import { Popup } from "@/components/popup";
import { EngineDesk } from "@/components/engine-desk";

export const Route = createFileRoute("/chancellor")({ component: ChancellorPage });

type Office = Awaited<ReturnType<typeof loadOffice>>;

function ChancellorPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <Popup>
        <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
          <p className="text-[10px] uppercase tracking-[0.22em] text-lime">Synchronizing session…</p>
        </main>
      </Popup>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return (
    <Popup>
      <Desk />
    </Popup>
  );
}

function Desk() {
  const role = useTemple((s) => s.role);
  const setAccess = useTemple((s) => s.setAccess);
  const path = useTemple((s) => s.path);
  const paid = useTemple((s) => s.paid);
  const [phrase, setPhrase] = useState("");
  const [err, setErr] = useState("");
  const [office, setOffice] = useState<Office | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("seeker");
  const [mailKey, setMailKey] = useState("");

  async function refresh() {
    const data = await loadOffice();
    setOffice(data);
  }

  useEffect(() => {
    if (role !== "chancellor") return;
    void refresh().catch(() => setOffice(null));
  }, [role]);

  if (role !== "chancellor") {
    return (
      <main className="mx-auto max-w-lg bg-ink px-4 py-20 text-paper">
        <p className="font-display text-3xl uppercase">Chancellor desk</p>
        <p className="mt-3 text-sm text-paper/60">
          Sign in, then speak the house phrase once. After that, only you hold the keys: tiers, scholarships, discounts, and the mail queue.
        </p>
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            setErr("");
            void claimChancellor({ data: phrase })
              .then(() => {
                setAccess({ paid: true, role: "chancellor", path: path === "none" ? "initiate" : path });
              })
              .catch((error: Error) => setErr(error.message || "Rejected"));
          }}
        >
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="h-12 w-full border border-lime/40 bg-transparent px-3 text-base uppercase tracking-wide"
            placeholder="HOUSE PHRASE"
            autoComplete="off"
          />
          <Button type="submit" variant="lime" className="mt-4">
            Claim the desk
          </Button>
          {err ? <p className="mt-3 text-sm text-orange">{err}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="bg-ink px-4 py-12 text-paper sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-lime">Office · database</p>
        <h1 className="mt-2 font-display text-4xl uppercase">Chancellor</h1>
        <p className="mt-3 max-w-2xl text-sm text-paper/60">
          Membership, Stripe, join requests, books, rituals, transmissions, and blasts live here. Every letter leaves from {CONTACT_EMAIL}.
        </p>
        <nav className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.16em] text-lime">
          <a href="#members">Members</a>
          <a href="#mail">Mail</a>
          <a href="#shop-orders">Orders</a>
          <a href="#audio">Transmissions</a>
          <a href="#books">Books</a>
          <a href="#rituals">Rituals</a>
        </nav>
        <EngineDesk />

        <StripeDesk
          stripe={office?.stripe}
          onSaved={() => void refresh()}
        />

        <ShopDesk />

        <section id="mail" className="mt-10 border border-lime/30 p-5">
          <h2 className="font-display text-xl uppercase">Mail blast</h2>
          <p className="mt-2 font-mono text-[11px] normal-case text-paper/60">
            From {office?.from ?? CONTACT_EMAIL}. Reply-to is the same address.
            {office?.mail ? " The mail key is connected." : " Held until the mail key is saved."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={mailKey}
              onChange={(e) => setMailKey(e.target.value)}
              placeholder="MAIL KEY"
              className="h-11 min-w-48 flex-1 border border-paper/20 bg-transparent px-3 text-sm"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="dark"
              onClick={() => {
                void saveMailKey({ data: mailKey })
                  .then(() => {
                    setMailKey("");
                    return refresh();
                  })
                  .catch(() => {});
              }}
            >
              Save key
            </Button>
            <Button
              type="button"
              variant="lime"
              onClick={() => {
                void runDrip({ data: true }).then(() => refresh());
              }}
            >
              Run due letters
            </Button>
          </div>
          <ul className="mt-4 space-y-1 text-[11px] uppercase tracking-wide text-paper/55">
            {DRIP.map((letter) => (
              <li key={letter.key}>
                {letter.tier} · day {letter.day} · {letter.subject}
              </li>
            ))}
          </ul>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="SUBJECT"
            className="mt-4 h-12 w-full border border-paper/20 bg-transparent px-3 text-base uppercase"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="BODY"
            className="mt-3 min-h-28 w-full border border-paper/20 bg-transparent px-3 py-2 text-base"
          />
          <label className="mt-4 block text-[10px] uppercase tracking-[0.16em] text-paper/45">
            Send to
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-2 h-11 w-full border border-paper/20 bg-ink px-3 text-sm uppercase text-paper"
            >
              {BLAST_TO.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="lime"
              onClick={() => {
                void queueBlast({ data: { subject, body, audience } })
                  .then(() => refresh())
                  .then(() => {
                    setSubject("");
                    setBody("");
                  })
                  .catch(() => {});
              }}
            >
              Queue blast
            </Button>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            {(office?.blasts ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3">
                <span>
                  {b.status} · {BLAST_TO.find((item) => item.id === b.audience)?.label ?? b.audience} · {b.subject}
                </span>
                {b.status === "sent" ? null : (
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-wide text-lime"
                    onClick={() => {
                      void sendBlast({ data: b.id }).then(() => refresh());
                    }}
                  >
                    Send
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <AudioDesk />
        <VaultDesk kind="book" />
        <VaultDesk kind="ritual" />

        <section id="members" className="mt-8">
          <h2 className="font-display text-xl uppercase">Members</h2>
          <ul className="mt-4 space-y-3">
            {(office?.members ?? []).map((m) => (
              <MemberRow key={m.user_id} member={m} onSaved={() => void refresh()} />
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl uppercase">Requests to join</h2>
          <ul className="mt-4 divide-y divide-paper/10 border border-paper/10">
            {(office?.requests ?? []).map((r) => (
              <li key={r.id} className="px-4 py-4">
                <p className="font-display uppercase">
                  {r.name} · {r.email}
                </p>
                <p className="mt-2 text-sm text-paper/70">{r.message}</p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 text-[10px] uppercase tracking-wide text-paper/35">
          Your own key: {paid ? "paid" : "seeker"}
        </p>
      </div>
    </main>
  );
}

function ShopDesk() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listShopOrders>>>([]);
  function reload() {
    return listShopOrders().then(setRows).catch(() => setRows([]));
  }
  useEffect(() => {
    void reload();
  }, []);
  return (
    <section id="shop-orders" className="mt-10 border border-lime/30 p-5">
      <h2 className="font-display text-xl uppercase">Shop orders</h2>
      <p className="mt-2 text-sm text-paper/60">Stickers to print and mail. Mark each one when the envelope goes out.</p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="border border-paper/15 px-3 py-3 text-sm">
            <p className="font-display uppercase">
              {row.status} · {row.title} · ${(row.amount / 100).toFixed(0)}
            </p>
            <p className="mt-1 text-paper/70">
              {row.name || "No name"} · {row.email || "No email"}
            </p>
            <p className="mt-1 text-paper/60">
              {[row.ship_line, row.city, row.region, row.zip, row.country].filter(Boolean).join(", ") || "No address yet"}
            </p>
            {row.status === "mailed" ? null : (
              <Button type="button" variant="lime" className="mt-3" onClick={() => void markShopMailed({ data: row.id }).then(() => reload())}>
                Mark mailed
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StripeDesk({
  stripe,
  onSaved,
}: {
  stripe?: Office["stripe"];
  onSaved: () => void;
}) {
  const [secret, setSecret] = useState("");
  const [webhook, setWebhook] = useState("");
  const [err, setErr] = useState("");
  const hook =
    typeof window !== "undefined" ? `${window.location.origin}/api/stripe/webhook` : "/api/stripe/webhook";
  return (
    <section className="mt-10 border border-lime/30 p-5">
      <h2 className="font-display text-xl uppercase">Stripe</h2>
      <p className="mt-2 text-sm text-paper/60">
        {stripe?.connected
          ? `Connected ${stripe.masked}. Initiate is $${(stripe.initiate / 100).toFixed(0)} a month. Patron is $${(stripe.patron / 100).toFixed(0)} a month.`
          : "Not connected. Paste the secret key from Stripe. Test keys start with sk_test_. Live keys start with sk_live_."}
      </p>
      <p className="mt-2 break-all font-mono text-[11px] normal-case text-paper/50">Webhook {hook}</p>
      <p className="mt-1 text-[11px] uppercase text-paper/40">
        Signing secret {stripe?.webhook ? "is saved" : "is missing"}
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          void saveStripeKeys({ data: { secret, webhook } })
            .then(() => {
              setSecret("");
              setWebhook("");
              onSaved();
            })
            .catch((error: Error) => setErr(error.message || "Rejected"));
        }}
      >
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="SK_LIVE_ OR SK_TEST_"
          autoComplete="off"
          className="h-12 border border-paper/20 bg-transparent px-3 text-base normal-case"
        />
        <input
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder="WHSEC_"
          autoComplete="off"
          className="h-12 border border-paper/20 bg-transparent px-3 text-base normal-case"
        />
        <Button type="submit" variant="lime">
          Save Stripe
        </Button>
        {err ? <p className="text-sm text-orange">{err}</p> : null}
      </form>
      <ul className="mt-4 space-y-2 text-sm text-paper/70">
        {(stripe?.payments ?? []).map((p) => (
          <li key={p.id}>
            {p.status} · {p.label} · ${(p.amount / 100).toFixed(2)} · {p.email || "unnamed"}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AudioDesk() {
  const [title, setTitle] = useState("");
  const [pathLabel, setPathLabel] = useState("house");
  const [rows, setRows] = useState<{ id: string; title: string; path_label: string }[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function reload() {
    return listHouseAudio().then((list) => {
      setRows(list);
      useRadio.getState().setTracks(withHouseAudio(list));
    });
  }

  useEffect(() => {
    void reload().catch(() => {});
  }, []);

  return (
    <section id="audio" className="mt-8 border border-lime/30 p-5">
      <h2 className="font-display text-xl uppercase">Transmissions</h2>
      <p className="mt-2 text-sm text-paper/60">
        Upload an audio file. It joins the radio and stays with the listener when they change pages. Keep each file under 4 MB.
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const file = (e.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0];
          if (!file) {
            setErr("Choose an audio file");
            return;
          }
          setBusy(true);
          setErr("");
          const reader = new FileReader();
          reader.onload = () => {
            const raw = String(reader.result ?? "");
            const base64 = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw;
            const mime = file.type || (file.name.toLowerCase().endsWith(".wav")
              ? "audio/wav"
              : file.name.toLowerCase().endsWith(".m4a")
                ? "audio/mp4"
                : file.name.toLowerCase().endsWith(".ogg")
                  ? "audio/ogg"
                  : file.name.toLowerCase().endsWith(".webm")
                    ? "audio/webm"
                    : "audio/mpeg");
            void uploadHouseAudio({
              data: { title: title || file.name.replace(/\.[^.]+$/, ""), pathLabel, mime, base64 },
            })
              .then(() => reload())
              .then(() => setTitle(""))
              .catch((error: Error) => setErr(error.message || "Upload failed"))
              .finally(() => setBusy(false));
          };
          reader.onerror = () => {
            setBusy(false);
            setErr("Could not read that file");
          };
          reader.readAsDataURL(file);
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="TITLE"
          className="h-12 border border-paper/20 bg-transparent px-3 text-base uppercase"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={pathLabel}
            onChange={(e) => setPathLabel(e.target.value)}
            className="h-12 border border-paper/20 bg-ink px-2 text-sm uppercase"
          >
            <option value="house">House</option>
            <option value="seeker">Seeker</option>
            <option value="initiate">Initiate</option>
            <option value="patron">Patron</option>
          </select>
          <input name="file" type="file" accept="audio/*" className="h-12 text-sm" />
          <Button type="submit" variant="lime" disabled={busy}>
            {busy ? "Uploading" : "Upload transmission"}
          </Button>
        </div>
        {err ? <p className="text-sm text-orange">{err}</p> : null}
      </form>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 border border-paper/15 px-3 py-2">
            <span>
              <span className="block font-display uppercase">{row.title}</span>
              <span className="text-[11px] uppercase text-paper/45">{row.path_label}</span>
            </span>
            <Button
              type="button"
              variant="dark"
              onClick={() => {
                void deleteHouseAudio({ data: row.id }).then(() => reload());
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VaultDesk({ kind }: { kind: "book" | "ritual" }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [gate, setGate] = useState(kind === "ritual" ? "seeker" : "initiate");
  const [rows, setRows] = useState<{ id: string; title: string; gate: string; hasFile: boolean }[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function reload() {
    return listVault({ data: kind }).then((list) => setRows(list));
  }

  useEffect(() => {
    void reload().catch(() => {});
  }, []);

  return (
    <section id={kind === "book" ? "books" : "rituals"} className="mt-8 border border-lime/30 p-5">
      <h2 className="font-display text-xl uppercase">{kind === "book" ? "Books and PDFs" : "Rituals"}</h2>
      <p className="mt-2 text-sm text-paper/60">
        {kind === "book"
          ? "Upload a PDF. It appears in the library for whoever you open the gate to. Keep each file under 3 MB."
          : "Write a ritual, or attach a PDF. It appears on the ceremonies page for the gate you set."}
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const file = (e.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0];
          setBusy(true);
          setErr("");
          const send = (base64: string, filename: string, mime: string) => {
            void uploadHouseFile({
              data: { kind, title, body, gate, filename, mime, base64 },
            })
              .then(() => reload())
              .then(() => {
                setTitle("");
                setBody("");
              })
              .catch((error: Error) => setErr(error.message || "Upload failed"))
              .finally(() => setBusy(false));
          };
          if (!file) {
            send("", "", "");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const raw = String(reader.result ?? "");
            const base64 = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw;
            const mime = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "application/pdf";
            send(base64, file.name, mime);
          };
          reader.onerror = () => {
            setBusy(false);
            setErr("Could not read that file");
          };
          reader.readAsDataURL(file);
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="TITLE"
          className="h-12 border border-paper/20 bg-transparent px-3 text-base uppercase"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === "ritual" ? "RITUAL TEXT" : "NOTE (OPTIONAL IF A PDF IS ATTACHED)"}
          className="min-h-24 border border-paper/20 bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-3">
          <select value={gate} onChange={(e) => setGate(e.target.value)} className="h-12 border border-paper/20 bg-ink px-2 text-sm uppercase">
            <option value="public">Public</option>
            <option value="seeker">Seeker</option>
            <option value="initiate">Academy</option>
            <option value="patron">Patron</option>
            <option value="priestline">Chancellor only</option>
          </select>
          <input name="file" type="file" accept="application/pdf,.pdf" className="h-12 text-sm" />
          <Button type="submit" variant="lime" disabled={busy}>
            {busy ? "Saving" : kind === "book" ? "Save book" : "Save ritual"}
          </Button>
        </div>
        {err ? <p className="text-sm text-orange">{err}</p> : null}
      </form>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 border border-paper/15 px-3 py-2">
            <span>
              <span className="block font-display uppercase">{row.title}</span>
              <span className="text-[11px] uppercase text-paper/45">
                {row.gate}
                {row.hasFile ? " · pdf" : " · text"}
              </span>
            </span>
            <Button
              type="button"
              variant="dark"
              onClick={() => {
                void deleteHouseFile({ data: row.id }).then(() => reload());
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MemberRow({
  member,
  onSaved,
}: {
  member: Office["members"][number];
  onSaved: () => void;
}) {
  const [tier, setTier] = useState(member.tier || "seeker");
  const [scholarship, setScholarship] = useState(member.scholarship);
  const [discount, setDiscount] = useState(String(member.discount_pct ?? 0));
  const [note, setNote] = useState(member.note ?? "");
  const [lists, setLists] = useState(member.lists ?? "");
  function toggleList(id: string) {
    const on = lists.split(",").includes(id);
    const next = ["guides", "investors", "grants"].filter((item) => (item === id ? !on : lists.split(",").includes(item)));
    setLists(next.join(","));
  }
  return (
    <li className="grid gap-2 border border-paper/15 p-4 md:grid-cols-[1.4fr_auto_auto_auto_1fr_auto] md:items-center">
      <div>
        <p className="font-display uppercase">{member.name || member.email}</p>
        <p className="text-[11px] text-paper/50">{member.email}</p>
        <span className="mt-2 flex flex-wrap gap-3">
          {(
            [
              ["guides", "Guides"],
              ["investors", "Investors"],
              ["grants", "Grants"],
            ] as const
          ).map(([id, label]) => (
            <label key={id} className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-paper/55">
              <input type="checkbox" checked={lists.split(",").includes(id)} onChange={() => toggleList(id)} />
              {label}
            </label>
          ))}
        </span>
      </div>
      <select value={tier} onChange={(e) => setTier(e.target.value)} className="h-11 border border-paper/20 bg-ink px-2 text-sm uppercase">
        <option value="seeker">Seeker</option>
        <option value="initiate">Initiate</option>
        <option value="patron">Patron</option>
        <option value="priestline">Priestline</option>
        <option value="elder">Elder</option>
      </select>
      <label className="flex items-center gap-2 text-[11px] uppercase">
        <input type="checkbox" checked={scholarship} onChange={(e) => setScholarship(e.target.checked)} />
        Scholarship
      </label>
      <input
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        className="h-11 w-20 border border-paper/20 bg-transparent px-2 text-base"
        inputMode="numeric"
        aria-label="Discount percent"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="NOTE"
        className="h-11 border border-paper/20 bg-transparent px-2 text-sm uppercase"
      />
      <Button
        type="button"
        variant="lime"
        onClick={() => {
          void setMemberAccess({
            data: {
              userId: member.user_id,
              tier,
              scholarship,
              discountPct: Number(discount) || 0,
              note,
              lists,
            },
          }).then(onSaved);
        }}
      >
        Save
      </Button>
    </li>
  );
}
