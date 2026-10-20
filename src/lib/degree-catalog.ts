import degree from "./degree.json";
import electives from "./electives.json";

export type Lab = { name: string; materials: string; steps: string[] };

export type DegreeCourse = {
  code: string;
  title: string;
  level: number;
  tier: string;
  thesis: string;
  lecture: string;
  lab?: Lab;
  takeaway: string;
};

export type DegreeDept = {
  id: string;
  roman: string;
  code: string;
  name: string;
  tagline: string;
  level: string;
  courses: DegreeCourse[];
};

export const DEGREE = degree as DegreeDept[];

export const ELECTIVES = electives as {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  minutes: number;
  price: number;
  instructor: string;
  description: string;
}[];

export const ELECTIVE_CATEGORIES = [
  "all",
  ...Array.from(new Set(ELECTIVES.map((c) => c.category))),
];

const byCode = new Map(DEGREE.flatMap((d) => d.courses.map((c) => [c.code, { dept: d, course: c }] as const)));

export function degreeCourse(code: string) {
  return byCode.get(code) ?? null;
}
