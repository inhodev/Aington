import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sugangBaseUrl = "https://sugang.inha.ac.kr";
const sugangCourseSearchUrl = `${sugangBaseUrl}/sugang/SU_51001/Lec_Time_Search.aspx`;
const userAgent = "AingtonDataCollector/1.0";
const sourceTerm = "2026학년도 1학기";

type SugangCourse = {
  title: string;
  code: string;
  requirementType: string;
  grade: string;
  credits: number | null;
  sourceDepartment: string;
};

type SugangDepartment = {
  department: string;
  departmentCodes: string[];
  sourceTitles: string[];
  term: string;
  sourceUrl: string;
  courses: SugangCourse[];
};

type TableCourseRow = SugangCourse & {
  sectionCode: string;
};

const targetDepartmentCodes: Record<string, string[]> = {
  전기전자공학부: ["1601284", "1601767"],
  이차전지융합학과: ["1602285", "1602375", "1602700"],
  파이낸스경영학과: ["1608093"],
  영미유럽인문융합학부: ["1604067", "1604088", "1604486"],
  문화콘텐츠문화경영학과: ["1236588"],
  의예과: ["0317077"],
  간호학과: ["1600079"],
  디자인융합학과: ["1450589"],
  의류디자인학과: ["1454288"],
  소프트웨어융합공학과: ["1238590"],
  자유전공융합학부: ["1613354"],
  공학융합학부: ["1614096"],
  자연과학융합학부: ["1615102"],
  경영융합학부: ["1616110"],
  사회과학융합학부: ["1617262"],
  인문융합학부: ["1618265"],
  첨단바이오의약학과: ["1603353"],
  바이오식품공학과: ["1683817"],
};

const args = new Set(process.argv.slice(2));
const collectedDepartments = await collectInhaSugangDepartments();

if (args.has("--write-static")) {
  await writeStaticModule(collectedDepartments);
} else {
  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "인하대학교 수강신청 강의시간표 및 강의계획서",
        sourceUrl: sugangCourseSearchUrl,
        term: sourceTerm,
        departmentCount: collectedDepartments.length,
        courseBackedDepartmentCount: collectedDepartments.filter(
          (department) => department.courses.length >= 4,
        ).length,
        partialDepartmentCount: collectedDepartments.filter(
          (department) => department.courses.length > 0 && department.courses.length < 4,
        ).length,
        departments: collectedDepartments.map((department) => ({
          department: department.department,
          departmentCodes: department.departmentCodes,
          sourceTitles: department.sourceTitles,
          courseCount: department.courses.length,
          sampleCourses: department.courses.slice(0, 12).map((course) => course.title),
        })),
      },
      null,
      2,
    ),
  );
}

async function collectInhaSugangDepartments() {
  const session = await createSugangSession();
  const departments: SugangDepartment[] = [];

  for (const [department, departmentCodes] of Object.entries(targetDepartmentCodes)) {
    const courseByTitle = new Map<string, SugangCourse>();
    const sourceTitles: string[] = [];

    for (const departmentCode of departmentCodes) {
      const html = await fetchDepartmentSchedule(session, departmentCode);
      const sourceTitle = extractScheduleTitle(html);
      sourceTitles.push(sourceTitle);

      for (const course of parseMajorCourses(html, sourceTitle)) {
        if (!courseByTitle.has(course.title)) {
          courseByTitle.set(course.title, course);
        }
      }

      await wait(80);
    }

    departments.push({
      department,
      departmentCodes,
      sourceTitles,
      term: sourceTerm,
      sourceUrl: sugangCourseSearchUrl,
      courses: [...courseByTitle.values()],
    });
  }

  return departments;
}

async function createSugangSession() {
  const response = await fetch(sugangCourseSearchUrl, {
    headers: { "user-agent": userAgent },
  });
  const html = await response.text();
  const cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";

  if (!response.ok || !html.includes("ddlDept")) {
    throw new Error("Failed to open Inha sugang course search page");
  }

  return { cookie, firstPageHtml: html };
}

