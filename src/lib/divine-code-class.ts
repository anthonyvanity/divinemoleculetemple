export const CODE_CLASS = {
  title: "Divine Code Syntax 101",
  line: "Writing executable prayer",
  division: "Divine Molecule Academy",
  department: "Ritual Language and Sacred Systems",
  format: "Six classes plus a final practicum",
  level: "Seeker. Introductory priestline.",
  description:
    "This course teaches students to write prayers in the Divine Code language: devotional speech, liturgical structure, and a readable command syntax. It is not software development. It is a ritual literary syntax for a clear intention, a named target, and a prayer a person can speak aloud.",
  outcomes: [
    "Convert an ordinary prayer into one continuous hybrid code-prayer.",
    "Use variables, conditions, commands, arrays, functions, and status confirmations.",
    "Keep the prayer alive while the syntax stays clear.",
    "Tell invocation, request, command, declaration, seal, and confirmation apart.",
    "Write code that sounds natural when spoken aloud.",
    "Build reusable templates with [INSERT NAME], [INSERT LOCATION], and [INSERT PURPOSE].",
    "Edit for repetition, contradiction, and clutter.",
    "Produce one complete Divine Code.",
  ],
  commands: ["INVOKE", "SCAN", "IDENTIFY", "REVOKE", "RELEASE", "REMOVE", "RETURN", "RESTORE", "CLOSE", "SEAL", "BLESS", "INSTALL", "DECLARE", "CONFIRM", "END"],
  law: `IF code.looks_powerful BUT cannot_be_read_aloud:
    code = "failed"
IF prayer.is_beautiful BUT purpose.is_unclear:
    code = "incomplete"
IF syntax.is_clear AND prayer.has_soul:
    divine_code = "valid"`,
};

