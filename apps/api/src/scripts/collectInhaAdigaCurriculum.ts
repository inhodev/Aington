const adigaBaseUrl = "https://www.adiga.kr";
const inhaUniversityCode = "0000169";
const userAgent = "AingtonDataCollector/1.0";

type SubjectCard = {
  department: string;
  field: string;
  recruitmentCount: number | null;
  ruCd: string;
  searchYear: string;
};

type DepartmentDetail = SubjectCard & {
  sourceUrl: string;
  detailDepartment: string;
  educationGoal: string;
  courses: string[];
  careerFields: string[];
};

const years = process.argv.slice(2).filter((arg) => /^\d{4}$/.test(arg));
const searchYears = years.length > 0 ? years : ["2026", "2027"];

const results = (
  await Promise.all(searchYears.map((searchYear) => collectSearchYear(searchYear)))
).flat();

const byDepartment = new Map<string, DepartmentDetail>();
for (const result of results) {
  const existing = byDepartment.get(result.department);
  if (!existing || (existing.courses.length === 0 && result.courses.length > 0)) {
    byDepartment.set(result.department, result);
  }
}

const departments = [...byDepartment.values()].sort((a, b) =>
  a.department.localeCompare(b.department, "ko"),
);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "ADIGA 대입정보포털 인하대학교 설치학과/학과정보",
      universityCode: inhaUniversityCode,
      searchYears,
      departmentCount: departments.length,
      courseBackedDepartmentCount: departments.filter((item) => item.courses.length > 0).length,
      departments,
    },
    null,
    2,
  ),
);

async function collectSearchYear(searchYear: string) {
  const session = await createAdigaSession(searchYear);
  const cards = await collectSubjectCards(session, searchYear);
  const details: DepartmentDetail[] = [];

  for (const card of cards) {
    details.push(await collectDepartmentDetail(session.cookie, card));
    await wait(80);
  }

  return details;
}

async function createAdigaSession(searchYear: string) {
  const url = `${adigaBaseUrl}/ucp/uvt/uni/univDetailSubject.do?menuId=PCUVTINF2000&unvCd=${inhaUniversityCode}&searchSyr=${searchYear}`;
  const response = await fetch(url, { headers: { "user-agent": userAgent } });
  const html = await response.text();
  const csrf =
    html.match(/name="_csrf" value="([^"]+)"/)?.[1] ??
    html.match(/name="_csrf" content="([^"]+)"/)?.[1] ??
    "";
  const cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";

  if (!response.ok || !csrf) {
    throw new Error(`Failed to open ADIGA subject page for ${searchYear}`);
  }

  return { cookie, csrf, firstPageHtml: html };
}

async function collectSubjectCards(
  session: { cookie: string; csrf: string; firstPageHtml: string },
  searchYear: string,
) {
  const cards: SubjectCard[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const html =
      page === 1
        ? session.firstPageHtml
        : await fetchSubjectPage(session, searchYear, page);
    const pageCards = parseSubjectCards(html, searchYear);
    cards.push(...pageCards);

    if (pageCards.length === 0) {
      break;
    }
  }

  return [...new Map(cards.map((card) => [card.ruCd, card])).values()];
}

async function fetchSubjectPage(
  session: { cookie: string; csrf: string },
  searchYear: string,
  page: number,
) {
  const body = new URLSearchParams({
    _csrf: session.csrf,
    "pagination.currentPage": String(page),
    "pagination.cntPerPage": "9",
    ruCd: "",
    searchSyr: searchYear,
    unvCd: inhaUniversityCode,
    syr: searchYear,
    aftCd: "",
  });
  const response = await fetch(`${adigaBaseUrl}/ucp/uvt/uni/univDetailSubjectAjax.do`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      cookie: session.cookie,
      "user-agent": userAgent,
      "x-csrf-token": session.csrf,
    },
    body,
  });

  return response.text();
}

async function collectDepartmentDetail(cookie: string, card: SubjectCard) {
  const sourceUrl = `${adigaBaseUrl}/ucp/cls/uni/classUnivDetail.do?menuId=PCCLSINF2000&ruCd=${card.ruCd}&searchSyr=${card.searchYear}&unvCd=${inhaUniversityCode}`;
  const response = await fetch(sourceUrl, {
    headers: { cookie, "user-agent": userAgent },
  });
  const html = await response.text();
  const detailDepartment =
    normalizeHtmlText(
      html.match(/<div class="innerClsTit">[\s\S]*?<h4 class="h3">([\s\S]*?)<\/h4>/)?.[1] ??
        card.department,
    ) || card.department;

  return {
    ...card,
    sourceUrl,
    detailDepartment,
    educationGoal: extractSection(html, "교육목표"),
    courses: splitList(extractSection(html, "교육과정")),
    careerFields: splitList(extractSection(html, "진로취업분야")),
  };
}

function parseSubjectCards(html: string, searchYear: string) {
  const cards: SubjectCard[] = [];
  const cardPattern =
    /fnDetailPage\(&quot;(\d+)&quot;\)[\s\S]*?<span class="tit">([^<]+)<\/span>[\s\S]*?<span>([^<]+)<\/span>[\s\S]*?<span class="desc">모집인원<\/span>\s*<span class="no">([^<]+)<\/span>/g;
  let match: RegExpExecArray | null;

  while ((match = cardPattern.exec(html))) {
    cards.push({
      ruCd: match[1],
      department: normalizeHtmlText(match[2]),
      field: normalizeHtmlText(match[3]),
      recruitmentCount: Number(normalizeHtmlText(match[4]).replace(/[^0-9]/g, "")) || null,
      searchYear,
    });
  }

  return cards;
}

function extractSection(html: string, title: string) {
  const sectionPattern = new RegExp(
    `<h4 class="h3">${title}<\\/h4>\\s*<p[^>]*>([\\s\\S]*?)<\\/p>`,
    "i",
  );
  return normalizeHtmlText(html.match(sectionPattern)?.[1] ?? "");
}

function splitList(text: string) {
  return [
    ...new Set(
      text
        .split(/,|，/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2 && item.length <= 40),
    ),
  ];
}

function normalizeHtmlText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
