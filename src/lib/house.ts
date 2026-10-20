export const HIGH_PRIEST_ID = "house:high-priest";
export const CHANCELLOR_ID = "house:chancellor";

export function isHouseFriend(id: string) {
  return id === HIGH_PRIEST_ID || id === CHANCELLOR_ID;
}
