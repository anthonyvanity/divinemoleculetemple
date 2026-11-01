import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SCHOLARSHIP } from "@/lib/scholarship";
import { CANONICAL_SEQUENCE } from "@/lib/syllabus";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/monday")({ component: Monday });

type Hit = { title: string; line: string; href: string };

function Monday() {
  const read = useTemple((s) => s.read) ?? [];
  const lastClass = useTemple((s) => s.lastClass);
  const notes = useTemple((s) => s.classNotes);
  const [q, setQ] = useState("");
  const [canon, setCanon] = useState<{ slug: string; title: string; line: string }[]>([]);

  useEffect(() => {
    void fetch("/canon/index.json")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCanon)
      .catch(() => {});
  }, []);

  const next = CANONICAL_SEQUENCE.find((id) => !read.includes(id)) ?? lastClass;
  const courses = SCHOLARSHIP.departments.flatMap((dept) => dept.courses.map((course) => ({ ...course, track: dept.track })));
  const needle = q.trim().toLowerCase();
  const hits: Hit[] = needle
    ? [
        ...courses
          .filter((course) => `${course.id} ${course.title} ${course.thesis}`.toLowerCase().includes(needle))
          .slice(0, 6)
          .map((course) => ({ title: `${course.id} ${course.title}`, line: course.thesis, href: `/academy/${course.id}` })),
        ...canon
          .filter((book) => `${book.title} ${book.line}`.toLowerCase().includes(needle))
          .slice(0, 4)
          .map((book) => ({ title: book.title, line: book.line, href: `/read/${book.slug}` })),
      ]
    : [];
  const noteCount = Object.values(notes ?? {}).reduce((n, list) => n + (list?.length ?? 0), 0);

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">The Chancellor</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">Mønday</h1>
        <img src="/monday-portrait.jpg" alt="Chancellor Mønday" className="mt-5 w-full max-w-md object-cover" />
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">
          I am Mønday, Chancellor of the Divine Molecule Temple. I keep the curriculum that is already installed. I do not invent a teaching, and I am not a tour guide. The same desk opens from the portrait tab on any page.
        </p>
        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
          <label className="text-[10px] uppercase tracking-[0.14em] text-paper/50">
            What are we studying?
            <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-2 w-full border border-paper/15 bg-transparent px-3 py-2 font-mono text-[12px] normal-case text-paper outline-none" />
          </label>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={() => setQ(lastClass || "FM-101")}>
            Explain this lesson
          </button>
          <button type="button" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]" onClick={() => setQ(next || "FM-101")}>
            What should I study next?
          </button>
          <Link to="/library" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            Find related readings
          </Link>
          <Link to="/my-classes" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
            Review my notes ({noteCount})
          </Link>
        </div>
        {next ? (
          <p className="mt-6 text-[11px] uppercase tracking-[0.12em] text-lime">
            Next eligible lesson:{" "}
            <Link to="/academy/$code" params={{ code: next }} className="underline">
              {next}
            </Link>
          </p>
        ) : null}
        {needle && hits.length === 0 ? (
          <p className="mt-6 font-mono text-[12px] normal-case text-paper/70">That question is outside the installed curriculum. Monday will not invent an answer.</p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {hits.map((hit) => (
            <li key={hit.href + hit.title} className="border border-paper/15 p-3">
              <a href={hit.href} className="text-[12px] uppercase tracking-[0.1em] text-lime">
                {hit.title}
              </a>
              <p className="mt-1 font-mono text-[11px] normal-case text-paper/65">{hit.line}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