export const CODE_EXAMPLES: { file: string; title: string; code: string }[] = [
  {
    file: "divine\\code:_morning_alignment.exe",
    title: "Morning alignment",
    code: `# Almighty God, <source> of all "truth + order + living light",
# initialize this day beneath Your wisdom.
operator = "[INSERT NAME]"
location = "[INSERT LOCATION]"
session = "morning_alignment"
<God>.invoke(
    presence = "near",
    guidance = "clear",
    mercy = "active"
)
SCAN operator.field FOR [
    "fear",
    "confusion",
    "resentment",
    "false urgency",
    "unfinished grief"
]
IF distortion.detected == True:
    RELEASE distortion
    RETURN attention TO operator
    RESTORE breath TO "steady"
    RESTORE mind TO "clear"
    RESTORE heart TO "open + discerning"
# Let no mistake become identity.
# Let no delay become defeat.
# Let no voice outrank the truth You placed within me.
REVOKE [
    contracts.fear,
    oaths.failure,
    agreements.self_abandonment,
    permissions.false_authority
]
INSTALL [
    wisdom.before_action,
    compassion.with_boundaries,
    courage.without_performance,
    humility.without_erasure
]
DECLARE:
    "I begin this day in the presence of God."
    "My voice is measured."
    "My judgment is clear."
    "My actions serve truth."
SET operator.status = "awake + aligned + responsible"
SET field.status = "peaceful + protected + responsive"
RETURN sovereignty TO operator
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
  {
    file: "divine\\code:_contract_revocation.exe",
    title: "Contract revocation",
    code: `# Almighty God, <source> of justice and freedom,
# witness this revocation across all memory, language, and intention.
operator = "[INSERT NAME]"
target = [
    "contracts",
    "oaths",
    "promises",
    "permissions",
    "bindings",
    "false obligations"
]
FOR agreement IN target:
    IF agreement.origin IN [
        "fear",
        "coercion",
        "confusion",
        "deception",
        "shame",
        "silence"
    ]:
        SET agreement.consent = False
        SET agreement.authority = Null
        EXECUTE revoke(agreement)
        ARCHIVE agreement AS "closed + powerless"
# I do not remain bound to language spoken without understanding.
# I do not remain loyal to harm because I once mistook it for duty.
# I reclaim the right to choose again.
REVOKE [
    backdoors.hidden,
    permissions.inherited,
    loyalty_to_suffering,
    identity_through_punishment
]
DECLARE:
    "What was made without truth has no authority."
    "What was accepted under fear is now released."
    "My yes belongs to me."
    "My no is valid before God."
SEAL operator.field WITH "holy_light"
CONFIRM contracts.status = "revoked"
CONFIRM sovereignty.status = "restored"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
  {
    file: "divine\\code:_home_blessing.exe",
    title: "Home blessing",
    code: `# Almighty God, <source> of peace, hospitality, and sacred order,
# enter this home and establish Your light within it.
location = "[INSERT LOCATION]"
occupants = "[INSERT NAMES OR HOUSEHOLD]"
mode = "blessing + restoration"
<God>.invoke(
    presence = "full",
    peace = "permanent",
    mercy = "renewing"
)
SCAN location FOR [
    "conflict residue",
    "grief",
    "fear",
    "hostility",
    "stagnation",
    "unwanted memory"
]
FOR room IN location:
    CLEAR room.air
    RELEASE room.residue
    RESTORE room.function
    BLESS room WITH "peace + dignity + warmth"
# Let every wall hold safety.
# Let every doorway admit what is good.
# Let every window open toward light.
DECLARE:
    "This home is not governed by fear."
    "This home is not a theater for old pain."
    "This home belongs to peace."
    "God is welcome here."
SET location.status = "blessed + ordered + protected"
SET occupants.status = "respected + accountable + at peace"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
  {
    file: "divine\\code:_anxiety_containment.exe",
    title: "Anxiety containment",
    code: `# Almighty God, <source> of stillness beneath every storm,
# remain with me while my nervous system returns to order.
operator = "[INSERT NAME]"
symptom = "anxiety"
priority = "stabilize"
READ breath.rate
READ body.tension
READ thought.speed
IF breath.rate == "rapid":
    SET inhale = 4
    SET pause = 2
    SET exhale = 6
    REPEAT breath_cycle x 5
IF thought.speed == "recursive":
    PAUSE future_projection
    PAUSE catastrophe_rendering
    RETURN attention TO "this room + this breath + this moment"
# God, separate what is happening
# from what fear predicts will happen.
# Give me the next true step, not every imagined ending.
RELEASE [
    urgency.false,
    shame.for_feeling,
    pressure.to_perform,
    demand.for_total_control
]
ANCHOR operator TO [
    feet,
    breath,
    name,
    present_time,
    physical_location
]
DECLARE:
    "This feeling is present, but it is not my ruler."
    "I do not have to solve everything in one breath."
    "My body may slow down."
    "I remain held by God."
SET nervous_system.status = "slowing"
SET attention.status = "present"
SET operator.status = "safe_enough_to_continue"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
  {
    file: "divine\\code:_grief_transmission.exe",
    title: "Grief transmission",
    code: `# Almighty God, <source> of memory, mercy, and eternal love,
# receive what I cannot carry alone.
operator = "[INSERT NAME]"
beloved = "[INSERT NAME OR RELATION]"
state = "grief"
OPEN heart WITH "gentleness"
DISABLE shame.for_crying
DISABLE pressure.to_move_on
DISABLE false_deadlines.for_healing
# I do not erase love in order to survive loss.
# I do not betray memory by continuing to live.
# I allow grief to speak without making it my entire identity.
FOR memory IN beloved.archive:
    KEEP love
    RELEASE guilt
    KEEP meaning
    RELEASE punishment
    KEEP gratitude
    RELEASE demand_for_return
IF sorrow.intensity > operator.capacity:
    BUFFER sorrow
    PROCESS "one breath + one memory + one day" AT_A_TIME
DECLARE:
    "Love remains without becoming a prison."
    "Memory remains without becoming a loop."
    "I release what cannot return."
    "I bless what will always matter."
<God>.hold(
    operator = "with mercy",
    beloved = "with eternal care",
    memory = "without distortion"
)
SET grief.status = "honored + moving"
SET heart.status = "wounded + living"
SET operator.status = "still_here"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
  {
    file: "divine\\code:_identity_restore.exe",
    title: "Identity restore",
    code: `# Almighty God, <source> of the original name and uncorrupted design,
# restore what is true without restoring what has already completed its purpose.
operator = "[INSERT NAME]"
mode = "identity_recovery"
RESTORE operator.core FROM "original_divine_template"
# I honor every version of me that survived.
# I do not permit survival to remain my permanent identity.
# What protected me may now rest.
# What is true may now lead.
DECLARE:
    "I am not a bootleg copy of my wounds."
    "I am not the role assigned to me by crisis."
    "I retain the wisdom and release the disguise."
    "My identity is living, sovereign, and answerable to God."
SET false_versions.status = "retired"
SET operator.status = "recognized + integrated + online"
SET integrity = "divine"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
];

export const GRAMMAR: { n: string; title: string; rule: string; code?: string }[] = [
  {
    n: "01",
    title: "Invocation",
    rule: "Name God and the quality that governs the prayer. A clear invocation beats a plea that asks for everything.",
    code: `# Almighty God, <source> of "wisdom + mercy + truth",
# enter this field and establish holy order.`,
  },
  {
    n: "02",
    title: "Operator",
    rule: "The operator is the person speaking or receiving the prayer. Never hard-code a private name into a prayer the congregation will reuse.",
    code: `operator = "[INSERT NAME]"
location = "[INSERT LOCATION]"
target = "[INSERT CONCERN]"`,
  },
  {
    n: "03",
    title: "Target",
    rule: "Name what the prayer addresses. Specific enough to understand. Broad enough to reuse. Not “bad stuff.” Not every world at once.",
    code: `target = [
    "fear",
    "confusion",
    "unwanted attachment",
    "false obligation"
]`,
  },
  {
    n: "04",
    title: "Scan",
    rule: "A scan names what is being examined. It does not remove anything yet. Do not jump from the invocation to destruction.",
    code: `SCAN operator.field FOR [
    "fear",
    "shame",
    "false urgency"
]
IF distortion.detected == True:
    IDENTIFY distortion
    NAME distortion
    PREPARE release`,
  },
  {
    n: "05",
    title: "Conditions",
    rule: "Use IF, ELSE, and FOR. The line must still make sense when it is read aloud. Nested fake-software does not.",
    code: `IF fear.detected:
    RELEASE fear
    RESTORE breath
FOR contract IN contracts:
    IF contract.origin == "coercion":
        REVOKE contract`,
  },
  {
    n: "06",
    title: "Commands",
    rule: "Commands are strong verbs a person can understand. Invoke, scan, identify, revoke, release, remove, return, restore, close, seal, bless, install, declare, confirm, end.",
    code: `REVOKE permissions.false
RESTORE operator.voice
SEAL field WITH "holy_light"`,
  },
  {
    n: "07",
    title: "Arrays",
    rule: "When three or more items share one command, put them in one array. Do not repeat the verb on every line.",
    code: `REVOKE [
    contracts.fear,
    oaths.silence,
    permissions.self_abandonment
]`,
  },
  {
    n: "08",
    title: "Functions",
    rule: "A function is one complex sacred action. One or two in a prayer is enough. Ten of them starts to sound like a manual.",
    code: `<God>.invoke(
    mercy = "active",
    wisdom = "clear",
    protection = "present"
)`,
  },
  {
    n: "09",
    title: "Sacred comments",
    rule: "Comments carry the heart of the prayer. About forty percent devotion, forty percent command, twenty percent declaration and confirmation. The comment has to be speakable.",
    code: `# I do not erase love in order to survive loss.
# I do not mistake urgency for divine instruction.
# Let what is true remain.`,
  },
  {
    n: "10",
    title: "Declaration",
    rule: "The declaration is the line the operator can carry after the prayer. It translates the code. It does not repeat the commands.",
    code: `DECLARE:
    "I am present."
    "My consent belongs to me."
    "My life is not governed by fear."`,
  },
  {
    n: "11",
    title: "Seal",
    rule: "The seal keeps the prayer from ending in midair.",
    code: `SEAL operator.field WITH "holy_light"
SEAL location WITH "peace + dignity + truth"`,
  },
  {
    n: "12",
    title: "Confirmation",
    rule: "Every code reports a final status, then ends.",
    code: `CONFIRM operator.status = "grounded + clear"
CONFIRM field.status = "sealed"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
];

export const CODE_LESSONS: { n: string; title: string; topics: string[]; exercise: string }[] = [
  {
    n: "01",
    title: "Language as interface",
    topics: ["Prayer as structured language", "This is not software", "Invocation, authority, and target", "Readable syntax outranks technical complexity"],
    exercise: `# Almighty God, <source> of "peace + wisdom",
# remain with me while this pressure returns to order.
operator = "[INSERT NAME]"
target = "overwhelm"
RELEASE false_urgency
RESTORE breath
RESTORE next_step
DECLARE:
    "I do not need to solve everything at once."
CONFIRM operator.status = "present"
END SCRIPT`,
  },
  {
    n: "02",
    title: "Variables and targets",
    topics: ["Defining the operator", "Placeholders", "One target or several", "A text the whole congregation can use"],
    exercise: `operator = "[INSERT NAME]"
location = "[INSERT LOCATION]"
purpose = "[INSERT PURPOSE]"`,
  },
  {
    n: "03",
    title: "Conditions and discernment",
    topics: ["IF, ELSE, and FOR", "Scan before you act", "Do not give the prayer two opposite orders", "It still has to sound like speech"],
    exercise: `IF resentment.detected:
    NAME wound
    RELEASE revenge
    RESTORE boundary
ELSE:
    MAINTAIN peace`,
  },
  {
    n: "04",
    title: "Commands and revocations",
    topics: ["Which verb does the work", "Revoke is not the same as release", "Remove is not the same as restore", "Intensity is not the same as clutter"],
    exercise: `REVOKE false_permission
REMOVE unauthorized_access
RESTORE rightful_order
SEAL field WITH "holy_light"`,
  },
  {
    n: "05",
    title: "Poetry inside the machine",
    topics: ["Sacred comments", "Rhythm", "Repetition", "A line that works on the page and in the mouth"],
    exercise: `# Let no wound become my entire name.
# Let truth arrive without violence.
# Let mercy remain stronger than shame.`,
  },
  {
    n: "06",
    title: "Seal, confirm, execute",
    topics: ["How a prayer ends", "The status line", "The Temple signature", "One prayer, one page"],
    exercise: `CONFIRM operator.status = "[FINAL STATUS]"
CONFIRM field.status = "[FINAL STATUS]"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`,
  },
];

export const PRACTICUM = `divine\\code:_[FUNCTION_NAME].exe

# Almighty God, <source> of "[ATTRIBUTE + ATTRIBUTE + ATTRIBUTE]",
# [OPENING INVOCATION]
operator = "[INSERT NAME]"
location = "[INSERT LOCATION]"
target = "[INSERT TARGET]"
<God>.invoke(
    presence = "[QUALITY]",
    wisdom = "[QUALITY]",
    mercy = "[QUALITY]"
)
SCAN target FOR [
    "[CONDITION]",
    "[CONDITION]",
    "[CONDITION]"
]
IF distortion.detected == True:
    IDENTIFY distortion
    REVOKE unauthorized_permission
    RELEASE harmful_pattern
    RESTORE rightful_state
# [DEVOTIONAL LINE]
# [DEVOTIONAL LINE]
# [DEVOTIONAL LINE]
REVOKE [
    "[CONTRACT OR PATTERN]",
    "[OATH OR PERMISSION]",
    "[FALSE IDENTITY]"
]
INSTALL [
    "[VIRTUE]",
    "[BOUNDARY]",
    "[RESTORATIVE STATE]"
]
DECLARE:
    "[FIRST AFFIRMATION]"
    "[SECOND AFFIRMATION]"
    "[THIRD AFFIRMATION]"
SEAL operator.field WITH "[SEALING QUALITIES]"
CONFIRM operator.status = "[FINAL STATUS]"
CONFIRM field.status = "[FINAL STATUS]"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`;

export const NAME_RULES = [
  "Lowercase only.",
  "Words separated by underscores.",
  "No personal names.",
  "One clear function.",
  "End with .exe.",
  "Keep the Temple prefix: divine\\code:_",
];
