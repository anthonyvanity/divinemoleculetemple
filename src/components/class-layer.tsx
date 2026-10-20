import { Play, StickyNote } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listClassNotes, saveClassNote } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

export function ClassLayer({
  code,
  videoSrc,
  children,
}: {
  code: string;
  videoSrc?: string;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<"read" | "notes" | "video">("read");
  const note = useTemple((s) => s.classNotes?.[code]?.[0]?.body ?? "");
  const setClassNote = useTemple((s) => s.setClassNote);
  const { user } = useCurrentUserState();
  const pending = useRef<number | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;
    void listClassNotes()
      .then((rows) => {
        const row = rows.find((item) => item.code.toUpperCase() === code.toUpperCase());
        const local = useTemple.getState().classNotes?.[code]?.[0]?.body ?? "";
        if (row?.body) setClassNote(code, row.body);
        else if (local.trim()) void saveClassNote({ data: { code, body: local } }).catch(() => {});
      })
      .catch(() => {});
  }, [user, code, setClassNote]);

  function write(body: string) {
    setClassNote(code, body);
    if (!user) return;
    if (pending.current) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      void saveClassNote({ data: { code, body } }).catch(() => {});
    }, 400);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-paper/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setMode("read")}
          className={cn("min-h-9 px-3 text-micro tracking-wide", mode === "read" ? "bg-lime text-ink" : "text-paper/60")}
        >
          Lesson
        </button>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "notes" ? "read" : "notes"))}
          className={cn("min-h-9 px-3 text-micro tracking-wide", mode === "notes" ? "bg-lime text-ink" : "text-paper/60")}
        >
          <StickyNote className="mr-1 inline size-3.5" /> Class notes
        </button>
        <button
          type="button"
          onClick={() => setMode("video")}
          className={cn("min-h-9 px-3 text-micro tracking-wide", mode === "video" ? "bg-lime text-ink" : "text-paper/60")}
        >
          <Play className="mr-1 inline size-3.5" /> Watch
        </button>
      </div>

      {mode === "notes" ? (
        <div className="border-b border-paper/10 px-4 py-4 sm:px-6">
          <label className="block max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.16em] text-lime">{code}</span>
            <textarea
              value={note}
              onChange={(e) => write(e.target.value)}
              rows={6}
              placeholder="Write something, if you want."
              className="mt-2 w-full resize-y border border-lime/40 bg-transparent p-3 font-mono text-[13px] normal-case leading-relaxed text-paper outline-none"
            />
          </label>
        </div>
      ) : null}

      {mode === "video" ? (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {videoSrc ? (
            <video src={videoSrc} controls playsInline className="aspect-video w-full bg-ink" />
          ) : (
            <p className="border border-paper/15 p-8 text-sm text-paper/55">Lecture video for this node is still being encoded.</p>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
