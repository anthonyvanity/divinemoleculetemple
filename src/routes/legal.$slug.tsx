import { createFileRoute, notFound } from "@tanstack/react-router";
import { Popup } from "@/components/popup";

export const Route = createFileRoute("/legal/$slug")({ component: Legal });

const PAGES: Record<string, { title: string; body: string[] }> = {
  accessibility: {
    title: "Accessibility Statement",
    body: [
      "The Divine Molecule Temple is committed to making this digital sanctuary usable by as many seekers as possible.",
      "We aim to meet WCAG 2.2 AA for color contrast, keyboard access, and screen-reader structure. If a chamber, rite, or tool blocks you, write contact@dmttemple.com and we will restore the path.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "This site stores membership locally in your browser. We do not sell lists, and we do not run a surveillance church.",
      "If you write us, we keep only what is needed to answer. Cash App donations are processed by Cash App, not by the Temple.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "Use of this sanctuary is at your own risk and in your own sovereignty. Teaching is offered as doctrine, not as medical, legal, or psychiatric advice.",
      "The Divine Molecule Temple and the Divine Molecule Trust reserve all rights in all densities, timelines, and realities. Do not scrape, clone, or misrepresent this house.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "Donations and offerings to the Divine Molecule Trust are gifts unless a specific program states otherwise in writing.",
      "If a paid session is cancelled by the Temple, the offering is returned. If you cancel, write contact@dmttemple.com and we will review in good faith.",
    ],
  },
};

function Legal() {
  const { slug } = Route.useParams();
  const page = PAGES[slug];
  if (!page) throw notFound();

  return (
    <Popup>
      <article className="mx-auto max-w-2xl border border-lime/40 bg-ink p-8 text-paper">
        <p className="text-[11px] uppercase tracking-[0.22em] text-lime">Legal</p>
        <h1 className="mt-4 font-display text-title uppercase">{page.title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-paper">
          {page.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
    </Popup>
  );
}
