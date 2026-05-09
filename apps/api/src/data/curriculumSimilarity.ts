import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

type CurriculumRow = {
  university: string;
  department: string;
  record_type: string;
  category: string;
  year_term: string;
  course_or_item: string;
  credits: string;
  requirement_type: string;
  track: string;
  source_url: string;
  evidence_file: string;
  notes: string;
};

export type Course = {
  university: string;
  department: string;
  yearTerm: string;
  title: string;
  canonicalTitle: string;
  area: string;
  text: string;
  credits?: number | null;
  requirementType?: string | null;
  track?: string | null;
  category?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  evidenceFile?: string | null;
};

export type CurriculumSimilarityOptions = {
  school?: string;
  department?: string;
  grade?: string;
  semester?: string;
  yearTerm?: string;
};

export type CurriculumSimilarityResult = {
  base: {
    school: string;
    department: string;
    courseCount: number;
    filters: {
      grade?: string;
      semester?: string;
      yearTerm?: string;
    };
  };
  rankings: Array<{
    rank: number;
    school: string;
    department: string;
    score: number;
    components: {
      semantic: number;
      jaccard: number;
      area: number;
      structure: number;
    };
    sharedCourses: string[];
    sharedAreas: string[];
    differentAreas: string[];
    comparedCourseCount: number;
  }>;
  availableTargets: Array<{
    school: string;
    department: string;
    courseCount: number;
  }>;
};

const CSV_RELATIVE_PATH = path.join(
  "major_mirror_cs_departments",
  "csv",
  "all_computer_engineering_departments.csv",
);

const SCHOOL_ALIASES: Record<string, string> = {
  가천대학교: "가천대",
  경기대학교: "경기대",
  고려대학교: "고려대",
  서울대학교: "서울대",
  아주대학교: "아주대",
  연세대학교: "연세대",
  용인대학교: "용인대",
  인천대학교: "인천대",
  인하대학교: "인하대",
  한양대학교: "한양대",
};

const areaRules: Array<{ area: string; keywords: string[] }> = [
  { area: "프로그래밍", keywords: ["프로그래밍", "programming", "python", "c언어", "객체지향", "자바", "java"] },
  { area: "자료구조", keywords: ["자료구조", "data structure"] },
  { area: "알고리즘", keywords: ["알고리즘", "algorithm"] },
  { area: "이산수학", keywords: ["이산", "discrete"] },
  { area: "수학/통계", keywords: ["수학", "선형대수", "확률", "통계", "미적분", "mathematics"] },
  { area: "컴퓨터구조", keywords: ["컴퓨터구조", "구조론", "architecture", "논리회로", "디지털논리"] },
  { area: "운영체제", keywords: ["운영체제", "operating system", "os"] },
  { area: "데이터베이스", keywords: ["데이터베이스", "database", "db"] },
  { area: "네트워크", keywords: ["네트워크", "network", "통신"] },
  { area: "소프트웨어공학", keywords: ["소프트웨어공학", "software engineering", "요구분석", "품질", "테스팅"] },
  { area: "AI/머신러닝", keywords: ["인공지능", "ai", "머신러닝", "machine learning", "딥러닝", "deep learning", "지능"] },
  { area: "데이터/빅데이터", keywords: ["데이터", "빅데이터", "data science", "데이터마이닝"] },
  { area: "보안", keywords: ["보안", "security", "암호"] },
  { area: "웹/앱", keywords: ["웹", "앱", "모바일", "인터넷", "프론트", "백엔드"] },
  { area: "시스템/임베디드", keywords: ["시스템", "임베디드", "마이크로프로세서", "iot", "로봇"] },
  { area: "캡스톤/프로젝트", keywords: ["캡스톤", "종합설계", "프로젝트", "현장실습", "창의설계"] },
];

let cachedCourses: Course[] | null = null;

export function buildCurriculumSimilarity(
  options: CurriculumSimilarityOptions = {},
): CurriculumSimilarityResult {
  return buildCurriculumSimilarityFromCourses(loadCurriculumCourses(), options);
}

