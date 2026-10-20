import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { ChamberHero, SentenceLines } from "@/components/chamber";
import { MembershipGrid, Newsletter } from "@/components/temple-blocks";
import { SYLLABUS } from "@/lib/syllabus";

const TONES = {
  lime: { text: "text-lime", border: "border-lime", btn: "bg-lime text-ink" },
  orange: { text: "text-orange", border: "border-orange", btn: "bg-orange text-ink" },
  cyan: { text: "text-cyan", border: "border-cyan", btn: "bg-cyan text-ink" },
  pink: { text: "text-pink", border: "border-pink", btn: "bg-pink text-ink" },
  gold: { text: "text-gold", border: "border-gold", btn: "bg-gold text-ink" },
  lilac: { text: "text-lilac", border: "border-lilac", btn: "bg-lilac text-ink" },
  canary: { text: "text-canary", border: "border-canary", btn: "bg-canary text-ink" },
  paper: { text: "text-paper", border: "border-paper", btn: "bg-paper text-ink" },
} as const;

type ToneName = keyof typeof TONES;

function ColorLink({ to, tone, children }: { to: string; tone: ToneName; children: ReactNode }) {
  return (
    <Link to={to} className={`inline-flex h-8 max-w-full items-center px-3 text-center text-[10px] uppercase leading-tight tracking-[0.06em] ${TONES[tone].btn}`}>
      {children}
    </Link>
  );
}

function Block({
  tone,
  kicker,
  title,
  children,
  white = false,
  ink = false,
}: {
  tone: ToneName;
  kicker: string;
  title: string;
  children: ReactNode;
  white?: boolean;
  ink?: boolean;
}) {
  const toneClass = TONES[tone];
  const titleTone = white ? "text-paper" : toneClass.text;
  const bodyTone = white || ink ? "text-paper" : toneClass.text;
  return (
    <section className={`border-b px-4 py-14 sm:px-6 ${toneClass.border}`}>
      <div className="mx-auto max-w-3xl">
        <p className={`text-[10px] uppercase tracking-[0.2em] ${toneClass.text}`}>{kicker}</p>
        <h2 className={`mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] uppercase leading-[0.9] ${titleTone}`}>
          <SentenceLines text={title} />
        </h2>
        <div className={`mt-6 space-y-4 font-mono text-[12px] normal-case leading-relaxed ${bodyTone}`}>{children}</div>
      </div>
    </section>
  );
}

