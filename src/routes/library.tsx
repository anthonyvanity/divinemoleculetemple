import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SCROLLS } from "@/lib/scrolls";
import { SOURCE_CODES } from "@/lib/temple-content";
import { listVault } from "@/lib/temple-admin";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/library")({ component: Library });

const FACES: { src: string; title: string; line?: string; to?: "/cos" | "/codes" }[] = [
  { src: "/covers/shelf/cos-manual.jpg", title: "The Cosmic Operating System", to: "/cos" },
  { src: "/covers/cos/divine-codes.jpg", title: "Divine <codes/>", line: "hacking holy scripture", to: "/codes" },
  { src: "/covers/shelf/molecule.jpg", title: "The Divine Molecule" },
  { src: "/covers/shelf/bodies.jpg", title: "The Nine Sacred Bodies" },
  { src: "/covers/shelf/christos.jpg", title: "Christos Unveiled" },
  { src: "/covers/shelf/flame.jpg", title: "The Flame" },
  { src: "/covers/shelf/awareness.jpg", title: "An Introduction to Awareness" },
  { src: "/covers/shelf/veil.jpg", title: "The Veil Breaker" },
  { src: "/covers/shelf/apocalypse.jpg", title: "The Dual Apocalypse" },
];

const HIDDEN = new Set(["bible", "sacred-book", "scholarship", "scholarship-map"]);

function Manuscripts() {
  const [books, setBooks] = useState<{ slug: string; title: string; line: string; pages: number }[]>([]);
  useEffect(() => {
    void fetch("/canon/index.json")
      .then((res) => res.json())
      .then((rows: { slug: string; title: string; line: string; pages: number }[]) =>
        setBooks(rows.filter((book) => !HIDDEN.has(book.slug))),
      )
      .catch(() => {});
  }, []);
  if (!books.length) return null;
  return (
    <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
      {books.map((book) => {
        const open = book.slug === "cos-original" || book.slug === "welcome";
        return (
          <li key={book.slug} className="flex items-center justify-between gap-4 px-4 py-4">
            <span>
              <span className="block font-display uppercase">{book.title}</span>
              <span className="mt-1 block font-mono text-[11px] normal-case text-paper/60">{book.line}</span>
            </span>
            {open ? (
              <Link
                to={book.slug === "welcome" ? "/read/$slug" : "/cos"}
                params={book.slug === "welcome" ? { slug: "welcome" } : undefined}
                className="shrink-0 text-[10px] uppercase tracking-wide text-cyan"
              >
                Open
              </Link>
            ) : (
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-paper/40">Sealed</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Library() {
  const read = useTemple((s) => s.read);
  const { user } = useCurrentUserState();

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="cyan"
        icon="Library"
        kicker="The house of the texts"
        title="Sacred Library"
        titleClassName="text-paper"
        lede={`Three books are open.
The rest of the shelf is sealed.`}
      />

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionKicker className="text-cyan">On the shelf</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Sacred Library</h2>
          <p className="mt-3 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            The Cosmic Operating System, Divine {"<codes/>"}, and Welcome, Seeker are open. The rest of the shelf is sealed.
          </p>
          <VaultBooks />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FACES.map((face) => {
              const card = (
                <article className="overflow-hidden border border-paper/15 bg-ink">
                  <img src={face.src} alt="" className={`aspect-[2/3] w-full object-cover ${face.to ? "" : "opacity-60"}`} />
                  <p className="px-3 py-3 font-display text-sm uppercase leading-tight">{face.title}</p>
                  {face.line ? <p className="px-3 font-mono text-[11px] normal-case text-paper/60">{face.line}</p> : null}
                  <p className="px-3 pb-3 text-[10px] uppercase tracking-wide text-paper/40">{face.to ? "Open" : "Sealed"}</p>
                </article>
              );
              return face.to ? (
                <Link key={face.src} to={face.to}>
                  {card}
                </Link>
              ) : (
                <div key={face.src}>{card}</div>
              );
            })}
          </div>
          <Manuscripts />
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker className="text-cyan">Release map</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Who receives which scroll</h2>
          <p className="mt-3 max-w-2xl font-mono text-[11px] normal-case leading-relaxed text-paper/70">
            One shelf. The readings that are written are open. A free account keeps your place.
          </p>
          <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
            {SCROLLS.filter((scroll) => scroll.key !== "scholarship").map((scroll) => {
              const when = scroll.day === 0 ? "Immediate" : `Day ${scroll.day}`;
              return (
                <li key={scroll.key} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wide text-cyan">
                      {scroll.category} · {scroll.gate} · {when}
                    </span>
                    <span className="mt-1 block font-display uppercase">{scroll.title}</span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-paper/40">
                    {scroll.key === "welcome" ? (
                      <Link to="/read/$slug" params={{ slug: "welcome" }} className="text-cyan">
                        Open
                      </Link>
                    ) : (
                      "Sealed"
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {!user ? (
            <Link to="/register" className="mt-6 inline-flex h-8 items-center bg-cyan px-3 text-[10px] uppercase tracking-wide text-white">
              Join free
            </Link>
          ) : null}
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker className="text-cyan">Source codes · {read.length} examined</SectionKicker>
          <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
            {SOURCE_CODES.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-5">
                <span>
                  <span className="text-[10px] uppercase tracking-wide text-cyan">
                    {c.volume} · {c.id}
                  </span>
                  <span className="mt-1 block font-display uppercase">{c.title}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wide text-paper/40">Sealed</span>
              </li>
            ))}
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
      .then((rows) =>
        setRows(
          rows.filter((row) => !/bible|sacred text|scholarship of the enlightened/i.test(row.title)),
        ),
      )
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
            <p className="mt-2 text-[10px] uppercase tracking-wide text-paper/40">Sealed</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