export async function buildCurriculumSimilarityFromDatabase(
  options: CurriculumSimilarityOptions = {},
): Promise<CurriculumSimilarityResult> {
  if (!prisma) {
    return buildCurriculumSimilarity(options);
  }

  try {
    const dbCourses = await prisma.course.findMany({
      include: {
        department: {
          include: {
            university: true,
          },
        },
      },
    });

    if (dbCourses.length === 0) {
      return buildCurriculumSimilarity(options);
    }

    const courses = dbCourses.map((course) => ({
      university: course.department.university.name,
      department: course.department.name,
      yearTerm: course.yearTerm,
      title: course.title,
      canonicalTitle: course.canonicalTitle,
      area: course.area,
      text: normalizeSpaces(
        [
          course.title,
          course.category ?? "",
          course.track ?? "",
          course.notes ?? "",
        ].join(" "),
      ),
      credits: course.credits,
      requirementType: course.requirementType,
      track: course.track,
      category: course.category,
      notes: course.notes,
      sourceUrl: course.sourceUrl,
      evidenceFile: course.evidenceFile,
    }));

    return buildCurriculumSimilarityFromCourses(courses, options);
  } catch (error) {
    console.warn("Curriculum DB lookup failed. Falling back to CSV data.");
    console.warn(error);
    return buildCurriculumSimilarity(options);
  }
}

