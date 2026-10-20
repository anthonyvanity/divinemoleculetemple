import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AWAKENING } from "@/lib/temple-content";
import { sealAwakeningDay } from "@/lib/temple-data";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/awakening")({ component: Awakening });

function Awakening() {
  const awakening = useTemple((s) => s.awakening);
  const path = useTemple((s) => s.path);
  const sealDay = useTemple((s) => s.sealDay);
  const { user } = useCurrentUserState();
  const [index, setIndex] = useState<number | null>(null);
  const open = AWAKENING.findIndex((d) => !awakening.includes(d.id));
  const at = index ?? (open === -1 ? AWAKENING.length - 1 : open);
  const day = AWAKENING[at];
  const last = at === AWAKENING.length - 1;
  const paid = path === "initiate" || path === "patron" || path === "priestline" || path === "elder";
  const nextDoor = paid ? "/academy" : user ? "/ascend?gate=initiate" : "/register?gate=initiate";

  function seal(id: string) {
    if (awakening.includes(id)) return;
    sealDay(id);
    void sealAwakeningDay({ data: id }).catch(() => {});
  }

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-5 py-16">
        <p className="text-[12px] tracking-[0.28em] text-lime">DAY {day.day}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-paper/70">{day.module}:</p>
        <h1 className="mt-1 font-sans text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">{day.title}</h1>
        <p className="mt-8 text-[15px] leading-relaxed text-paper/70">Lesson Outcome:</p>
        <p className="mt-1 text-[16px] leading-relaxed">{day.outcome}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-paper/70">Practice:</p>
        <ul className="mt-1 space-y-1 text-[16px] leading-relaxed">
          {day.practice.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-8 text-[16px] leading-relaxed text-paper/80">{day.note}</p>
        <div className="mt-14 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous day"
            disabled={at === 0}
            onClick={() => setIndex(at - 1)}
            className="grid size-10 place-items-center border border-lime text-lime disabled:opacity-20"
          >
            <ChevronLeft className="size-5" />
          </button>
          {last ? (
            <a
              href={nextDoor}
              aria-label="Next"
              onClick={() => seal(day.id)}
              className="grid size-10 place-items-center bg-lime text-ink"
            >
              <ChevronRight className="size-5" />
            </a>
          ) : (
            <button
              type="button"
              aria-label="Next day"
              onClick={() => {
                seal(day.id);
                setIndex(at + 1);
              }}
              className="grid size-10 place-items-center bg-lime text-ink"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
