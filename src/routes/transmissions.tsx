import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Newsletter } from "@/components/temple-blocks";
import { useRadio } from "@/lib/radio-store";

export const Route = createFileRoute("/transmissions")({ component: Transmissions });

function Transmissions() {
  const tracks = useRadio((s) => s.tracks);
  const index = useRadio((s) => s.index);
  const playing = useRadio((s) => s.playing);
  const playAt = useRadio((s) => s.playAt);
  const toggle = useRadio((s) => s.toggle);

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="ink"
        icon="Radio"
        kicker="Transmissions"
        title="The voice of the Temple"
        lede={`Podcasts, speeches,
meditations, and the archive.
Start a signal.
It does not drop.`}
      />

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionKicker>All transmissions</SectionKicker>
          <div className="mt-10 grid gap-0 border border-paper/15 md:grid-cols-2">
            {tracks.map((t, i) => {
              const on = index === i && playing;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => (index === i ? toggle() : playAt(i))}
                  className="flex items-center justify-between border-b border-paper/15 p-5 text-left hover:bg-paper/5 md:odd:border-r"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="grid size-12 place-items-center border border-orange text-orange">
                      {on ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="text-micro tracking-wide text-orange">
                        {t.path} · {t.length}
                      </span>
                      <span className="mt-1 block truncate font-display">{t.title}</span>
                    </span>
                  </span>
                  <span className="text-micro tracking-wide text-paper/40">{on ? "Live" : "Play"}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-paper/50">
            The bar at the top of the screen holds the signal when you leave this chamber.
          </p>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
