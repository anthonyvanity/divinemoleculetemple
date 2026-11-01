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
  const { user, isPending } = useCurrentUserState();
  const signedIn = Boolean(user);
  const locked = !signedIn;

  useEffect(() => {
    if (!signedIn && mode !== "read") setMode("read");
  }, [signedIn, mode]);
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
      <div className="flex flex-wrap items-center gap-2 border-b border-paper/15 px-4 py-3 sm:px-6">
        {(
          [
            ["read", "Lesson"],
            ["notes", "Class notes"],
            ["video", "Watch"],
          ] as const
        ).map(([id, label]) => {
          const shut = id !== "read" && (locked || isPending);
          return (
            <button
              key={id}
              type="button"
              disabled={shut}
              onClick={() => {
                if (shut) return;
                setMode(id);
              }}
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 border px-3 text-[11px] uppercase tracking-[0.12em]",
                shut
                  ? "cursor-not-allowed border-white/15 text-paper/35"
                  : mode === id
                    ? "cursor-pointer border-lime bg-lime text-ink"
                    : "cursor-pointer border-white/25 text-paper hover:border-lime hover:text-lime",
              )}
            >
              {id === "notes" ? <StickyNote className="size-3.5" /> : null}
              {id === "video" ? <Play className="size-3.5" /> : null}
              {label}
            </button>
          );
        })}
      </div>
      {locked && !isPending ? (
        <p className="px-4 pt-3 text-[10px] uppercase tracking-[0.14em] text-paper/45 sm:px-6">Sign in to open class notes and the lecture.</p>
      ) : null}

      {mode === "notes" && signedIn ? (
        <div className="px-4 py-6 sm:px-6">
          <label className="mx-auto block max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.16em] text-lime">{code}</span>
            <textarea
              value={note}
              onChange={(e) => write(e.target.value)}
              rows={10}
              placeholder="Write something, if you want."
              className="mt-2 w-full resize-y border border-white/25 bg-transparent p-3 font-mono text-[13px] normal-case leading-relaxed text-paper outline-none"
            />
          </label>
        </div>
      ) : null}

      {mode === "video" && signedIn ? (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {videoSrc ? (
            <video src={videoSrc} controls playsInline className="aspect-video w-full bg-black" />
          ) : (
            <p className="border border-white/25 p-8 text-sm text-paper/70">This class does not have a lecture video yet.</p>
          )}
        </div>
      ) : null}

      {mode === "read" || !signedIn ? children : null}
    </div>
  );
}