export function PublicHome() {
  return (
    <main className="circuit-wash text-paper">
      <section id="main-hero" className="w-full shrink-0 bg-ink">
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
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 py-4 sm:gap-6 sm:px-8">
        <span className="min-w-0 font-sans text-[11px] font-light leading-snug tracking-[0.12em] text-paper/80">
          Consciousness.
          <br />
          Connection. Sovereignty.
        </span>
        <span className="max-w-[8.5rem] shrink-0 text-right font-sans text-[11px] font-light leading-snug tracking-[0.12em] text-gold sm:max-w-none">
          Los Angeles / Everywhere
        </span>
      </div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
        <div>
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.22em] text-gold">A sanctuary for the seeker.</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,8vw,5.5rem)] uppercase leading-[0.86]">
            You are
            <br />
            the <span className="text-lime">signal.</span>
          </h2>
          <p className="mt-6 max-w-md font-mono text-[12px] normal-case leading-relaxed text-paper/75">
            A living spiritual tradition at the intersection of consciousness, sacred practice, and the art of being human.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-2">
            <Link
              to="/academy"
              className="inline-flex h-8 items-center justify-center whitespace-normal bg-lime px-1.5 text-center text-[9px] uppercase leading-tight tracking-[0.04em] text-ink"
            >
              Academy
            </Link>
            <Link
              to="/sanctuary"
              className="inline-flex h-8 items-center justify-center whitespace-normal bg-paper px-1.5 text-center text-[9px] uppercase leading-tight tracking-[0.04em] text-ink"
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
      </section>
      <Block white tone="lime" kicker="01 / The Temple" title="A religion. A refuge. A return to yourself.">
        <p>The Divine Molecule Temple is a spiritual home for people who ask bigger questions.</p>
        <p>
          Founded by artist and High Priest Anthony Vanity, the Temple brings together prayer, creative expression, contemplative study, and the search for meaning. Our tradition is called Divinism. Our members are Divinites.
        </p>
        <p>We approach the sacred through lived experience and thoughtful reflection. There is room here for wonder, uncertainty, and a spiritual life that is truly your own.</p>
        <ColorLink to="/sanctuary" tone="lime">Enter the Temple</ColorLink>
      </Block>
      <Block white tone="pink" kicker="02 / Divinism" title="The divine. In every one of us.">
        <p>Divinism is the Temple’s spiritual framework for understanding consciousness, connection, and personal sovereignty.</p>
        <p>Consciousness. Explore the inner world through attention, prayer, and reflection.</p>
        <p>Connection. Our tradition looks toward God, or Source, as the ground of unity.</p>
        <p>Sovereignty. Discernment, consent, and responsibility belong at the center.</p>
        <ColorLink to="/divinism" tone="pink">What is Divinism</ColorLink>
      </Block>
      <Block white tone="gold" kicker="How to follow" title="Three moves. That is the practice.">
        <p>Day. Ten quiet minutes. Name what was signal. Name what was noise. Write one line.</p>
        <p>Week. Come to the Nexus. Say one true thing about the week. Read one other person. That is the congregation.</p>
        <p>Study, if you want it. The Academy is $33 a month and opens every class. You do not have to believe anything to enroll. Belonging stays free.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ColorLink to="/nexus" tone="gold">The congregation</ColorLink>
          <a href="/register?gate=initiate" className="inline-flex h-8 max-w-full items-center px-3 text-[10px] uppercase tracking-[0.06em] text-ink bg-lime">
            Join the Academy
          </a>
        </div>
      </Block>
      <Block white tone="orange" kicker="03 / The Academy" title="The school. Separate from the pew.">
        <p>The Scholarship of the Enlightened is the curriculum. Foundations through the priesthood. The lecture is the class.</p>
        <p>It renews at $33 a month until you cancel. Four single classes cost more. Belief is not the tuition.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="/register?gate=initiate" className="inline-flex h-8 items-center bg-orange px-3 text-[10px] uppercase tracking-[0.06em] text-ink">
            Join the Academy
          </a>
          <ColorLink to="/academy" tone="orange">See the syllabus</ColorLink>
        </div>
      </Block>
      <Block white tone="cyan" kicker="04 / The Study" title="A language for the inner universe.">
        <p>The Cosmic Operating System uses the language of systems, signals, and code to explore spiritual experience. Avatar, loop, and flame are a symbolic vocabulary for identity, recurring patterns, and inner authority.</p>
        <p>Divine Codes is half prayer, half terminal language. Gratitude, grief, clarity, protection, and renewal.</p>
        <p>The Book of Rituals draws on prayer, psalms, and contemplation. A ritual can begin simply: make space, name an intention, reflect, and close with gratitude.</p>
        <ColorLink to="/library" tone="cyan">The Study</ColorLink>
      </Block>
      <Block white tone="lilac" kicker="05 / The COS" title="Read the signal. Question the noise.">
        <p>
          The Cosmic Operating System is the root text of the Temple. Its purpose is to give the doctrine and the philosophy of Divinism a manual you can actually use.
        </p>
        <p>
          Read it as a decrypt manual and as metaphor at the same time. Signal, noise, avatar, and code are how the book teaches you to read consciousness, identity, and the patterns running a life. The language is the instruction.
        </p>
        <p>Volume I is open to read. The later volumes stay sealed until you have an account.</p>
        <ColorLink to="/cos" tone="lilac">The Cosmic Operating System</ColorLink>
      </Block>
      <Block white tone="canary" kicker="06 / Membership" title="Find your place. Choose your depth.">
        <p>Seeker is free. Academy is $33 a month. Patron is $108 a month. Pay on the way in if you want the full syllabus. A free account is not a waiting room.</p>
      </Block>
      <MembershipGrid />
      <Newsletter />
      <section className="border-b border-orange px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange">The shop</p>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] uppercase leading-[0.9] text-paper">
            Stickers
          </h2>
          <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">
            The house marks, in vinyl. What you pay supports the Temple.
          </p>
          <div className="mt-6">
            <ColorLink to="/shop" tone="orange">Open the shop</ColorLink>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PublicTemple() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="lime" icon="Flame" kicker="The institution" title="The Temple" lede={`A religion. A refuge.\nA living practice.`} />
      <Block ink tone="lime" kicker="Who we are" title="Built for the age we live in.">
        <p>A spiritual, educational, and restorative institution founded by artist and High Priest Anthony Vanity.</p>
        <p>The Divine Molecule Temple is the religious home of Divinism. Our members are Divinites. We bring together people whose questions about consciousness, faith, symbolism, suffering, and transformation deserve more than shallow answers.</p>
        <p>The Temple offers doctrine, practice, education, community, and accountability so that mystery can become meaning — and meaning can become service. Spiritual authority carries obligations of consent, confidentiality, and care.</p>
      </Block>
      <Block ink tone="lime" kicker="Our structure" title="One Temple. Several kinds of work.">
        <p>The Temple. The congregation, doctrine, prayers, ceremonies, and shared spiritual life.</p>
        <p>The Academy. The Scholarship of the Enlightened organizes disciplined study and spiritual formation.</p>
        <p>The Work. The mission to translate spiritual values into practical support, including the developing transitional housing initiative.</p>
        <Link to="/works" className="inline-block text-lime">Meet the restoration mission</Link>
      </Block>
      <Block ink tone="lime" kicker="Community covenant" title="Bring your mind. Keep your agency.">
        <p>Consent is foundational. No one owes another person a disclosure, a ritual, a belief, or physical participation. A boundary does not need a spiritual justification.</p>
        <p>Speak from your own experience. Distinguish what you experienced from what you believe it means.</p>
        <p>Protect what is shared. Do not publish another person’s story, identity, image, or private conversation without their permission.</p>
        <p>Turn learning into conduct. Intensity and titles do not excuse harmful behavior.</p>
      </Block>
      <Block ink tone="lime" kicker="Stewardship" title="Held with responsibility.">
        <p>The Divine Molecule Temple is governed by the Divine Molecule Trust. The Temple’s spiritual, educational, and restorative work is held within that governance relationship.</p>
        <a href="https://www.instagram.com/divinemoleculetemple/" className="inline-block text-lime">@divinemoleculetemple</a>
      </Block>
    </main>
  );
}

