import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listHouseDocuments } from "@/lib/command";
import { RITES, UNINSTALLED } from "@/lib/rites";
import { useTemple } from "@/lib/temple-store";

const TABS = ["Today", "Rites", "Prayers", "Sessions", "Schedule"] as const;

function dayKey(zone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function MemberSanctuary() {
  const schedule = useTemple((s) => s.deskSchedule);
  const practice = useTemple((s) => s.deskPractice);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");
  const [house, setHouse] = useState<Awaited<ReturnType<typeof listHouseDocuments>>>([]);
  const today = practice[dayKey(schedule.zone || "UTC")] ?? {};
  const next = RITES.find((rite) => !today[rite.key]) ?? RITES[0];

  useEffect(() => {
    void listHouseDocuments()
      .then(setHouse)
      .catch(() => {});
  }, []);

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">Your sacred space. Your daily practice.</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">The Sanctuary</h1>
        <p className="mt-4 max-w-2xl font-mono text-[12px] normal-case leading-relaxed text-paper/70">
          The Sanctuary is where the teachings become practice. Through prayer, intention, ritual, and reflection, members develop a personal spiritual discipline.
        </p>
        <div className="mt-6 flex gap-2 overflow-x-auto text-[10px] uppercase tracking-[0.14em]">
          {TABS.map((name) => (
            <button key={name} type="button" onClick={() => setTab(name)} className={tab === name ? "bg-lime px-3 py-2 text-ink" : "border border-paper/15 px-3 py-2 text-paper/70"}>
              {name}
            </button>
          ))}
        </div>

        {tab === "Today" ? (
          <section className="mt-8 border border-paper/15 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-paper/50">Begin your day with intention</p>
            <h2 className="mt-2 font-display text-2xl uppercase">{next.title}</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-paper/55">
              {next.when} · {next.minutes} · {today[next.key] ? "Complete" : "Open"}
            </p>
            <p className="mt-3 font-mono text-[12px] normal-case text-paper/70">{next.purpose}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/rite/$id" params={{ id: next.id }} className="bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
                Begin next rite
              </Link>
              <Link to="/practice" className="border border-paper/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                Edit my schedule
              </Link>
            </div>
          </section>
        ) : null}

        {tab === "Rites" || tab === "Today" ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            {RITES.map((rite) => (
              <Link key={rite.id} to="/rite/$id" params={{ id: rite.id }} className="border border-paper/15 p-4 hover:border-lime/50">
                <p className="text-[12px] uppercase tracking-[0.14em]">{rite.title}</p>
                <p className="mt-2 font-mono text-[12px] normal-case text-paper/65">{rite.purpose}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-lime">{today[rite.key] ? "Sealed today" : rite.when}</p>
              </Link>
            ))}
            {UNINSTALLED.map((rite) => (
              <Link key={rite.id} to="/rite/$id" params={{ id: rite.id }} className="border border-paper/10 p-4 text-paper/60">
                <p className="text-[12px] uppercase tracking-[0.14em]">{rite.title}</p>
                <p className="mt-2 font-mono text-[12px] normal-case">{rite.line} Full text not installed.</p>
              </Link>
            ))}
            {house.map((doc) => (
              <Link key={doc.id} to="/rite/$id" params={{ id: doc.id }} className="border border-paper/15 p-4 hover:border-lime/50">
                <p className="text-[12px] uppercase tracking-[0.14em]">{doc.title}</p>
                <p className="mt-2 font-mono text-[12px] normal-case text-paper/65">{doc.locked ? `Locked. This text is for ${doc.accessTier}.` : doc.purpose}</p>
              </Link>
            ))}
          </section>
        ) : null}

        {tab === "Prayers" ? (
          <section className="mt-8 space-y-3">
            <p className="font-mono text-[12px] normal-case text-paper/70">The prayers of this house are the rites above and the codes you write yourself. Nothing here is a paraphrase of a rite we do not hold.</p>
            <Link to="/academy/codes" className="inline-flex text-[10px] uppercase tracking-[0.14em] text-lime">
              Open the Divine Codes
            </Link>
          </section>
        ) : null}

        {tab === "Sessions" ? (
          <section className="mt-8">
            <p className="font-mono text-[12px] normal-case text-paper/70">Guided audio that is actually published lives with the transmissions.</p>
            <Link to="/transmissions" className="mt-3 inline-flex text-[10px] uppercase tracking-[0.14em] text-lime">
              Open transmissions
            </Link>
          </section>
        ) : null}

        {tab === "Schedule" ? (
          <section className="mt-8">
            <p className="font-mono text-[12px] normal-case text-paper/70">
              Wake {schedule.wake}. Study {schedule.study}. Rest {schedule.bed}. {schedule.zone}. Reminders {schedule.reminders ? "on" : "off"}.
            </p>
            <Link to="/practice" className="mt-4 inline-flex bg-lime px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-ink">
              Build my schedule
            </Link>
          </section>
        ) : null}
      </section>
    </main>
  );
}
