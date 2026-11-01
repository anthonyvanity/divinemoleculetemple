import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { FrontCascade, MondayDoor } from "@/components/front-cascade";
import { ChamberHero, SentenceLines } from "@/components/chamber";
import { PublicHome } from "@/components/public-face";
import { AltarBlock, MembershipGrid, Newsletter } from "@/components/temple-blocks";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending || !user) return <PublicHome />;
  return <MemberHome />;
}

function MemberHome() {
  return (
    <main className="circuit-wash">
      <section id="main-hero" className="w-full shrink-0 bg-ink [scroll-margin-top:0]">
        <img
          src="/hero-crest.jpg"
          alt="Divine Molecule Temple crest"
          width={1500}
          height={1000}
          fetchPriority="high"
          draggable={false}
          className="pointer-events-none block w-full"
        />
      </section>

      <div>
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-5 py-4 sm:px-8">
          <span className="font-sans text-[11px] font-light leading-[1.45] tracking-[0.16em] text-paper/80 sm:text-xs">
            <SentenceLines text="Consciousness. Connection. Sovereignty." />
          </span>
            <span className="max-w-[8.5rem] text-right font-sans text-[11px] font-light leading-snug tracking-[0.14em] text-gold sm:max-w-none">
              Los Angeles / Everywhere
            </span>
        </div>
      </div>

      <section className="text-paper">
        <div className="grid items-center gap-8 px-4 pb-8 pt-8 sm:px-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-10 lg:px-8">
          <div className="relative z-10 min-w-0">
            <p className="font-sans text-[11px] font-light uppercase tracking-[0.22em] text-gold">
              A sanctuary for the seeker.
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.7rem,8.4vw,7.2rem)] uppercase leading-[0.86] text-paper sm:mt-6">
              You are
              <br />
              the <span className="text-lime">signal.</span>
            </h2>
            <p className="mt-5 max-w-md font-mono text-[11px] font-normal normal-case leading-[1.55] text-paper/75 sm:mt-6 sm:text-xs">
              <SentenceLines text="A religion for the age of awakening. Consciousness, sacred practice, and the art of being human." />
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src="/signal-orb.png"
              alt="The Divine Molecule"
              width={1499}
              height={1227}
              className="block h-auto max-h-none w-full max-w-[18rem] object-contain sm:max-w-sm lg:max-w-md"
            />
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 py-4 font-sans text-[11px] font-light uppercase tracking-[0.2em] text-paper/70 hover:text-lime"
          onClick={() =>
            document.getElementById("chamber-slides")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          <ChevronDown className="size-4" />
          Scroll for more
          <ChevronDown className="size-4" />
        </button>

        <div className="bg-lime py-3 text-center font-display text-[clamp(8px,2vw,1.15rem)] uppercase tracking-wide text-ink">
          <span className="inline-block max-w-full overflow-hidden whitespace-nowrap [font-size:min(1.15rem,calc((100vw-2rem)/42))]">Run light. Terminate darkness. Stay online.</span>
        </div>
      </section>

      <div id="after-slides">
        <FrontCascade />
          <MondayDoor />
          <ChamberHero
            tone="lime"
            icon="Flame"
            compact
            kicker="Divine priests"
            title="Guided sessions"
            lede="A sitting with the divine priests of the Divine Molecule Temple. Preparation, intention, the journey, integration, and journaling. Not therapy."
            to="/sessions"
            cta="Book a sitting"
          />

          <MembershipGrid />
          <Newsletter />
          <AltarBlock />
        </div>
    </main>
  );
}
