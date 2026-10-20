import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BIBLE_PAGES } from "@/lib/bible-read";
import { saveReading } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/academy/bible")({ component: Bible });

function Bible() {
  const saved = useTemple((s) => s.bookmarks?.bible ?? 0);
  const setBookmark = useTemple((s) => s.setBookmark);
  const [at, setAt] = useState(0);
  const [toc, setToc] = useState(true);

  useEffect(() => {
    if (saved >= 0 && saved < BIBLE_PAGES.length) setAt(saved);
  }, [saved]);

  function go(next: number, showReading = true) {
    const page = Math.max(0, Math.min(BIBLE_PAGES.length - 1, next));
    setAt(page);
    setBookmark("bible", page);
    if (showReading) setToc(false);
    void saveReading({ data: { work: "bible", page } }).catch(() => {});
  }

  const leaf = BIBLE_PAGES[at];

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-2 pt-6">
        <img src="/covers/bible.jpg" alt="" className="h-24 w-16 shrink-0 border border-gold/40 object-cover" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold">The Divine Molecule Temple Bible</p>
          <h1 className="mt-1 font-display text-2xl uppercase leading-none">From flesh to flame</h1>
          <p className="mt-2 font-mono text-[11px] normal-case text-paper/60">
            Page {at + 1} of {BIBLE_PAGES.length}. The place you stop is kept on your account.
          </p>
        </div>
      </section>

      {toc ? (
        <section className="mx-auto max-w-3xl px-4 py-6">
          <ol className="divide-y divide-paper/10 border border-paper/15">
            {BIBLE_PAGES.map((page, index) => (
              <li key={page.title}>
                <button
                  type="button"
                  onClick={() => go(index)}
                  className={cn(
                    "flex w-full items-baseline gap-3 px-4 py-3 text-left text-sm hover:bg-panel",
                    index === at && "text-lime",
                  )}
                >
                  <span className="w-8 shrink-0 font-mono text-[10px] text-paper/40">{String(index + 1).padStart(2, "0")}</span>
                  <span>{page.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="mx-auto max-w-3xl px-4 py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">{leaf.title}</p>
          <div className="mt-6 space-y-5">
            {leaf.body.map((paragraph) => (
              <p key={paragraph} className="font-mono text-[13px] normal-case leading-relaxed text-paper/85">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setToc(true)} className="min-h-11 text-[11px] uppercase tracking-wide text-paper/50">
              Contents
            </button>
            <button
              type="button"
              onClick={() => (at + 1 < BIBLE_PAGES.length ? go(at + 1) : setToc(true))}
              className="min-h-11 bg-lime px-6 text-[12px] font-semibold uppercase tracking-wide text-ink"
            >
              {at + 1 < BIBLE_PAGES.length ? "Next" : "End"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
