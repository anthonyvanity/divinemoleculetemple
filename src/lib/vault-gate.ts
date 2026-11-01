export function vaultRank(role: string, tier: string, scholarship: boolean) {
  if (role === "chancellor" || role === "priestline" || tier === "priestline") return 5;
  if (tier === "patron" || role === "patron") return 3;
  if (scholarship || tier === "initiate" || role === "initiate") return 2;
  if (tier === "seeker" || role === "member" || role === "elder") return 1;
  return 0;
}

export function vaultAllowed(gate: string, rank: number) {
  if (gate === "public") return true;
  if (gate === "seeker") return rank >= 1;
  if (gate === "initiate") return rank >= 2;
  if (gate === "patron") return rank >= 3;
  if (gate === "priestline") return rank >= 5;
  return false;
}

const HOUSE_HOSTS = new Set([
  "divinemoleculetemple.com",
  "www.divinemoleculetemple.com",
  "dmttemple.com",
  "www.dmttemple.com",
]);

/** OAuth is registered on this host. Custom domains must start Google here. */
export const CANONICAL_AUTH_ORIGIN = "https://divinemoleculetemple.grok.me";

/** Absolute https URL on a Temple domain, or null. */
export function houseReturnUrl(raw: string | null): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!HOUSE_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return null;
    return url;
  } catch {
    return null;
  }
}

export function sameHouseHost(hostname: string) {
  return HOUSE_HOSTS.has(hostname.toLowerCase());
}
