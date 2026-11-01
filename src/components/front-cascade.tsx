import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Door = {
  id: string;
  tone: string;
  mark: string;
  kicker: string;
  title: string;
  line: string;
  cta: string;
  heading: string;
  paragraphs: string[];
  links: { to: "/sanctuary" | "/divinism" | "/cos" | "/nexus" | "/register" | "/academy" | "/gates"; label: string }[];
};

const DOORS: Door[] = [
  {
    id: "temple",
    tone: "bg-lime",
    mark: "text-lime",
    kicker: "The Temple",
    title: "Consciousness. Connection. Sovereignty.",
    line: "A religion for the age of awakening.",
    cta: "Explore the Temple",
    heading: "The Divine Molecule Temple",
    paragraphs: [
      "Welcome to the Divine Molecule Temple, the spiritual home of Divinism: a religion of consciousness, divine connection, personal sovereignty, and truth beyond convention.",
      "We believe awakening is a responsibility: question reality, examine belief, reclaim authority, and seek God directly.",
      "Ancient mysticism meets modern philosophy. Sacred ritual meets symbolic systems. Spiritual education becomes disciplined study.",
      "We are a temple, an academy, and a congregation.",
      "The Divine Molecule Temple is a religious community devoted to worship, study, fellowship, service, and the disciplined pursuit of understanding. You do not need all the answers. You need the courage to ask better questions, and the discipline to follow them further.",
    ],
    links: [
      { to: "/sanctuary", label: "Explore the Temple" },
      { to: "/divinism", label: "Discover Divinism" },
    ],
  },
  {
    id: "cos",
    tone: "bg-lilac",
    mark: "text-lilac",
    kicker: "The COS",
    title: "Decrypt the unseen.",
    line: "A living framework for the hidden architecture of reality.",
    cta: "Explore the COS",
    heading: "The Cosmic Operating System",
    paragraphs: [
      "The Cosmic Operating System is the Temple’s deepest field of exploration: a living framework for entering the hidden architecture of reality.",
      "It gives language to the impossible. The glitches, transmissions, synchronicities, altered states, recurring symbols, and moments when the surface of existence suddenly reveals its machinery.",
      "The COS connects consciousness, perception, belief, sovereignty, ritual, and the forces that shape the world behind the visible world.",
      "It is not a metaphor to admire from a distance. It is a system to study, test, navigate, and apply.",
      "Through the Academy, initiates learn to read the interfaces of experience, identify the programs running beneath inherited reality, and recover the authority to operate from a deeper level of awareness.",
      "The COS is where metaphysics becomes operational. Where revelation becomes structure. Where the unseen becomes readable.",
    ],
    links: [{ to: "/cos", label: "Explore the COS" }],
  },
  {
    id: "divinism",
    tone: "bg-cyan",
    mark: "text-cyan",
    kicker: "Divinism",
    title: "The divine is not distant.",
    line: "Consciousness is sacred. The human spirit is sovereign.",
    cta: "Discover Divinism",
    heading: "What is Divinism?",
    paragraphs: [
      "Divinism teaches that consciousness is sacred and that the human spirit is sovereign.",
      "Our relationship with God is not confined to institutions, inherited interpretations, or ordinary perception.",
      "Through prayer, philosophy, symbolism, ritual, sacred law, and the study of consciousness, we seek to understand what is true.",
      "Faith begins the journey. Discernment keeps you on it.",
    ],
    links: [{ to: "/divinism", label: "Discover Divinism" }],
  },
  {
    id: "academy",
    tone: "bg-orange",
    mark: "text-orange",
    kicker: "The Academy",
    title: "Decryption is required.",
    line: "Metaphysical engineering. Not a vibe course.",
    cta: "Review the Academy",
    heading: "The Scholarship of the Enlightened",
    paragraphs: [
      "The Academy is the educational body of the Divine Molecule Temple. It exists to teach Divinism, consciousness studies, symbolic literacy, integration, ritual theory, sacred law, and the Cosmic Operating System.",
      "We do not offer belief systems. We provide decryption manuals.",
      "The Academy houses a rigorous curriculum engineered for those who seek to understand the structural logic behind existence. It is a metaphysical engineering program, not a vibe course.",
      "Visitors may review the structure and purpose of study. Full lessons, coursework, transmissions, and internal materials are reserved for members walking the Initiate Path.",
      "The curriculum begins with foundational instruction and advances through disciplined study, applied integration, symbolic analysis, ritual theory, sacred law, and deeper engagement with the COS.",
      "Enlightenment is not a personality trait. Understanding requires training.",
    ],
    links: [
      { to: "/academy", label: "Review the Academy" },
      { to: "/gates", label: "Begin the Initiate path" },
    ],
  },
  {
    id: "nexus",
    tone: "bg-pink",
    mark: "text-pink",
    kicker: "The Nexxus",
    title: "You were never meant to search alone.",
    line: "Study, reflection, conversation, and connection.",
    cta: "Meet the congregation",
    heading: "The Congregation",
    paragraphs: [
      "The Nexxus is the Temple’s digital congregation: a place for study, reflection, conversation, and connection.",
      "Bring your certainty. Bring your questions. Bring the experience you cannot explain.",
      "There is room for you here. Meaningful participation requires attention, discipline, and respect for the work.",
      "Your story is yours. Their story is sacred. The congregation is free. The covenant comes before the first post.",
    ],
    links: [
      { to: "/nexus", label: "Meet the congregation" },
      { to: "/register", label: "Join free" },
    ],
  },
];

