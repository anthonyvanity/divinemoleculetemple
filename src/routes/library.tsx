import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { getBearerToken } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SCROLLS, scrollUnlocked } from "@/lib/scrolls";
import { COS_VOLUMES, SOURCE_CODES } from "@/lib/temple-content";
import { listVault } from "@/lib/temple-admin";
import { canRead, daysActive, useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({ component: Library });

const SHELF = [
  { src: "/covers/cos.jpg", title: "The Cosmic Operating System", line: "The decryption manual. Open it and read.", to: "/cos" as const, frame: "border-cyan" },
  { src: "/covers/bible.jpg", title: "The Temple Bible", line: "Contents, then Next. Your page is kept.", to: "/academy/bible" as const, frame: "border-gold" },
  { src: "/covers/codes.jpg", title: "Source codes", line: "How a code is written, and the ones already in the house.", to: "/academy/codes" as const, frame: "border-cyan" },
] as const;

function Cover({ src, title, line, frame }: { src: string; title: string; line: string; frame: string }) {
  return (
    <article className={cn("overflow-hidden border-4 bg-ink shadow-[8px_8px_0_rgba(0,0,0,0.45)]", frame)}>
      <img src={src} alt="" className="aspect-[2/3] w-full object-cover" />
      <div className="px-3 py-3">
        <p className="font-display text-sm uppercase leading-tight">{title}</p>
        <p className="mt-2 font-mono text-[11px] normal-case leading-relaxed text-paper/60">{line}</p>
      </div>
    </article>
  );
}

const VOLUME_FRAME = [
  "border-gold",
  "border-cyan",
  "border-orange",
  "border-paper",
  "border-lime",
  "border-pink",
  "border-gold",
  "border-cyan",
  "border-orange",
];

function Library() {
  const paid = useTemple((s) => s.paid);
  const read = useTemple((s) => s.read);
  const role = useTemple((s) => s.role);
  const path = useTemple((s) => s.path);
  const joinedAt = useTemple((s) => s.joinedAt);
  const { user } = useCurrentUserState();
  const access = {
    signedIn: Boolean(user),
    paid: paid || path === "initiate" || path === "patron",
    role,
    day: daysActive(joinedAt),
  };

  return (
    <main className="page-cyan bg-ink text-paper">
      <ChamberHero
        tone="cyan"
        icon="Library"
        kicker="The sacred library"
        title="The living archives"
        lede={`A canon in five flames.
Read slowly.
A single line may take
a lifetime to decrypt.`}
      />

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Here is what is archived</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">The sacred library</h2>
          <p className="mt-3 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            The collected teachings of the Divine Molecule Temple. The Cosmic Operating System is open. A free account opens the seeker readings. The Academy opens the rest of what is written.
          </p>
          <Link to="/archives" className="mt-4 inline-block text-[10px] uppercase tracking-[0.16em] text-cyan">
            Search the record
          </Link>
          <VaultBooks />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SHELF.map((book) => (
              <Link key={book.src} to={book.to}>
                <Cover src={book.src} title={book.title} line={book.line} frame={book.frame} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>Release map</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Who receives which scroll</h2>
          <p className="mt-3 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            One library. Seeker readings open with a free account. The Academy opens the initiate shelf. Priesthood manuals stay with the Chancellor.
          </p>
          <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
            {SCROLLS.map((scroll) => {
              const open = scrollUnlocked(scroll, access);
              const when = scroll.day === 0 ? "Immediate" : `Day ${scroll.day}`;
              return (
                <li key={scroll.key} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wide text-orange">
                      {scroll.category} · {scroll.gate} · {when}
                    </span>
                    <span className="mt-1 block font-display uppercase">{scroll.title}</span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-paper/40">
                    {open ? "Open" : "Sealed gate"}
                  </span>
                </li>
              );
            })}
          </ul>
          {!user ? (
            <Link to="/register" className="mt-6 inline-flex bg-lime px-4 py-3 text-[11px] uppercase tracking-wide text-ink">
              Become a seeker
            </Link>
          ) : null}
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Nine volumes</SectionKicker>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COS_VOLUMES.map((v, i) => {
              const frame = VOLUME_FRAME[i % VOLUME_FRAME.length];
              const crest = v.n === "I";
              const card = (
                <article className={cn("flex min-h-64 flex-col overflow-hidden border-4 bg-ink", frame || "border-gold")}>
                  {crest ? (
                    <img src="/covers/cos.jpg" alt="" className="aspect-[2/3] w-full object-cover object-top" />
                  ) : (
                    <div className={cn("grid h-40 place-items-center border-b-4 font-display text-5xl", frame || "border-gold")}>
                      {v.n}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-paper/50">Volume {v.n}</p>
                    <h3 className="mt-2 font-display text-xl uppercase leading-none">{v.title}</h3>
                    <p className="mt-3 text-sm text-paper/60">{v.line}</p>
                    <p className="mt-auto pt-4 text-[10px] uppercase tracking-wide text-paper/40">
                      {crest ? "Open" : "Named"}
                    </p>
                  </div>
                </article>
              );
              return crest ? (
                <Link key={v.n} to="/cos">
                  {card}
                </Link>
              ) : (
                <div key={v.n}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>Source codes · {read.length} examined</SectionKicker>
          <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
            {SOURCE_CODES.map((c) => {
              const open = canRead(c.lockedFor, path);
              return (
                <li key={c.id}>
                  <Link
                    to="/cos"
                    hash={`source-${c.id}`}
                    className={cn("flex items-center justify-between gap-4 px-5 py-5 hover:bg-panel", !open && "opacity-60")}
                  >
                    <span>
                      <span className="text-[10px] uppercase tracking-wide text-orange">
                        {c.volume} · {c.id}
                      </span>
                      <span className="mt-1 block font-display uppercase">{c.title}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-paper/40">
                      {open ? "Open" : "Academy"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}

type VaultRow = {
  id: string;
  title: string;
  body: string;
  gate: string;
  hasFile: boolean;
  open: boolean;
};

function VaultBooks() {
  const [rows, setRows] = useState<VaultRow[]>([]);
  useEffect(() => {
    void listVault({ data: "book" })
      .then(setRows)
      .catch(() => setRows([]));
  }, []);
  if (!rows.length) return null;
  return (
    <div className="mt-10 border border-cyan/30">
      <p className="border-b border-cyan/30 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-cyan">From the desk</p>
      <ul>
        {rows.map((row) => (
          <li key={row.id} className="border-b border-paper/10 px-4 py-4 last:border-b-0">
            <p className="font-display uppercase">{row.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-paper/40">{row.gate}</p>
            {row.open && row.body ? <p className="mt-2 max-w-2xl text-sm text-paper/70">{row.body}</p> : null}
            {row.open && row.hasFile ? (
              <button
                type="button"
                className="mt-3 text-[10px] uppercase tracking-[0.16em] text-cyan"
                onClick={() => void openVaultFile(row.id, row.title)}
              >
                Open PDF
              </button>
            ) : row.open ? null : (
              <p className="mt-2 text-[10px] uppercase tracking-wide text-paper/40">Held</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

async function openVaultFile(id: string, title: string) {
  const token = getBearerToken();
  const res = await fetch(`/api/file/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.download = "";
  a.title = title;
  a.click();
}
