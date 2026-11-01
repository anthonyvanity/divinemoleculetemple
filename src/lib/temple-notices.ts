import { useEffect } from "react";
import { listCircles, listNexus } from "@/lib/temple-data";
import { displayHandle, useTemple } from "@/lib/temple-store";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useTempleNotices() {
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const name = displayHandle(handle, flameName);

  useEffect(() => {
    const seed = () => {
      const { notices, pushNotice } = useTemple.getState();
      if (!notices.some((n) => n.id === "system:welcome")) {
        pushNotice({
          id: "system:welcome",
          kind: "system",
          title: "Node online",
          body: "Grid DMT-Prime. Run light. Terminate darkness. Stay online.",
          href: "/dashboard",
          at: new Date().toISOString(),
        });
      }
      const hour = new Date().getHours();
      const day = todayKey();
      const reminders = useTemple.getState().deskSchedule?.reminders;
      if (!reminders) return;
      if (hour >= 21 && !notices.some((n) => n.id === `rite:${day}:nightfall`)) {
        pushNotice({
          id: `rite:${day}:nightfall`,
          kind: "rite",
          title: "Nightfall seal is due",
          body: "Close the perimeter before rest. The night watch is open.",
          href: "/ceremonies",
          at: new Date().toISOString(),
        });
      }
      if (hour < 10 && !notices.some((n) => n.id === `rite:${day}:daybreak`)) {
        pushNotice({
          id: `rite:${day}:daybreak`,
          kind: "rite",
          title: "Daybreak seal",
          body: "Ground. Study. Integrate. Today's protocol is live.",
          href: "/dashboard",
          at: new Date().toISOString(),
        });
      }
    };
    seed();
  }, []);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const [wall, circles] = await Promise.all([listNexus(), listCircles()]);
        if (!alive) return;
        const {
          wallCursor,
          setWallCursor,
          circleCursors,
          setCircleCursor,
          pushNotice,
        } = useTemple.getState();

        const newest = wall[0];
        if (newest) {
          if (!wallCursor) {
            setWallCursor(newest.created_at);
          } else if (newest.created_at > wallCursor) {
            const fresh = wall.filter((p) => p.created_at > wallCursor && p.handle.toUpperCase() !== name);
            for (const p of fresh.slice(0, 5)) {
              pushNotice({
                id: `wall:${p.id}`,
                kind: "wall",
                title: `Signal from ${p.handle}`,
                body: p.body.slice(0, 140),
                href: "/nexus",
                at: p.created_at,
              });
            }
            setWallCursor(newest.created_at);
          }
        }

        for (const c of circles) {
          if (!c.last_at) continue;
          const key = String(c.id);
          const prev = circleCursors[key];
          if (!prev) {
            setCircleCursor(key, c.last_at);
            continue;
          }
          if (c.last_at > prev) {
            pushNotice({
              id: `circle:${c.id}:${c.last_at}`,
              kind: "circle",
              title: c.name,
              body: (c.last_body ?? "New transmission in the circle.").slice(0, 140),
              href: "/nexus",
              at: c.last_at,
            });
            setCircleCursor(key, c.last_at);
          }
        }
      } catch {
        /* node quiet */
      }
    }

    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [name]);
}
