const files = import.meta.glob("../chancellor-vault/*.json", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

type Book = { title: string; chunks: string[] };

let loaded: Book[] | null = null;

function books() {
  if (loaded) return loaded;
  loaded = Object.values(files).map((raw) => JSON.parse(raw) as Book);
  return loaded;
}

const STOP = new Set([
  "this",
  "that",
  "with",
  "from",
  "your",
  "have",
  "what",
  "when",
  "where",
  "which",
  "about",
  "into",
  "them",
  "they",
  "their",
  "there",
  "would",
  "could",
  "should",
  "does",
  "been",
  "being",
  "were",
  "will",
  "just",
  "only",
  "than",
  "then",
  "also",
  "some",
  "such",
]);

export function vaultFor(question: string) {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOP.has(word));
  if (!words.length) return "";
  const hits: { score: number; title: string; bit: string }[] = [];
  for (const book of books()) {
    const title = book.title.toLowerCase();
    for (const chunk of book.chunks) {
      const hay = chunk.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (hay.includes(word)) score += 1;
        if (title.includes(word)) score += 0.35;
      }
      if (score < 1) continue;
      hits.push({ score, title: book.title, bit: chunk.slice(0, 650) });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  const picked: typeof hits = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const key = `${hit.title}:${hit.bit.slice(0, 90)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(hit);
    if (picked.length === 4) break;
  }
  return picked.map((hit) => `${hit.title}\n${hit.bit}`).join("\n\n");
}
