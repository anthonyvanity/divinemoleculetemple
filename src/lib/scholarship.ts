import data from "./scholarship.json";

export type ScholarshipBlock = { h: string; p: string[] };

export type ScholarshipCourse = {
  id: string;
  title: string;
  level: "initiate" | "adept" | "inner";
  tier: string;
  free: boolean;
  thesis: string;
  blocks: ScholarshipBlock[];
};

export type ScholarshipDept = {
  code: string;
  roman: string;
  track: string;
  name: string;
  line: string;
  courses: ScholarshipCourse[];
};

type ScholarshipFile = {
  title: string;
  mission: string;
  departments: ScholarshipDept[];
};

export const SCHOLARSHIP = data as ScholarshipFile;

const byId = new Map<string, { course: ScholarshipCourse; dept: ScholarshipDept }>();
for (const dept of SCHOLARSHIP.departments) {
  for (const course of dept.courses) byId.set(course.id, { course, dept });
}

export function scholarshipCourse(id: string) {
  const hit = byId.get(id);
  if (!hit) return null;
  return { ...hit.course, dept: hit.dept };
}

export function scholarshipPreview(id: string, n = 2) {
  const hit = byId.get(id);
  if (!hit) return [];
  return hit.course.blocks.flatMap((block) => block.p).slice(0, n);
}

export const SCHOLARSHIP_COUNT = SCHOLARSHIP.departments.reduce((n, dept) => n + dept.courses.length, 0);

export const SCHOLARSHIP_SEQUENCE = SCHOLARSHIP.departments.flatMap((dept) => dept.courses.map((course) => course.id));
