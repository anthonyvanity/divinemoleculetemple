import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureMember, getDesk, listClassNotes, listReadings } from "@/lib/temple-data";
import { confirmStripeSession } from "@/lib/stripe-temple";
import type { PathId } from "@/lib/temple-content";
import { useTemple } from "@/lib/temple-store";

const TIERS = new Set(["seeker", "initiate", "patron"]);

/** The account is the record. The browser only displays it. */
export function AccessSync() {
  const { user } = useCurrentUserState();
  const applyAccount = useTemple((s) => s.applyAccount);
  useEffect(() => {
    if (!user) return;
    let stop = false;
    void (async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (sessionId) {
        try {
          await confirmStripeSession({ data: sessionId });
        } catch {
          /* the desk still has the webhook */
        }
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
      const m = await ensureMember();
      const notes = await listClassNotes().catch(() => null);
      const marks = await listReadings().catch(() => null);
      const desk = await getDesk().catch(() => null);
      if (stop) return;
      const tier = m.membership?.tier ?? "seeker";
      const scholarship = Boolean(m.membership?.scholarship);
      const suspended = Boolean(m.membership?.suspended);
      const expired = m.membership?.billing_status === "expired";
      const paid = !suspended && !expired && (scholarship || tier === "initiate" || tier === "patron");
      const path = (suspended || expired ? "seeker" : TIERS.has(tier) ? tier : "seeker") as PathId;
      const classNotes = notes
        ? Object.fromEntries(notes.filter((n) => n.body.trim()).map((n) => [n.code, [{ id: n.code, x: 0, y: 0, body: n.body }]]))
        : undefined;
      const bookmarks = marks ? Object.fromEntries(marks.map((row) => [row.work, row.page])) : undefined;
      applyAccount({
        paid,
        role: m.membership?.role ?? "member",
        path,
        handle: m.profile.handle || "",
        flameName: m.profile.flame_name ?? "",
        bio: m.profile.bio ?? "",
        sigil: Number(m.profile.sigil ?? 1),
        portrait: m.profile.avatar_url ?? "",
        joinedAt: m.profile.joined_at || new Date().toISOString(),
        awakening: Array.isArray(m.awakening) ? m.awakening : [],
        read: (m.progress ?? []).map((row) => row.node_id).filter((id) => id && !id.startsWith("reader:")),
        ...(classNotes ? { classNotes } : {}),
        ...(bookmarks ? { bookmarks } : {}),
        ...(desk
          ? {
              lastClass: desk.lastClass || useTemple.getState().lastClass,
              deskSchedule: desk.schedule,
              deskPractice: desk.practice,
            }
          : {}),
      });
    })().catch(() => {});
    return () => {
      stop = true;
    };
  }, [user, applyAccount]);
  return null;
}
