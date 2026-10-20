import { SCHOLARSHIP, SCHOLARSHIP_SEQUENCE, scholarshipCourse as findScholarship, scholarshipPreview } from "./scholarship";

export type ClassLevel = "initiate" | "adept" | "inner";

export type SyllabusCourse = {
  id: string;
  title: string;
  level: ClassLevel;
  focus?: string;
  free?: boolean;
};

export type SyllabusDept = {
  code: string;
  track: string;
  name: string;
  line: string;
  courses: SyllabusCourse[];
};

export const SYLLABUS: SyllabusDept[] = SCHOLARSHIP.departments.map((dept) => ({
  code: dept.code,
  track: dept.track,
  name: dept.name,
  line: dept.line,
  courses: dept.courses.map((course) => ({
    id: course.id,
    title: course.title,
    level: course.level,
    focus: course.thesis,
    free: course.free,
  })),
}));

export const SYLLABUS_COUNT = SYLLABUS.reduce((n, d) => n + d.courses.length, 0);

export const ACADEMY_PHASES = [
  { id: "I", title: "Foundation", d: "Language, orientation, sacred study, critical discernment, the basic architecture of consciousness, and the responsibilities of the Seeker." },
  { id: "II", title: "Decryption", d: "Perception, symbolism, identity, inherited patterns, the COS framework, ritual literacy, and the examination of reality models." },
  { id: "III", title: "Integration", d: "Ethics, embodiment, spiritual experience, shadow, service, community responsibility, integration, and applied practice." },
  { id: "IV", title: "Stewardship", d: "Leadership, teaching, doctrine, clergy studies, sanctuary, ministry, and the obligations that accompany spiritual authority." },
] as const;

export const ACADEMY_FAQ = [
  {
    q: "What is the Scholarship of the Enlightened?",
    a: "The Scholarship of the Enlightened is the Divine Molecule Temple's complete academic curriculum. Foundations, Quantum Theology, Simulation Decryption, Chrono-Mechanics, Dimensional Engineering, Ritual Technology, Applied Metaphysics, the Master’s, the Doctorate, and the Book of the Priest. The class is the book. It does not stop at the overview.",
  },
  {
    q: "How do I access the curriculum?",
    a: "The seven-day awakening, FM-101, and SD-101 are open. The Academy is $33 a month and opens the whole syllabus. You do not have to join the religion to enroll. One class, if you only want one, is $10.",
  },
  {
    q: "What is the difference between the Academy and the Electives?",
    a: "The Academy is the Scholarship, billed monthly. Classes are the electives, sold one at a time from $35. An elective does not open the syllabus.",
  },
] as const;

export const FM101_BODY = scholarshipPreview("FM-101", 8);

export function syllabusCourse(id: string) {
  return findScholarship(id);
}

export const CANONICAL_SEQUENCE = SCHOLARSHIP_SEQUENCE;

export function isDeepTeaching(id?: string) {
  const course = id ? syllabusCourse(id) : null;
  if (!course) return false;
  if (course.dept.track === "Doctorate" || course.dept.track === "Master's" || course.dept.track === "Priesthood") return true;
  if (course.level === "inner") return true;
  return false;
}

export function asksForSeat(id?: string) {
  const course = id ? syllabusCourse(id) : null;
  if (!course) return false;
  return course.dept.code === "HRC" || course.dept.track === "Doctorate" || course.dept.track === "Priesthood";
}

export function levelOpen(_level: ClassLevel, _path: string, id?: string, paid = false, _member = false) {
  if (paid) return true;
  if (isDeepTeaching(id)) return false;
  const course = id ? syllabusCourse(id) : null;
  if (course?.free || id === "FM-101" || id === "SD-101" || id === "AW-7") return true;
  return false;
}

export function classUnlocked(id: string | undefined, paid = false, owned: readonly string[] = []) {
  if (!id) return false;
  const code = id.toUpperCase();
  if (paid) return true;
  if (owned.some((row) => row.toUpperCase() === code)) return true;
  if (code === "FM-101" || code === "SD-101" || code === "AW-7") return true;
  return Boolean(syllabusCourse(code)?.free);
}
