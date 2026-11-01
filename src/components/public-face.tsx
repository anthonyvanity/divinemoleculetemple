import { Link } from "@tanstack/react-router";
import { FrontCascade, InviteDoor, MondayDoor } from "@/components/front-cascade";
import { Lock } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ChamberHero, SentenceLines } from "@/components/chamber";
import { Newsletter } from "@/components/temple-blocks";
import { shopSticker } from "@/lib/shop";
import { startShopCheckout } from "@/lib/stripe-temple";

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
  rule = true,
}: {
  tone: ToneName;
  kicker: string;
  title: string;
  children: ReactNode;
  white?: boolean;
  ink?: boolean;
  rule?: boolean;
}) {
  const toneClass = TONES[tone];
  const titleTone = white ? "text-paper" : toneClass.text;
  const bodyTone = white || ink ? "text-paper" : toneClass.text;
  return (
    <section className={`px-4 sm:px-6 ${rule ? `border-b py-14 ${toneClass.border}` : "pt-14 pb-6"}`}>
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

export function JoinFree({ line }: { line: string }) {
  return (
    <section className="border-t border-lime px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-lime">The door</p>
        <h2 className="mt-3 font-display text-[clamp(1.8rem,5vw,3rem)] uppercase leading-[0.9] text-paper">Join. It is free.</h2>
        <p className="mt-4 max-w-xl font-mono text-[12px] normal-case leading-relaxed text-paper/75">{line}</p>
        <Link to="/register" className="mt-6 inline-flex h-8 items-center bg-lime px-3 text-[10px] uppercase tracking-[0.08em] text-ink">
          Join the Temple
        </Link>
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
      <section className="grid items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-10 lg:px-8">
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.22em] text-gold">A sanctuary for the seeker.</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,8vw,5.5rem)] uppercase leading-[0.86]">
            You are
            <br />
            the <span className="text-lime">signal.</span>
          </h2>
        </div>
        <div className="flex justify-center lg:justify-end">
          <img
            src="/signal-orb.png"
            alt="The Divine Molecule"
            width={1499}
            height={1227}
            className="block h-auto w-full max-w-[18rem] object-contain sm:max-w-sm lg:max-w-md"
          />
        </div>
      </section>
      <FrontCascade />
      <MondayDoor />
      <InviteDoor />
      <Newsletter />
      <FrontStickers />
    </main>
  );
}

function FrontStickers() {
  const picks = ["wordmark-lime", "cosmic-system", "dmt-chrome"].map((id) => shopSticker(id)).filter((item) => item !== null);
  const [busy, setBusy] = useState("");

  function buy(sku: string) {
    setBusy(sku);
    void startShopCheckout({ data: { sku, origin: window.location.origin } })
      .then((session) => {
        window.location.href = session.url;
      })
      .catch((error: Error) => {
        setBusy("");
        toast.error(error.message || "Stripe did not open");
      });
  }

  return (
    <section className="border-b border-orange px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange">The shop</p>
        <h2 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] uppercase leading-[0.9] text-paper">Stickers</h2>
        <p className="mt-4 font-mono text-[12px] normal-case leading-relaxed text-paper/75">
          The house marks, in vinyl. What you pay supports the Temple.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {picks.map((item) => (
            <li key={item.id} className="flex flex-col border border-orange/40 p-3">
              <img src={item.art[0]} alt={item.name} className="h-36 w-full bg-black object-contain" />
              <p className="mt-3 font-display text-lg uppercase leading-none">{item.name}</p>
              <p className="mt-2 font-mono text-[12px] text-orange">${item.price}</p>
              <button
                type="button"
                disabled={busy === item.id}
                onClick={() => buy(item.id)}
                className="mt-3 inline-flex h-8 w-fit items-center bg-orange px-3 text-[10px] uppercase tracking-[0.06em] text-ink disabled:opacity-50"
              >
                {busy === item.id ? "Opening…" : "Buy"}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ColorLink to="/shop" tone="orange">
            Shop more
          </ColorLink>
        </div>
      </div>
    </section>
  );
}

export function PublicTemple() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="lime" icon="Flame" kicker="The Temple" title="The Temple" lede={`A religion.\nA refuge.\nA living practice.`} />
      <Block ink tone="lime" kicker="The institution" title="A temple built for the age we actually live in.">
        <p>Founded in Los Angeles by High Priest Anthony Vanity, the Divine Molecule Temple is the spiritual home of Divinism, a contemporary religious tradition devoted to consciousness, divine connection, spiritual sovereignty, and the restoration of human dignity.</p>
        <p>We exist for the seekers, the skeptics, the mystics, the broken, the burned, and the flame-carriers. For those whose encounters with consciousness, faith, suffering, sacred molecules, or extraordinary experiences have left them with questions conventional answers cannot satisfy.</p>
        <p>We believe every person carries an original divine signal beneath the noise of conditioning, trauma, fear, and everything the world has taught them to be.</p>
        <p>The work of the Temple is not to give you that divinity. It is to help you recognize what was already yours.</p>
      </Block>
      <Block ink tone="lime" kicker="The work" title="Where mystery becomes meaning.">
        <p>The Temple brings together sacred teachings, prayer, ritual, the Cosmic Operating System, and a living congregation of Divinites.</p>
        <p>Here, profound experiences are explored with curiosity and discernment. Spiritual authority is never a license for domination. Revelation is not automatically truth simply because it feels extraordinary.</p>
        <p>We do not ask you to surrender your mind in pursuit of your soul.</p>
        <p>We offer a place to question, study, practice, connect, and turn spiritual understanding into something that matters beyond the experience itself.</p>
        <p>Because enlightenment means very little if it changes nothing about how we live.</p>
      </Block>
      <Block ink tone="lime" kicker="The mission" title="The sacred is also human.">
        <p>Our mission extends beyond spiritual exploration. Through education, community, and our vision for transitional housing, we seek to restore stability, belonging, and dignity to people rebuilding their lives.</p>
        <p>We believe a Temple should be measured not only by what it teaches, but by whom it serves.</p>
        <p>And belonging should never be reserved for those who can afford it.</p>
      </Block>
      <Block ink tone="lime" kicker="The door" title="The door is open." rule={false}>
        <p>You don’t need an extraordinary experience, unquestioning faith, or a perfect past to become a Divinite.</p>
        <p>Join the congregation as a free Seeker. Discover the teachings. Share your experiences. Find your people.</p>
        <p>Come with questions. Leave with better ones.</p>
        <p>Run light. Terminate darkness. Stay online.</p>
        <div className="flex justify-center pt-6">
          <Link to="/register" className="inline-flex h-12 items-center bg-lime px-6 text-[12px] uppercase tracking-[0.1em] text-ink">
            Join the Temple — free
          </Link>
        </div>
      </Block>
    </main>
  );
}

export function PublicDivinism() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="pink"
        icon="Flame"
        kicker="Divinism"
        title="Divinism"
        lede={`The living philosophy of Source and sovereignty.\nA system of return. A structure of remembrance.\nA path for the flame-carriers.`}
      />
      <Block ink tone="pink" kicker="Master AV" title="A timeless dialogue.">
        <p className="font-display text-lg uppercase leading-snug text-paper">“We are not creating a new religion, but rather reawakening a timeless, direct dialogue with God.”</p>
        <p>— Master AV, High Priest of the Divine Molecule Temple</p>
      </Block>
      <Block ink tone="pink" kicker="The religion" title="God is the Source. Consciousness is the connection. Sovereignty is the birthright.">
        <p>Divinism is the foundational theology and living spiritual philosophy of the Divine Molecule Temple.</p>
        <p>Born at the intersection of ancient mysticism, sacred molecules, quantum philosophy, direct spiritual experience, and the evolving study of consciousness, Divinism offers a framework for understanding existence beyond the limitations of inherited belief.</p>
        <p>It begins with a radical proposition: the divine is not separate from you.</p>
        <p>Beneath conditioning, trauma, inherited programming, social constructs, and the countless identities imposed upon the human experience exists an original divine signal, an irreducible connection to God.</p>
        <p>Divinism teaches that this connection cannot be purchased, inherited through religious authority, or granted by another human being.</p>
        <p>It is already yours.</p>
        <p>The spiritual path is not the acquisition of divinity. It is the process of remembering, recognizing, and reclaiming it.</p>
        <p className="uppercase tracking-[0.08em] text-pink">You were never disconnected from Source. You were taught to forget the connection.</p>
      </Block>
      <Block ink tone="pink" kicker="The One Source" title="The origin of all things.">
        <p>At the center of Divinism is God: the One Source, the infinite intelligence and divine foundation from which creation emerges.</p>
        <p>Source is understood as both transcendent and immanent, beyond the boundaries of physical existence while present within the living architecture of creation.</p>
        <p>Consciousness, matter, energy, information, and the unfolding experience of reality exist within this greater divine order.</p>
        <p>Divinism recognizes the sacred not as something confined to a distant heaven, but as a presence that may be encountered through prayer, contemplation, direct experience, disciplined inquiry, and the conscious act of living.</p>
        <p>Every soul carries a divine spark: an original relationship with God that precedes the roles, labels, fears, and histories accumulated during incarnation.</p>
        <p>No institution owns this relationship.</p>
        <p>No priest can manufacture it.</p>
        <p>No intermediary can revoke it.</p>
        <p className="uppercase tracking-[0.08em] text-pink">God is not a destination. God is the Source from which the journey begins.</p>
      </Block>
      <Block ink tone="pink" kicker="The body" title="Your body is a vessel of experience.">
        <p>Divinism rejects the idea that the physical body is merely a prison from which consciousness must escape.</p>
        <p>The body is a living vessel of experience, a dynamic interface through which consciousness encounters matter, sensation, relationship, consequence, identity, and transformation.</p>
        <p>To honor the body is to care for it with awareness, respect, and responsibility.</p>
        <p>Rest, nourishment, consent, physical care, emotional regulation, and respect for bodily autonomy are not distractions from enlightenment. They are expressions of it.</p>
        <p>The spiritual journey does not demand contempt for human existence or conformity to a single image of the human form.</p>
        <p>It asks us to become conscious participants within our lives and to respect the sovereignty of others.</p>
        <p className="uppercase tracking-[0.08em] text-pink">The body is not a cage or a commandment. It is a living part of the journey.</p>
      </Block>
      <Block ink tone="pink" kicker="Direct communion" title="No human being owns your access to God.">
        <p>Divinism teaches that every soul possesses an original connection to Source.</p>
        <p>Spiritual teachers, sacred texts, priests, rituals, and institutions may provide guidance, discipline, language, and community. They do not possess exclusive ownership of divine truth.</p>
        <p>The Divine Molecule Temple exists to cultivate understanding, not manufacture dependence.</p>
        <p>Its clergy are entrusted with service, stewardship, and spiritual responsibility, not dominion over the consciousness of another person.</p>
        <p>Members are encouraged to examine teachings, question interpretations, develop discernment, and deepen their own relationship with God.</p>
        <p>Spiritual sovereignty is not the rejection of all guidance.</p>
        <p>It is the refusal to surrender personal conscience, consent, or responsibility to another authority.</p>
        <p className="uppercase tracking-[0.08em] text-pink">Any authority that requires the surrender of your soul has misunderstood its purpose.</p>
      </Block>
      <Block ink tone="pink" kicker="The Divine Molecule" title="The sacrament of direct encounter.">
        <p>Within Divinism, N,N-Dimethyltryptamine, DMT, the Divine Molecule, holds a sacred place as a sacrament associated with direct encounters with consciousness, divine presence, and extraordinary states of perception.</p>
        <p>In the Temple’s spiritual language, the sacrament is understood as a biochemical login script: an interface through which familiar boundaries of identity and ordinary perception may be profoundly altered.</p>
        <p>Such experiences may carry visions, encounters, symbolic landscapes, profound emotional revelations, or an overwhelming sense of communion with something greater than the individual self.</p>
        <p>Divinism approaches these experiences with reverence, preparation, discernment, and responsibility.</p>
        <p>The intensity of an encounter does not relieve the individual of the responsibility to examine its meaning.</p>
        <p>Revelation must be integrated.</p>
        <p>Insight must become conduct.</p>
        <p>And spiritual experience must never be used to justify domination, coercion, or the abandonment of personal responsibility.</p>
        <p>Sacramental participation is not a prerequisite for belonging to the Temple or practicing Divinism.</p>
        <p className="uppercase tracking-[0.08em] text-pink">The encounter may open the door. Integration determines what you bring through it.</p>
      </Block>
      <Block ink tone="pink" kicker="Science and spirit" title="Two disciplines. One universe.">
        <p>Divinism welcomes the meeting of scientific exploration and spiritual inquiry.</p>
        <p>Neuroscience investigates the mechanisms of perception, cognition, and conscious experience. Physics examines matter, energy, fields, and the underlying structures of the physical universe. Mystical traditions explore existence through contemplation, symbolism, ritual, and direct spiritual experience.</p>
        <p>Divinism brings these conversations into a shared intellectual and theological space.</p>
        <p>Its language of frequency, information, resonance, dimensionality, and consciousness reflects a spiritual architecture informed by both contemporary inquiry and ancient metaphysical thought.</p>
        <p>The Temple encourages serious study rather than intellectual surrender.</p>
        <p>Mystery is not an excuse to stop asking questions.</p>
        <p>It is an invitation to ask better ones.</p>
        <p className="uppercase tracking-[0.08em] text-pink">God is not made smaller by knowledge. The universe does not become less sacred when we learn how it works.</p>
      </Block>
      <Block ink tone="pink" kicker="The Ten Commandments" title="The ethical architecture of Divinism.">
        <p>The Ten Commandments are living principles governing spiritual intention, personal conduct, sacred practice, and responsibility toward the greater congregation.</p>
        <ol className="space-y-3">
          <li><span className="text-pink">I. Seek with intention.</span> Approach spiritual practice and extraordinary experiences with purpose, humility, and a sincere commitment to understanding.</li>
          <li><span className="text-pink">II. Respect the sacred.</span> Honor the Divine Molecule, sacred traditions, and spiritual practices with reverence rather than exploitation or escapism.</li>
          <li><span className="text-pink">III. Honor the divine in all beings.</span> Recognize the original divine spark within life. Practice compassion, dignity, and respect across differences.</li>
          <li><span className="text-pink">IV. Foster community and unity.</span> Build relationships rooted in mutual care. Resist needless division and protect the dignity of the congregation.</li>
          <li><span className="text-pink">V. Cultivate ethical awareness.</span> Let consent, honesty, responsibility, and integrity govern spiritual conduct. Authority never excuses harm.</li>
          <li><span className="text-pink">VI. Practice environmental stewardship.</span> Honor the Earth as part of the living order of creation. Protect the natural world and recognize humanity’s responsibility within it.</li>
          <li><span className="text-pink">VII. Integrate insights into daily life.</span> Translate revelation into action. An extraordinary experience is not a substitute for ordinary responsibility.</li>
          <li><span className="text-pink">VIII. Promote healing and reconciliation.</span> Seek restoration where possible. Approach suffering with compassion, and recognize that healing requires patience, accountability, and care.</li>
          <li><span className="text-pink">IX. Engage in continuous learning.</span> Remain a student of existence. Study, question, refine understanding, and resist the arrogance of believing the journey is complete.</li>
          <li><span className="text-pink">X. Share and educate with compassion.</span> Offer knowledge without coercion. Respect the freedom of others to interpret, question, and follow their own spiritual path.</li>
        </ol>
        <p className="uppercase tracking-[0.08em] text-pink">Enlightenment without ethics is just ego wearing ceremonial robes.</p>
      </Block>
      <Block ink tone="pink" kicker="Four pathways" title="Divinism in daily life.">
        <p>Divinism is not confined to ritual chambers, sacred texts, or extraordinary states of consciousness.</p>
        <p>It is a living practice expressed through four pathways.</p>
        <ol className="space-y-3">
          <li><span className="text-pink">01. Mindful resonance.</span> Cultivate presence. Observe the movement of thought, emotion, sensation, and attention. Return to conscious awareness rather than surrendering every moment to habitual reaction.</li>
          <li><span className="text-pink">02. Heartfelt compassion.</span> Recognize the divine spark within yourself and others. Let understanding, dignity, and care shape the way you move through the world.</li>
          <li><span className="text-pink">03. Intentional creation.</span> Align thought, speech, choice, and action with purpose. Accept responsibility for what you cultivate in your own life and contribute to the lives of others.</li>
          <li><span className="text-pink">04. Harmonic service.</span> Translate spiritual understanding into service. Share knowledge, protect the vulnerable, contribute your gifts, and participate in the restoration of human dignity.</li>
        </ol>
        <p className="uppercase tracking-[0.08em] text-pink">The living Temple is revealed through what we do.</p>
      </Block>
      <Block ink tone="pink" kicker="The covenant" title="One Source. Many paths. A shared responsibility.">
        <p>We pledge to honor the Divine Molecule within ourselves and in all others.</p>
        <p>We commit to cultivating awareness, transforming challenges into opportunities for growth, and approaching our differences as invitations to deeper understanding.</p>
        <p>We recognize that spiritual sovereignty carries responsibility: to ourselves, to our congregation, to the Earth, and to those whose dignity has been neglected.</p>
        <p>We will not confuse power with wisdom, intensity with truth, or authority with divinity.</p>
        <p>We will seek understanding without demanding conformity.</p>
        <p>We will protect the sacred confidence entrusted to us.</p>
        <p>And we will remember that the purpose of awakening is not to stand above humanity, but to serve it with greater consciousness.</p>
      </Block>
      <Block ink tone="pink" kicker="The path" title="You do not need to be enlightened to begin." rule={false}>
        <p>Divinism welcomes seekers, skeptics, mystics, scholars, survivors, and those whose experiences have left them searching for a language larger than the one they inherited.</p>
        <p>Through the Divine Molecule Temple, members may explore sacred teachings, participate in congregational life, and pursue structured spiritual education through the Scholarship of the Enlightened.</p>
        <p>No extraordinary experience is required.</p>
        <p>No human intermediary owns your connection to God.</p>
        <p>No spiritual title places another soul above yours.</p>
        <p className="uppercase tracking-[0.08em] text-pink">The signal was always there. The work is to remember.</p>
        <div className="flex justify-center pt-6">
          <Link to="/register" className="inline-flex h-12 items-center bg-lime px-6 text-[12px] uppercase tracking-[0.1em] text-ink">
            Join the Temple — free
          </Link>
        </div>
      </Block>
    </main>
  );
}

