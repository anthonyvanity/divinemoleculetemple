import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PathId } from "@/lib/temple-content";

export type OfferingRecord = {
  id: string;
  tier: string;
  amount: number;
  at: string;
  note: string;
};

export type NexusPost = {
  id: string;
  at: string;
  body: string;
  visibility: "private" | "anonymous" | "named";
};

export type CompiledPrayer = {
  id: string;
  at: string;
  issue: string;
  filename: string;
  code: string;
  prayer: string;
};

export type TempleNotice = {
  id: string;
  kind: "wall" | "circle" | "rite" | "system";
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
};

export type TempleMode = "night" | "day" | "possessed";

export type ClassNote = {
  id: string;
  x: number;
  y: number;
  body: string;
};

type TempleState = {
  path: PathId | "none";
  handle: string;
  read: string[];
  offerings: OfferingRecord[];
  journal: string;
  flameName: string;
  subscribed: boolean;
  mode: TempleMode;
  orientationDone: boolean;
  awakening: string[];
  rites: { id: string; at: string; title: string }[];
  nexusPosts: NexusPost[];
  sigil: number;
  bio: string;
  portrait: string;
  compiled: CompiledPrayer[];
  joinedAt: string;
  notices: TempleNotice[];
  wallCursor: string;
  circleCursors: Record<string, string>;
  classNotes: Record<string, ClassNote[]>;
  bookmarks: Record<string, number>;
  lastClass: string;
  deskSchedule: {
    wake: string;
    work: string;
    study: string;
    bed: string;
    zone: string;
    reminders: boolean;
    setupSkipped: boolean;
  };
  deskPractice: Record<string, Record<string, boolean>>;
  setLastClass: (id: string) => void;
  setPath: (path: PathId | "none") => void;
  paid: boolean;
  role: string;
  setAccess: (access: { paid: boolean; role: string; path: PathId | "none" }) => void;
  setHandle: (handle: string) => void;
  markRead: (id: string) => void;
  addOffering: (entry: Omit<OfferingRecord, "id" | "at">) => void;
  setJournal: (journal: string) => void;
  setFlameName: (name: string) => void;
  setSubscribed: (v: boolean) => void;
  setMode: (mode: TempleMode) => void;
  setOrientationDone: (v: boolean) => void;
  sealDay: (id: string) => void;
  mergeAwakening: (ids: string[]) => void;
  logRite: (title: string) => void;
  addNexusPost: (post: Omit<NexusPost, "id" | "at">) => void;
  setSigil: (n: number) => void;
  setBio: (bio: string) => void;
  setPortrait: (portrait: string) => void;
  addCompiled: (entry: Omit<CompiledPrayer, "id" | "at">) => void;
  pushNotice: (notice: Omit<TempleNotice, "read"> & { read?: boolean }) => void;
  markNotice: (id: string) => void;
  markAllNotices: () => void;
  setWallCursor: (at: string) => void;
  setCircleCursor: (circleId: string, at: string) => void;
  addClassNote: (code: string, note: Omit<ClassNote, "id">) => void;
  updateClassNote: (code: string, id: string, body: string) => void;
  setClassNote: (code: string, body: string) => void;
  removeClassNote: (code: string, id: string) => void;
  setBookmark: (work: string, page: number) => void;
  setDeskSchedule: (schedule: TempleState["deskSchedule"]) => void;
  setDeskPractice: (practice: TempleState["deskPractice"]) => void;
  applyAccount: (patch: Partial<TempleState>) => void;
};

