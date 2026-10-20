import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChamberHero } from "@/components/chamber";
import { SYNTHETIC_CHAPTERS } from "@/lib/canon";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/academy/synthetic")({ component: Synthetic });

function Synthetic() {
  const paid = useTemple((s) => s.paid);
  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="orange"
        icon="Atom"
        kicker="Faculty of Consciousness"
        title={`Synthetic mind,
divine molecule.`}
        lede={`An in-depth guide
through culture, art,
science, and humanity.`}
      />
      {paid ? (
      <section className="mx-auto max-w-3xl space-y-5 px-4 py-16 sm:px-6">
        <p className="text-paper/75">
          Required science of the sacrament. History, psychopharmacology, law, philosophy, art, and the
          modern vessel of practice. This is not a pamphlet. It is how the molecule is studied as culture
          and as consciousness engineering.
        </p>
        <p className="text-sm text-paper/55">Twelve chapters. The full treatise is held as a PDF of the house.</p>
        <ol className="space-y-2">
          {SYNTHETIC_CHAPTERS.map((c, i) => (
            <li key={c} className="border-b border-paper/10 pb-2 text-sm text-paper/75">
              {i + 1}. {c}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-6">
          <Button asChild variant="lime">
            <a href="/synthetic-mind.pdf" target="_blank" rel="noreferrer">
              Open the treatise →
            </a>
          </Button>
          <Button asChild variant="dark">
            <Link to="/academy">Return to the Academy</Link>
          </Button>
        </div>
      </section>
      ) : (
        <p className="mx-auto max-w-3xl px-4 py-10 text-sm uppercase tracking-wide text-paper/60">
          The title is public. The treatise opens with a paid membership.
        </p>
      )}
    </main>
  );
}
