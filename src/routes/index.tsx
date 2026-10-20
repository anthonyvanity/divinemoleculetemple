import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChamberHero, ChamberIcon, SentenceLines, TONE_CLASS, TONE_MUTED } from "@/components/chamber";
import { PublicHome } from "@/components/public-face";
import { ChamberStrip, MyTempleButton } from "@/components/site-shell";
import { AltarBlock, MembershipGrid, Newsletter } from "@/components/temple-blocks";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CHAMBERS } from "@/lib/temple-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const AUTO_MS = 5200;
const SLIDE_ORDER = [
  "temple",
  "divinism",
  "cos",
  "ceremonies",
  "initiation",
  "academy",
  "library",
  "nexus",
  "community",
] as const;
const SLIDES = SLIDE_ORDER.map((id) => CHAMBERS.find((card) => card.id === id)).filter((card) => card != null);

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

function Slides() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const desktop = useMedia("(min-width: 768px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");

  const go = useCallback((n: number) => {
    setI((n + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    const node = track.current;
    if (!header || !node) return;
    const apply = () => {
      const h = `${Math.round(header.getBoundingClientRect().height)}px`;
      node.style.setProperty("--header-h", h);
      document.documentElement.style.setProperty("--header-h", h);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!desktop || paused || reduce) return;
    const id = window.setInterval(() => go(i + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [desktop, paused, reduce, i, go]);

  useEffect(() => {
    const onGo = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const n = SLIDES.findIndex((c) => c.id === id);
      if (n >= 0) go(n);
    };
    window.addEventListener("temple:chamber", onGo);
    return () => window.removeEventListener("temple:chamber", onGo);
  }, [go]);

  const ink = SLIDES[i].tone === "ink";

  return (
    <div
      ref={track}
      className="relative h-[68dvh] min-h-[26rem] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        touchX.current = null;
        if (dx > 48) go(i - 1);
        else if (dx < -48) go(i + 1);
      }}
    >
      <div
        className={cn("flex h-full", !reduce && "transition-transform duration-500 ease-out")}
        style={{
          width: `${SLIDES.length * 100}%`,
          transform: `translate3d(-${(i * 100) / SLIDES.length}%, 0, 0)`,
        }}
      >
        {SLIDES.map((card) => (
          <article
            key={card.id}
            className={cn(
              "relative flex h-full shrink-0 flex-col items-center justify-center overflow-hidden px-14 text-center",
              TONE_CLASS[card.tone],
            )}
            style={{ width: `${100 / SLIDES.length}%` }}
          >
            <ChamberIcon
              name={card.icon}
              className="pointer-events-none absolute left-1/2 top-1/2 size-[78vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.02]"
            />
            <h2 className="relative max-w-[16ch] font-display text-[clamp(1.8rem,6vw,4.4rem)] uppercase leading-[0.88]">
              {card.title}
            </h2>
            <p
              className={cn(
                "relative mt-4 max-w-md font-mono text-[11px] font-normal normal-case leading-[1.5] sm:text-xs",
                TONE_MUTED[card.tone],
              )}
            >
              <SentenceLines text={card.d} />
            </p>
            <Button asChild className="relative mt-8" variant={card.tone === "ink" ? "lime" : "default"}>
              <Link to={card.to}>Enter</Link>
            </Button>
          </article>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(i - 1)}
        className={cn(
          "absolute left-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center",
          ink ? "text-paper" : "text-ink",
        )}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(i + 1)}
        className={cn(
          "absolute right-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center",
          ink ? "text-paper" : "text-ink",
        )}
      >
        <ChevronRight className="size-5" />
      </button>
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
        {SLIDES.map((card, n) => (
          <button
            key={card.id}
            type="button"
            aria-label={card.title}
            onClick={() => go(n)}
            className={cn(
              "size-2.5 rounded-full",
              n === i
                ? SLIDES[i].tone === "ink"
                  ? "bg-lime"
                  : "bg-ink"
                : SLIDES[i].tone === "ink"
                  ? "bg-paper/35"
                  : "bg-ink/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

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

      <div className="sticky top-[var(--header-h,11rem)] z-30">
        <ChamberStrip />
      </div>
      <div>
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-5 py-4 sm:px-8">
          <span className="font-sans text-[11px] font-light leading-[1.45] tracking-[0.16em] text-paper/80 sm:text-xs">
            <SentenceLines text="Consciousness. Connection. Sovereignty." />
          </span>
          <div className="flex flex-col items-end gap-2">
            <span className="max-w-[8.5rem] text-right font-sans text-[11px] font-light leading-snug tracking-[0.14em] text-gold sm:max-w-none">
              Los Angeles / Everywhere
            </span>
            <MyTempleButton />
          </div>
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
            <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10">
              <Link
                to="/academy"
                className="inline-flex h-8 items-center justify-center whitespace-normal px-1.5 text-center text-[9px] uppercase leading-tight tracking-[0.04em] text-ink bg-lime"
              >
                Academy
              </Link>
              <Link
                to="/sanctuary"
                className="inline-flex h-8 items-center justify-center whitespace-normal px-1.5 text-center text-[9px] uppercase leading-tight tracking-[0.04em] text-ink bg-paper"
              >
                Temple
              </Link>
              <Link
                to="/divinism"
                className="inline-flex h-8 items-center justify-center whitespace-normal border border-lime px-1.5 text-center text-[9px] uppercase leading-tight tracking-[0.04em] text-lime"
              >
                Divinism
              </Link>
            </div>
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

      <div id="chamber-slides" className="scroll-mt-[var(--header-h,7rem)]">
        <Slides />

        <div id="after-slides">
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
      </div>
    </main>
  );
}
