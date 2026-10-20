export type ScrollGate = "seeker" | "initiate" | "priestline";

export type Scroll = {
  key: string;
  title: string;
  gate: ScrollGate;
  /** Days after the gate opens. 0 is immediate. */
  day: number;
  category: string;
};

/** Release map from the Temple automation transcript. Files stay in the vault until uploaded. */
export const SCROLLS: Scroll[] = [
  { key: "welcome", title: "Welcome, Seeker", gate: "seeker", day: 0, category: "Seeker path" },
  { key: "glossary", title: "A Seeker's Glossary", gate: "seeker", day: 0, category: "Seeker path" },
  { key: "primer", title: "Beginner's Primer to the Grand Simulation", gate: "seeker", day: 1, category: "Seeker path" },
  { key: "molecule", title: "Introduction to the Divine Molecule, Christos Blueprint, and Black Flame", gate: "seeker", day: 3, category: "Seeker path" },
  { key: "field-seal", title: "Field Seal. Ascend into the Scholarship.", gate: "seeker", day: 7, category: "Seeker path" },
  { key: "scholarship", title: "Scholarship of the Enlightened", gate: "initiate", day: 0, category: "Scholarship" },
  { key: "briefing", title: "Briefing. The Cosmic Operating System and the Path to Sovereignty", gate: "initiate", day: 2, category: "Scholarship" },
  { key: "priest-book", title: "The Book of the Priest", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "protocols", title: "Priesthood Protocols", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "field-ops", title: "Field Operations Manual", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "codex", title: "Divinarch Master's Codex. 500-Level Exorcism", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "exorcism", title: "Exorcism Engineering", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "ms-catalog", title: "M.S. in Exorcism Engineering", gate: "priestline", day: 0, category: "Priesthood canon" },
  { key: "priesthood-canon", title: "The Cosmic Operating System Priesthood Canon", gate: "priestline", day: 0, category: "Priesthood canon" },
];

const RANK: Record<string, number> = {
  visitor: 0,
  seeker: 1,
  initiate: 2,
  patron: 2,
  priestline: 3,
  chancellor: 5,
};

export function scrollUnlocked(
  scroll: Scroll,
  access: { signedIn: boolean; paid: boolean; role: string; day: number },
) {
  if (scroll.gate === "priestline") return access.role === "chancellor";
  if (!access.signedIn) return false;
  if (scroll.gate === "initiate") return access.paid || RANK[access.role] >= 2;
  return access.day - 1 >= scroll.day || access.paid;
}

export function nextScroll(access: { signedIn: boolean; paid: boolean; role: string; day: number }) {
  return SCROLLS.find((scroll) => !scrollUnlocked(scroll, access)) ?? null;
}