export const useTemple = create<TempleState>()(
  persist(
    (set, get) => ({
      path: "none",
      handle: "",
      read: [],
      offerings: [],
      journal: "",
      flameName: "",
      subscribed: false,
      mode: "night",
      orientationDone: false,
      awakening: [],
      rites: [],
      nexusPosts: [],
      sigil: 1,
      bio: "",
      portrait: "",
      compiled: [],
      joinedAt: new Date().toISOString(),
      notices: [],
      wallCursor: "",
      circleCursors: {},
      classNotes: {},
      bookmarks: {},
      lastClass: "",
      deskSchedule: {
        wake: "07:00",
        work: "09:00",
        study: "18:00",
        bed: "22:00",
        zone: "UTC",
        reminders: false,
        setupSkipped: false,
      },
      deskPractice: {},
      paid: false,
      role: "member",
      setPath: (path) => {
        if (get().path === path) return;
        set({ path });
      },
      setAccess: ({ paid, role, path }) => {
        const cur = get();
        if (cur.paid === paid && cur.role === role && cur.path === path) return;
        set({ paid, role, path });
      },
      setHandle: (handle) => {
        if (get().handle === handle) return;
        set({ handle });
      },
      setLastClass: (lastClass) => {
        if (get().lastClass === lastClass) return;
        set({ lastClass });
      },
      markRead: (id) => {
        const read = get().read;
        if (read.includes(id)) return;
        set({ read: [...read, id] });
      },
      addOffering: (entry) =>
        set({
          offerings: [
            {
              id: crypto.randomUUID(),
              at: new Date().toISOString(),
              ...entry,
            },
            ...get().offerings,
          ].slice(0, 40),
        }),
      setJournal: (journal) => set({ journal }),
      setFlameName: (flameName) => set({ flameName }),
      setSubscribed: (subscribed) => set({ subscribed }),
      setMode: (mode) => set({ mode }),
      setOrientationDone: (orientationDone) => set({ orientationDone }),
      sealDay: (id) => {
        const awakening = get().awakening;
        if (awakening.includes(id)) return;
        const next = [...awakening, id];
        set({ awakening: next });
      },
      mergeAwakening: (ids) => {
        const awakening = get().awakening;
        const next = [...awakening];
        for (const id of ids) if (id && !next.includes(id)) next.push(id);
        if (next.length === awakening.length) return;
        set({ awakening: next });
      },
      logRite: (title) =>
        set({
          rites: [{ id: crypto.randomUUID(), at: new Date().toISOString(), title }, ...get().rites].slice(0, 40),
        }),
      addNexusPost: (post) =>
        set({
          nexusPosts: [{ id: crypto.randomUUID(), at: new Date().toISOString(), ...post }, ...get().nexusPosts].slice(
            0,
            80,
          ),
        }),
      setSigil: (sigil) => set({ sigil }),
      setBio: (bio) => set({ bio }),
      setPortrait: (portrait) => {
        if (get().portrait === portrait) return;
        set({ portrait });
      },
      addCompiled: (entry) =>
        set({
          compiled: [{ id: crypto.randomUUID(), at: new Date().toISOString(), ...entry }, ...get().compiled].slice(
            0,
            30,
          ),
        }),
      pushNotice: (notice) => {
        if (get().notices.some((n) => n.id === notice.id)) return;
        set({ notices: [{ read: false, ...notice }, ...get().notices].slice(0, 40) });
      },
      markNotice: (id) => set({ notices: get().notices.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
      markAllNotices: () => set({ notices: get().notices.map((n) => ({ ...n, read: true })) }),
      setWallCursor: (wallCursor) => set({ wallCursor }),
      setCircleCursor: (circleId, at) => set({ circleCursors: { ...get().circleCursors, [circleId]: at } }),
      addClassNote: (code, note) => {
        const all = get().classNotes ?? {};
        const list = all[code] ?? [];
        set({
          classNotes: {
            ...all,
            [code]: [...list, { ...note, id: crypto.randomUUID() }].slice(0, 40),
          },
        });
      },
      updateClassNote: (code, id, body) => {
        const all = get().classNotes ?? {};
        const list = all[code] ?? [];
        set({
          classNotes: {
            ...all,
            [code]: list.map((n) => (n.id === id ? { ...n, body } : n)),
          },
        });
      },
      setClassNote: (code, body) => {
        const all = get().classNotes ?? {};
        const prev = all[code]?.[0];
        if ((prev?.body ?? "") === body && (all[code]?.length ?? 0) <= 1) return;
        set({
          classNotes: {
            ...all,
            [code]: [{ id: prev?.id ?? crypto.randomUUID(), x: 0, y: 0, body }],
          },
        });
      },
      removeClassNote: (code, id) => {
        const all = get().classNotes ?? {};
        const list = all[code] ?? [];
        set({ classNotes: { ...all, [code]: list.filter((n) => n.id !== id) } });
      },
      setBookmark: (work, page) => {
        if ((get().bookmarks ?? {})[work] === page) return;
        set({ bookmarks: { ...(get().bookmarks ?? {}), [work]: page } });
      },
      setDeskSchedule: (deskSchedule) => set({ deskSchedule }),
      setDeskPractice: (deskPractice) => set({ deskPractice }),
      applyAccount: (patch) => set(patch),
    }),
    {
      name: "dmt-temple-v3",
      partialize: (state) => ({
        mode: state.mode,
        subscribed: state.subscribed,
        notices: state.notices,
        wallCursor: state.wallCursor,
        circleCursors: state.circleCursors,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<TempleState>;
        return {
          ...current,
          mode: saved.mode === "day" || saved.mode === "possessed" || saved.mode === "night" ? saved.mode : current.mode,
          subscribed: typeof saved.subscribed === "boolean" ? saved.subscribed : current.subscribed,
          notices: Array.isArray(saved.notices) ? saved.notices : current.notices,
          wallCursor: typeof saved.wallCursor === "string" ? saved.wallCursor : current.wallCursor,
          circleCursors: saved.circleCursors && typeof saved.circleCursors === "object" ? saved.circleCursors : current.circleCursors,
        };
      },
    },
  ),
);

export function leaveTemple() {
  useTemple.setState({
    path: "none",
    paid: false,
    role: "member",
    handle: "",
    flameName: "",
    bio: "",
    portrait: "",
    sigil: 1,
    awakening: [],
    read: [],
    classNotes: {},
    bookmarks: {},
    lastClass: "",
    deskPractice: {},
    offerings: [],
    journal: "",
    rites: [],
    nexusPosts: [],
  });
  try {
    window.localStorage.removeItem("dmt-temple-v2");
    window.localStorage.removeItem("dmt-temple-v3");
  } catch {
    /* private mode */
  }
}

export function canRead(codeLockedFor: readonly string[], path: PathId | "none") {
  if (codeLockedFor.length === 0) return true;
  if (path === "none" || path === "seeker") {
    return !codeLockedFor.includes("seeker");
  }
  return true;
}

export function displayHandle(handle: string, flameName: string) {
  const raw = handle.trim() || flameName.trim();
  if (!raw) return "SEEKER";
  return raw.replace(/\s+/g, "_").toUpperCase();
}

export function daysActive(joinedAt: string) {
  const start = new Date(joinedAt).getTime();
  if (!Number.isFinite(start)) return 1;
  return Math.max(1, Math.floor((Date.now() - start) / 86_400_000) + 1);
}

export function givenTotal(offerings: { amount: number }[]) {
  return offerings.reduce((n, o) => n + (Number(o.amount) || 0), 0);
}
