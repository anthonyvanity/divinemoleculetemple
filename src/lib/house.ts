export const HIGH_PRIEST_ID = "house:high-priest";
export const CHANCELLOR_ID = "house:chancellor";

export type TempleRank = "" | "high-priest" | "chancellor" | "priest";

export function isHouseFriend(id: string) {
  return id === HIGH_PRIEST_ID || id === CHANCELLOR_ID;
}

export function templeRank(userId: string, role = "", tier = "", handle = ""): TempleRank {
  const key = handle.replace(/[^a-z]/gi, "").toLowerCase();
  if (userId === CHANCELLOR_ID || key === "chancellormonday") return "chancellor";
  if (userId === HIGH_PRIEST_ID || key === "highpriest" || key === "anthonyvanity" || role === "high_priest" || role === "chancellor") {
    return "high-priest";
  }
  if (role === "priest" || role === "priestline" || tier === "priestline" || tier === "elder") return "priest";
  return "";
}

export function rankLabel(rank: TempleRank) {
  if (rank === "high-priest") return "High Priest";
  if (rank === "chancellor") return "Chancellor";
  if (rank === "priest") return "Priest";
  return "";
}
