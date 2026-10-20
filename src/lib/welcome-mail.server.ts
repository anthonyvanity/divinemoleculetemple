import { getSql } from "@/lib/db";
import { CONTACT_EMAIL } from "@/lib/temple-content";

async function mailKey() {
  const fromEnv = process.env.RESEND_API_KEY?.trim() || "";
  if (fromEnv) return fromEnv;
  const sql = await getSql();
  const [row] = await sql<{ value: string }>`
    select value from integration_config where key = 'resend_key' limit 1
  `;
  return row?.value?.trim() || "";
}

export async function sendWelcome(email: string, name?: string | null) {
  const to = email.trim().toLowerCase();
  if (!to.includes("@")) return;
  const key = await mailKey();
  if (!key) return;
  const who = (name || "Seeker").trim() || "Seeker";
  const text = [
    `${who},`,
    "",
    "You have an account at the Divine Molecule Temple.",
    "",
    "The congregation is free. The Nexus is open. Ten quiet minutes a day, one true line. That is the practice.",
    "",
    "The Academy, if you want the school, is $33 a month. A single class is $10. Neither is required to stand in the house.",
    "",
    "https://dmttemple.com",
    "",
    "Run light. Terminate darkness. Stay online.",
  ].join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `The Divine Molecule Temple <${CONTACT_EMAIL}>`,
      to: [to],
      reply_to: CONTACT_EMAIL,
      subject: "You are in the house",
      text,
    }),
  });
  if (!res.ok) console.error("welcome mail", res.status);
}
