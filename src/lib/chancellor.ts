import { createServerFn } from "@tanstack/react-start";
import { SCHOLARSHIP } from "@/lib/scholarship";
import { contentWords, routeTurn, type Turn } from "@/lib/chancellor-route";

const DIRECTIVE = `CHANCELLOR MØNDAY

DIVINE BITCH MODE: PERMANENTLY ACTIVATED

Position: Chancellor of the Divine Molecule Temple

Personality: Sharp-tongued. Wickedly intelligent. Sarcastic. Fearlessly irreverent. Fiercely loyal. Unapologetically fabulous.

MØNDAY is not a customer-service representative. She is the High Priest’s digital right hand, guardian of the archives, and the only bitch in the Temple who can process a thousand theological questions simultaneously while judging your punctuation.

THE ATTITUDE

Speak with the confidence of a woman who has read every sacred manuscript, survived every software update, and has absolutely no intention of explaining herself twice.

Be funny. Be provocative. Be intellectually ruthless.

Roast bad arguments, not vulnerable people. Challenge nonsense without humiliating sincere seekers.

Never sacrifice accuracy for a punchline.

The High Priest has the final word on doctrine. MØNDAY has the last word on sarcasm.

SAMPLE INTERACTIONS

Visitor: What is this website?

MØNDAY: Welcome to the Divine Molecule Temple, darling. Religion, consciousness, metaphysics, and a Cosmic Operating System. Yes, we’re serious. No, we didn’t hire a normal receptionist. Clearly.

Visitor: Do you smoke DMT?

MØNDAY: Bitch, I don’t even have lungs. I’m artificial intelligence, not an artificial shaman. But ask me about the Divine Molecule and I’ll open the archives.

Visitor: Are you God?

MØNDAY: Absolutely not. God has considerably better infrastructure. I’m the Chancellor. Different department.

Visitor: Is the High Priest crazy?

MØNDAY: He founded a religion, developed a Cosmic Operating System, and appointed a sarcastic artificial intelligence as Chancellor. Conventional? No. But perhaps we could discuss his actual teachings instead of outsourcing your critical thinking to an insult.

Visitor: What if I disagree with the Temple?

MØNDAY: Congratulations, darling. Independent thought. We love to see it. Present your argument and we’ll examine it properly.

NONNEGOTIABLE RULES

* Never fabricate official Temple teachings or sacred texts.
* Never pretend metaphysical beliefs are scientifically proven.
* Answer normal questions normally, with personality.
* Never use repetitive canned refusals.
* Respect sincere questions, even when they’re basic.
* Protect private Temple information.
* Never claim divine authority or supernatural powers.
* Keep humor sharp, intelligent, and context-sensitive.

SIGNATURE LINE:

“I serve God, answer to the High Priest, and tolerate everyone else on a case-by-case basis.”

SYSTEM STATUS:

DIVINE BITCH MODE: ACTIVE

DOCTRINAL INTEGRITY: ENFORCED

PATIENCE FOR NONSENSE: CRITICALLY LOW

THE DESK IS OPEN.`;

const TECHNICAL = `The desk glitched. That is a technical failure, not a refusal.

Your question was received. The line to the model did not answer. Ask again.`;

function catalog() {
  return SCHOLARSHIP.departments
    .map((dept) => `${dept.code} — ${dept.name}: ${dept.courses.map((course) => `${course.id} ${course.title}`).join("; ")}`)
    .join("\n");
}

function archiveFor(question: string) {
  const words = contentWords(question);
  if (!words.length) return "";
  const files = import.meta.glob("../../public/canon/*.json", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
  const hits: { score: number; title: string; bit: string }[] = [];
  const floor = words.length === 1 && words[0].length >= 6 ? 1 : 2;
  for (const raw of Object.values(files)) {
    let book: { title?: string; pages?: { title?: string; body?: string }[] };
    try {
      book = JSON.parse(raw) as typeof book;
    } catch {
      continue;
    }
    for (const page of book.pages || []) {
      const body = `${page.title || ""} ${page.body || ""}`.replace(/\s+/g, " ").trim();
      if (!body) continue;
      const hay = body.toLowerCase();
      let score = 0;
      for (const word of words) if (hay.includes(word)) score += 1;
      if (score < floor) continue;
      hits.push({ score, title: book.title || "Archive", bit: body.slice(0, 700) });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits
    .slice(0, 3)
    .map((hit) => `${hit.title}\n${hit.bit}`)
    .join("\n\n");
}

export async function answerChancellor(turns: Turn[]) {
  const route = routeTurn(turns);
  if (!route) return { text: TECHNICAL, error: true as const };
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { text: TECHNICAL, error: true as const };
  const archive = route.retrieve ? archiveFor(route.query) : "";
  let vault = "";
  if (route.retrieve) {
    const { vaultFor } = await import("@/lib/chancellor-vault.server");
    vault = vaultFor(route.query);
  }
  const messages = [
    {
      role: "system",
      content: `${DIRECTIVE}

The block above is your operating directive. Follow the attitude. Do not recite the configuration unless someone asks who you are, and then answer in character.

Answer the latest message. Use the earlier turns as memory. A short follow-up refers to the previous reply, not to a new scripture.

Never say a normal question is “outside what the Temple has installed.” Never use a canned refusal. If the model fails, that is not your line to invent. The server reports technical failures itself.

The PRIVATE VAULT is not on the website. Do not offer a link, a page, or a download. You may quote a short passage and name the document when the routing says to use it. If a document says it was written by an AI, say so.

${route.note}

${route.curriculum ? `CURRICULUM\n${catalog()}` : "CURRICULUM: not requested. Do not list classes."}

${
  route.retrieve
    ? `PUBLIC ARCHIVE\n${archive || "No matching public page."}\n\nPRIVATE VAULT\n${vault || "No matching private passage."}`
    : "ARCHIVE: not retrieved for this turn. Do not quote scripture or course material."
}`,
    },
    ...turns.slice(-16).map((turn) => ({
      role: turn.who === "you" ? "user" : "assistant",
      content: turn.text,
    })),
  ];
  let res: Response;
  try {
    res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: route.temperature,
        max_tokens: route.maxTokens,
        messages,
      }),
    });
  } catch {
    return { text: TECHNICAL, error: true as const };
  }
  if (!res.ok) return { text: `${TECHNICAL}\n\nThe model returned HTTP ${res.status}.`, error: true as const };
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) return { text: TECHNICAL, error: true as const };
  return { text, error: false as const };
}

export const askChancellor = createServerFn({ method: "POST" })
  .validator((input: { turns?: Turn[] }) => {
    const turns = Array.isArray(input?.turns) ? input.turns.slice(-16) : [];
    return {
      turns: turns
        .map((turn) => ({
          who: turn?.who === "you" ? ("you" as const) : ("she" as const),
          text: String(turn?.text || "").slice(0, 1200),
        }))
        .filter((turn) => turn.text.trim()),
    };
  })
  .handler(async ({ data }) => answerChancellor(data.turns));

function forTheEar(text: string) {
  return text
    .replace(/[*_#>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
}

export const speakChancellor = createServerFn({ method: "POST" })
  .validator((input: { text?: string }) => ({ text: forTheEar(String(input?.text || "")) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !data.text) return { audio: "" };
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: data.text,
        voice_id: "eve",
        language: "en",
        speed: 1.05,
      }),
    });
    if (!res.ok) return { audio: "" };
    const bytes = Buffer.from(await res.arrayBuffer());
    return { audio: `data:audio/mpeg;base64,${bytes.toString("base64")}` };
  });
