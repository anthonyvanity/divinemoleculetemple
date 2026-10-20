import { createFileRoute, Link } from "@tanstack/react-router";
import { ChamberHero } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/temple-content";

export const Route = createFileRoute("/housing")({ component: Housing });

function Housing() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="orange"
        icon="Home"
        title="Housing"
        lede={`A supervised sanctuary
for artists coming off the street
and out of the spiral.`}
      />
      <section className="mx-auto max-w-3xl space-y-5 px-4 py-12 font-mono text-[12px] normal-case leading-relaxed text-paper/75 sm:px-6">
        <p>
          The Temple keeps a house for LGBTQIA+ artists in recovery from homelessness and addiction. Hollywood. Eight to ten adults. Sober. Supervised. A bridge between emergency survival and a working creative life.
        </p>
        <p>
          Stabilization is a bed, a rule, and a person who answers. The curriculum is small-group work: artistic discipline set beside the spiritual recovery of this house. It is not a clinic. It is not a shelter lottery.
        </p>
        <p>
          Partners who fund the lease may pay the landlord directly, so housing money stays housing money. Proposals for that grant go through Contact, on the housing lane.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild variant="lime">
            <Link to="/contact">Send a housing proposal</Link>
          </Button>
          <Button asChild variant="dark">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