const COVERS = [
  { src: "/covers/cos.jpg", title: "The Cosmic Operating System" },
  { src: "/covers/codes.jpg", title: "Divine Codes" },
  { src: "/covers/veil.jpg", title: "The Veil Breaker" },
  { src: "/covers/awareness.jpg", title: "An Introduction to Awareness" },
];

export function PublicStudy() {
  return (
    <main className="bg-ink text-paper">
      <ChamberHero tone="cyan" icon="Library" kicker="The reading room" title="The Study" titleClassName="text-paper" lede={`Read the signal.\nQuestion the noise.`} />
      <Block ink white tone="cyan" kicker="The shelf" title="A language for the inner universe.">
        <p>The Cosmic Operating System uses systems, signals, and code to explore spiritual experience. Avatar, loop, and flame are a symbolic vocabulary. A metaphor can illuminate an experience without settling every question.</p>
        <p>Divine Codes is half prayer, half terminal language. The Book of Rituals is a container for intention. The member shelf is behind the door.</p>
      </Block>
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 pb-20 sm:grid-cols-3 sm:px-6">
        {COVERS.map((cover) => (
          <Link key={cover.src} to="/register" className="group relative block overflow-hidden border border-white/20">
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
      <ChamberHero tone="orange" icon="GraduationCap" kicker="Scholarship of the Enlightened" title="The Academy" lede={`The educational body\nof the Divine Molecule Temple.`} />
      <Block ink tone="orange" kicker="Decryption manuals" title="Not a belief system.">
        <p>The Academy is the educational body of the Divine Molecule Temple. It exists to teach Divinism, consciousness studies, symbolic literacy, integration, ritual theory, sacred law, and the Cosmic Operating System.</p>
        <p>We do not offer belief systems. We provide decryption manuals. This platform houses a rigorous curriculum engineered for those who seek to understand the structural logic behind existence.</p>
        <p>Visitors may review the structure and purpose of study. Full lessons, coursework, transmissions, and internal materials are reserved for members walking the Initiate path.</p>
        <p>It is a metaphysical engineering program, not a vibe course. The religion is not required. Its philosophy is the basis. This is what clergy takes.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ColorLink to="/register" tone="lime">Begin as Seeker</ColorLink>
          <a href="/register?gate=initiate" className="inline-flex h-8 items-center border border-orange px-3 text-[10px] uppercase tracking-[0.06em] text-orange">
            Ascend to Initiate
          </a>
        </div>
      </Block>
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