async function fetchDepartmentSchedule(
  session: { cookie: string; firstPageHtml: string },
  departmentCode: string,
) {
  const body = buildDepartmentSearchParams(session.firstPageHtml, departmentCode);
  const response = await fetch(sugangCourseSearchUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: session.cookie,
      "user-agent": userAgent,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Inha sugang department ${departmentCode}`);
  }

  return response.text();
}

function buildDepartmentSearchParams(html: string, departmentCode: string) {
  const params = new URLSearchParams();

  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if (!attributes.name) {
      continue;
    }

    const type = (attributes.type ?? "").toLowerCase();
    if (["submit", "button", "image", "reset"].includes(type)) {
      continue;
    }

    params.append(attributes.name, attributes.value ?? "");
  }

  for (const match of html.matchAll(
    /<select\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi,
  )) {
    const name = decodeHtmlEntities(match[1]);
    const options = [
      ...match[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi),
    ];
    const selected = options.find((option) => /selected/i.test(option[1])) ?? options[0];
    const selectedAttributes = selected ? parseAttributes(`<option ${selected[1]}>`) : {};
    params.set(name, selectedAttributes.value ?? normalizeHtmlText(selected?.[2] ?? ""));
  }

  params.set("ddlDept", departmentCode);
  params.set("hhdSrchGubun", "search1");
  params.set("hhdGetval", "");
  params.set("ibtnSearch1", "조회");
  return params;
}

function parseMajorCourses(html: string, sourceDepartment: string): SugangCourse[] {
  const table = html.match(/<table[^>]+id="dgList"[\s\S]*?<\/table>/i)?.[0] ?? "";
  const courses: TableCourseRow[] = [];

  for (const rowMatch of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      normalizeHtmlText(cell[1]),
    );

    if (cells.length < 10 || cells[0] === "학수번호") {
      continue;
    }

    const requirementType = cells[5];
    const title = normalizeCourseTitle(cells[2]);

    if (!requirementType.startsWith("전공") || title.length < 2) {
      continue;
    }

    courses.push({
      title,
      code: cells[0].split("-")[0],
      sectionCode: cells[0],
      requirementType,
      grade: cells[3],
      credits: Number.parseFloat(cells[4]) || null,
      sourceDepartment,
    });
  }

  return courses.map(({ sectionCode: _sectionCode, ...course }) => course);
}

function extractScheduleTitle(html: string) {
  return (
    normalizeHtmlText(
      html.match(/id="lblTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "",
    ) || "인하대학교 강의시간표 및 강의계획서"
  );
}

function renderStaticModule(departments: SugangDepartment[]) {
  return `export type InhaOfficialSugangCourse = {
  title: string;
  code: string;
  requirementType: string;
  grade: string;
  credits: number | null;
  sourceDepartment: string;
};

export type InhaOfficialSugangDepartment = {
  department: string;
  departmentCodes: string[];
  sourceTitles: string[];
  term: string;
  sourceUrl: string;
  courses: InhaOfficialSugangCourse[];
};

export const inhaOfficialSugangSourceUrl = ${JSON.stringify(sugangCourseSearchUrl)};

export const inhaOfficialSugangEvidence =
  "인하대학교 수강신청 2026학년도 1학기 강의시간표 및 강의계획서";

export const inhaOfficialSugangMinimumCourseSignals = 4;

export const inhaOfficialSugangDepartments: InhaOfficialSugangDepartment[] = ${JSON.stringify(
    departments,
    null,
    2,
  )};

export function findInhaOfficialSugangDepartment(department: string) {
  const normalizedDepartment = normalizeDepartmentName(department);
  return inhaOfficialSugangDepartments.find(
    (item) => normalizeDepartmentName(item.department) === normalizedDepartment,
  );
}

export function summarizeInhaOfficialSugangCoverage(
  admissionDepartments: string[],
  minimumCourseSignals = inhaOfficialSugangMinimumCourseSignals,
) {
  const matchedDepartments = admissionDepartments
    .map((department) => ({
      department,
      schedule: findInhaOfficialSugangDepartment(department),
    }))
    .filter(({ schedule }) => Boolean(schedule));

  const courseBackedDepartments = matchedDepartments.filter(
    ({ schedule }) => (schedule?.courses.length ?? 0) >= minimumCourseSignals,
  );

  const partialDepartments = matchedDepartments.filter(({ schedule }) => {
    const courseCount = schedule?.courses.length ?? 0;
    return courseCount > 0 && courseCount < minimumCourseSignals;
  });

  return {
    officialDepartmentCount: inhaOfficialSugangDepartments.length,
    matchedAdmissionDepartmentCount: matchedDepartments.length,
    courseBackedAdmissionDepartmentCount: courseBackedDepartments.length,
    partialAdmissionDepartmentCount: partialDepartments.length,
    courseBackedAdmissionDepartments: courseBackedDepartments.map(
      ({ department }) => department,
    ),
    partialAdmissionDepartments: partialDepartments.map(({ department }) => department),
    missingAdmissionDepartments: admissionDepartments.filter(
      (department) => !findInhaOfficialSugangDepartment(department),
    ),
  };
}

function normalizeDepartmentName(department: string) {
  return department.replace(/\\s+/g, "").trim();
}
`;
}

async function writeStaticModule(departments: SugangDepartment[]) {
  const scriptPath = fileURLToPath(import.meta.url);
  const outputPath = path.resolve(
    path.dirname(scriptPath),
    "../data/inhaOfficialSugangCourses.ts",
  );

  await fs.writeFile(outputPath, renderStaticModule(departments));
  console.log(
    JSON.stringify(
      {
        ok: true,
        outputPath,
        departmentCount: departments.length,
        courseBackedDepartmentCount: departments.filter(
          (department) => department.courses.length >= 4,
        ).length,
      },
      null,
      2,
    ),
  );
}

function parseAttributes(tag: string) {
  const attributes: Record<string, string> = {};
  for (const match of tag.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) {
    attributes[match[1]] = decodeHtmlEntities(match[2]);
  }
  return attributes;
}

function normalizeCourseTitle(title: string) {
  return normalizeHtmlText(title).replace(/\s+/g, " ").trim();
}

function normalizeHtmlText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
