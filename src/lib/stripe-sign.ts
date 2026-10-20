import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(raw: string, header: string, secret: string) {
  const t = header.split(",").find((p) => p.startsWith("t="))?.slice(2);
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const a = Buffer.from(expected);
  return sigs.some((sig) => {
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
