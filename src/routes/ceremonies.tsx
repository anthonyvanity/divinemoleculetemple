import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { getBearerToken } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { CEREMONIES } from "@/lib/temple-content";
import { listVault } from "@/lib/temple-admin";
import { logDailyRitual } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/ceremonies")({ component: Ceremonies });

function Ceremonies() {
  const logRite = useTemple((s) => s.logRite);
  const rites = useTemple((s) => s.rites);
  const paid = useTemple((s) => s.paid);
  const user = useCurrentUser();
  const seekerRites = new Set(["solstice-s", "equinox-v", "full-moon"]);

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="lime"
        icon="Moon"
        kicker="The old craft"
        title="Ancient rites"
        lede={`The ancient half of the blend.
Ritual, ceremony, sigil work,
and the green pharmacopia.
Where the old craft meets
the new operating system.`}
      />

      <section className="border-b border-lime/30 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionKicker>The daily rite</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Four moves. Then seal it.</h2>
          <ol className="mt-6 space-y-3 font-mono text-[13px] normal-case leading-relaxed text-paper/80">
            <li>1. Light a flame, or picture one.</li>
            <li>2. Name the static you are not taking into the next hour.</li>
            <li>3. Speak one sentence you will actually keep.</li>
            <li>4. Sit still until the room is quieter than you found it.</li>
          </ol>
          <Button
            variant="lime"
            className="mt-6"
            onClick={() => {
              logRite("Daily rite");
              void logDailyRitual({ data: { ritual: "Daily rite", duration_min: 10, notes: "" } }).catch(() => {});
              toast.success("Rite kept on your account.");
            }}
          >
            Seal the day
          </Button>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>The blend</SectionKicker>
          <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">
            The Temple does not discard the ancient. It decrypts it. Modern consciousness engineering does not stand alone. The flame, the moon, the glyph, and the leaf are the load-bearing traditions that carried this work across centuries. Look freely. The deep work waits behind the gate.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {[
            ["Ritual", "Deliberate acts of encoded intention — the mechanics of command, field stabilization, and frequency imprinting."],
            ["Ceremony", "Aligned work with the celestial clock — solstices, equinoxes, full moons, and initiatory thresholds."],
            ["Sigil work", "Geometry that holds intention without decay. A sigil is a compressed command line."],
            ["Herbalism", "Plant allies as frequency allies — the old green pharmacopia for calibration, hygiene, and ritual support."],
          ].map(([name, line]) => (
            <article key={name} className="border border-paper/15 p-6">
              <h2 className="font-display uppercase">{name}</h2>
              <p className="mt-3 font-mono text-[11px] normal-case leading-relaxed text-paper/70">{line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>The turning points</SectionKicker>
          <h2 className="mt-3 font-display text-title uppercase">Rites of the year</h2>
          <ul className="mt-10 divide-y divide-paper/10 border border-paper/10">
            {CEREMONIES.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-6">
                <div>
                  <p className="text-micro uppercase tracking-wide text-lime">{c.when}</p>
                  <h3 className="mt-1 font-display text-2xl uppercase">{c.title}</h3>
                  <p className="mt-2 text-sm text-paper/65">{c.line}</p>
                </div>
                {paid || (user && seekerRites.has(c.id)) ? (
                <Button
                  variant="dark"
                  onClick={() => {
                    logRite(c.title);
                    void logDailyRitual({ data: { ritual: c.title, duration_min: 0, notes: "" } }).catch(() => {});
                    toast.success("Rite logged.");
                  }}
                >
                  Log rite
                </Button>
                ) : (
                  <span className="text-[10px] uppercase tracking-wide text-paper/40">Paid membership</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HouseRituals />

      <section className="border-t border-lime px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionKicker>Your ledger</SectionKicker>
          {rites.length === 0 ? (
            <p className="mt-4 text-sm uppercase tracking-wide text-paper/50">No rite logged. Begin today.</p>
          ) : (
            <ul className="mt-6 space-y-2">
              {rites.map((r) => (
                <li key={r.id} className="flex justify-between border border-paper/10 px-4 py-3 text-sm">
                  <span className="uppercase">{r.title}</span>
                  <span className="text-paper/45">{new Date(r.at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="lime" className="mt-10">
            <Link to="/altar">Cast an offering</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function HouseRituals() {
  const [rows, setRows] = useState<{ id: string; title: string; body: string; gate: string; hasFile: boolean; open: boolean }[]>([]);
  useEffect(() => {
    void listVault({ data: "ritual" })
      .then(setRows)
      .catch(() => setRows([]));
  }, []);
  if (!rows.length) return null;
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionKicker>From the desk</SectionKicker>
        <h2 className="mt-3 font-display text-title uppercase">House rituals</h2>
        <ul className="mt-8 divide-y divide-paper/10 border border-paper/10">
          {rows.map((row) => (
            <li key={row.id} className="px-5 py-6">
              <p className="text-micro uppercase tracking-wide text-lime">{row.gate}</p>
              <h3 className="mt-1 font-display text-2xl uppercase">{row.title}</h3>
              {row.open && row.body ? <p className="mt-3 whitespace-pre-wrap text-sm text-paper/75">{row.body}</p> : null}
              {row.open && row.hasFile ? (
                <button
                  type="button"
                  className="mt-3 text-[10px] uppercase tracking-[0.16em] text-lime"
                  onClick={() => {
                    const token = getBearerToken();
                    void fetch(`/api/file/${row.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                      .then((res) => (res.ok ? res.blob() : Promise.reject()))
                      .then((blob) => {
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank", "noopener");
                      })
                      .catch(() => toast.error("That file is held."));
                  }}
                >
                  Open PDF
                </button>
              ) : row.open ? null : (
                <p className="mt-3 text-[10px] uppercase tracking-wide text-paper/40">Held</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