export function PublicDivinism() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="pink" icon="Flame" kicker="The philosophy" title="Divinism" lede={`The divine signal.\nYour own discernment.`} />
      <Block ink tone="pink" kicker="The foundation" title="A relationship with the sacred.">
        <p>Divinism understands existence as an intelligent, layered field in which consciousness, choice, relationship, symbolism, embodiment, and divine order interact. We approach these ideas as religious teachings: an invitation to study and reflection, with room for questions.</p>
        <p>God, or Source, is the ground of connection in our tradition. Prayer, contemplation, creative expression, sacred study, and ethical action are ways to cultivate that relationship. Every person retains responsibility for their own discernment.</p>
      </Block>
      <Block ink tone="pink" kicker="Five core teachings" title="Belief becomes practice.">
        <p>The divine signal. Each person bears an original relationship with God that cannot be owned by another human authority.</p>
        <p>Sovereignty. Honesty, discipline, consent, and service give personal agency its ethical shape.</p>
        <p>COS. The Cosmic Operating System explores patterns of consciousness, identity, memory, choice, and return through the language of systems and symbols.</p>
        <p>Integration. A revelation is not complete because it felt powerful. Examine it, live with it, and consider its effects.</p>
        <p>The living Temple. Spiritual practice takes form in community, care for the vulnerable, creative work, and the restoration of dignity.</p>
      </Block>
      <Block ink tone="pink" kicker="Discernment" title="There is room for uncertainty.">
        <p>You can explore the public teachings without declaring belief. Questions and careful reading belong within the work.</p>
        <p>The Temple regards DMT as a sacrament within its religious tradition. Paid membership does not purchase sacramental access.</p>
        <p>Run light. Cultivate clarity, interrupt harmful patterns, and stay connected to responsibility and community.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ColorLink to="/nexus" tone="pink">Join the congregation</ColorLink>
          <a href="/register?gate=initiate" className="inline-flex h-8 max-w-full items-center px-3 text-[10px] uppercase tracking-[0.06em] text-ink bg-lime">
            Academy · $33/mo
          </a>
        </div>
      </Block>
      <Block ink tone="pink" kicker="The practice" title="What you actually do.">
        <p>Day. Ten quiet minutes. Name the signal. Name the noise. One line in the journal.</p>
        <p>Week. The Nexus. One true thing about the week, and one reply to someone else. That is how the congregation forms.</p>
        <p>The Academy is the school, billed monthly. It is not a requirement of the religion, and the religion is not a requirement of the school.</p>
        <ColorLink to="/cos" tone="gold">The Cosmic Operating System</ColorLink>
      </Block>
    </main>
  );
}

