import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ChamberHero } from "@/components/chamber";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SCHOLARSHIP, SCHOLARSHIP_COUNT, type ScholarshipDept } from "@/lib/scholarship";
import { ownedClassCodes } from "@/lib/stripe-temple";
import { asksForSeat, classUnlocked } from "@/lib/syllabus";
import { useTemple } from "@/lib/temple-store";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "What is the Scholarship of the Enlightened?",
    a: [
      "The Scholarship of the Enlightened is the Divine Molecule Temple’s comprehensive academic program for the study of consciousness, metaphysics, quantum theology, and spiritual science.",
      "Its curriculum progresses from foundational studies through advanced disciplines including Simulation Decryption, Chrono-Mechanics, Dimensional Engineering, Ritual Technology, and Applied Metaphysics.",
      "Structured across Bachelor’s, Master’s, and Doctoral levels, the program culminates in the Book of the Priest, an advanced path of theological study and spiritual leadership.",
      "This is not a collection of introductory lectures. Each course is a complete body of study, supported by dedicated texts, structured lessons, and progressive academic development.",
    ],
  },
  {
    q: "How do I access the curriculum?",
    a: [
      "Begin with the complimentary Seven-Day Awakening and Foundation Lecture, available to explore before enrolling.",
      "Enrollment in the Academy does not require membership in the Divinist religion.",
      "The complete curriculum, academic pathways, and enrollment options are presented in the official syllabus.",
      "Students interested in a particular subject may also enroll in individual electives without committing to the full academic program.",
    ],
  },
  {
    q: "What is the difference between the Academy and individual electives?",
    a: [
      "The Academy is the complete academic journey. It offers a structured progression through Bachelor’s, Master’s, and Doctoral studies, followed by the advanced priesthood curriculum.",
      "Electives are individual courses drawn from the same academic disciplines, allowing students to explore a specific subject independently.",
      "Elective enrollment does not grant access to the complete curriculum, confer an academic degree, or constitute ordination into the Divine Molecule Temple’s priesthood.",
    ],
  },
] as const;

export const Route = createFileRoute("/academy/")({ component: Academy });

const TRACKS = ["Bachelor", "Master's", "Doctorate", "Priesthood", "Seeker"] as const;

const TRACK_COLOR: Record<string, { tone: string; mark: string; edge: string }> = {
  Bachelor: { tone: "bg-orange", mark: "text-orange", edge: "border-l-orange" },
  "Master's": { tone: "bg-lilac", mark: "text-lilac", edge: "border-l-lilac" },
  Doctorate: { tone: "bg-cyan", mark: "text-cyan", edge: "border-l-cyan" },
  Priesthood: { tone: "bg-pink", mark: "text-pink", edge: "border-l-pink" },
  Seeker: { tone: "bg-lime", mark: "text-lime", edge: "border-l-lime" },
};