export function FrontCascade() {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const onGo = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!DOORS.some((item) => item.id === id)) return;
      setOpen(id);
      document.getElementById(`door-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("temple:chamber", onGo);
    return () => window.removeEventListener("temple:chamber", onGo);
  }, []);

  return (
    <div id="chamber-slides" className="scroll-mt-[var(--header-h,7rem)] px-3 pt-4 sm:px-6">
      <ol className="mx-auto flex max-w-3xl flex-col gap-3">
        {DOORS.map((item, index) => {
          const shown = open === item.id;
          return (
            <li key={item.id} id={`door-${item.id}`} className="scroll-mt-28">
              <article className="overflow-hidden rounded-2xl bg-black">
                <div className={cn("relative px-5 py-6 transition-colors duration-300 sm:px-7 sm:py-8", shown ? cn(item.tone, "text-ink") : "text-paper")}>
                  {shown ? (
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setOpen(null)}
                      className="absolute right-3 top-3 z-20 grid size-11 place-items-center text-2xl leading-none text-ink"
                    >
                      ×
                    </button>
                  ) : null}
                  <p className={cn("text-[10px] uppercase tracking-[0.2em]", shown ? "pr-8 text-ink" : item.mark)}>
                    {String(index + 1).padStart(2, "0")} / {item.kicker}
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(1.7rem,5vw,2.8rem)] uppercase leading-[0.9]">{item.title}</h2>
                  <p className={cn("mt-3 max-w-xl font-sans text-[15px] leading-snug", shown ? "text-ink" : "text-paper/70")}>{item.line}</p>
                  {shown ? null : (
                    <button
                      type="button"
                      aria-expanded={false}
                      onClick={() => setOpen(item.id)}
                      className={cn("mt-5 inline-flex h-11 items-center px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink", item.tone)}
                    >
                      ↗ {item.cta}
                    </button>
                  )}
                </div>
                <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", shown ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="bg-black px-5 py-6 text-white sm:px-7 sm:py-8">
                      <h3 className="font-display text-2xl uppercase leading-[0.9]">{item.heading}</h3>
                      <div className="mt-4 space-y-4 font-mono text-[13px] normal-case leading-relaxed text-white/80">
                        {item.paragraphs.map((paragraph) =>
                          paragraph === paragraph.toUpperCase() ? (
                            <p key={paragraph} className="pt-2 font-display text-sm uppercase tracking-wide text-white">
                              {paragraph}
                            </p>
                          ) : (
                            <p key={paragraph}>{paragraph}</p>
                          ),
                        )}
                      </div>
                      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
                        Run light. Terminate darkness. Stay online.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.links.map((link) => (
                          <Link key={link.label} to={link.to} className="inline-flex h-10 items-center bg-[#c6ff00] px-3 text-[10px] uppercase tracking-[0.12em] text-black">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function MondayDoor() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function play() {
    setPlaying(true);
    const node = videoRef.current;
    if (!node) return;
    node.controls = true;
    void node.play();
  }

  return (
    <div className="mt-3 px-3 sm:px-6">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black">
        <div className={cn("relative px-5 py-6 transition-colors duration-300 sm:px-7 sm:py-8", open ? "bg-gold text-ink" : "text-paper")}>
          {open ? (
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-20 grid size-11 place-items-center text-2xl leading-none text-ink"
            >
              ×
            </button>
          ) : null}
          <p className={cn("text-[10px] uppercase tracking-[0.2em]", open ? "pr-8 text-ink" : "text-gold")}>06 / Meet the chancellor</p>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,5vw,2.8rem)] uppercase leading-[0.9]">Meet Mønday,</h2>
          <p className={cn("mt-3 max-w-xl font-sans text-[15px] leading-snug", open ? "text-ink" : "text-paper/70")}>
            The temples chancellor
          </p>
          {open ? null : (
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex h-11 items-center bg-gold px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink"
            >
              ↗ Watch the transmission
            </button>
          )}
        </div>
        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="bg-black text-white">
              <div className="group relative">
                <video
                  ref={videoRef}
                  src="/monday-manifesto.mp4"
                  poster="/monday-manifesto.jpg"
                  playsInline
                  preload="none"
                  className="block w-full bg-black"
                  onPlay={() => setPlaying(true)}
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-black/55 transition-opacity duration-300",
                    playing ? "pointer-events-none opacity-0" : "opacity-80 group-hover:opacity-30",
                  )}
                />
                {!playing ? (
                  <button
                    type="button"
                    aria-label="Play the manifesto of Chancellor Monday"
                    onClick={play}
                    className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink opacity-70 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <Play className="size-6 translate-x-0.5 fill-current" />
                  </button>
                ) : null}
              </div>
              <p className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold sm:px-7">
                The manifesto of chancellor Monday
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function InviteDoor() {
  return (
    <div className="mt-3 px-3 pb-8 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-2xl bg-[#ececec] px-5 py-7 text-black sm:px-8 sm:py-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">07 / The invitation</p>
        <h2 className="mt-4 font-display text-[clamp(2.1rem,6vw,3.2rem)] uppercase leading-[0.9]">
          The Temple is free
          <br />
          to enter.
        </h2>
        <p className="mt-5 max-w-md font-sans text-[18px] normal-case leading-snug">
          Create your account.
          <br />
          Find your place.
          <br />
          Discover what's waiting beyond the first door.
        </p>
        <Link
          to="/register"
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-[15px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          Sign up free <span aria-hidden>↗</span>
        </Link>
        <p className="mt-5 text-center text-[15px] normal-case text-black/45">
          Already a member?{" "}
          <Link to="/login" className="text-black/70 underline underline-offset-2">
            Sign in.
          </Link>
        </p>
      </article>
    </div>
  );
}
