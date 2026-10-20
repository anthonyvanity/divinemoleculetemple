import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChamberHero } from "@/components/chamber";
import { PRINCIPLES } from "@/lib/temple-content";

export const Route = createFileRoute("/divinism")({ component: Divinism });

const NEON = ["border-lime text-lime", "border-orange text-orange", "border-cyan text-cyan", "border-pink text-pink"];

function NeonBox({ index, children, className }: { index: number; children: ReactNode; className?: string }) {
  return (
    <article className={`border p-6 ${NEON[index % NEON.length]} ${className ?? ""}`}>
      {children}
    </article>
  );
}

function Divinism() {
  return (
    <main className="page-pink">
      <ChamberHero
        tone="pink"
        icon="Flame"
        title="Divinism"
        titleClassName="text-[clamp(3.4rem,16vw,7rem)] leading-[0.82]"
        lede={`Reason and wonder
belong at the same table.
The spiritual path
of the Divine Molecule Temple.
Consciousness, sovereignty,
and the choices that follow.`}
      />
      <section className="bg-ink px-4 py-20 text-paper">
        <div className="mx-auto grid max-w-3xl gap-4 font-mono text-[12px] normal-case leading-relaxed">
          <NeonBox index={0}>
            <h2 className="font-display text-2xl uppercase">
              The sacred flame
              <span className="flame-caret" aria-hidden />
            </h2>
            <p className="mt-4 opacity-80">
              The Sacred Flame is the Temple’s central symbol for the living presence of Divine consciousness within the human being: the capacity to perceive, choose, create, love, refuse corruption, and return to alignment.
            </p>
            <p className="mt-3 opacity-80">
              The Flame is not permission to believe every thought. It is the responsibility to examine what shapes the self and to choose more consciously.
            </p>
          </NeonBox>
          <NeonBox index={1}>
            <h2 className="font-display text-2xl uppercase">What Divinism teaches</h2>
            <ul className="mt-4 space-y-2 opacity-80">
              {[
                "Consciousness is worthy of sacred study.",
                "Spiritual freedom requires discernment and responsibility.",
                "Reason and mystical experience need not be enemies.",
                "Ritual is meaningful when joined with intention, ethics, and integration.",
                "No institution should replace a person’s relationship with the Divine.",
                "Knowledge becomes wisdom through contemplation and practice.",
                "Sanctuary becomes sacred when it becomes service.",
              ].map((line) => (
                <li key={line}>◆ {line}</li>
              ))}
            </ul>
          </NeonBox>
          <NeonBox index={2}>
            <h2 className="font-display text-2xl uppercase">A path, not a demand</h2>
            <p className="mt-4 opacity-80">
              Divinism offers study, prayer, contemplation, ritual, creative expression, community, and service. It does not require the abandonment of prior faith, cultural identity, science, or critical thought.
            </p>
            <p className="mt-3 opacity-80">
              The path asks a simpler question: What becomes possible when you approach consciousness as sacred — and your choices as consequential?
            </p>
          </NeonBox>
        </div>
        <div className="mx-auto mt-4 max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <NeonBox key={p.title} index={i + 3}>
                <h2 className="font-display text-xl">{p.title}</h2>
                <p className="mt-3 opacity-80">{p.body}</p>
              </NeonBox>
            ))}
          </div>
          <NeonBox index={7} className="mx-auto mt-4 max-w-3xl">
            <h2 className="font-display text-2xl uppercase">What you actually do</h2>
            <p className="mt-4 opacity-80">Day. Ten quiet minutes. Name the signal. Name the noise. One line in the journal.</p>
            <p className="mt-3 opacity-80">Week. The Nexus. One true thing about the week, and one reply to someone else. That is the congregation.</p>
            <p className="mt-3 opacity-80">The Academy is the school, $33 a month, until you cancel. It is not required to practice, and the practice is not required to enroll.</p>
          </NeonBox>
          <NeonBox index={8} className="mx-auto mt-4 max-w-3xl">
            <h2 className="font-display text-2xl uppercase">A religion for the age of awakening</h2>
            <p className="mt-4 opacity-80">
              For generations people have searched through churches, temples, science, philosophy, meditation, psychology, and personal experience. Every path carried a fragment. None held the whole picture.
            </p>
            <p className="mt-3 opacity-80">
              Divinism continues that search. We are a spiritual community dedicated to self-discovery, personal sovereignty, expanded consciousness, and the pursuit of truth wherever it may be found — including in mathematics, in silence, and in the operator who refuses to be overwritten.
            </p>
            <p className="mt-3 opacity-80">Not through fear. Through awareness, responsibility, curiosity, and love.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="lime" className="h-8 min-h-0 px-3 text-[10px]">
                <a href="/register?gate=initiate">Academy · $33/mo</a>
              </Button>
              <Button asChild variant="dark">
                <Link to="/nexus">The congregation</Link>
              </Button>
              <Button asChild variant="dark">
                <Link to="/cos">Read the Cosmic Operating System</Link>
              </Button>
            </div>
          </NeonBox>
        </div>
      </section>
    </main>
  );
}