function DeptDoor({
  dept,
  shown,
  onToggle,
  paid,
  owned,
  read,
}: {
  dept: ScholarshipDept;
  shown: boolean;
  onToggle: () => void;
  paid: boolean;
  owned: string[];
  read: string[];
}) {
  const color = TRACK_COLOR[dept.track] ?? TRACK_COLOR.Bachelor;
  return (
    <article id={`dept-${dept.code}`} className={cn("scroll-mt-28 border border-[#cfcfcf] border-l-2 bg-[#e6e6e6] text-ink", color.edge)}>
      <button type="button" aria-expanded={shown} onClick={onToggle} className="block w-full px-4 py-4 text-left text-ink">
        <span className="flex items-start justify-between gap-3">
          <span className="font-display text-[clamp(0.95rem,1.6vw,1.15rem)] uppercase leading-[0.95]">
            <span className={color.mark}>{dept.code}</span>
            <span> — {dept.name}</span>
          </span>
          <ChevronDown className={cn("mt-0.5 size-3.5 shrink-0 text-ink/40 transition-transform", shown && "rotate-180")} />
        </span>
        <span className="mt-2 block font-mono text-[11px] normal-case leading-relaxed text-ink/70">{dept.line}</span>
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", shown ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <ul className="divide-y divide-black/10 bg-[#f3f3f3]">
            {dept.courses.map((course) => {
              const unlocked = classUnlocked(course.id, paid, owned);
              const seat = asksForSeat(course.id);
              return (
                <li key={course.id}>
                  <Link to="/academy/$code" params={{ code: course.id }} className="flex items-start justify-between gap-4 px-5 py-4 text-ink hover:bg-black/5 sm:px-7">
                    <span>
                      <span className={cn("text-[10px] uppercase tracking-wide", color.mark)}>
                        {course.id} · {course.tier} · {course.level}
                      </span>
                      <span className="mt-1 block font-display uppercase">{course.title}</span>
                      <span className="mt-1 block font-mono text-[11px] normal-case text-ink/65">{course.thesis}</span>
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink/45">
                      {unlocked ? (read.includes(course.id) ? "Examined" : "Open") : seat ? "Sealed" : "Academy"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}

function Academy() {
  const paid = useTemple((s) => s.paid);
  const read = useTemple((s) => s.read);
  const { user } = useCurrentUserState();
  const [owned, setOwned] = useState<string[]>([]);
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [syllabusOpen, setSyllabusOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    void ownedClassCodes()
      .then(setOwned)
      .catch(() => {});
  }, [user?.id]);

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="orange"
        icon="GraduationCap"
        kicker="Scholarship of the Enlightened"
        title="The Academy"
        lede={`The educational body
of the Divine Molecule Temple.`}
      />

      <section className="px-4 pt-2 sm:px-6">
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-white/15 sm:grid-cols-4">
          {[
            ["4", "Phases"],
            [String(SCHOLARSHIP.departments.length), "Departments"],
            [String(SCHOLARSHIP_COUNT), "Lessons"],
            ["∞", "Perpetual access"],
          ].map(([n, label]) => (
            <div key={label} className="bg-ink px-4 py-5 text-center">
              <dt className="font-display text-3xl leading-none text-orange">{n}</dt>
              <dd className="mt-2 text-[10px] uppercase tracking-[0.16em] text-paper/55">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-5xl border border-white/15">
          <header className="border-b border-white/15 px-5 py-6 sm:px-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-orange">Faculty of the Academy</p>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,4.5vw,3.2rem)] uppercase leading-[0.9]">
              School of
              <br />
              Metaphysical Engineering
            </h2>
            <p className="mt-4 max-w-2xl font-mono text-[12px] normal-case leading-relaxed text-paper/55">
              Three degrees. Conferred in order. Each one is earned by examination, not by attendance.
            </p>
          </header>
          <ol className="grid divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["I", "B.Div.", "Bachelor of Divinity", "Undergraduate"],
              ["II", "M.A.S.", "Master of the Ascension Sciences", "Graduate"],
              ["III", "D.M.E.", "Doctor of Metaphysical Engineering", "Doctoral"],
            ].map(([n, post, name, standing]) => (
              <li key={post} className="px-5 py-6 sm:px-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-paper/55">{n} · {standing}</p>
                <p className="mt-4 font-display text-4xl uppercase leading-none text-orange">{post}</p>
                <p className="mt-4 font-display text-lg uppercase leading-tight">{name}</p>
              </li>
            ))}
          </ol>
          <p className="border-t border-white/15 px-5 py-4 font-mono text-[11px] normal-case leading-relaxed text-paper/55 sm:px-8">
            Degrees of the Divine Molecule Temple Academy. They mark an internal academic progression. They are not externally accredited university degrees.
          </p>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl uppercase">Frequently asked questions</h2>
          <div className="mt-4 border border-white/15">
            {FAQ.map((item, index) => {
              const shown = openFaq === index;
              return (
                <article key={item.q} className="border-b border-white/15 last:border-b-0">
                  <button type="button" aria-expanded={shown} onClick={() => setOpenFaq(shown ? null : index)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
                    <span className="font-display text-[clamp(0.95rem,2vw,1.15rem)] uppercase leading-tight">{item.q}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-paper/55 transition-transform", shown && "rotate-180")} />
                  </button>
                  <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", shown ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <div className="space-y-3 px-4 pb-5 font-mono text-[12px] normal-case leading-relaxed text-paper/55">
                        {item.a.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-5xl border border-white/15">
          <div className="flex flex-col items-center gap-4 px-4 py-6 text-center">
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] uppercase leading-[0.95] text-white">Every class. Every department.</h2>
            <button type="button" aria-expanded={syllabusOpen} onClick={() => setSyllabusOpen((open) => !open)} className="inline-flex h-11 items-center justify-center bg-orange px-5 text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
              {syllabusOpen ? "Close the syllabus" : "Explore the entire syllabus"}
            </button>
          </div>
          <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", syllabusOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden">
              <div className="space-y-10 border-t border-white/15 px-4 py-6">
          {TRACKS.map((track) => {
            const departments = SCHOLARSHIP.departments.filter((dept) => dept.track === track);
            if (!departments.length) return null;
            const color = TRACK_COLOR[track];
            return (
              <div key={track}>
                <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-paper/70">
                  <span className={cn("h-3.5 w-px", color.tone)} aria-hidden />
                  Departments
                  <span className={color.mark}>{track}</span>
                </p>
                <div className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                  {departments.map((dept) => (
                    <DeptDoor
                      key={dept.code}
                      dept={dept}
                      shown={openDept === dept.code}
                      onToggle={() => setOpenDept(openDept === dept.code ? null : dept.code)}
                      paid={paid}
                      owned={owned}
                      read={read}
                    />
                  ))}
                </div>
              </div>
            );
          })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!paid ? (
        <section className="border-t border-orange px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange">The school · billed monthly</p>
              <h2 className="mt-2 font-display text-3xl uppercase leading-none">The whole syllabus. $33 a month.</h2>
            </div>
            <a href={user ? "/ascend?gate=initiate" : "/register?gate=initiate"} className="inline-flex h-11 w-fit items-center justify-center bg-orange px-5 text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
              Academy · $33/mo
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
