type AuditCheck = {
  id: string;
  ok: boolean;
  severity: "blocker" | "warning";
  detail: string;
};

type JsonRecord = Record<string, any>;

const apiUrl = normalizeBaseUrl(
  process.env.AINGTON_API_URL || process.env.PILOT_API_URL || "https://aington-api.vercel.app",
);
const webUrl = normalizeBaseUrl(process.env.AINGTON_WEB_URL || "https://aington.vercel.app");

const checks: AuditCheck[] = [];

const health = await fetchJson("/health");
const validation = await fetchJson("/api/validation-status");
const readiness = await fetchJson("/api/pilot-readiness");
const inhaElectrical = await fetchJson(
  `/api/insights?school=${encodeURIComponent("인하대학교")}&department=${encodeURIComponent("전기전자공학부")}`,
);
const businessFusion = await fetchJson(
  `/api/insights?school=${encodeURIComponent("인하대학교")}&department=${encodeURIComponent("경영융합학부")}`,
);
const webHome = await fetchText(webUrl);

recordCheck({
  id: "api-health",
  ok: health.status === 200 && health.body?.ok === true,
  severity: "blocker",
  detail: `GET /health returned ${health.status} (${health.body?.storage ?? "unknown"} storage).`,
});

const coverage = validation.body?.dataCoverage ?? {};
recordCheck({
  id: "inha-admission-coverage",
  ok: validation.status === 200 && coverage.inhaDepartmentCount >= 70,
  severity: "blocker",
  detail: `${coverage.inhaDepartmentCount ?? 0} Inha admission units are represented.`,
});
recordCheck({
  id: "inha-source-backed-coverage",
  ok:
    validation.status === 200 &&
    coverage.inhaPublicCourseBackedDepartmentCount >= 55 &&
    coverage.inhaOfficialSugangCourseBackedAdmissionDepartmentCount >= 15 &&
    coverage.inhaSourceBackedAdmissionDepartmentCount >= 70,
  severity: "blocker",
  detail: `ADIGA ${coverage.inhaPublicCourseBackedDepartmentCount ?? 0}, sugang ${
    coverage.inhaOfficialSugangCourseBackedAdmissionDepartmentCount ?? 0
  }, final source-backed ${coverage.inhaSourceBackedAdmissionDepartmentCount ?? 0}.`,
});
recordCheck({
  id: "needs-review-bounded-and-named",
  ok:
    validation.status === 200 &&
    coverage.inhaArchetypeOnlyDepartmentCount <= 5 &&
    Array.isArray(coverage.inhaNeedsReviewAdmissionDepartments) &&
    coverage.inhaNeedsReviewAdmissionDepartments.length === coverage.inhaArchetypeOnlyDepartmentCount,
  severity: "blocker",
  detail: `needs-review departments: ${
    Array.isArray(coverage.inhaNeedsReviewAdmissionDepartments)
      ? coverage.inhaNeedsReviewAdmissionDepartments.join(", ") || "none"
      : "missing from validation-status"
  }.`,
});

const failedBlockers = (readiness.body?.checks ?? []).filter(
  (check: JsonRecord) => check.severity === "blocker" && !check.ok,
);
recordCheck({
  id: "pilot-readiness-blockers",
  ok: readiness.status === 200 && failedBlockers.length === 0,
  severity: "blocker",
  detail:
    failedBlockers.length === 0
      ? "No failed blocker checks."
      : failedBlockers.map((check: JsonRecord) => check.id).join(", "),
});

recordCheck({
  id: "inha-ee-report-trust",
  ok:
    inhaElectrical.status === 200 &&
    inhaElectrical.body?.curriculumTrust?.sourceKind === "inha-sugang-course-schedule" &&
    inhaElectrical.body?.curriculumTrust?.sourceCourseSignalCount >= 60 &&
    inhaElectrical.body?.headline?.includes("인하대 ") &&
    inhaElectrical.body?.headline?.includes("공학과"),
  severity: "blocker",
  detail: `${inhaElectrical.body?.headline ?? "no headline"} / ${
    inhaElectrical.body?.curriculumTrust?.sourceCourseSignalCount ?? 0
  } course signals.`,
});

recordCheck({
  id: "inha-fusion-report-honesty",
  ok:
    businessFusion.status === 200 &&
    businessFusion.body?.curriculumTrust?.sourceKind === "archetype-seed" &&
    businessFusion.body?.curriculumTrust?.confidence === "needs-review",
  severity: "blocker",
  detail: `경영융합학부 trust is ${
    businessFusion.body?.curriculumTrust?.sourceKind ?? "missing"
  }/${businessFusion.body?.curriculumTrust?.confidence ?? "missing"}.`,
});

recordCheck({
  id: "web-home",
  ok: webHome.status === 200 && webHome.body.includes("데이터로 찾는"),
  severity: "blocker",
  detail: `GET ${webUrl} returned ${webHome.status}.`,
});

const failed = checks.filter((check) => check.severity === "blocker" && !check.ok);
const result = {
  generatedAt: new Date().toISOString(),
  apiUrl,
  webUrl,
  status: failed.length === 0 ? "pass" : "fail",
  failedBlockerCount: failed.length,
  checks,
  nextAction:
    failed.length === 0
      ? "Proceed with the 10-student private pilot and monitor intent_created / report_viewed."
      : "Fix failed blocker checks before inviting students.",
};

console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) {
  process.exitCode = 1;
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

async function fetchJson(path: string) {
  const url = `${apiUrl}${path}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    return {
      status: response.status,
      body: parseJson(text),
    };
  } catch (error) {
    return {
      status: 0,
      body: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url);
    return {
      status: response.status,
      body: await response.text(),
    };
  } catch (error) {
    return {
      status: 0,
      body: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 500) };
  }
}

function recordCheck(check: AuditCheck) {
  checks.push(check);
}
