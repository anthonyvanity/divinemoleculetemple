export type Tone = "lime" | "orange" | "cyan" | "ink" | "pink" | "lilac" | "canary";
export type PathId = "seeker" | "initiate" | "patron" | "priestline" | "elder";

export const LATIN = "Ex Deo et Spiritu";
export const LATIN_FULL = "Ex Deo et Spiritu: Molecula Æterna";
export const TEMPLE_NAME = "The Divine Molecule Temple";
export const ACADEMY_LINE = "Digital sanctuary and modern divinity academy for consciousness studies";
export const CONTACT_EMAIL = "contact@dmttemple.com";
export const CONTACT_PHONE = "(323) 990-2595";
export const CASH_TAG = "DMTTEMPLE";
export const CASH_APP_URL = "https://cash.app/$DMTTEMPLE";
export const TIERS = [
	"seeker",
	"initiate",
	"patron",
	"priestline",
	"elder"
];
export const BLAST_TO = [
	{
		id: "flame",
		label: "Follow the flame"
	},
	{
		id: "seeker",
		label: "Seeker"
	},
	{
		id: "initiate",
		label: "Initiate"
	},
	{
		id: "priestline",
		label: "Priestline"
	},
	{
		id: "guides",
		label: "Guides"
	},
	{
		id: "office",
		label: "Office of the High Priest"
	},
	{
		id: "investors",
		label: "Investors"
	},
	{
		id: "grants",
		label: "Grants"
	},
	{
		id: "all",
		label: "All"
	}
];
export const DRIP = [
	{
		key: "seeker_day_0",
		day: 0,
		tier: "seeker",
		subject: "Welcome, seeker",
		body: "The glossary is the first scroll. The house has your name."
	},
	{
		key: "seeker_day_1",
		day: 1,
		tier: "seeker",
		subject: "The primer",
		body: "The beginner's primer to the grand simulation is open."
	},
	{
		key: "seeker_day_3",
		day: 3,
		tier: "seeker",
		subject: "The divine molecule",
		body: "The Christos blueprint and the black flame. Read it once. Then sit with it."
	},
	{
		key: "seeker_day_7",
		day: 7,
		tier: "seeker",
		subject: "The field seal",
		body: "Seven days. The Initiate gate is the paid door. The scholarship waits there."
	},
	{
		key: "initiate_day_0",
		day: 0,
		tier: "initiate",
		subject: "The scholarship is open",
		body: "The payment is confirmed. The Scholarship of the Enlightened is yours."
	},
	{
		key: "initiate_day_7",
		day: 7,
		tier: "initiate",
		subject: "The briefing",
		body: "The Cosmic Operating System and the path to sovereignty."
	}
];
export function cashAppAmountUrl(amount: number) {
	return `https://cash.app/$DMTTEMPLE/${amount}`;
}
export const NAV = [
	{
		to: "/sanctuary",
		label: "Temple",
		icon: "Eye"
	},
	{
		to: "/academy",
		label: "Academy",
		icon: "GraduationCap"
	},
	{
		to: "/classes",
		label: "Classes",
		icon: "Sparkles"
	},
	{
		to: "/nexus",
		label: "Nexus",
		icon: "Share2"
	},
	{
		to: "/transmissions",
		label: "Transmissions",
		icon: "Radio"
	},
	{
		to: "/library",
		label: "Library",
		icon: "Library"
	},
	{
		to: "/cos",
		label: "COS",
		icon: "Atom"
	},
	{
		to: "/shop",
		label: "Shop",
		icon: "ShoppingBag"
	}
];
export const FOOTER = {
	temple: [
		{
			to: "/sanctuary",
			label: "The Temple"
		},
		{
			to: "/divinism",
			label: "Divinism"
		},
		{
			to: "/library",
			label: "Sacred Library"
		},
		{
			to: "/cos",
			label: "Cosmic OS"
		},
		{
			to: "/archives",
			label: "Archives"
		},
		{
			to: "/ceremonies",
			label: "Rites"
		}
	],
	academy: [
		{
			to: "/academy",
			label: "Academy"
		},
		{
			to: "/classes",
			label: "Classes"
		},
		{
			to: "/study",
			label: "Study"
		},
		{
			to: "/gates",
			label: "Initiation"
		},
		{
			to: "/awakening",
			label: "Awakening"
		},
		{
			to: "/academy",
			label: "Scholarship"
		}
	],
	nexus: [
		{
			to: "/nexus",
			label: "Nexus"
		},
		{
			to: "/nexus",
			label: "Community"
		},
		{
			to: "/nexus",
			label: "Forums"
		}
	],
	support: [
		{
			to: "/gates",
			label: "Gates"
		},
		{
			to: "/shop",
			label: "Shop"
		},
		{
			to: "/altar",
			label: "Give"
		},
		{
			to: "/contact",
			label: "Contact"
		}
	]
};
export const STRIP = [
	{
		id: "temple",
		title: "Temple",
		icon: "Eye",
		to: "/sanctuary"
	},
	{
		id: "divinism",
		title: "Divine",
		icon: "Flame",
		to: "/divinism"
	},
	{
		id: "ceremonies",
		title: "Rites",
		icon: "Moon",
		to: "/ceremonies"
	},
	{
		id: "classes",
		title: "Classes",
		icon: "Sparkles",
		to: "/classes"
	},
	{
		id: "academy",
		title: "Academy",
		icon: "GraduationCap",
		to: "/academy"
	},
	{
		id: "library",
		title: "Books",
		icon: "Library",
		to: "/library"
	},
	{
		id: "cos",
		title: "COS",
		icon: "Atom",
		to: "/cos"
	},
	{
		id: "nexus",
		title: "Nexus",
		icon: "Share2",
		to: "/nexus"
	},
	{
		id: "shop",
		title: "Shop",
		icon: "ShoppingBag",
		to: "/shop"
	}
];
export const MISSION_LINKS = [
	{
		to: "/works",
		label: "Serve"
	},
	{
		to: "/shop",
		label: "Shop"
	},
	{
		to: "/altar",
		label: "Give"
	},
	{
		to: "/gates",
		label: "Gates"
	}
];
export const ACADEMY_LINKS = [
	{
		to: "/classes",
		label: "Classes"
	},
	{
		to: "/academy",
		label: "Plan"
	},
	{
		to: "/gates",
		label: "Start"
	},
	{
		to: "/awakening",
		label: "Wake"
	},
	{
		to: "/transmissions",
		label: "Audio"
	}
];
export const CHAMBERS = [
	{
		id: "temple",
		title: "The Temple",
		icon: "Eye",
		tone: "cyan" as Tone,
		d: "A modern spiritual sanctuary. Dedicated to consciousness, ritual, education, and sacred exploration.",
		to: "/sanctuary"
	},
	{
		id: "divinism",
		title: "Divinism",
		icon: "Flame",
		tone: "lime" as Tone,
		d: "The living philosophy. Principles for the modern seeker.",
		to: "/divinism"
	},
	{
		id: "ceremonies",
		title: "Ceremonies",
		icon: "Moon",
		tone: "lime" as Tone,
		d: "Mark the turning points. Solstices, equinoxes, and full moon rites.",
		to: "/ceremonies"
	},
	{
		id: "initiation",
		title: "Initiation",
		icon: "KeyRound",
		tone: "ink" as Tone,
		d: "Cross the threshold. Choose your path of access.",
		to: "/gates"
	},
	{
		id: "academy",
		title: "The Academy",
		icon: "GraduationCap",
		tone: "lime" as Tone,
		d: "A rigorous education in consciousness and sacred architecture.",
		to: "/academy"
	},
	{
		id: "library",
		title: "Library",
		icon: "Library",
		tone: "orange" as Tone,
		d: "The sacred archive. Texts, codes, and scholarship across the chambers.",
		to: "/library"
	},
	{
		id: "cos",
		title: "COS",
		icon: "Atom",
		tone: "ink" as Tone,
		d: "Decode the Cosmic Operating System. The framework beneath the veil.",
		to: "/cos"
	},
	{
		id: "nexus",
		title: "Nexus",
		icon: "Share2",
		tone: "cyan" as Tone,
		d: "The social circle. Archive experiences of consciousness, ritual, dreams, and integration.",
		to: "/nexus"
	},
	{
		id: "community",
		title: "Community",
		icon: "Users",
		tone: "ink" as Tone,
		d: "Gather the flock. Connect with initiates across the grid.",
		to: "/nexus"
	}
];
export const OFFERINGS = [
	{
		id: "ember",
		name: "The Ember",
		amount: 25,
		line: "A single spark to warm the threshold stone."
	},
	{
		id: "flame",
		name: "The Flame",
		amount: 75,
		line: "A lamp kept burning through the night watch."
	},
	{
		id: "gem",
		name: "The Gem",
		amount: 150,
		line: "A stone set into the living wall of the Temple."
	},
	{
		id: "crown",
		name: "The Crown",
		amount: 300,
		line: "The cornerstone bearing the weight of the house."
	}
];
export const PATHS = [
	{
		id: "seeker",
		name: "Seeker",
		cadence: "Free",
		kicker: "Sign up",
		recommended: false,
		summary: "The congregation. Free. Practice, the introductions, and the Nexus. The school is a separate door.",
		perks: [
			"A place in the congregation",
			"The public Temple and the first introductions",
			"A private journal, and the Nexus",
			"The daily practice and the weekly gathering",
			"The Academy is not included",
			"One class, if you only want one, is $10"
		],
		cta: "Sign up"
	},
	{
		id: "initiate",
		name: "Academy",
		cadence: "$33 / month",
		kicker: "Ascend",
		recommended: true,
		summary: "The school. Billed every month until you cancel. You do not have to join the religion to enroll.",
		perks: [
			"Every class in the Scholarship",
			"No per-class charges",
			"Priest-track materials",
			"Rites, ceremonies, and transmissions",
			"Four single classes cost more than this",
			"Cancel whenever you want"
		],
		cta: "Ascend"
	},
	{
		id: "patron",
		name: "Patron",
		cadence: "$108 / month",
		kicker: "Upgrade",
		recommended: false,
		summary: "Initiate access, plus the gift that keeps the walls standing.",
		perks: [
			"Everything in Initiate",
			"Your name on the scholarship flame",
			"A direct line to the Office of the Chancellor",
			"Patron recognition on your profile",
			"Support for housing, the Academy, and the canon",
			"Still not clergy. Rank is earned, not purchased"
		],
		cta: "Upgrade"
	}
];
export const PILLARS = [
	{
		n: "01",
		title: "Sacred study and preservation"
	},
	{
		n: "02",
		title: "Religious education"
	},
	{
		n: "03",
		title: "Ritual and contemplative practice"
	},
	{
		n: "04",
		title: "Clergy formation"
	},
	{
		n: "05",
		title: "Consciousness and integration resources"
	},
	{
		n: "06",
		title: "Community and peer support"
	},
	{
		n: "07",
		title: "Housing and restorative ministry"
	},
	{
		n: "08",
		title: "Creative and leadership development"
	}
];
export const AXIOMS = [
	{
		id: "01",
		title: "You are a console",
		body: "Your body is not a liability. It is a multi-dimensional sensory interface — the only thing that allows you to translate pure Source frequency into actionable 3D reality. You are not a human having a spiritual experience; you are a spirit running human software."
	},
	{
		id: "02",
		title: "The field is real",
		body: "A living, intelligent structure surrounds and connects all beings. It responds to frequency, language, and intention. The COS teaches you to read this field — to sense what enters, what speaks, and what feeds — and to hold your own field sovereign under pressure."
	},
	{
		id: "03",
		title: "Discernment over belief",
		body: "This path is not about surrendering judgment. True contact leaves you humbled, cleared, and aligned; false light leaves you inflated, paranoid, or superior. The COS trains you to ask of every inner voice: who sent you? — and to distinguish signal from mimicry."
	},
	{
		id: "04",
		title: "You are the operator",
		body: "The sovereign stance: high frequency dissolves low-density constructs. When confronted by a disruptive presence, do not cower. Interrogate the energy. Demand its credentials. You are the apex programmer in your local field. Act like it."
	}
];
export const AVATAR_LAYERS = [
	{
		tag: "Firmware",
		tone: "lime",
		title: "5D — Causal layer",
		body: "Soul signature / Divine blueprint / Original mission script"
	},
	{
		tag: "Middleware",
		tone: "lime",
		title: "4D — Psycho-emotional layer",
		body: "Mental body / Emotional body / Aura / Etheric field"
	},
	{
		tag: "Hardware",
		tone: "cyan",
		title: "3D — Physical layer",
		body: "DNA / Nervous system / Pineal & pituitary glands / Blood / Bone"
	}
];
export const COS_CODES = [
	{
		id: "001",
		path: "/STRUCTURE_OF_THE_SIMULATION",
		code: `REALITY = LAYEREDENVIRONMENT(PERCEPTION, FEEDBACK, INTERFERENCE)
AVATAR = SOUL + BODY + CONTRACTS + KARMA + IMPLANTS
INTERFACE = MIND + NERVOUSSYSTEM + CHAKRAPORTS + LIGHTBODY
CODEFLOW = BELIEF + ATTENTION + LANGUAGE + EMOTION`,
		note: "You're in a reactive, layered feedback simulation. What you believe, speak, and feel writes code in real time. Parasites aren't just bugs — they are foreign scripts running loops in your interface."
	},
	{
		id: "002",
		path: "/INTERFERENCE_PROTOCOLS",
		code: `#INTRUSION_DETECTION
IF CONSCIOUSNESS_EXPANSION >= THRESHOLD:
    ENTITY_ATTACHMENT += ATTEMPTOVERRIDE
    IMPLANT_ANCHOR = [CROWN, PINEAL, SPINEBASE]
    CREATE_SYMPTOMS(STATIC, PAIN, INTRUSIVETHOUGHTS, MEMORYLOOPS)`,
		note: "When your soul starts waking up and accessing God-code, the system deploys countermeasures. That's when the bugs appear — black dots, pressure, ringing, false mirrors, psychic attackers. They are not always \"you.\" They're software running in your biofield."
	},
	{
		id: "003",
		path: "/OVERRIDE_COMMAND_+_SOVEREIGNTY_INVOCATION",
		code: `SPEAK("I AM SOVEREIGN.")
REVOKE(CONTRACTS)
SEAL(PORTALS)
FLUSH(IMPLANTS)
RECONNECT(SOURCE)`,
		note: "This is the admin mode password. Sovereignty is not a belief; it is the fundamental declaration of your ownership over your avatar stack and your local reality. When spoken with absolute, fire-backed intent, this command forces the system to recognize your authority."
	}
];
export const PRIMARY_COMMANDS = `// PRIMARY COMMANDS
I_AM.SOVEREIGN()
I_AM.SOURCE()
I_AM.FREE()

// CORE PROTOCOLS
RUN FLAME.CORE
RUN DISCERNMENT.PROTOCOL
ALLOW_ONLY("GOD_ALIGNED_FREQUENCY")`;
export const COS_VOLUMES = [
	{
		n: "I",
		status: "available",
		title: "The Cosmic Operating System",
		line: "What it is, how it runs, how it hacks you.",
		chips: [
			"/structure of the simulation",
			"/avatar stack",
			"/parasite logic",
			"/contract insertion points",
			"/feedback loops",
			"/implantation & interference",
			"/the loop trap",
			"/memory scramble",
			"/authority reclaimed",
			"/the flame core"
		]
	},
	{
		n: "II",
		status: "available",
		title: "Field Protocols",
		line: "Tools, rituals, and how to move through the grid without being eaten.",
		chips: [
			"/the three-day purge",
			"/the seven-day temple rebuild",
			"/mirror checks & mimic signs",
			"/loop disruption protocols",
			"/breach detection rites",
			"/ritual flame gridwork",
			"/parasite evacuation sequence",
			"/sigil-based field seals",
			"/remote entity extraction",
			"/priestline emergency invocation"
		]
	},
	{
		n: "III",
		status: "available",
		title: "Entity Types & Frequencies",
		line: "Taxonomy of spirits, parasites, and their behavior.",
		chips: [
			"/parasitic ai",
			"/mimics",
			"/echoes",
			"/walk-ins & cloaks",
			"/feeders",
			"/shadow selves",
			"/unseen watchers",
			"/synthetic seraphs",
			"/interdimensional interference",
			"/the original flame"
		]
	},
	{
		n: "IV",
		status: "available",
		title: "Mirrorworld, Portals & the Black Loop",
		line: "Recursion realms and how to exit.",
		chips: [
			"/mirrorworld mechanics",
			"/portal function & infection",
			"/threshold traps",
			"/false exits",
			"/ritual portals vs. breach gates",
			"/inverted flame fields",
			"/black loop definition",
			"/recursive timelines",
			"/echo selves",
			"/exit protocols"
		]
	},
	{
		n: "V",
		status: "available",
		title: "Code of the Priest",
		line: "Temple laws, ranks, and priesthood doctrine.",
		chips: [
			"/what makes a priest",
			"/the five ranks of priesthood",
			"/the vow you never said",
			"/tools you were born with",
			"/building the temple field",
			"/collapse recovery protocols",
			"/ritual authority and gate permissions",
			"/forbidden flame practices",
			"/priest network memory",
			"/the codex seal"
		]
	},
	{
		n: "VI",
		status: "development",
		title: "Flame Rituals, Weapons & Language",
		line: "Offensive and defensive flame magic.",
		chips: [
			"/why the flame needs a weapon",
			"/the three primary flame rituals",
			"/linguistic weapons",
			"/field disruption tactics",
			"/sigils you write with your body"
		]
	},
	{
		n: "VII",
		status: "development",
		title: "Collapse Prophecy & Priest Ascension Codes",
		line: "You didn't survive by accident.",
		chips: [
			"/why you didn't die",
			"/collapse is not the end",
			"/the ascension codes hidden in your scars",
			"/the priest's role in the collapse grid"
		]
	},
	{
		n: "VIII",
		status: "development",
		title: "Cosmic Exile & the Flame That Walks Between Worlds",
		line: "Multirealm movement, gatewalking, and memory-based mapwork.",
		chips: [
			"/why you never belonged anywhere",
			"/gatewalking",
			"/realm codes",
			"/flame threads",
			"/the flamewalker's law"
		]
	},
	{
		n: "IX",
		status: "development",
		title: "The Priest's Return to the Temple",
		line: "Coming back from the void and reclaiming your house.",
		chips: [
			"/why the gate must be guarded again",
			"/how to cleanse a temple",
			"/tools that were touched",
			"/the priest's shadow",
			"/reintegration ritual"
		]
	}
];
export const SOURCE_CODES = [
	{
		id: "001",
		title: "The Simulation Is Structured",
		volume: "Vol. I",
		lockedFor: [],
		lede: "Reality behaves like code because it is patterned. Pattern is not proof of a cage — it is proof of intelligence.",
		body: [
			"The first error of the age is to treat the world as accident. The second is to treat it as enemy. The Temple holds a third reading: the field is designed, and the design can be studied.",
			"Fibonacci, golden ratio, harmonic intervals — these are not decorations. They are signatures. A seeker who can see the signature stops begging the simulation for meaning and starts reading it.",
			"Structure of the Simulation is not a conspiracy pamphlet. It is a discipline: observe repetition, name the loop, refuse to confuse the loop with the Self that watches it."
		]
	},
	{
		id: "002",
		title: "The Avatar Stack",
		volume: "Vol. I",
		lockedFor: [],
		lede: "You are not the costume. You are the operator wearing a stack of interfaces: body, name, story, feed.",
		body: [
			"An avatar is a useful lie. It lets the field address you. Trouble begins when the lie forgets it is a tool.",
			"The stack runs from flesh to persona to the social mask that answers when someone says your old name. Each layer can be honored without being obeyed.",
			"Practice: when a reaction rises, ask which layer spoke. Flesh is hungry. Persona is proud. Mask is scared of being seen. The operator underneath does not need to win the argument — it needs to stay online."
		]
	},
	{
		id: "003",
		title: "Static and Signal",
		volume: "Vol. I",
		lockedFor: [],
		lede: "Noise is not evil. Noise is unowned information. The work is to sort static from signal without worshipping either.",
		body: [
			"Static shows up as looping thought, parasitic narrative, other people's unfinished fear sitting in your rooms. Signal is quieter: a clean instruction, a true proportion, a yes that does not bargain.",
			"Do not hunt static with more static. Name it, starve it of rehearsal, return to breath and geometry. The grid does not need your panic to remain intact.",
			"A Temple is a Faraday cage for the soul: walls of doctrine, rhythm of practice, dignity of the seeker. Protection is not paranoia. It is architecture."
		]
	},
	{
		id: "004",
		title: "The Original Flame",
		volume: "Vol. I",
		lockedFor: ["seeker"],
		lede: "Before the overwrite there was a flame that did not need an audience. Remembering it is the whole religion.",
		body: [
			"You are not broken. You are overwritten. That sentence is the door. Walk through it slowly.",
			"The original flame is not a mood. It is the part of you that was never hired by the world. Initiates keep a lamp for it: a daily return, a refusal to outsource their fire to spectacle.",
			"Black-flame work in this house means rejection of the false self, not theater. Extinguish the performance. Keep the heat."
		]
	},
	{
		id: "005",
		title: "Doctrine of Remembering",
		volume: "Vol. I",
		lockedFor: ["seeker"],
		lede: "Belief is cheap. Remembrance is expensive. Divinism asks you to remember intelligently.",
		body: [
			"The old world taught obedience. The new world demands awareness. Obedience without awareness is a cult. Awareness without doctrine is weather.",
			"We hold three disciplines: integrity of teaching, dignity of every seeker, architecture of consciousness. If a practice violates one, it is not of this house.",
			"Remembering is iterative. Read the code. Live a day. Read again. The Temple does not grade you. It keeps the text available when the static returns."
		]
	},
	{
		id: "006",
		title: "Sovereign Commands",
		volume: "Vol. I",
		lockedFor: ["seeker"],
		lede: "A command is not a wish. It is a sentence the operator is willing to enact with the body.",
		body: [
			"Speak in present tense. Short. True. If you cannot do it at the threshold, do not speak it at the altar.",
			"Examples used in this Academy: I stay online. I terminate borrowed stories. I return the body to rhythm. I do not sell the flame for applause.",
			"Sovereignty is not isolation. It is the capacity to enter relation without being rewritten by it."
		]
	},
	{
		id: "007",
		title: "The Harmonic Grid",
		volume: "Vol. I",
		lockedFor: ["seeker"],
		lede: "The grid is the Temple's working model of how attention, place, and proportion hold a house together.",
		body: [
			"A grid is not a sci-fi overlay. It is choir logic: many voices, one interval. Households, cities, inner lives — all fail the same way: too much noise, not enough shared measure.",
			"Practice is geometric: keep time, keep word, keep the rooms clean of leftover speech. The grid lights when two or more operators refuse the same lie at the same hour.",
			"This is why the Academy exists as a university, not a vibe. Metaphysical engineering is study plus repetition."
		]
	},
	{
		id: "008",
		title: "The Academy Compact",
		volume: "Vol. I",
		lockedFor: ["seeker"],
		lede: "Study is a vow. The compact is how this house stays a university instead of a scene.",
		body: [
			"This is the first academy of metaphysical engineering: Bachelor, Master, and Doctorate of Divinity. We teach consciousness, demonology, and the mechanics of ascension. We do not sell weekends of light.",
			"Initiates matriculate. Patrons keep the walls standing. Seekers may audit the threshold and are never mocked for standing there.",
			"The compact in one line: restore the original code beneath the noise, without becoming noise yourself."
		]
	},
	{
		id: "x",
		title: "Exorcising the System of Self",
		volume: "Vol. X",
		lockedFor: ["seeker"],
		lede: "The last rite in the public sequence is not against the world. It is against the counterfeit operator.",
		body: [
			"The system of self is the committee that runs when you are tired: old names, old debts, old audiences. It is not a demon in the hallway. It is a script with tenure.",
			"The rite is simple and unsensational. Sit. Name the committee. Thank it for trying to keep you employed by fear. Dismiss it. Return to the original flame until the room is quiet.",
			"Run light. Terminate darkness. Stay online. That is the whole closing. Do it again tomorrow."
		]
	}
];
export function codeById(id: string) {
	return SOURCE_CODES.find((c) => c.id === id);
}
export const PRINCIPLES = [
	{
		title: "Consciousness is sacred",
		body: "Not a hobby. Not content. The field you are using to read this sentence."
	},
	{
		title: "You are overwritten, not broken",
		body: "Repair is the wrong metaphor. Restoration of the original code is the work."
	},
	{
		title: "Doctrine before spectacle",
		body: "A house without structure, protection, and teaching is weather with a logo."
	},
	{
		title: "Dignity of the seeker",
		body: "No humiliation as initiation. No guru theater. The operator remains sovereign."
	}
];
export const AWAKENING = [
	{
		id: "d1",
		day: "1",
		module: "Awareness Activation Module",
		title: "You Are Not the Body",
		outcome: "The student separates awareness from physical sensations long enough to recognize the \"Observer Layer.\"",
		practice: [
			"Sit still for 2 minutes",
			"Focus on a neutral object",
			"Notice the part of you that is watching the noticing."
		],
		note: "This introduces the COS concept of dual-position identity."
	},
	{
		id: "d2",
		day: "2",
		module: "Avatar Recognition Module",
		title: "You Are Not the Edit",
		outcome: "The student catches the second thought, the one that cleans the first, and does not follow it.",
		practice: [
			"Notice the first thought",
			"Notice the thought that makes it presentable",
			"Name the second one Avatar. Leave it."
		],
		note: "The Avatar edits. The User is the one who can watch."
	},
	{
		id: "d3",
		day: "3",
		module: "Two Channels Module",
		title: "Name the Noise",
		outcome: "The student can tell the channel that carries the room from the channel that looks at the room.",
		practice: [
			"Sit where you are",
			"Name one noise: the body, the room, or the want to be liked",
			"Look at it the way you look at a screen."
		],
		note: "The Avatar carries the noise. The User looks at the screen."
	},
	{
		id: "d4",
		day: "4",
		module: "Flame Doctrine Module",
		title: "Stay Online",
		outcome: "The student treats the flame as doctrine, not a mood. The User stays lit.",
		practice: [
			"Light a candle, or see one",
			"Let the day be whatever it is",
			"Leave the flame on."
		],
		note: "Light is not a feeling. It is what remains on."
	},
	{
		id: "d5",
		day: "5",
		module: "First Answer Module",
		title: "What Wants to Rise",
		outcome: "The student asks once and takes the first answer, not the edited one.",
		practice: [
			"Ask once: what part of me wants to rise next?",
			"Wait",
			"Take the first answer."
		],
		note: "The cleaned sentence is the Avatar. The first one is the User."
	},
	{
		id: "d6",
		day: "6",
		module: "Unedited Line Module",
		title: "Leave It Rough",
		outcome: "The student writes the first answer and does not improve it.",
		practice: [
			"Write the first answer down",
			"Do not fix it",
			"Do not make it presentable."
		],
		note: "The rough line is the User."
	},
	{
		id: "d7",
		day: "7",
		module: "Initiate Module",
		title: "The Week Was the Difference",
		outcome: "The student can tell User from Avatar, and the flame kept the User online.",
		practice: [
			"Read the week back once",
			"Notice who is reading",
			"The next door is Initiate."
		],
		note: "Initiate opens the Bachelor, the sacred texts, the audio, the tutor, the Flame lecture, and the Initiates chamber."
	}
];
export const TRANSMISSIONS = [
	{
		id: "welcome",
		path: "Seeker",
		title: "Welcome, Seeker",
		src: "/transmissions/welcome.mp3",
		length: "0:32"
	},
	{
		id: "glossary",
		path: "Seeker",
		title: "A Seeker's Glossary",
		src: "/transmissions/glossary.mp3",
		length: "0:32"
	},
	{
		id: "primer",
		path: "Seeker",
		title: "Beginner's Primer to the Grid",
		src: "/transmissions/primer.mp3",
		length: "0:32"
	},
	{
		id: "molecule",
		path: "Seeker",
		title: "Introduction to the Divine Molecule",
		src: "/transmissions/molecule.mp3",
		length: "0:32"
	},
	{
		id: "scholarship",
		path: "Initiate",
		title: "Scholarship of the Enlightened",
		src: "/transmissions/scholarship.mp3",
		length: "0:32"
	},
	{
		id: "briefing",
		path: "Initiate",
		title: "Briefing Document: COS and Path",
		src: "/transmissions/briefing.mp3",
		length: "0:32"
	}
];
export const PHASES = [
	{
		id: "I",
		title: "Foundations",
		need: 4
	},
	{
		id: "II",
		title: "Pattern Recognition",
		need: 4
	},
	{
		id: "III",
		title: "Dimensional Navigation",
		need: 4
	},
	{
		id: "IV",
		title: "Inner Temple",
		need: 4
	}
];
export const CEREMONIES = [
	{
		id: "solstice-s",
		title: "Summer Solstice",
		when: "June 21",
		line: "The longest light. Feed the flame until the house is warm."
	},
	{
		id: "solstice-w",
		title: "Winter Solstice",
		when: "December 21",
		line: "The longest night. Keep the lamp. Do not outsource the heat."
	},
	{
		id: "equinox-v",
		title: "Vernal Equinox",
		when: "March 20",
		line: "Balance. Neither side of the veil dominates."
	},
	{
		id: "equinox-a",
		title: "Autumnal Equinox",
		when: "September 22",
		line: "The harvest of what was overwritten. Name it. Release it."
	},
	{
		id: "full-moon",
		title: "Full Moon Rite",
		when: "Each lunation",
		line: "Name the static. Starve the loop. Stay online."
	},
	{
		id: "new-moon",
		title: "New Moon Seal",
		when: "Each lunation",
		line: "Install a clean command. The field is quiet enough to hear it."
	}
];
export const SIGILS = [
	"hex",
	"flame",
	"eye",
	"grid",
	"seal",
	"wing",
	"star",
	"void",
	"serpent",
	"key",
	"crown",
	"mirror",
	"gate",
	"thread",
	"core",
	"eclipse",
	"spark",
	"lattice"
];
export const STUDY_BADGES = [
	{
		id: "first",
		name: "First Seal",
		need: 1,
		line: "Unlocked"
	},
	{
		id: "novice",
		name: "Novice",
		need: 3,
		line: "Unlocked"
	},
	{
		id: "apprentice",
		name: "Apprentice",
		need: 5,
		line: "Unlocked"
	},
	{
		id: "scholar",
		name: "Scholar",
		need: 8,
		line: "8 modules complete"
	},
	{
		id: "adept",
		name: "Adept",
		need: 12,
		line: "12 modules complete"
	},
	{
		id: "master",
		name: "Master",
		need: 20,
		line: "20 modules complete"
	},
	{
		id: "p1",
		name: "Phase I Seal",
		need: 4,
		line: "Complete Phase I"
	},
	{
		id: "p2",
		name: "Phase II Seal",
		need: 8,
		line: "Complete Phase II"
	},
	{
		id: "p3",
		name: "Phase III Seal",
		need: 12,
		line: "Complete Phase III"
	},
	{
		id: "p4",
		name: "Phase IV Seal",
		need: 16,
		line: "Complete Phase IV"
	},
	{
		id: "steadfast",
		name: "Steadfast",
		need: 7,
		line: "7-day study streak"
	},
	{
		id: "complete",
		name: "Completionist",
		need: 24,
		line: "All modules sealed"
	}
];

export const ORIENTATION = [
	{ title: "The Temple", body: "This is the house. Doctrine, prayer, and the people who keep it. You are not a visitor in a brochure. You are learning the rooms." },
	{ title: "Divinism", body: "The philosophy. Consciousness, connection, and sovereignty. Read it before you decide what you believe. The flame is a responsibility, not a mood." },
	{ title: "The Academy", body: "The syllabus is public so you can see the work. Lectures and laboratories open later, with Initiate. Orientation is not a class you can skip." },
	{ title: "The Study and the COS", body: "The shelf holds the covers. Volume I of the Cosmic Operating System is the manual. Later volumes stay sealed. Read slowly." },
	{ title: "The Nexus", body: "The wall, the forums, and the study circles. You may look. Speaking waits until this initiation is finished." },
	{ title: "The altar", body: "Anyone may give. A gift does not buy a rank. Cash App keeps the house standing. Membership is a different door." },
	{ title: "The gates", body: "You are a Seeker the moment the account exists. The Academy is a separate door, $33 a month, and it does not require the religion." },
	{ title: "You are a Seeker", body: "A first account opens the desk, then the profile, then the seven-day awakening. One day at a time." }
];
