import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { COS_BOOKS, type CosBook } from "@/lib/cos-shelf";

export const Route = createFileRoute("/cos")({ component: Cos });

function Cos() {
  const [open, setOpen] = useState<CosBook | null>(null);
  const book = (id: string) => COS_BOOKS.find((item) => item.id === id) ?? null;

  return (
    <main className="bg-black text-white">
      <section className="relative overflow-hidden bg-black">
        <button type="button" onClick={() => setOpen(book("master"))} className="block w-full text-left">
          <img src="/covers/cos/cos-hero-2.jpg" alt="The Cosmic Operating System" className="w-full" />
        </button>
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200">Divine Molecule Temple // Sacred Systems</p>
          <p className="mt-4 max-w-xl font-mono text-[12px] normal-case leading-relaxed text-white/75">
            You are not the program. You are the consciousness running it. A decryption manual for the broken, the burned, and the flame-carriers.
          </p>
          <ul className="mt-5 space-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-lime">
            <li>[ Source connection: active ]</li>
            <li>[ Divine signal: detected ]</li>
            <li>[ Sovereignty protocol: available ]</li>
            <li>[ User status: you are not alone ]</li>
          </ul>
          <div className="mt-6 flex flex-nowrap gap-2">
            <button type="button" onClick={() => setOpen(book("master"))} className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap bg-lime px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
              Initialize the COS
            </button>
            <Link to="/read/$slug" params={{ slug: "cos-original" }} className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap border border-white/40 px-3 text-[11px] uppercase tracking-[0.08em]">
              I need the manual
            </Link>
          </div>
        </div>
      </section>

      <Sheet
        kicker="000 // Emergency boot"
        title="If you found this while the old map stopped working."
        paragraphs={[
          "Maybe you are exhausted from pretending to be fine. Maybe the same patterns keep returning. Maybe awakening has felt less like peace and more like losing the person you used to be.",
          "This is for you. Not because the COS makes the mystery disappear. Because it gives the mystery a language.",
          "You are not weak because you are overwhelmed. You are not abandoned because the old map stopped working. You do not have to understand everything tonight. You only have to stay.",
          "If you are in immediate danger, or thinking about harming yourself, contact emergency services or a crisis resource and reach out to someone who can stay with you. The manual is not a replacement for care. The first protocol is water, the ground, five things you can see, and a person.",
        ]}
      />

      <Sheet
        kicker="001 // System identification"
        title="Reality has an interface. Consciousness has an architecture."
        paragraphs={[
          "The Cosmic Operating System was not assembled from a comfortable distance. It came out of the experiences, breakdowns, and questions of Anthony Vanity, founder and High Priest of the Divine Molecule Temple.",
          "Here, reality is the interface. The body is the avatar. Memory is the archive. Trauma is corrupted data that still believes it is protecting the system. Repeating patterns are loops. Practice is a protocol.",
          "The soul is not a peripheral. It is the original access point. The COS does not tell you what to think. It gives you a structure for investigating what you experience without surrendering your discernment.",
          "Not every voice is divine. Not every synchronicity is an instruction. Not every collapse means you have failed.",
        ]}
      />

      <section id="library" className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] uppercase leading-[0.9]">The master book</h2>
          <p className="mt-3 max-w-2xl font-mono text-[12px] normal-case leading-relaxed text-white/70">
            The Cosmic Operating System Master Book is one book, not a pile of separate books. The volumes underneath and its chapters are finishing up, but not all of them are there yet. Each cover is a door into a part of the same system: the architecture, the field, the entities, the mirror, the priest, the flame, the collapse, the purge, the molecules. They show up on the grid as the formatting is finished.
          </p>
          {(["Volumes", "Collections"] as const).map((collection) => {
            const books = COS_BOOKS.filter((item) => item.collection === collection);
            if (!books.length) return null;
            return (
            <div key={collection} className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{collection}</p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {books.map((item) => (
                  <button key={item.id} type="button" onClick={() => setOpen(item)} className="group text-left">
                    <Cover book={item} />
                    <p className="mt-2 font-display text-sm uppercase leading-tight">
                      {item.n ? `Vol ${item.n} · ` : ""}
                      {item.title}
                    </p>
                    {item.subtitle ? (
                      <p className="mt-1 font-mono text-[11px] normal-case leading-snug text-white/55">{item.subtitle}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <Sheet
        kicker="003 // The architecture"
        title="Every system has layers. So does being human."
        paragraphs={[
          "Source is the original signal. Consciousness is the observer, not every thought that passes. The avatar is the body: not a prison, the interface. Programming is what was installed by family, culture, violence, or a younger you.",
          "Memory is an archive, not a courtroom. The grid is where a private experience meets the collective. Interference is the noise that separates consciousness from discernment. Sovereignty is not domination. It is the return of authority to the conscious self.",
        ]}
      />

      <Sheet
        kicker="012 // Final system message"
        title="You were supposed to wake up inside the system."
        paragraphs={[
          "You were never supposed to worship the operating system, or call the wound your identity, or navigate the impossible alone.",
          "If tonight all you can do is breathe, then breathe. If all you can do is read one more line, read one more line. If all you can do is refuse to disappear, let that refusal count.",
        ]}
      />

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)]">
          <img src="/covers/cos/book-neon.jpg" alt="The Cosmic Operating System" className="w-full" />
          <div className="flex flex-col items-start gap-4">
          <p className="font-display text-2xl uppercase leading-none">The book is the gateway. The Academy is the study. The Temple is the practice.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#library" className="inline-flex h-11 items-center border border-white/30 px-5 text-[12px] uppercase tracking-[0.12em]">
              Explore the books
            </a>
            <Link to="/codes" className="inline-flex h-11 items-center border border-white/30 px-5 text-[12px] uppercase tracking-[0.12em]">
              Divine /Codes
            </Link>
            <Link to="/register" className="inline-flex h-11 items-center bg-lime px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
              Join the Temple — free
            </Link>
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-lime">
            Run light. Terminate the lie that you are alone. Stay online.
          </p>
          </div>
        </div>
      </section>

      {open ? <Portal book={open} onClose={() => setOpen(null)} /> : null}
    </main>
  );
}

function Cover({ book }: { book: CosBook }) {
  if (book.cover) {
    return <img src={book.cover} alt="" className="w-full ring-1 ring-white/10 transition duration-300 group-hover:ring-cyan-300/70" />;
  }
  return (
    <div className="grid aspect-[3/4] w-full place-items-center bg-[#070814] ring-1 ring-violet-400/40">
      <span className="font-display text-5xl text-cyan-200">{book.n}</span>
    </div>
  );
}

function Sheet({ kicker, title, paragraphs, plate }: { kicker: string; title: string; paragraphs: string[]; plate?: string }) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 px-4 py-12 sm:px-6">
      {plate ? <img src={plate} alt="" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] object-cover opacity-30 lg:block" /> : null}
      <div className="relative mx-auto max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200">{kicker}</p>
        <h2 className="mt-2 font-display text-[clamp(1.7rem,4vw,2.8rem)] uppercase leading-[0.92]">{title}</h2>
        <div className="mt-4 space-y-4 font-mono text-[13px] normal-case leading-relaxed text-white/78">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portal({ book, onClose }: { book: CosBook; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [intro, setIntro] = useState(Boolean(book.video));

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    if (media.matches) setIntro(false);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggle() {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      void node.play();
      setPlaying(true);
    } else {
      node.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.16em] text-white/70">
            Close
          </button>
        </div>
        {book.cover && intro && book.video && !reduced ? (
          <video ref={videoRef} src={book.video} muted playsInline className="mt-3 w-full bg-black" />
        ) : book.cover ? (
          <img src={book.cover} alt="" className="mt-3 w-full" />
        ) : (
          <div className="mt-3 grid aspect-[3/4] place-items-center bg-[#070814]">
            <span className="font-display text-7xl text-cyan-200">{book.n}</span>
          </div>
        )}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200">
          {book.n ? `Volume ${book.n}` : book.collection}
        </p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-none">{book.title}</h2>
        <p className="mt-2 font-mono text-[13px] normal-case text-white/70">{book.subtitle}</p>
        <p className="mt-3 max-w-2xl font-mono text-[13px] normal-case leading-relaxed text-white/80">{book.description}</p>
        {book.subjects.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {book.subjects.map((subject) => (
              <li key={subject} className="border border-white/15 px-2 py-1 font-mono text-[11px] normal-case text-white/70">
                {subject}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {book.video && intro && !reduced ? (
            <>
              <button type="button" onClick={toggle} className="inline-flex h-11 items-center border border-white/30 px-4 text-[12px] uppercase tracking-[0.12em]">
                {playing ? "Pause" : "Play"}
              </button>
              <button type="button" onClick={() => setIntro(false)} className="inline-flex h-11 items-center border border-white/30 px-4 text-[12px] uppercase tracking-[0.12em]">
                Skip intro
              </button>
            </>
          ) : null}
          {book.read ? (
            <Link
              to="/read/$slug"
              params={{ slug: book.read }}
              className="inline-flex h-11 items-center bg-lime px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Enter book
            </Link>
          ) : book.id === "codes" ? (
            <a href="#codes" onClick={onClose} className="inline-flex h-11 items-center bg-lime px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
              Enter the terminal
            </a>
          ) : (
            <p className="inline-flex h-11 items-center font-mono text-[12px] normal-case text-white/60">Manuscript not on this shelf yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