export function buildCurriculumSimilarityFromCourses(
  sourceCourses: Course[],
  options: CurriculumSimilarityOptions = {},
): CurriculumSimilarityResult {
  const courses = filterCourses(sourceCourses, options);
  const availableTargets = buildAvailableTargets(courses);
  const baseKey = resolveBaseKey(courses, options);
  const grouped = groupByTarget(courses);
  const baseCourses = grouped.get(baseKey) ?? [];

  const rankings = [...grouped.entries()]
    .filter(([key]) => key !== baseKey)
    .map(([key, otherCourses]) => {
      const [school, department] = key.split("||");
      const components = scoreComponents(baseCourses, otherCourses);
      const score =
        components.semantic * 0.45 +
        components.jaccard * 0.25 +
        components.area * 0.2 +
        components.structure * 0.1;

      return {
        rank: 0,
        school,
        department,
        score: round(score),
        components,
        sharedCourses: sharedCanonicalCourses(baseCourses, otherCourses).slice(0, 6),
        sharedAreas: sharedAreas(baseCourses, otherCourses).slice(0, 5),
        differentAreas: differentAreas(baseCourses, otherCourses).slice(0, 4),
        comparedCourseCount: otherCourses.length,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const [school, department] = baseKey.split("||");

  return {
    base: {
      school,
      department,
      courseCount: baseCourses.length,
      filters: {
        grade: options.grade,
        semester: options.semester,
        yearTerm: options.yearTerm,
      },
    },
    rankings,
    availableTargets,
  };
}

export function loadCurriculumCourses() {
  if (cachedCourses) {
    return cachedCourses;
  }

  const csvPath = findCsvPath();
  const csv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(csv);
  cachedCourses = rows
    .filter((row) => row.record_type === "course" && row.course_or_item.trim())
    .map((row) => {
      const title = normalizeSpaces(row.course_or_item);
      const text = normalizeSpaces(
        [row.course_or_item, row.category, row.track, row.notes].filter(Boolean).join(" "),
      );
      return {
        university: row.university,
        department: row.department,
        yearTerm: normalizeSpaces(row.year_term) || "확인 필요",
        title,
        canonicalTitle: canonicalizeCourseName(title),
        area: classifyArea(text),
        text,
        credits: parseCredits(row.credits),
        requirementType: normalizeNullable(row.requirement_type),
        track: normalizeNullable(row.track),
        category: normalizeNullable(row.category),
        notes: normalizeNullable(row.notes),
        sourceUrl: normalizeNullable(row.source_url),
        evidenceFile: normalizeNullable(row.evidence_file),
      };
    });
  return cachedCourses;
}

function findCsvPath() {
  const candidates = [
    path.resolve(process.cwd(), CSV_RELATIVE_PATH),
    path.resolve(process.cwd(), "..", CSV_RELATIVE_PATH),
    path.resolve(process.cwd(), "..", "..", CSV_RELATIVE_PATH),
    path.resolve(process.cwd(), "..", "..", "..", CSV_RELATIVE_PATH),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Curriculum CSV not found. Tried: ${candidates.join(", ")}`);
  }
  return found;
}

function parseCsv(csv: string): CurriculumRow[] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      record.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      record.push(field);
      field = "";
      if (record.some((value) => value.length > 0)) {
        records.push(record);
      }
      record = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const [headers = [], ...body] = records;
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  ) as CurriculumRow[];
}

function filterCourses(courses: Course[], options: CurriculumSimilarityOptions) {
  return courses.filter((course) => {
    if (options.yearTerm && course.yearTerm !== options.yearTerm) {
      return false;
    }
    if (options.grade && !course.yearTerm.startsWith(`${options.grade}-`)) {
      return false;
    }
    if (options.semester && !course.yearTerm.endsWith(`-${options.semester}`)) {
      return false;
    }
    return true;
  });
}

function resolveBaseKey(courses: Course[], options: CurriculumSimilarityOptions) {
  const targets = buildAvailableTargets(courses);
  const school = normalizeSchoolName(options.school || targets[0]?.school || "인하대");
  const department = normalizeSpaces(options.department || "");
  const exact = targets.find(
    (target) =>
      target.school === school &&
      (!department || target.department === department || target.department.includes(department)),
  );

  if (exact) {
    return targetKey(exact.school, exact.department);
  }

  const schoolOnly = targets.find((target) => target.school === school);
  if (schoolOnly) {
    return targetKey(schoolOnly.school, schoolOnly.department);
  }

  return targetKey(targets[0].school, targets[0].department);
}

function buildAvailableTargets(courses: Course[]) {
  return [...groupByTarget(courses).entries()]
    .map(([key, targetCourses]) => {
      const [school, department] = key.split("||");
      return { school, department, courseCount: targetCourses.length };
    })
    .sort((a, b) => a.school.localeCompare(b.school, "ko"));
}

function groupByTarget(courses: Course[]) {
  const grouped = new Map<string, Course[]>();
  for (const course of courses) {
    const key = targetKey(course.university, course.department);
    grouped.set(key, [...(grouped.get(key) ?? []), course]);
  }
  return grouped;
}

function scoreComponents(baseCourses: Course[], otherCourses: Course[]) {
  return {
    semantic: round(cosine(tokenVector(baseCourses), tokenVector(otherCourses))),
    jaccard: round(jaccard(
      new Set(baseCourses.map((course) => course.canonicalTitle)),
      new Set(otherCourses.map((course) => course.canonicalTitle)),
    )),
    area: round(cosine(areaVector(baseCourses), areaVector(otherCourses))),
    structure: round(cosine(yearTermVector(baseCourses), yearTermVector(otherCourses))),
  };
}

function tokenVector(courses: Course[]) {
  const vector = new Map<string, number>();
  for (const course of courses) {
    for (const token of tokenize(`${course.canonicalTitle} ${course.area} ${course.text}`)) {
      vector.set(token, (vector.get(token) ?? 0) + 1);
    }
  }
  return vector;
}

function areaVector(courses: Course[]) {
  const vector = new Map<string, number>();
  for (const course of courses) {
    vector.set(course.area, (vector.get(course.area) ?? 0) + 1);
  }
  return vector;
}

function yearTermVector(courses: Course[]) {
  const vector = new Map<string, number>();
  for (const course of courses) {
    vector.set(course.yearTerm, (vector.get(course.yearTerm) ?? 0) + 1);
  }
  return vector;
}

function cosine(a: Map<string, number>, b: Map<string, number>) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  let dot = 0;
  let aMag = 0;
  let bMag = 0;

  for (const key of keys) {
    const av = a.get(key) ?? 0;
    const bv = b.get(key) ?? 0;
    dot += av * bv;
    aMag += av * av;
    bMag += bv * bv;
  }

  if (aMag === 0 || bMag === 0) {
    return 0;
  }
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

function jaccard(a: Set<string>, b: Set<string>) {
  const union = new Set([...a, ...b]);
  if (union.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const value of a) {
    if (b.has(value)) {
      intersection += 1;
    }
  }
  return intersection / union.size;
}

function sharedCanonicalCourses(baseCourses: Course[], otherCourses: Course[]) {
  const other = new Set(otherCourses.map((course) => course.canonicalTitle));
  return [...new Set(baseCourses.map((course) => course.canonicalTitle))]
    .filter((course) => other.has(course))
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function sharedAreas(baseCourses: Course[], otherCourses: Course[]) {
  const other = new Set(otherCourses.map((course) => course.area));
  return [...new Set(baseCourses.map((course) => course.area))]
    .filter((area) => other.has(area))
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function differentAreas(baseCourses: Course[], otherCourses: Course[]) {
  const baseCounts = countAreas(baseCourses);
  const otherCounts = countAreas(otherCourses);
  return [...new Set([...baseCounts.keys(), ...otherCounts.keys()])]
    .map((area) => ({
      area,
      delta: Math.abs((baseCounts.get(area) ?? 0) - (otherCounts.get(area) ?? 0)),
    }))
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .map((item) => item.area);
}

function countAreas(courses: Course[]) {
  const counts = new Map<string, number>();
  for (const course of courses) {
    counts.set(course.area, (counts.get(course.area) ?? 0) + 1);
  }
  return counts;
}

export function canonicalizeCourseName(title: string) {
  const normalized = normalizeSpaces(title)
    .toLowerCase()
    .replace(/[()［］\[\]ⅠⅡⅢⅣⅴivx0-9]/gi, "")
    .replace(/\s+/g, "");

  const aliases: Array<[RegExp, string]> = [
    [/자료구조|datastructure/, "자료구조"],
    [/알고리즘|algorithm/, "알고리즘"],
    [/운영체제|operatingsystem/, "운영체제"],
    [/데이터베이스|database|db/, "데이터베이스"],
    [/컴퓨터구조|architecture/, "컴퓨터구조"],
    [/네트워크|network/, "네트워크"],
    [/소프트웨어공학|softwareengineering/, "소프트웨어공학"],
    [/이산/, "이산수학"],
    [/선형대수/, "선형대수"],
    [/확률|통계/, "확률통계"],
    [/인공지능|머신러닝|딥러닝|ai/, "AI/머신러닝"],
    [/보안|security/, "보안"],
    [/캡스톤|종합설계/, "캡스톤디자인"],
    [/객체지향/, "객체지향프로그래밍"],
    [/프로그래밍|programming/, "프로그래밍"],
  ];

  return aliases.find(([pattern]) => pattern.test(normalized))?.[1] || title;
}

export function classifyArea(text: string) {
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  return (
    areaRules.find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase().replace(/\s+/g, ""))),
    )?.area || "기타 전공"
  );
}

function tokenize(text: string) {
  return normalizeSpaces(text)
    .toLowerCase()
    .split(/[^가-힣a-z0-9/]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function normalizeSchoolName(school: string) {
  const normalized = normalizeSpaces(school);
  return SCHOOL_ALIASES[normalized] || normalized;
}

function targetKey(school: string, department: string) {
  return `${school}||${department}`;
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeNullable(value: string) {
  const normalized = normalizeSpaces(value);
  return normalized.length > 0 ? normalized : null;
}

function parseCredits(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number) {
  return Number(value.toFixed(3));
}
