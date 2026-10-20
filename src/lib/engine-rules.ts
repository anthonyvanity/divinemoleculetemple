/** Pure rules for the archive and the sequences. No database. No doctrine. */

export const TIER_RANK: Record<string, number> = {
  public: 0,
  seeker: 1,
  initiate: 2,
  patron: 2,
  priestline: 3,
};

export type Viewer = {
  signedIn: boolean;
  paid: boolean;
  role: string;
};

export function viewerRank(viewer: Viewer) {
  if (viewer.role === "chancellor") return 5;
  if (viewer.role === "priestline") return 3;
  if (viewer.paid || viewer.role === "initiate" || viewer.role === "patron") return 2;
  if (viewer.signedIn) return 1;
  return 0;
}

export function tierAllows(tier: string, viewer: Viewer) {
  const need = TIER_RANK[tier] ?? TIER_RANK.initiate;
  return viewerRank(viewer) >= need;
}

export function withUnlock<T extends { stepNumber: number }>(steps: T[], completed: Set<number>) {
  const ordered = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  let open = true;
  return ordered.map((step) => {
    const done = completed.has(step.stepNumber);
    const unlocked = open;
    if (!done) open = false;
    return { ...step, completed: done, unlocked };
  });
}

/** Step 1 is open. Step N opens only after N-1 is sealed. A sealed step cannot be sealed again. */
export function canComplete(stepNumber: number, completed: Set<number>) {
  if (completed.has(stepNumber)) return false;
  if (stepNumber <= 1) return true;
  return completed.has(stepNumber - 1);
}

export function archiveSlug(label: string) {
  const slug = label
    .replace(/^\//, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("The slug needs letters or numbers");
  return slug;
}

export function assertOwner(actorId: string, ownerId: string) {
  if (!actorId || actorId !== ownerId) throw new Error("Not yours");
}
