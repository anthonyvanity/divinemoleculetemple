import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChamberHero } from "@/components/chamber";
import { browseArchive } from "@/lib/engine";

export const Route = createFileRoute("/archives")({ component: Archives });

type Card = Awaited<ReturnType<typeof browseArchive>>[number];

function Archives() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void browseArchive({ data: { q, type } })
        .then((rows) => {
          setCards(rows);
          setErr("");
          setReady(true);
        })
        .catch((error: Error) => {
          setErr(error.message || "The archive did not open");
          setReady(true);
        });
    }, 180);
    return () => window.clearTimeout(handle);
  }, [q, type]);

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="lilac"
        icon="Atom"
        kicker="Temple archives"
        title={`The record,
not the page.`}
        lede={`Chapters, rites, and teachings
live here as data.
A new record publishes
without a new page.`}
      />
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SEARCH THE RECORD"
            className="h-11 min-w-0 flex-1 border border-lilac/40 bg-transparent px-3 text-sm outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 border border-lilac/40 bg-ink px-3 text-[11px] uppercase"
          >
            <option value="">All types</option>
            <option value="COS">COS</option>
            <option value="PRAYER">Prayer</option>
            <option value="RITUAL">Ritual</option>
            <option value="TEACHING">Teaching</option>
          </select>
        </div>
        {err ? <p className="mt-4 text-micro text-orange">{err}</p> : null}
        {ready && !err && cards.length === 0 ? (
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.16em] text-paper/40">Nothing in the record yet.</p>
        ) : null}
        <ul className="mt-8 divide-y divide-lilac/30 border border-lilac/40">
          {cards.map((card) => (
            <li key={card.id}>
              <Link to="/archive/$slug" params={{ slug: card.slug }} className="block px-4 py-4 hover:bg-lilac/5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-lilac">
                  {card.contentType}
                  {card.volumeNumber ? ` · Volume ${card.volumeNumber}` : ""}
                  {card.chapterNumber ? ` · Chapter ${String(card.chapterNumber).padStart(3, "0")}` : ""}
                </p>
                <p className="mt-1 font-display text-2xl uppercase leading-none">{card.title}</p>
                <p className="mt-2 font-mono text-[12px] normal-case leading-relaxed text-paper/70">{card.excerpt}</p>
                <p className="mt-2 text-[10px] uppercase tracking-wide text-paper/45">
                  {card.locked ? `${card.accessTier} · sealed` : "Open"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-paper/40">
          <Link to="/awakening" className="text-lime">
            The 7-Day Awakening
          </Link>
          <span className="px-2">·</span>
          <Link to="/program/$slug" params={{ slug: "11-flame-protocols" }} className="text-lilac">
            11 Flame Protocols
          </Link>
        </p>
      </section>
    </main>
  );
}
