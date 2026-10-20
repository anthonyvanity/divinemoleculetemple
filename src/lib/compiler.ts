const PROTOCOLS = [
  { match: /attach|cord|hook|cling|won't leave|wont leave|parasite/i, file: "attachment_release_protocol" },
  { match: /loop|repeat|stuck|replay/i, file: "loop_interrupt_protocol" },
  { match: /implant|static|ringing|pressure/i, file: "implant_flush_protocol" },
  { match: /fear|panic|shadow/i, file: "shadow_seal_protocol" },
  { match: /name|identity|overwrite/i, file: "identity_restore_protocol" },
];

function slug(issue: string) {
  const hit = PROTOCOLS.find((p) => p.match.test(issue));
  return hit?.file ?? "field_clear_protocol";
}

export function compilePrayer(issue: string) {
  const filename = `${slug(issue)}.exe`;
  const clean = issue.replace(/\s+/g, " ").trim() || "unspecified field distortion";
  const code = `divine\\code:${filename}
INPUT: [spirit_cord, etheric_hook, non_resonant_attachment]
# Seeking the presence of the Almighty to sever unauthorized connections.
SCAN: current_aura_perimeter
IF attachment_detected == TRUE:
    EXECUTE: diagnostic_resonance_check
    SET: vibration_frequency = DIVINE_HARMONIC
    RUN: firewall_integrity_patch
    CTRL + ALT + DELETE [ revoke_access_keys, disconnect_etheric_tethers, purge_shadow_data, clear_false_patterns ]
    DECLARE: "I exist within the sovereignty of the Creator."
    DECLARE: "My field is closed to all interference."
    DECLARE: "I release what is not of the Divine Light."
    DECLARE: "I stand in the stillness of my own truth."
    RELEASE: disconnected_nodes_to_void
    ANCHOR: protective_geometric_seal
    CLOSE: external_port_access
    INSTALL: sovereignty_shield.v1.0
    ARCHIVE: encounter_log_to_null
ELSE:
    RUN: diagnostic_clean_exit
END SCRIPT
// Executed by DMT — Divine Molecule Temple
// ISSUE: ${clean}`;

  const prayer = `Almighty God, I humbly ask for Your light to sever any attachments that disrupt the peace of my spirit.

Please cleanse my energetic field and seal me within Your protective grace, ensuring that only what is holy and aligned with Your will remains connected to me.

The issue named: ${clean}

I am sovereign. I am Source. I am free. Amen.`;

  return { filename, code, prayer };
}