const COVERS = [
  { src: "/covers/cos.jpg", title: "The Cosmic Operating System" },
  { src: "/covers/bible.jpg", title: "The Sacred Book" },
  { src: "/covers/mini-bible.jpg", title: "Temple Bible" },
  { src: "/covers/codes.jpg", title: "Divine Codes" },
  { src: "/covers/veil.jpg", title: "The Veil Breaker" },
  { src: "/covers/awareness.jpg", title: "An Introduction to Awareness" },
];

export function PublicStudy() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="cyan" icon="Library" kicker="The reading room" title="The Study" lede={`Read the signal.\nQuestion the noise.`} />
      <Block ink tone="cyan" kicker="The shelf" title="A language for the inner universe.">
        <p>The Cosmic Operating System uses systems, signals, and code to explore spiritual experience. Avatar, loop, and flame are a symbolic vocabulary. A metaphor can illuminate an experience without settling every question.</p>
        <p>Divine Codes is half prayer, half terminal language. The Book of Rituals is a container for intention. The member shelf is behind the door.</p>
      </Block>
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 pb-20 sm:grid-cols-3 sm:px-6">
        {COVERS.map((cover) => (
          <Link key={cover.src} to="/register" className="group relative block overflow-hidden border-4 border-cyan">
            <img src={cover.src} alt={cover.title} className="aspect-[2/3] w-full object-cover opacity-50" />
            <span className="absolute inset-0 grid place-items-center bg-ink/55 px-3 text-center text-paper">
              <span>
                <Lock className="mx-auto size-6" strokeWidth={1.6} />
                <span className="mt-2 block text-[10px] uppercase tracking-wide">Sign up for access</span>
              </span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

export function PublicAcademy() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="orange" icon="GraduationCap" kicker="Scholarship of the Enlightened" title="The Academy" lede={`Where revelation\nlearns discipline.`} />
      <Block ink tone="orange" kicker="Your learning path" title="Start with the foundations.">
        <p>A visitor may read the map. A Seeker opens orientation. An Initiate opens the included paths. A finished introduction does not open paid material, and clergy formation is a separate door.</p>
      </Block>
      <section className="mx-auto max-w-3xl space-y-4 px-4 pb-20 sm:px-6">
        {SYLLABUS.map((dept) => (
          <article key={dept.code} className="border border-orange p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-orange">
              {dept.code} · {dept.track}
            </p>
            <h3 className="mt-2 font-display text-xl uppercase leading-none text-orange">{dept.name}</h3>
            <p className="mt-2 font-mono text-[11px] normal-case leading-relaxed text-paper">{dept.line}</p>
            <ul className="mt-3 space-y-1 font-mono text-[11px] normal-case text-paper">
              {dept.courses.map((course) => (
                <li key={course.id}>
                  {course.id} — {course.title}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <ColorLink to="/register" tone="orange">Sign up for access</ColorLink>
      </section>
    </main>
  );
}

export function PublicWork() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="pink" icon="Flame" kicker="Mission · Housing · Giving" title="The Work" lede={`Make sanctuary\nsomething tangible.`} />
      <Block ink tone="lime" kicker="The mission" title="Belief becomes responsibility.">
        <p>The Divine Molecule Temple exists to support a disciplined relationship with consciousness and the sacred through study, ritual, integration, publishing, and restorative community.</p>
        <p>Publish the work. Build the Academy. Build practical support.</p>
      </Block>
      <Block ink tone="lime" kicker="Divine Molecule Transitional Housing" title="A door. A bed. An address.">
        <p>Developing program. Housing intake and placements are not open through this site.</p>
        <p>Divine Molecule Transitional Housing is designed to help people move from instability toward structure, belonging, income, and independent life. The mission centers LGBTQIA+ people, artists, and people rebuilding after homelessness.</p>
        <p>Spiritual participation must never be coerced as the price of basic dignity.</p>
        <p>Stabilize. Orient. Participate. Advance. Transition.</p>
        <p>This page does not offer emergency shelter or confirm housing availability.</p>
      </Block>
      <Block ink tone="lime" kicker="Support" title="Choose the work you care about.">
        <p>Preserve the canon. Develop the Academy. Build the housing mission. Keep the Temple running.</p>
        <ColorLink to="/altar" tone="gold">Give</ColorLink>
      </Block>
    </main>
  );
}

export function PublicMembership() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="canary" icon="KeyRound" kicker="The access map" title="Your place" lede={`Start freely.\nChoose your depth.`} />
      <Block ink tone="canary" kicker="One map. Different access." title="What you are depends on the door.">
        <p>Public. No account. Read these pages and the collection introductions.</p>
        <p>Seeker. Free. Orientation, introductory resources, one COS dashboard, a private journal, and Seeker community areas.</p>
        <p>Academy. $33 a month, renewing until you cancel. The full syllabus, every class, and the priest-track materials.</p>
        <p>Completing introductory study does not automatically unlock paid content.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ColorLink to="/register" tone="canary">Become a Seeker</ColorLink>
          <ColorLink to="/login" tone="canary">Already have a profile</ColorLink>
        </div>
      </Block>
    </main>
  );
}

export function SealedGate() {
  return (
    <main className="bg-ink px-4 pb-24 pt-36 text-center text-paper">
      <p className="text-[13px] uppercase tracking-[0.22em] text-lime">Member access</p>
      <h1 className="mt-4 font-display text-title uppercase leading-none">This gate is sealed</h1>
      <p className="mx-auto mt-6 max-w-md font-mono text-[12px] normal-case leading-relaxed text-paper/75">
        The congregation is free. The Academy is $33 a month and opens the syllabus. You can enroll without joining the religion.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <a href="/register?gate=initiate" className="inline-flex h-8 max-w-full items-center px-3 text-[10px] uppercase tracking-[0.06em] text-ink bg-lime">
          Join the Academy — $33/mo
        </a>
        <Link to="/register" className="text-[11px] uppercase tracking-wide text-paper/55">
          Join the congregation free
        </Link>
      </div>
    </main>
  );
}

const NEXUS_ROOMS = [
  ["Journal", "Write privately, or post it so the congregation can read it."],
  ["Other entries", "Read what people have shared. Experience, in their own words."],
  ["Study circles", "Group chats and forums. A class, a volume, a question, a life."],
  ["The house", "This is where people get to know each other."],
];

export function PublicNexus() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="pink" icon="Share2" kicker="The Nexus" title="Community" lede={`The wall.\nThe circles.\nThe forums.`} />
      <section className="mx-auto grid max-w-3xl gap-4 px-4 pb-20 sm:px-6">
        {NEXUS_ROOMS.map(([title, line]) => (
          <article key={title} className="relative border border-pink p-5">
            <h2 className="font-display text-xl uppercase text-pink">{title}</h2>
            <p className="mt-2 font-mono text-[12px] normal-case leading-relaxed text-paper">{line}</p>
            <p className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-wide text-paper">
              <Lock className="size-3.5" />
              Sign up for access
            </p>
          </article>
        ))}
        <ColorLink to="/register" tone="pink">Become a Seeker</ColorLink>
      </section>
    </main>
  );
}

export function PublicFace({ path }: { path: string }) {
  if (path === "/sanctuary") return <PublicTemple />;
  if (path === "/divinism") return <PublicDivinism />;
  if (path === "/library" || path === "/study") return <PublicStudy />;
  if (path === "/academy" || path === "/academy/") return <PublicAcademy />;
  if (path.startsWith("/academy")) return <SealedGate />;
  if (path === "/works" || path === "/housing") return <PublicWork />;
  if (path === "/gates" || path === "/enter") return <PublicMembership />;
  if (path === "/nexus" || path.startsWith("/nexus")) return <PublicNexus />;
  return <SealedGate />;
}
