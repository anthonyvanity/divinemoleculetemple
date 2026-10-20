import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChamberHero } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { cashAppAmountUrl } from "@/lib/temple-content";
import { useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sessions")({ component: Sessions });

const SITTINGS = [
  { id: "30", label: "30 min", amount: 90, line: "Preparation and intention. A short sitting." },
  { id: "45", label: "45 min", amount: 120, line: "The journey, watched. Then the first integration." },
  { id: "60", label: "60 min", amount: 160, line: "The full path. Processing, integration, and journaling." },
] as const;

const HOURS = ["11:00", "13:00", "15:00", "17:00", "19:00"];

function monthGrid(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const start = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

function Sessions() {
  const [length, setLength] = useState<(typeof SITTINGS)[number]["id"]>("45");
  const [cursor, setCursor] = useState(() => new Date());
  const [day, setDay] = useState<number | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const path = useTemple((s) => s.path);
  const role = useTemple((s) => s.role);
  const canBook = role === "chancellor" || path === "initiate" || path === "patron";
  const sitting = SITTINGS.find((s) => s.id === length) ?? SITTINGS[1];
  const cells = useMemo(() => monthGrid(cursor), [cursor]);
  const label = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function book() {
    if (!canBook) return;
    if (!day || !hour) {
      toast.error("Choose a day and an hour.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Leave an email so the priest can answer.");
      return;
    }
    const when = `${label.split(" ")[0]} ${day} · ${hour}`;
    toast.success(`${sitting.label} held for ${name.trim() || "the seeker"} · ${when}.`);
    window.open(cashAppAmountUrl(sitting.amount), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="ink"
        icon="Flame"
        title="Guides"
        lede={`Psychointegration.
We are not therapists.
We are guides.`}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[11px] normal-case leading-relaxed text-paper/75">
          A sitting with a divine priest of the Temple. You name the intention. You sit in contemplation. The guide stays through the journey. Then processing, integration, and the journal. This is not therapy and not medicine. No one here is a doctor.
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            ["01", "Intention", "You say what you came to meet."],
            ["02", "Contemplation", "The room goes quiet before anything opens."],
            ["03", "The journey", "The guide watches. You are not left alone."],
            ["04", "Processing", "What moved is spoken while it is still warm."],
            ["05", "Integration", "It is set back into the life you return to."],
            ["06", "Journaling", "The hour is written down before you leave."],
          ].map(([n, title, line]) => (
            <li key={n} className="border border-paper/15 p-4">
              <p className="font-mono text-[10px] text-lime">{n}</p>
              <p className="mt-1 font-display uppercase">{title}</p>
              <p className="mt-2 font-mono text-[11px] normal-case text-paper/65">{line}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {SITTINGS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setLength(s.id)}
              className={cn(
                "border px-2 py-3 text-center",
                length === s.id ? "border-lime bg-lime text-ink" : "border-paper/20 text-paper hover:border-lime",
              )}
            >
              <span className="block font-display text-sm uppercase">{s.label}</span>
              <span className="mt-1 block font-mono text-[11px]">${s.amount}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] normal-case text-paper/70">{sitting.line}</p>

        <div className="relative mt-10">
          <div className={cn(!canBook && "pointer-events-none select-none")}>
        <div className="border border-paper/15 p-4">
          <div className="flex items-center justify-between">
            <button type="button" className="px-2 text-paper/60" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              Prev
            </button>
            <p className="font-display uppercase">{label}</p>
            <button type="button" className="px-2 text-paper/60" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              Next
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-paper/40">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={`${d}${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
              const past = date < today;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => setDay(d)}
                  className={cn(
                    "h-10 text-sm",
                    day === d ? "bg-lime text-ink" : "text-paper hover:bg-paper/10",
                    past && "text-paper/20",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHour(h)}
              className={cn(
                "border py-2 font-mono text-[11px]",
                hour === h ? "border-lime bg-lime text-ink" : "border-paper/20 hover:border-lime",
              )}
            >
              {h}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-14 border-2 border-paper/25 bg-transparent px-4 text-sm outline-none focus:border-lime"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="h-14 border-2 border-paper/25 bg-transparent px-4 text-sm outline-none focus:border-lime"
          />
        </div>

        <Button variant="lime" className="mt-6" onClick={book}>
          Hold {sitting.label} · ${sitting.amount}
        </Button>
        <p className="mt-2 font-mono text-[10px] normal-case text-paper/50">
          Cash App $DMTTEMPLE. The priest confirms the hour after the offering.
        </p>
          </div>
          {canBook ? null : (
            <div className="absolute inset-0 grid place-items-center bg-ink/80 px-6 text-center">
              <div className="text-paper">
                <Lock className="mx-auto size-8 text-paper" strokeWidth={1.5} />
                <p className="mt-4 font-display text-xl uppercase leading-tight text-paper">
                  Only an Initiate can book a session.
                </p>
                <Link to="/gates" className="mt-5 inline-flex h-11 items-center bg-lime px-5 text-[11px] uppercase tracking-wide text-ink">
                  Open the gate
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
