import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { readArchive, toggleSaved } from "@/lib/engine";

export const Route = createFileRoute("/archive/$slug")({ component: ArchivePage });

type RecordView = Awaited<ReturnType<typeof readArchive>>;

function ArchivePage() {
  const { slug } = Route.useParams();
  const { user } = useCurrentUserState();
  const [record, setRecord] = useState<RecordView | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    void readArchive({ data: slug })
      .then(setRecord)
      .catch((error: Error) => setErr(error.message || "Missing"));
  }, [slug]);

  if (err) {
    return (
      <main className="bg-ink px-4 py-24 text-center text-paper">
        <p className="font-display text-3xl uppercase">{err}</p>
      </main>
    );
  }
  if (!record) {
    return (
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-micro uppercase tracking-[0.2em] text-lilac">Opening the record…</p>
      </main>
    );
  }

  const { item } = record;
  return (
    <main className="bg-ink px-4 py-16 text-paper sm:px-6">
      <article className="mx-auto max-w-2xl">
        <Link to="/archives" className="text-[10px] uppercase tracking-[0.16em] text-lilac">
          Temple archives
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-lilac">
          {item.contentType}
          {item.volumeNumber ? ` · Volume ${item.volumeNumber}` : ""}
          {item.chapterNumber ? ` · Chapter ${String(item.chapterNumber).padStart(3, "0")}` : ""}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.4rem)] uppercase leading-[0.9]">{item.title}</h1>
        {item.subtitle ? <p className="mt-3 font-mono text-[12px] normal-case text-paper/70">{item.subtitle}</p> : null}
        {record.locked ? (
          <div className="mt-8 border border-paper/20 p-5">
            <p className="text-[10px] uppercase tracking-wide text-paper">Sealed · {item.accessTier}</p>
            <p className="mt-3 font-mono text-[12px] normal-case leading-relaxed text-paper/70">{item.excerpt}</p>
            <Button asChild variant="dark" className="mt-6">
              <Link to={item.accessTier === "seeker" ? "/register" : "/gates"}>
                {item.accessTier === "seeker" ? "Become a Seeker" : "Open the gate"}
              </Link>
            </Button>
          </div>
        ) : item.body.includes("[CONTENT REQUIRED]") ? (
          <p className="mt-8 font-mono text-[12px] normal-case leading-relaxed text-paper/70">{item.excerpt.includes("not in the vault") ? item.subtitle : item.excerpt}</p>
        ) : (
          <div className="mt-8 whitespace-pre-wrap font-mono text-[13px] normal-case leading-relaxed text-paper/85">
            {item.body}
          </div>
        )}
        {!record.locked && user ? (
          <button
            type="button"
            className="mt-8 text-[10px] uppercase tracking-[0.16em] text-lime"
            onClick={() => {
              void toggleSaved({ data: item.slug }).then((mark) => {
                setRecord({ ...record, saved: mark.saved });
              });
            }}
          >
            {record.saved ? "Saved to my library" : "Save to my library"}
          </button>
        ) : null}
        <div className="mt-10 flex justify-between gap-4 text-[10px] uppercase tracking-[0.14em]">
          {record.prev ? (
            <Link to="/archive/$slug" params={{ slug: record.prev.slug }} className="text-paper/60 hover:text-lilac">
              ← {record.prev.title}
            </Link>
          ) : (
            <span />
          )}
          {record.next ? (
            <Link to="/archive/$slug" params={{ slug: record.next.slug }} className="text-right text-paper/60 hover:text-lilac">
              {record.next.title} →
            </Link>
          ) : null}
        </div>
      </article>
    </main>
  );
}
