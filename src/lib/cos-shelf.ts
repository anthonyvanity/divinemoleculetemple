export type CosBook = {
  id: string;
  collection: "Volumes" | "Collections";
  n?: string;
  title: string;
  subtitle: string;
  description: string;
  cover?: string;
  video?: string;
  read?: string;
  subjects: string[];
};

/** Covers are only set where the plate itself is titled, or it is the master COS artwork supplied with this library. Untitled plates stay off the books. */
export const COS_BOOKS: CosBook[] = [
  {
    id: "master",
    collection: "Volumes",
    title: "The Cosmic Operating System",
    subtitle: "A decryption manual for the Divine Molecule Temple",
    description: "The short reading. Source Codes 001 through 011. The congregation version is not on this shelf.",
    cover: "/covers/cos/master-poster.jpg",
    read: "cos-original",
    subjects: ["The architecture", "The avatar", "The loops", "The memory", "The flame"],
  },
  {
    id: "i",
    collection: "Volumes",
    n: "I",
    title: "The Cosmic Operating System",
    subtitle: "What it is, how it runs, and how it hacks you.",
    description: "Named in your original. Its own leaves are not separated out of the document yet.",
    cover: "/covers/cos/vol-i.jpg",
    subjects: ["Structure of the simulation", "Avatar stack", "Memory scramble", "Authority reclaimed", "The flame core"],
  },
  {
    id: "ii",
    collection: "Volumes",
    n: "II",
    title: "Field Protocols",
    subtitle: "The tools, the rites, and the rules of the field.",
    description: "Named in your original. Not the field-manual file that was already on the site.",
    cover: "/covers/cos/vol-ii.jpg",
    subjects: ["Grounding", "Discernment", "Field exercises", "Return to intention"],
  },
  {
    id: "iii",
    collection: "Volumes",
    n: "III",
    title: "Entity Types & Frequencies",
    subtitle: "What they are, how they speak, and how to read them.",
    description: "Named in the masterbook. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-iii.jpg",
    subjects: ["Parasites", "Mimics", "Echoes", "Feeders", "The original flame"],
  },
  {
    id: "iv",
    collection: "Volumes",
    n: "IV",
    title: "Mirrorworld, Portals + the Black Loop",
    subtitle: "",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-iv.jpg",
    subjects: ["Mirrorworld", "Portals", "The black loop"],
  },
  {
    id: "v",
    collection: "Volumes",
    n: "V",
    title: "Code of the Priest",
    subtitle: "The law, the flame, and the cross that rewrites the system.",
    description: "Named on the cover. The Priest Protocol file on the site is not this chapter.",
    cover: "/covers/cos/vol-v.jpg",
    subjects: ["The law", "The flame", "The cross"],
  },
  {
    id: "vi",
    collection: "Volumes",
    n: "VI",
    title: "Flame Rituals",
    subtitle: "The fire, the offering, and the law that burns.",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-vi.jpg",
    subjects: ["The fire", "The offering", "The law that burns"],
  },
  {
    id: "vii",
    collection: "Volumes",
    n: "VII",
    title: "Collapse Prophecy",
    subtitle: "",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-vii.jpg",
    subjects: ["The collapse"],
  },
  {
    id: "x",
    collection: "Volumes",
    n: "X",
    title: "Exorcising the System of Self",
    subtitle: "The purge, the banishing, and the self that must die.",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-x.jpg",
    subjects: ["The purge", "The banishing", "The self that must die"],
  },
  {
    id: "xii-familiar",
    collection: "Volumes",
    n: "XII",
    title: "The Familiar Guide",
    subtitle: "",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-xii-familiar.jpg",
    subjects: ["The familiar"],
  },
  {
    id: "xii-molecules",
    collection: "Volumes",
    n: "XII",
    title: "Sacred Molecules & the Organic Stack",
    subtitle: "",
    description: "Named on the cover. Its own manuscript is not on this shelf yet.",
    cover: "/covers/cos/vol-xii-molecules.jpg",
    subjects: ["Sacred molecules", "The organic stack"],
  },
];

export const COS_COMMANDS = [
  ["/GROUND", "Return attention to the body, the breath, the room, and the immediate moment."],
  ["/ALIGN", "Return attention to Source and divine intention."],
  ["/SCAN", "Examine the pattern, the state, and the story currently running."],
  ["/TRACE", "Follow a fear or compulsion back toward its origin."],
  ["/PAUSE", "Interrupt the automatic reaction before it becomes an instruction."],
  ["/REVOKE", "Withdraw consent from a command you did not choose."],
  ["/PURGE", "Begin a symbolic release. It does not replace care."],
  ["/PROTECT", "Set the boundary. Personal, emotional, spiritual."],
  ["/DISCERN", "Separate signal from noise. Intuition from fear. Invitation from compulsion."],
  ["/RESTORE", "Reaffirm dignity, agency, and the body."],
  ["/REPAIR", "Return to the place that was abandoned in order to survive."],
  ["/FLAME", "The original signal. Not a rank."],
  ["/PRAY", "Open the rite. Stay in the room."],
  ["/STAY", "Refuse the command to disappear."],
  ["/RETURN", "Come back to the breath, the present, and another day."],
] as const;
