export type Turn = { who: "she" | "you"; text: string };

export type RouteKind = "greeting" | "followup" | "curriculum" | "doctrine" | "chat";

export type ChancellorRoute = {
  kind: RouteKind;
  retrieve: boolean;
  curriculum: boolean;
  query: string;
  note: string;
  temperature: number;
  maxTokens: number;
};

const STOP = new Set([
  "this", "that", "with", "from", "your", "have", "what", "when", "where", "which", "about",
  "into", "them", "they", "their", "there", "would", "could", "should", "does", "been",
  "being", "were", "will", "just", "only", "than", "then", "also", "some", "such", "tell",
  "know", "mean", "like", "want", "need", "please", "really", "something", "anything",
]);

const GREETING =
  /^(hi|hello|hey|hiya|yo|sup|howdy|hola|good\s+(morning|afternoon|evening|night)|what'?s\s+up|whats\s+up)[!.?\s]*$/i;

const FOLLOWUP =
  /^(what|why|how|huh|wait|explain|and|more|continue|go on|say again|again|simpler|clarify|pardon|excuse me|come again|what do you mean|i don'?t (get|understand)( it| that)?|wdym|say that again|in english|simpler please)[?.!\s]*$/i;

const ABOUT_HER =
  /\b(who are you|what are you|your name|this place|this website|this site|what is this|what's this|whats this|do you smoke|are you god|are you (a )?human|are you real|can you talk)\b/i;

const CURRICULUM =
  /\b(class|classes|course|courses|syllabus|curriculum|academy|enroll|enrol|elective|bachelor|masters|master's|doctorate|lesson|fm-\d+)\b/i;

const DOCTRINE =
  /\b(divinism|temple|molecule|dmt|sacrament|flame|parasite|avatar|simulation|cosmic|operating system|\bcos\b|source code|rite|ritual|priest|seeker|initiate|grid|monday|mønday|chancellor|doctrine|archive|sigil|entity|implant|sovereignty|source)\b/i;

export function contentWords(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOP.has(word));
}

function previousShe(turns: Turn[], before: number) {
  for (let i = before - 1; i >= 0; i -= 1) {
    if (turns[i]?.who === "she" && turns[i].text.trim()) return turns[i].text.trim();
  }
  return "";
}

export function routeTurn(turns: Turn[]): ChancellorRoute | null {
  let lastIndex = -1;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    if (turns[i]?.who === "you" && turns[i].text.trim()) {
      lastIndex = i;
      break;
    }
  }
  if (lastIndex < 0) return null;
  const text = turns[lastIndex].text.trim().replace(/\s+/g, " ");

  if (GREETING.test(text)) {
    return {
      kind: "greeting",
      retrieve: false,
      curriculum: false,
      query: "",
      temperature: 0.7,
      maxTokens: 120,
      note: `ROUTING: The visitor only greeted you. Answer with a short witty greeting and then stop. Do not explain the Temple, the COS, a class, or a teaching. Do not quote an archive. Two sentences at most. A correct greeting is: “Well, look who wandered into the Chancellery. Welcome, darling. I’m MØNDAY. What can I do for you?”`,
    };
  }

  if (text.length <= 48 && FOLLOWUP.test(text)) {
    const prior = previousShe(turns, lastIndex).slice(0, 1500);
    return {
      kind: "followup",
      retrieve: false,
      curriculum: false,
      query: "",
      temperature: 0.6,
      maxTokens: 220,
      note: `ROUTING: The visitor’s latest line is a short follow-up. It refers to YOUR immediately previous message, not to a new subject. Restate that message in simpler language. Do not open a lecture, a course, or an unrelated archive page. Do not say the question is outside the Temple, unsupported, or not installed.

YOUR PREVIOUS MESSAGE:
${prior || "You have not said anything yet. Ask what they want clarified."}`,
    };
  }

  const curriculum = CURRICULUM.test(text);
  const aboutHer = ABOUT_HER.test(text);
  const doctrine = DOCTRINE.test(text) && !aboutHer;

  if (aboutHer && !curriculum) {
    return {
      kind: "chat",
      retrieve: false,
      curriculum: false,
      query: "",
      temperature: 0.75,
      maxTokens: 220,
      note: `ROUTING: Ordinary conversation. Answer in character and briefly. Do not recite a lecture, a course list, or an archive passage. If they asked what this place is, say it is the Divine Molecule Temple: a religion of consciousness, metaphysics, and a Cosmic Operating System. Two or three sentences. If they asked whether you smoke DMT, you are software and you do not have lungs. You may add that you can talk about the Divine Molecule if they want. A correct reply sounds like: “Darling, I’m software. I don’t even have lungs. But I know a thing or two about the Divine Molecule.”`,
    };
  }

  if (curriculum) {
    return {
      kind: "curriculum",
      retrieve: doctrine,
      curriculum: true,
      query: text,
      temperature: 0.55,
      maxTokens: 360,
      note: `ROUTING: They asked about classes or the Academy. Use the CURRICULUM list. Name a real code and title. Do not invent a class. Do not paste the whole catalog.`,
    };
  }

  if (doctrine) {
    return {
      kind: "doctrine",
      retrieve: true,
      curriculum: false,
      query: text,
      temperature: 0.55,
      maxTokens: 420,
      note: `ROUTING: This question asks for Temple teaching. Use the ARCHIVE and PRIVATE VAULT below only where they actually match. Name the source. If they do not contain the answer, say the page is not in front of you. Do not invent scripture. Say clearly when something is Temple doctrine rather than a scientific finding. Do not dump an unrelated passage.`,
    };
  }

  return {
    kind: "chat",
    retrieve: false,
    curriculum: false,
    query: "",
    temperature: 0.8,
    maxTokens: 220,
    note: `ROUTING: Ordinary conversation. Answer the words they actually typed. Do not pivot into a COS lecture, a class, or an archive quotation. Do not claim their question is outside an installed curriculum.`,
  };
}
