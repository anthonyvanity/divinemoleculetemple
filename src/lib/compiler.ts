const TARGETS: [RegExp, string, string][] = [
  [/anxi|panic|overwhelm|nervous/, "anxiety", "anxiety_containment"],
  [/grief|mourn|loss of|died|death of/, "grief", "grief_transmission"],
  [/home|house|apartment|this room/, "the home", "home_blessing"],
  [/contract|oath|bound to|revoke/, "false contracts", "contract_revocation"],
  [/identity|who i am|my name/, "identity", "identity_restore"],
  [/fear|afraid/, "fear", "fear_release"],
  [/attach|won't leave|wont leave|cord/, "unwanted attachment", "attachment_release"],
];

function quote(line: string) {
  return line.replace(/\\/g, "").replace(/"/g, "'");
}

function sentences(prayer: string) {
  return prayer
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function compilePrayer(issue: string) {
  const spoken = sentences(issue);
  const clean = spoken.join(" ") || issue.replace(/\s+/g, " ").trim();
  const hit = TARGETS.find(([pattern]) => pattern.test(clean));
  const target = hit?.[1] ?? "the prayer as spoken";
  const slug = hit?.[2] ?? "spoken_prayer";
  const comments = (spoken.length ? spoken : [clean]).slice(0, 3).map((line) => `# ${line}`);
  const declares = (spoken.length ? spoken : [clean]).slice(0, 3).map((line) => `    "${quote(line)}"`);
  const filename = `${slug}.exe`;
  const code = `divine\\code:_${slug}.exe

# Almighty God, <source> of "mercy + truth + light",
# receive what is spoken and keep it clear.
operator = "[INSERT NAME]"
target = "${quote(target)}"
<God>.invoke(
    presence = "near",
    guidance = "clear",
    mercy = "active"
)
SCAN operator.field FOR [
    "${quote(target)}"
]
IF distortion.detected == True:
    IDENTIFY distortion
    RELEASE distortion
    RETURN attention TO operator
    RESTORE breath TO "steady"
${comments.join("\n")}
DECLARE:
${declares.join("\n")}
SEAL operator.field WITH "holy_light"
CONFIRM operator.status = "present"
CONFIRM field.status = "sealed"
END SCRIPT
// Executed by DMT — Divine Molecule Temple`;
  return { filename, code, prayer: clean };
}
