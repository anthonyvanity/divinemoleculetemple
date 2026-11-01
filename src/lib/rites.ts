export type RiteStep = { n: string; title: string; body: string };

export type TempleRite = {
  id: string;
  title: string;
  kicker: string;
  when: string;
  minutes: string;
  purpose: string;
  preparation?: string;
  steps: RiteStep[];
  closing?: string;
  intention?: string;
  related?: { label: string; href: string };
  /** Key stored on today's practice record. */
  key: string;
  /** Full authorized text is installed. */
  installed: boolean;
  note?: string;
};

export const RITES: TempleRite[] = [
  {
    id: "morning-seal",
    title: "Morning Seal",
    kicker: "Initialize your day.",
    when: "After waking or before work",
    minutes: "Approximately 5 minutes",
    purpose: "Begin the day with prayer, attention, gratitude, and a conscious commitment to how you will act.",
    preparation: "Find a quiet moment. Sit or stand comfortably. Silence unnecessary distractions.",
    key: "morning",
    installed: true,
    intention: "What is one thing you intend to do well today?",
    steps: [
      {
        n: "01",
        title: "Arrive",
        body: "Place your feet firmly on the ground.\n\nTake three slow, comfortable breaths.",
      },
      {
        n: "02",
        title: "Invoke",
        body: `God, Source of all light and life,

I enter this day with gratitude.

Let my thoughts be clear, my words be deliberate, and my actions reflect the highest good I am capable of serving.

Where there is confusion, grant me discernment.

Where there is fear, grant me courage.

Where there is conflict, grant me patience.

May I remain faithful to truth, compassionate toward others, and sovereign in my choices.

Let no circumstance persuade me to surrender my conscience.

Let my work be honorable, my presence purposeful, and my spirit awake.

In God’s light, I begin.

Amen.`,
      },
      {
        n: "03",
        title: "Declare",
        body: "RUN LIGHT. TERMINATE DARKNESS. STAY ONLINE.",
      },
      {
        n: "04",
        title: "Set your intention",
        body: "What is one thing you intend to do well today?",
      },
    ],
  },
  {
    id: "daily-protection",
    title: "Daily Protection",
    kicker: "Stand in your sovereignty.",
    when: "Before challenging activities, or when seeking spiritual focus",
    minutes: "Approximately 5 minutes",
    purpose: "A prayer for clarity, courage, spiritual resilience, and protection.",
    preparation: "Stand or sit comfortably.",
    key: "protection",
    installed: true,
    steps: [
      {
        n: "01",
        title: "Invocation",
        body: `God of eternal light,

Surround this moment with Your peace.

Guide my judgment. Strengthen my resolve. Help me recognize what deserves my attention and what I may release.

May fear not govern my decisions.

May anger not govern my words.

May confusion not govern my understanding.

I affirm the dignity of my mind, the integrity of my body, and the freedom of my conscience.

I welcome wisdom, compassion, and truth.

I release what does not serve the life I am called to build.

Let my home be a place of peace, my work a place of purpose, and my relationships guided by mutual respect.

Through God, I seek clarity and strength.

Amen.`,
      },
    ],
    closing: "MY WILL IS MY OWN. MY CONSCIENCE IS MY COMPASS. MY LIGHT REMAINS.",
  },
  {
    id: "evening-closure",
    title: "Evening Closure",
    kicker: "Close the day. Return to peace.",
    when: "Before bed",
    minutes: "Approximately 5–7 minutes",
    purpose: "Review the day, acknowledge what happened, and prepare for rest.",
    key: "evening",
    installed: true,
    intention: "What did I learn today? What am I grateful for? What can wait until tomorrow?",
    steps: [
      {
        n: "01",
        title: "Reflect",
        body: "What did I learn today?\n\nWhat am I grateful for?\n\nWhat can wait until tomorrow?",
      },
      {
        n: "02",
        title: "Release",
        body: `God,

Thank You for carrying me through this day.

I acknowledge what I accomplished and what remains unfinished.

I release the arguments I cannot resolve tonight, the expectations I cannot fulfill tonight, and the burdens that do not need to accompany me into sleep.

Where I have caused harm, guide me toward accountability.

Where I have been hurt, help me find peace without abandoning my boundaries.

Let this home be quiet.

Let my mind rest.

Let tomorrow arrive in its own time.

I close this day in gratitude and entrust the night to Your care.

Amen.`,
      },
      {
        n: "03",
        title: "Close",
        body: "DAY COMPLETE. REST AUTHORIZED.",
      },
    ],
  },
  {
    id: "sovereign-reclamation",
    title: "Sovereign Reclamation",
    kicker: "Reclaim your authority.",
    when: "When a pattern, a promise, or a fear is still speaking for you",
    minutes: "As long as the reading takes",
    purpose: "An invocation of conscience, spiritual dignity, personal responsibility, and freedom.",
    key: "sovereign",
    installed: true,
    related: { label: "Read the Cosmic Operating System", href: "/read/cos-original" },
    steps: [
      {
        n: "01",
        title: "The rite",
        body: `In the presence of God, I stand as myself.

I reclaim responsibility for my choices, my words, my boundaries, and the direction of my life.

I release promises made from fear, expectations accepted without discernment, and patterns I no longer choose to repeat.

I do not surrender my judgment to intimidation.

I do not confuse suffering with destiny.

I do not confuse obedience with wisdom.

I ask for the courage to recognize truth, the humility to correct my errors, and the strength to act with integrity.

What belongs to my responsibility, I accept.

What belongs to another, I release.

What is beyond my control, I entrust to God.

My conscience remains my own.

My path remains open.

My light remains.`,
      },
    ],
    closing: "AUTHORITY RECLAIMED.",
  },
];

export const UNINSTALLED = [
  {
    id: "kabbalistic-cross",
    title: "Kabbalistic Cross",
    line: "A ceremonial practice of alignment and sacred orientation.",
  },
  {
    id: "lbrp",
    title: "Lesser Banishing Ritual of the Pentagram",
    line: "A structured ceremonial practice from the Western esoteric tradition.",
  },
  {
    id: "michael",
    title: "Saint Michael Invocation",
    line: "Named in the archive. The authorized text is not installed.",
  },
  {
    id: "benedict",
    title: "Saint Benedict Prayer",
    line: "Named in the archive. The authorized text is not installed.",
  },
];

export function riteById(id: string) {
  return RITES.find((rite) => rite.id === id) ?? null;
}

export function riteIcs(rite: TempleRite, start: string) {
  const [h, m] = start.split(":").map((n) => Number(n) || 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const begin = `20260101T${pad(h)}${pad(m)}00`;
  const endMin = h * 60 + m + 7;
  const end = `20260101T${pad(Math.floor(endMin / 60) % 24)}${pad(endMin % 60)}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Divine Molecule Temple//Rite//EN",
    "BEGIN:VEVENT",
    `UID:${rite.id}@divinemoleculetemple.com`,
    `DTSTART:${begin}`,
    `DTEND:${end}`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${rite.title}`,
    `DESCRIPTION:${rite.purpose}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
