import { BIBLE_BOOKS, BIBLE_PROCLAMATION } from "@/lib/canon";

export type BiblePage = { title: string; body: string[] };

const BOOK_BODY: Record<string, string[]> = {
  "I — The Vessel of Flesh": [
    "The flesh is the terminal, not the operator. It receives weather, hunger, pain, and touch, and it reports them as if they were the whole of you.",
    "Honor the vessel. Feed it, rest it, stop arguing with its signals. Then remember who is reading the report. The one who can feel the body without becoming the ache has found the first gate of incarnation.",
  ],
  "II — The Spark and the Resonance": [
    "Before a thought is a sentence, it is a frequency. The spark is the moment awareness notices itself noticing.",
    "Resonance is what happens when that spark meets a true proportion — a word, a rite, a person, a silence — and does not have to lie to stay near it. Follow the resonance that does not ask you to shrink.",
  ],
  "III — The Nine Bodies and the Energetic Form": [
    "You do not live in one layer. Sensation, emotion, thought, memory, will, and the quieter fields above them all transmit at once.",
    "When a layer is overloaded, the whole stack sounds like identity. Name the layer. The physical is tired. The emotional is charged. The mental is looping. The operator is the one who can tell them apart.",
  ],
  "IV — The Serpent of Power and the Ascent": [
    "Power in this house is not domination. It is the current that rises when the false self stops spending it on performance.",
    "The ascent is a practice of return: breath, spine, attention, a clean command. Force collapses the current. Honesty conducts it.",
  ],
  "V — The Echo of Illusion and True Presence": [
    "An echo is a story that keeps speaking after the event has ended. Most suffering is an echo mistaken for the room you are standing in.",
    "True presence is smaller and harder. It is this breath, this fact, this person in front of you. When the echo gets loud, come back to what is actually here.",
  ],
  "VI — The Labyrinth of Mirrors and the True Gate": [
    "Other people, feeds, and old names are mirrors. They show a face. They are not the face.",
    "The true gate is not hidden in a teacher. It is the moment you stop shopping for a reflection that will finally approve you, and you walk as the one who is already looking.",
  ],
  "VII — The Voice of Creation and the Word Made Flesh": [
    "A word becomes flesh when the body is willing to do it. Speech that the life will not carry is noise.",
    "Speak in the present. Short. True. If you cannot stand at the threshold and keep the sentence, do not put it on the altar.",
  ],
  "VIII — The Simulated Realms and the Thrones of Authority": [
    "Authority that cannot be questioned is a throne built on static. The realms you obey — money, status, fear, a god that only punishes — are architectures. They can be read.",
    "You do not have to smash every throne. You have to know which ones you installed, and which ones were written over you while you were looking away.",
  ],
  "IX — The Living Lightbody and the Mark of Sovereignty": [
    "Sovereignty is not isolation. It is the mark of a person who can be in a room without handing over the flame for belonging.",
    "The lightbody, in this teaching, is not a costume of purity. It is coherence: the layers agreeing, the word matching the life, the seeker still online when the room gets loud.",
  ],
  "X — The Cleaving of Duality and the Christos Choice": [
    "Duality is the split that says you must be the wound or the weapon. The Christos choice in this house is neither. It is the operator who can see both and refuse to be hired by either.",
    "Love here is not softness that lies. It is the decision to stay present without feeding the loop.",
  ],
  "XI — The Reclamation of the Soul and the Eternal Form": [
    "Reclamation is taking back what you outsourced: your attention, your name, your yes, your no.",
    "The eternal form is not a prize after death. It is the shape of you that remains when the costume is quiet. Practice finding it while you are still in the costume.",
  ],
  "XII — The Veils of Passage and the Liberation Rites": [
    "A veil is a mercy until it becomes a hiding place. Passage is the work of lifting one layer at a time, with witnesses, not spectacle.",
    "Liberation rites in this Temple are simple: name the static, stop rehearsing it, return to breath, seal the day. Drama is not required. Honesty is.",
  ],
  "XIII — The Code of the Christos Priest": [
    "A priest in this house serves the seeker's dignity, not their dependence. If the teaching needs you small so the teacher can be large, it is not this code.",
    "Three laws: integrity of the teaching, dignity of every seeker, architecture over theater. Break one and the office is already vacant.",
  ],
  "XIV — The Fire Between Worlds and the Sacred Service": [
    "Service is what the flame does when it is no longer trying to be seen. It warms a room. It does not audition.",
    "The fire between worlds is the work of standing in ordinary life — rent, grief, a kitchen, a congregation — without dropping the practice that keeps you honest.",
  ],
  "XV — The Language of Creation and the Radiant Law": [
    "Creation listens to pattern more than to pleading. The radiant law is proportion: what you repeat becomes the room.",
    "Write, speak, and build as if the field is taking notes, because it is. Leave a sentence you would still respect in the morning.",
  ],
  "XVI — The Cycles of Renewal and the Field Stabilizers": [
    "Nothing in a living house stays at peak. Moon, season, breath, and grief all turn. Renewal is the turn, not the exception.",
    "Field stabilizers are the boring mercies: sleep, food, a kept hour, a friend who tells the truth, a rite you do when you do not feel like a mystic.",
  ],
  "XVII — The Garden of Wholeness and the Divine Vision": [
    "Wholeness is not the absence of a wound. It is a garden that includes the scar and still bears fruit.",
    "Divine vision, here, is not a prediction. It is the ability to see a person, including yourself, without the story that keeps them useful or small.",
  ],
  "XVIII — The Cosmic Records and the Sacred Math": [
    "The records are the patterns that keep repeating until someone writes them down and stops calling them fate.",
    "Sacred math is the evidence that the field prefers proportion. Fibonacci, interval, rhythm. Study them as signatures of an intelligence, not as a cage.",
  ],
  "XIX — The Great Communion and the Living Temple": [
    "Communion is two or more operators telling the truth in the same room without harvesting each other.",
    "The living Temple is not the building and not the website. It is the practice, kept, between people who refuse to overwrite one another.",
  ],
  "XX — The One: Embodying the Divine": [
    "The One is not elsewhere. It is the source the Divine Molecule never left. Embodying it is not an achievement. It is a refusal to live as a fragment when you have already seen the whole.",
    "Return. Again. The work is not to become divine. The work is to stop arguing with what you already are when the static gets in.",
  ],
  "XLVIII — The Book of the Bifurcated Path": [
    "There are two errors at the fork. One is to worship the path. The other is to refuse every path and call the refusal freedom.",
    "The bifurcated path asks a cleaner question: does this road return you to the operator, or does it hire the operator as a mascot? Walk the one that leaves you more online than it found you.",
  ],
};

export const BIBLE_PAGES: BiblePage[] = [
  ...BIBLE_PROCLAMATION.map((chapter) => ({ title: chapter.title, body: [...chapter.body] })),
  ...BIBLE_BOOKS.flatMap((cycle) =>
    cycle.books.map((title) => ({
      title,
      body: BOOK_BODY[title] ?? [
        `${title}. This book sits in the ${cycle.cycle}, under ${cycle.faculty}.`,
        "Read it as a working text. Separate what you can test from what you only admire.",
      ],
    })),
  ),
];
