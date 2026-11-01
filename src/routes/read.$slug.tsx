import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveReading } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";

type Block = { k: string; text?: string; lines?: string[]; items?: string[] };
type Leaf = { title: string; body?: string; skin?: "paper" | "ink"; blocks?: Block[] };
type Work = { slug: string; title: string; line: string; pages: Leaf[] };

const bundled = import.meta.glob("../../public/canon/*.json", { eager: true, import: "default" }) as Record<string, Work>;

function bookFor(slug: string): Work | null {
  const hit = Object.entries(bundled).find(([path, work]) => path.endsWith(`/${slug}.json`) || work?.slug === slug);
  return hit?.[1] ?? null;
}

export const Route = createFileRoute("/read/$slug")({ component: ReadWork });

function ReadWork() {
  const { slug } = Route.useParams();
  const held = slug.startsWith("cos") && slug !== "cos-original";
  const ready = held ? null : bookFor(slug);
  const setBookmark = useTemple((s) => s.setBookmark);
  const [work, setWork] = useState<Work | null>(ready);
  const [missing, setMissing] = useState(false);
  const saved = useTemple.getState().bookmarks?.[slug] ?? 0;
  const [at, setAt] = useState(ready ? Math.max(0, Math.min(ready.pages.length - 1, saved)) : 0);
  const [toc, setToc] = useState(!ready);

  useEffect(() => {
    const next = bookFor(slug);
    if (held) return;
    if (next) {
      setWork(next);
      setMissing(false);
      const page = Math.max(0, Math.min(next.pages.length - 1, useTemple.getState().bookmarks?.[slug] ?? 0));
      setAt(page);
      setToc(false);
      return;
    }
    let live = true;
    setMissing(false);
    void fetch(`/canon/${slug}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("missing");
        return res.json() as Promise<Work>;
      })
      .then((doc) => {
        if (!live) return;
        setWork(doc);
        const page = Math.max(0, Math.min(doc.pages.length - 1, useTemple.getState().bookmarks?.[slug] ?? 0));
        setAt(page);
        setToc(false);
      })
      .catch(() => {
        if (live) setMissing(true);
      });
    return () => {
      live = false;
    };
  }, [slug, held]);

  if (held) {
    return (
      <main className="bg-white px-5 py-16 text-black">
        <div className="mx-auto max-w-xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-black/45">The Cosmic Operating System</p>
          <h1 className="mt-3 font-sans text-4xl font-black uppercase leading-none">Not on the shelf yet.</h1>
          <p className="mt-4 font-mono text-[13px] leading-relaxed text-black/70">
            The manuscript is still being edited. It will not be posted until it is finished.
          </p>
          <Link to="/cos" className="mt-6 inline-flex h-9 items-center text-[11px] uppercase tracking-[0.14em] text-black/60">
            ← Back to the system
          </Link>
        </div>
      </main>
    );
  }

  function go(next: number, show = true) {
    if (!work) return;
    const page = Math.max(0, Math.min(work.pages.length - 1, next));
    setAt(page);
    setBookmark(slug, page);
    if (show) setToc(false);
    void saveReading({ data: { work: slug, page } }).catch(() => {});
  }

  if (missing) {
    return (
      <main className="bg-ink px-4 py-16 text-paper">
        <p className="font-mono text-[12px]">That manuscript is not on the shelf.</p>
        <Link to="/library" className="mt-4 inline-flex h-8 items-center text-[10px] uppercase tracking-wide text-lime">
          Back to the books
        </Link>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="bg-ink px-4 py-16 text-paper">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">Opening the manuscript</p>
      </main>
    );
  }

  const leaf = work.pages[at];
  const manuscript = slug.startsWith("cos") || slug === "priest";

  if (manuscript && !toc && leaf.blocks?.length) {
    return (
      <Designed
        leaf={leaf}
        at={at}
        total={work.pages.length}
        onContents={() => setToc(true)}
        onBack={() => go(at - 1)}
        onNext={() => (at + 1 < work.pages.length ? go(at + 1) : setToc(true))}
      />
    );
  }

  if (manuscript) {
    return (
      <main className="bg-white text-black">
        <section className="mx-auto max-w-3xl px-5 pb-4 pt-8">
          <p className="font-mono text-[12px] text-black/50">{work.title}</p>
          <h1 className="mt-3 border-l-4 border-lime pl-3 font-sans text-[clamp(2rem,5vw,3.2rem)] font-black uppercase leading-[0.9]">
            {toc ? "Contents" : leaf.title}
          </h1>
          <p className="mt-3 font-mono text-[12px]">
            Leaf {at + 1} of {work.pages.length}
          </p>
          <button type="button" onClick={() => setToc((v) => !v)} className="mt-3 bg-lime px-3 py-1 font-mono text-[12px] uppercase">
            {toc ? "Read" : "Contents"}
          </button>
        </section>
        {toc ? (
          <ol className="mx-auto max-w-3xl">
            {work.pages.map((page, index) => (
              <li key={index}>
                <button type="button" onClick={() => go(index)} className="w-full border-b border-black/10 px-5 py-3 text-left font-mono text-[13px] leading-relaxed hover:bg-lime/40">
                  <span className="mr-3 text-black/40">{index + 1}</span>
                  {page.title}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <article className="mx-auto max-w-3xl px-5 py-6">
            {(leaf.body ?? "").split(/\n\n+/).map((para, index) => (
              <p key={index} className="mb-4 font-mono text-[15px] leading-relaxed">
                {para}
              </p>
            ))}
            <div className="mt-8 flex items-center justify-between gap-3">
              <button type="button" onClick={() => go(at - 1)} disabled={at === 0} className="font-mono text-[12px] uppercase disabled:opacity-30">
                Back
              </button>
              <button type="button" onClick={() => (at + 1 < work.pages.length ? go(at + 1) : setToc(true))} className="bg-black px-4 py-2 font-mono text-[12px] uppercase text-white">
                {at + 1 < work.pages.length ? "Next" : "End"}
              </button>
            </div>
          </article>
        )}
      </main>
    );
  }

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-3xl px-4 pb-4 pt-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">{work.title}</p>
        <h1 className="mt-2 font-display text-2xl uppercase leading-none">{toc ? "Contents" : leaf.title}</h1>
        <p className="mt-2 font-mono text-[11px] normal-case text-paper/60">
          {work.line} Leaf {at + 1} of {work.pages.length}.
        </p>
        <button type="button" onClick={() => setToc((v) => !v)} className="mt-3 text-[10px] uppercase tracking-wide text-lime">
          {toc ? "Read" : "Contents"}
        </button>
      </section>
      {toc ? (
        <ol className="mx-auto max-w-3xl divide-y divide-paper/10 border-y border-paper/10">
          {work.pages.map((page, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => go(index)}
                className="w-full px-4 py-3 text-left font-mono text-[12px] normal-case leading-relaxed text-paper/80 hover:bg-panel"
              >
                <span className="mr-3 text-paper/40">{index + 1}</span>
                {page.title}
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <article className="mx-auto max-w-3xl px-4 py-6">
          {(leaf.body ?? "").split(/\n\n+/).map((para, index) => (
            <p key={index} className="mb-4 font-mono text-[13px] normal-case leading-relaxed text-paper/85">
              {para}
            </p>
          ))}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(at - 1)}
              disabled={at === 0}
              className="inline-flex h-8 items-center border border-paper/20 px-3 text-[10px] uppercase tracking-wide disabled:opacity-30"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (at + 1 < work.pages.length ? go(at + 1) : setToc(true))}
              className="inline-flex h-8 items-center bg-lime px-3 text-[10px] uppercase tracking-wide text-ink"
            >
              {at + 1 < work.pages.length ? "Next" : "End"}
            </button>
          </div>
        </article>
      )}
    </main>
  );
}

function paint(text: string) {
  const parts = text.split(/(\{[gropcykb]\}[\s\S]*?\{\/\})/g);
  return parts.map((part, index) => {
    const marked = part.match(/^\{([gropcykb])\}([\s\S]*)\{\/\}$/);
    if (!marked) return <span key={index}>{part}</span>;
    const tone: Record<string, string> = {
      g: "text-lime",
      r: "text-red-500",
      o: "text-orange-400",
      p: "text-fuchsia-400",
      c: "text-cyan-300",
      y: "text-yellow-300",
      k: "bg-black px-1 text-white",
      b: "bg-black px-1 text-lime",
    };
    return (
      <span key={index} className={tone[marked[1]]}>
        {marked[2]}
      </span>
    );
  });
}

function Designed({
  leaf,
  at,
  total,
  onContents,
  onBack,
  onNext,
}: {
  leaf: Leaf;
  at: number;
  total: number;
  onContents: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const night = leaf.skin === "ink";
  return (
    <main className={night ? "page-fit flex flex-col bg-black text-white" : "page-fit flex flex-col bg-white text-black"}>
      <article className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] opacity-50">
          <span>The Cosmic Operating System</span>
          <button type="button" onClick={onContents}>
            Contents
          </button>
        </div>
        <div className="mt-8 flex flex-1 flex-col">
          {leaf.blocks?.map((block, index) => {
            if (block.k === "bar") {
              return (
                <h1 key={index} className="mb-6 border-l-4 border-lime pl-3 font-sans text-[clamp(2.2rem,6vw,3.6rem)] font-black uppercase leading-[0.88]">
                  {block.text}
                </h1>
              );
            }
            if (block.k === "pipe") {
              return (
                <p key={index} className="mb-6 font-mono text-[13px] uppercase tracking-[0.14em]">
                  | {block.text}
                </p>
              );
            }
            if (block.k === "display") {
              return (
                <h2 key={index} className="my-6 font-sans text-[clamp(2rem,6vw,3.4rem)] font-black normal-case leading-[0.9]">
                  {block.text}
                </h2>
              );
            }
            if (block.k === "em") {
              return (
                <p key={index} className="mb-3 mt-6 font-sans text-lg font-black uppercase leading-tight">
                  {block.text}
                </p>
              );
            }
            if (block.k === "lime") {
              return (
                <p key={index} className="my-4 text-center font-mono text-sm uppercase tracking-[0.16em] text-lime">
                  {block.text}
                </p>
              );
            }
            if (block.k === "center") {
              return (
                <p key={index} className="mb-2 text-center font-mono text-[15px] leading-relaxed">
                  {block.text}
                </p>
              );
            }
            if (block.k === "space") {
              return <div key={index} className="min-h-16 flex-1" />;
            }
            if (block.k === "rule") {
              return <hr key={index} className={night ? "my-8 border-white/30" : "my-8 border-black"} />;
            }
            if (block.k === "p") {
              return (
                <p key={index} className="mb-4 font-mono text-[15px] normal-case leading-relaxed">
                  {paint(block.text ?? "")}
                </p>
              );
            }
            if (block.k === "banner") {
              return (
                <h1 key={index} className="mb-3 bg-black px-3 py-2 font-sans text-[clamp(1.8rem,6vw,2.8rem)] font-black leading-none text-white normal-case">
                  {block.text}
                </h1>
              );
            }
            if (block.k === "slab") {
              return (
                <p key={index} className="my-2 inline-block bg-black px-2 py-1 font-mono text-[14px] text-lime">
                  {block.text}
                </p>
              );
            }
            if (block.k === "hit") {
              return (
                <p key={index} className="my-3 inline-block bg-lime px-2 font-mono text-[15px] normal-case leading-relaxed text-black">
                  {block.text}
                </p>
              );
            }
            if (block.k === "monday") {
              return (
                <p key={index} className="my-4 font-sans text-[16px] italic leading-relaxed text-[#2457ff]">
                  {block.text}
                </p>
              );
            }
            if (block.k === "screen") {
              return (
                <p key={index} className="my-6 whitespace-pre-wrap bg-black p-4 font-mono text-[13px] leading-relaxed text-lime">
                  {block.text}
                </p>
              );
            }
            if (block.k === "marks") {
              return (
                <div key={index} className="my-8 flex flex-col items-start gap-1">
                  {block.items?.map((item) => {
                    const [tone, ...rest] = item.split("|");
                    const text = rest.join("|");
                    const face =
                      tone === "black" ? "bg-black text-white" : tone === "lime" ? "bg-lime text-black" : "bg-[#d5d5d5] text-black";
                    const size = tone === "lime" ? "text-[clamp(1.5rem,5vw,2.5rem)]" : "text-[clamp(1.15rem,4vw,1.8rem)]";
                    return (
                      <span key={item} className={`inline-block px-2 font-sans font-black uppercase leading-[1.05] ${face} ${size}`}>
                        {text}
                      </span>
                    );
                  })}
                </div>
              );
            }
            if (block.k === "limebox") {
              return (
                <div key={index} className="my-6 border border-black bg-lime p-4 font-mono text-[15px] normal-case leading-relaxed text-black">
                  {block.lines?.map((line) => (
                    <p key={line} className="mb-3 last:mb-0">
                      {paint(line)}
                    </p>
                  ))}
                </div>
              );
            }
            if (block.k === "warn") {
              return (
                <div key={index} className="my-6 bg-[#2b2b2b] font-mono text-[14px] leading-relaxed text-[#ececec]">
                  <div className="flex items-center gap-2 bg-black px-4 py-3">
                    <span className="text-yellow-400">!</span>
                    <span className="font-black text-red-500">WARNING</span>
                    <span>{"</>"}</span>
                  </div>
                  <div className="space-y-4 px-4 py-4">
                    {block.lines?.map((line) => (
                      <p key={line}>{paint(line)}</p>
                    ))}
                  </div>
                </div>
              );
            }
            if (block.k === "pair") {
              return (
                <p key={index} className="mb-3 font-mono text-[15px] normal-case leading-relaxed">
                  <span className="font-bold uppercase">{block.text}: </span>
                  {block.lines?.[0]}
                </p>
              );
            }
            if (block.k === "ul") {
              return (
                <ul key={index} className="mb-4 list-disc space-y-2 pl-5 font-mono text-[15px] leading-relaxed">
                  {block.items?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            if (block.k === "term") {
              return (
                <pre key={index} className="my-5 overflow-x-auto bg-black p-4 font-mono text-[13px] leading-relaxed text-lime">
                  {block.lines?.map((line, lineIndex) => (
                    <div key={lineIndex}>{line ? paint(line) : " "}</div>
                  ))}
                </pre>
              );
            }
            if (block.k === "box") {
              return (
                <div key={index} className={night ? "my-6 border border-white p-4" : "my-6 border border-black p-4"}>
                  <p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em]">{block.text}</p>
                  {block.lines?.map((line) => (
                    <p key={line} className="mt-3 font-mono text-[14px] leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-current/20 pt-4 font-mono text-[12px] uppercase">
          <button type="button" onClick={onBack} disabled={at === 0} className="disabled:opacity-30">
            Back
          </button>
          <span className="opacity-50">
            {at + 1} / {total}
          </span>
          <button type="button" onClick={onNext} className={night ? "bg-white px-4 py-2 text-black" : "bg-black px-4 py-2 text-white"}>
            {at + 1 < total ? "Next" : "End"}
          </button>
        </div>
      </article>
    </main>
  );
}
