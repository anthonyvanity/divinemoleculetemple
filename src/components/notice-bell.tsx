import { Link } from "@tanstack/react-router";
import { Bell, Flame, Hexagon, Radio, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTempleNotices } from "@/lib/temple-notices";
import { useTemple, type TempleNotice } from "@/lib/temple-store";

const KIND_ICON = {
  wall: Hexagon,
  circle: Users,
  rite: Flame,
  system: Radio,
} as const;

function relTime(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(delta / 60000));
  if (min < 1) return "Now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.round(hr / 24)}d`;
}

export function NoticeBell() {
  useTempleNotices();
  const notices = useTemple((s) => s.notices);
  const markNotice = useTemple((s) => s.markNotice);
  const markAllNotices = useTemple((s) => s.markAllNotices);
  const unread = notices.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid size-10 place-items-center rounded-full border"
        style={{ borderColor: "var(--desk-line)" }}
        aria-label={unread ? `${unread} unread transmissions` : "Transmissions"}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span
            className="absolute right-1.5 top-1.5 grid min-w-3.5 place-items-center rounded-full px-0.5 text-[8px] leading-none"
            style={{ background: "var(--desk-accent)", color: "var(--desk-on-accent)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--desk-line)", background: "var(--desk-panel)" }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--desk-line)" }}>
            <p className="text-[10px] tracking-[0.18em]">Transmissions</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => markAllNotices()}
                className="text-[9px] tracking-[0.16em]"
                style={{ color: "var(--desk-accent)" }}
              >
                Mark all read
              </button>
            ) : null}
            <Link to="/notices" className="text-[9px] tracking-[0.16em]" style={{ color: "var(--desk-accent)" }}>
              All
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notices.length === 0 ? (
              <li className="px-4 py-10 text-center text-[11px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
                Channel is quiet.
              </li>
            ) : (
              notices.map((n) => <NoticeRow key={n.id} notice={n} onOpen={() => { markNotice(n.id); setOpen(false); }} />)
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NoticeRow({ notice, onOpen }: { notice: TempleNotice; onOpen: () => void }) {
  const Icon = KIND_ICON[notice.kind];
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: "var(--desk-line)" }}>
      <Link
        to={notice.href}
        onClick={onOpen}
        className="flex gap-3 px-4 py-3 hover:opacity-90"
        style={notice.read ? { opacity: 0.55 } : undefined}
      >
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border" style={{ borderColor: "var(--desk-line)" }}>
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] tracking-wide">{notice.title}</span>
            <span className="shrink-0 text-[9px] tracking-[0.14em]" style={{ color: "var(--desk-muted)" }}>
              {relTime(notice.at)}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-snug" style={{ color: "var(--desk-muted)" }}>
            {notice.body}
          </span>
        </span>
        {!notice.read ? (
          <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: "var(--desk-accent)" }} />
        ) : null}
      </Link>
    </li>
  );
}
