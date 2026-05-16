import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  buildCurriculumSimilarityFromDatabase,
  getCurriculumFallbackSource,
} from "./data/curriculumSimilarity.js";
import {
  buildComplementMatches,
  type MatchingDistance,
  type PortfolioCategory,
  type PortfolioStats,
} from "./data/complementMatching.js";
import { buildCurriculumReport } from "./data/curriculumReport.js";
import { curriculumSeedCourses } from "./data/curriculumSeed.js";
import { buildGeminiDeepReport, GeminiReportError } from "./data/deepReport.js";
import { buildInsight } from "./data/demo.js";
import {
  inhaAdmissionsSourceUrl,
  inhaDepartmentSeedTargets,
  inhaSupplementalCurriculumCoverage,
} from "./data/inhaDepartments.js";
import {
  inhaSupplementalCurriculumEvidence,
  inhaSupplementalCurriculumSourceUrl,
} from "./data/inhaSupplementalCurriculum.js";
import {
  inhaOfficialSugangEvidence,
  inhaOfficialSugangSourceUrl,
} from "./data/inhaOfficialSugangCourses.js";
import { studentValidationScenarios } from "./data/studentScenarios.js";
import { webSourceCatalog } from "./data/webSourceCatalog.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

type StoredProfile = {
  id: string;
  school: string;
  department: string;
  email: string;
  name: string;
  role: string;
  interest: string;
  wantsToMeet: string;
  intro: string;
  portfolio: string;
  selectedField: string;
  matchingDistance: string;
  portfolioStats: string;
  profileTokenHash: string;
  createdAt: string;
};

type StoredMeetingIntent = {
  id: string;
  profileId: string;
  targetType: "peer" | "meeting";
  targetId: string;
  source: "report" | "dashboard";
  reason: string;
  createdAt: string;
};

type EventName =
  | "report_viewed"
  | "signup_completed"
  | "recommendation_clicked"
  | "intent_created";

type StoredEventLog = {
  id: string;
  profileId: string | null;
  eventName: EventName;
  source: string;
  metadata: string;
  createdAt: string;
};

type CurriculumTrustSnapshot = {
  sourceKind:
    | "database"
    | "adiga-public-department"
    | "inha-sugang-course-schedule"
    | "archetype-seed"
    | "official-seed"
    | "csv"
    | "seed";
  label: string;
  description: string;
  sourceUrl: string | null;
  evidenceFile: string | null;
  sourceCourseSignalCount: number;
  confidence: "high" | "medium" | "needs-review";
};

const defaultDemoSchool = "경기대학교";
const defaultDemoDepartment = "컴퓨터공학과";
const app = express();
const port = Number(process.env.PORT || 4000);
const memoryProfiles: StoredProfile[] = [];
const memoryMeetingIntents: StoredMeetingIntent[] = [];
const memoryEventLogs: StoredEventLog[] = [];
let runtimeSchemaReady: Promise<boolean> | null = null;

const configuredWebOrigins = [
  process.env.WEB_ORIGIN,
  process.env.WEB_ORIGINS,
]
  .filter((value): value is string => Boolean(value))
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedWebOrigins = new Set([
  ...configuredWebOrigins,
  "https://aington.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedWebOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json());

function requireString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isMatchingDistance(value: unknown): value is MatchingDistance {
  return value === "similar" || value === "balanced" || value === "diverse";
}

function isMeetingIntentTarget(value: unknown): value is StoredMeetingIntent["targetType"] {
  return value === "peer" || value === "meeting";
}

function isMeetingIntentSource(value: unknown): value is StoredMeetingIntent["source"] {
  return value === "report" || value === "dashboard";
}

function isEventName(value: unknown): value is EventName {
  return (
    value === "report_viewed" ||
    value === "signup_completed" ||
    value === "recommendation_clicked" ||
    value === "intent_created"
  );
}

function readPortfolioStats(value: unknown): PortfolioStats | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const categories: PortfolioCategory[] = ["프로젝트", "논문", "대회", "기타"];
  const source = value as Record<string, unknown>;
  return categories.reduce<PortfolioStats>((stats, category) => {
    const count = source[category];
    stats[category] = typeof count === "number" && Number.isFinite(count) ? count : 0;
    return stats;
  }, {});
}

function generateProfileToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashProfileToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toPublicProfile<T extends { profileTokenHash?: string | null }>(profile: T) {
  const { profileTokenHash: _profileTokenHash, ...publicProfile } = profile;
  return publicProfile;
}

async function ensurePrismaRuntimeSchema() {
  if (!prisma) {
    return false;
  }

  runtimeSchemaReady ??= (async () => {
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "selectedField" TEXT',
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "matchingDistance" TEXT',
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "portfolioStats" TEXT',
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "profileTokenHash" TEXT',
      );
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "EventLog" (
        "id" TEXT NOT NULL,
        "profileId" TEXT,
        "eventName" TEXT NOT NULL,
        "source" TEXT,
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
      )`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "MeetingIntent" (
        "id" TEXT NOT NULL,
        "profileId" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MeetingIntent_pkey" PRIMARY KEY ("id")
      )`);
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "EventLog_profileId_idx" ON "EventLog"("profileId")',
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "EventLog_eventName_idx" ON "EventLog"("eventName")',
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "EventLog_createdAt_idx" ON "EventLog"("createdAt")',
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "MeetingIntent_profileId_idx" ON "MeetingIntent"("profileId")',
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "MeetingIntent_targetType_targetId_idx" ON "MeetingIntent"("targetType", "targetId")',
      );
      return true;
    } catch (error) {
      runtimeSchemaReady = null;
      console.warn("Runtime Prisma schema check failed.");
      console.warn(error);
      return false;
    }
  })();

  return runtimeSchemaReady;
}

async function resolveCurriculumSource(): Promise<"database" | "seed"> {
  if (!prisma) {
    return "seed";
  }

  try {
    const count = await prisma.course.count();
    return count > 0 ? "database" : "seed";
  } catch {
    return "seed";
  }
}

async function resolveInsightCurriculumSource({
  department,
  school,
}: {
  department: string;
  school: string;
}): Promise<"database" | "csv" | "seed"> {
  const globalSource = prisma ? await resolveCurriculumSource() : getCurriculumFallbackSource();
  if (globalSource !== "database") {
    return globalSource;
  }

  return findInhaDepartmentTarget(school, department) ? "seed" : "database";
}

async function verifyProfileToken(profileId: string, profileToken: string) {
  const tokenHash = hashProfileToken(profileToken);

  if (prisma) {
    if (!(await ensurePrismaRuntimeSchema())) {
      return false;
    }

    try {
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true, profileTokenHash: true },
      });
      return Boolean(profile?.profileTokenHash && profile.profileTokenHash === tokenHash);
    } catch (error) {
      console.warn("Profile token lookup failed.");
      console.warn(error);
      return false;
    }
  }

  const profile = memoryProfiles.find((item) => item.id === profileId);
  return Boolean(profile && profile.profileTokenHash === tokenHash);
}

async function createEventLog({
  eventName,
  metadata,
  profileId,
  source,
}: {
  eventName: EventName;
  metadata?: string;
  profileId?: string | null;
  source?: string;
}) {
  const payload = {
    profileId: profileId || null,
    eventName,
    source: source || "",
    metadata: metadata || "",
  };

  if (prisma && (await ensurePrismaRuntimeSchema())) {
    try {
      return await prisma.eventLog.create({ data: payload });
    } catch (error) {
      console.warn("Event log write failed. Falling back to memory event log.");
      console.warn(error);
    }
  }

  const saved: StoredEventLog = {
    id: `event-${memoryEventLogs.length + 1}`,
    ...payload,
    eventName,
    createdAt: new Date().toISOString(),
  };
  memoryEventLogs.push(saved);
  return saved;
}

async function countEventsByName() {
  const eventNames: EventName[] = [
    "report_viewed",
    "signup_completed",
    "recommendation_clicked",
    "intent_created",
  ];

  if (prisma) {
    if (await ensurePrismaRuntimeSchema()) {
      try {
        const grouped = await prisma.eventLog.groupBy({
          by: ["eventName"],
          _count: { eventName: true },
        });
        return Object.fromEntries(
          eventNames.map((eventName) => [
            eventName,
            grouped.find((item) => item.eventName === eventName)?._count.eventName ?? 0,
          ]),
        ) as Record<EventName, number>;
      } catch (error) {
        console.warn("Event log count failed. Falling back to memory event counts.");
        console.warn(error);
      }
    }
  }

  return Object.fromEntries(
    eventNames.map((eventName) => [
      eventName,
      memoryEventLogs.filter((event) => event.eventName === eventName).length,
    ]),
  ) as Record<EventName, number>;
}

async function countMeetingIntentTargets(targetType: StoredMeetingIntent["targetType"]) {
  if (prisma) {
    if (await ensurePrismaRuntimeSchema()) {
      try {
        const grouped = await prisma.meetingIntent.groupBy({
          by: ["targetId"],
          where: { targetType },
          _count: { targetId: true },
        });

        return Object.fromEntries(
          grouped.map((item) => [item.targetId, item._count.targetId]),
        ) as Record<string, number>;
      } catch (error) {
        console.warn("Meeting intent count failed. Falling back to memory intents.");
        console.warn(error);
      }
    }
  }

  return memoryMeetingIntents.reduce<Record<string, number>>((counts, intent) => {
    if (intent.targetType !== targetType) {
      return counts;
    }

    counts[intent.targetId] = (counts[intent.targetId] ?? 0) + 1;
    return counts;
  }, {});
}

async function buildMeetingIntentSummary() {
  if (prisma) {
    if (await ensurePrismaRuntimeSchema()) {
      try {
        const grouped = await prisma.meetingIntent.groupBy({
          by: ["targetType", "targetId"],
          _count: { id: true },
          _max: { createdAt: true },
        });

        const targets = grouped.map((item) => ({
          targetType: item.targetType,
          targetId: item.targetId,
          count: item._count.id,
          latestAt: item._max.createdAt?.toISOString() ?? "",
        }));

        return {
          totalIntents: targets.reduce((total, item) => total + item.count, 0),
          targets: targets.sort((a, b) => b.count - a.count),
        };
      } catch (error) {
        console.warn("Meeting intent summary failed. Falling back to memory intents.");
        console.warn(error);
      }
    }
  }

  const targets = memoryMeetingIntents.reduce<
    Record<
      string,
      {
        targetType: StoredMeetingIntent["targetType"];
        targetId: string;
        count: number;
        latestAt: string;
      }
    >
  >((summary, intent) => {
    const key = `${intent.targetType}:${intent.targetId}`;
    const current = summary[key] ?? {
      targetType: intent.targetType,
      targetId: intent.targetId,
      count: 0,
      latestAt: intent.createdAt,
    };

    current.count += 1;
    current.latestAt = intent.createdAt > current.latestAt ? intent.createdAt : current.latestAt;
    summary[key] = current;
    return summary;
  }, {});

  const sortedTargets = Object.values(targets).sort((a, b) => b.count - a.count);
  return {
    totalIntents: sortedTargets.reduce((total, item) => total + item.count, 0),
    targets: sortedTargets,
  };
}

function buildFunnelSnapshot(counts: Record<EventName, number>) {
  const reportViews = counts.report_viewed || 0;
  return {
    counts,
    rates: {
      signupFromReport:
        reportViews === 0 ? 0 : Number((counts.signup_completed / reportViews).toFixed(3)),
      recommendationClickFromReport:
        reportViews === 0 ? 0 : Number((counts.recommendation_clicked / reportViews).toFixed(3)),
      intentFromReport:
        reportViews === 0 ? 0 : Number((counts.intent_created / reportViews).toFixed(3)),
    },
  };
}

function buildDataCoverageSnapshot() {
  const seedDepartmentKeys = new Set(
    curriculumSeedCourses.map((course) => `${course.university}:${course.department}`),
  );
  const sourceBackedDepartmentKeys = new Set(
    curriculumSeedCourses
      .filter((course) => course.sourceUrl)
      .map((course) => `${course.university}:${course.department}`),
  );

  return {
    officialSourceCount: webSourceCatalog.filter((source) => source.reliability === "official")
      .length,
    inhaDepartmentCount: inhaDepartmentSeedTargets.length,
    inhaPublicCurriculumDepartmentCount:
      inhaSupplementalCurriculumCoverage.publicDepartmentCount,
    inhaPublicCourseBackedDepartmentCount:
      inhaSupplementalCurriculumCoverage.publicCourseBackedDepartmentCount,
    inhaMatchedAdmissionDepartmentCount:
      inhaSupplementalCurriculumCoverage.matchedAdmissionDepartmentCount,
    inhaOfficialSugangMatchedAdmissionDepartmentCount:
      inhaSupplementalCurriculumCoverage.officialSugangMatchedAdmissionDepartmentCount,
    inhaOfficialSugangCourseBackedAdmissionDepartmentCount:
      inhaSupplementalCurriculumCoverage.officialSugangCourseBackedAdmissionDepartmentCount,
    inhaOfficialSugangPartialAdmissionDepartmentCount:
      inhaSupplementalCurriculumCoverage.officialSugangPartialAdmissionDepartmentCount,
    inhaOfficialSugangPartialAdmissionDepartments:
      inhaSupplementalCurriculumCoverage.officialSugangPartialAdmissionDepartments,
    inhaSourceBackedAdmissionDepartmentCount:
      inhaSupplementalCurriculumCoverage.sourceBackedAdmissionDepartmentCount,
    inhaArchetypeOnlyDepartmentCount:
      inhaSupplementalCurriculumCoverage.archetypeOnlyDepartmentCount,
    inhaArchetypeOnlyAdmissionDepartments:
      inhaSupplementalCurriculumCoverage.archetypeOnlyAdmissionDepartments,
    inhaNeedsReviewAdmissionDepartments:
      inhaSupplementalCurriculumCoverage.missingAdmissionDepartments,
    inhaCurriculumSourceKindCounts:
      inhaSupplementalCurriculumCoverage.curriculumSourceKindCounts,
    seedDepartmentCount: seedDepartmentKeys.size,
    sourceBackedDepartmentCount: sourceBackedDepartmentKeys.size,
    sourceBackedCourseCount: curriculumSeedCourses.filter((course) => course.sourceUrl).length,
  };
}

function buildCurriculumTrustSnapshot({
  curriculumSource,
  department,
  school,
}: {
  curriculumSource: "database" | "csv" | "seed";
  department: string;
  school: string;
}): CurriculumTrustSnapshot {
  if (curriculumSource === "database") {
    return {
      sourceKind: "database",
      label: "공식 출처 기반 DB",
      description: "Postgres에 적재된 커리큘럼 데이터로 분석했습니다.",
      sourceUrl: null,
      evidenceFile: "Prisma Course table",
      sourceCourseSignalCount: 0,
      confidence: "high",
    };
  }

  if (curriculumSource === "csv") {
    return {
      sourceKind: "csv",
      label: "CSV 커리큘럼",
      description: "로컬 CSV 커리큘럼 데이터를 기준으로 분석했습니다.",
      sourceUrl: null,
      evidenceFile: "major_mirror_cs_departments/csv/all_computer_engineering_departments.csv",
      sourceCourseSignalCount: 0,
      confidence: "medium",
    };
  }

  const inhaTarget = findInhaDepartmentTarget(school, department);
  if (inhaTarget) {
    if (inhaTarget.curriculumSourceKind === "adiga-public-department") {
      return {
        sourceKind: inhaTarget.curriculumSourceKind,
        label: "ADIGA 공개 교육과정",
        description: `대입정보포털 ADIGA 학과정보의 공개 교육과정 ${inhaTarget.sourceCourseSignalCount}개 과목을 기준으로 분석했습니다.`,
        sourceUrl: inhaTarget.curriculumSourceUrl,
        evidenceFile: inhaTarget.curriculumEvidenceFile,
        sourceCourseSignalCount: inhaTarget.sourceCourseSignalCount,
        confidence: "high",
      };
    }

    if (inhaTarget.curriculumSourceKind === "inha-sugang-course-schedule") {
      return {
        sourceKind: inhaTarget.curriculumSourceKind,
        label: "인하대 공식 개설 과목",
        description: `인하대학교 수강신청 2026학년도 1학기 전공 개설 과목 ${inhaTarget.sourceCourseSignalCount}개를 기준으로 분석했습니다. 전체 4년 교육과정표는 아닙니다.`,
        sourceUrl: inhaTarget.curriculumSourceUrl,
        evidenceFile: inhaTarget.curriculumEvidenceFile,
        sourceCourseSignalCount: inhaTarget.sourceCourseSignalCount,
        confidence: "medium",
      };
    }

    return {
      sourceKind: "archetype-seed",
      label: "공식 모집단위 + 탐색형 seed",
      description:
        "공식 모집단위와 전공자율선택제 공개 정보를 기준으로 한 탐색형 seed입니다. 세부 전공 과목은 2학년 전공 선택 후 다시 확인해야 합니다.",
      sourceUrl: inhaTarget.curriculumSourceUrl,
      evidenceFile: inhaTarget.curriculumEvidenceFile,
      sourceCourseSignalCount: inhaTarget.officialSugangCourseSignalCount,
      confidence: "needs-review",
    };
  }

  const sourceBackedCourses = curriculumSeedCourses.filter(
    (course) =>
      normalizeKey(course.university) === normalizeSchoolForLookup(school) &&
      normalizeKey(course.department) === normalizeKey(department) &&
      course.sourceUrl,
  );

  if (sourceBackedCourses.length > 0) {
    return {
      sourceKind: "official-seed",
      label: "공식 출처 seed",
      description: `공식 웹 출처와 버전관리 seed ${sourceBackedCourses.length}개 과목 신호를 함께 사용했습니다.`,
      sourceUrl: sourceBackedCourses[0]?.sourceUrl ?? null,
      evidenceFile: sourceBackedCourses[0]?.evidenceFile ?? null,
      sourceCourseSignalCount: sourceBackedCourses.length,
      confidence: "medium",
    };
  }

  return {
    sourceKind: "seed",
    label: "MVP seed",
    description: "버전관리 seed를 사용한 MVP 검증 데이터입니다. 공식 출처 보강이 필요합니다.",
    sourceUrl: null,
    evidenceFile: "apps/api/src/data/curriculumSeed.ts",
    sourceCourseSignalCount: 0,
    confidence: "needs-review",
  };
}

function findInhaDepartmentTarget(school: string, department: string) {
  if (normalizeSchoolForLookup(school) !== "인하대") {
    return null;
  }

  const normalizedDepartment = normalizeKey(department);
  return (
    inhaDepartmentSeedTargets.find(
      (target) => normalizeKey(target.department) === normalizedDepartment,
    ) ?? null
  );
}

function normalizeSchoolForLookup(school: string) {
  const normalized = normalizeKey(school);
  if (normalized === "인하대학교" || normalized === "인하대") {
    return "인하대";
  }
  if (normalized === "경기대학교" || normalized === "경기대") {
    return "경기대";
  }
  if (normalized === "아주대학교" || normalized === "아주대") {
    return "아주대";
  }
  if (normalized === "한양대학교" || normalized === "한양대") {
    return "한양대";
  }
  if (normalized === "고려대학교" || normalized === "고려대") {
    return "고려대";
  }
  if (normalized === "서울대학교" || normalized === "서울대") {
    return "서울대";
  }
  return normalized;
}

function normalizeKey(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function buildValidationWarnings({
  counts,
  dataCoverage,
}: {
  counts: Record<EventName, number>;
  dataCoverage: ReturnType<typeof buildDataCoverageSnapshot>;
}) {
  const warnings: string[] = [];

  if (counts.report_viewed < 10) {
    warnings.push("리포트 조회 표본이 아직 10회 미만이라 전환율 해석은 보류해야 합니다.");
  }
  if (counts.intent_created === 0) {
    warnings.push("추천 학생/모임 참여 의사가 아직 없어 핵심 KPI 검증이 시작되지 않았습니다.");
  }
  if (dataCoverage.sourceBackedDepartmentCount < 5) {
    warnings.push("공식 출처가 연결된 seed 학과가 5개 미만입니다.");
  }
  if (dataCoverage.inhaDepartmentCount < 70) {
    warnings.push("인하대 파일럿 모집단위 커버리지가 70개 미만입니다.");
  }
  if (dataCoverage.inhaPublicCourseBackedDepartmentCount < 50) {
    warnings.push("인하대 공개 학과정보 기반 교육과정 수집 학과가 50개 미만입니다.");
  }
  if (dataCoverage.inhaSourceBackedAdmissionDepartmentCount < 70) {
    warnings.push("인하대 모집단위 중 출처 기반 커리큘럼 신호가 70개 미만입니다.");
  }
  if (dataCoverage.inhaArchetypeOnlyDepartmentCount > 5) {
    warnings.push(
      `인하대 ${dataCoverage.inhaArchetypeOnlyDepartmentCount}개 모집단위는 아직 아키타입 seed만 사용합니다.`,
    );
  }
  if (dataCoverage.inhaNeedsReviewAdmissionDepartments.length > 0) {
    warnings.push(
      `인하대 needs-review 모집단위: ${dataCoverage.inhaNeedsReviewAdmissionDepartments.join(", ")}`,
    );
  }

  return warnings;
}

async function buildPilotReadiness() {
  const counts = await countEventsByName();
  const dataCoverage = buildDataCoverageSnapshot();
  const intentSummary = await buildMeetingIntentSummary();
  const inhaScenarioDepartments = new Set(
    studentValidationScenarios
      .filter((scenario) => normalizeSchoolForLookup(scenario.school) === "인하대")
      .map((scenario) => scenario.department),
  );
  const checks = [
    {
      id: "official-source-coverage",
      label: "공식/공개 출처 기반 seed 커버리지",
      ok:
        dataCoverage.sourceBackedDepartmentCount >= 5 &&
        dataCoverage.inhaSourceBackedAdmissionDepartmentCount >= 70,
      severity: "blocker",
      detail: `${dataCoverage.sourceBackedDepartmentCount}개 학과가 출처 URL과 연결되어 있고, 인하대 ${dataCoverage.inhaSourceBackedAdmissionDepartmentCount}개 모집단위가 ADIGA 또는 공식 수강신청 과목 신호를 제공합니다.`,
    },
    {
      id: "needs-review-transparency",
      label: "needs-review 모집단위 명시",
      ok: dataCoverage.inhaNeedsReviewAdmissionDepartments.length === 0,
      severity: "warning",
      detail:
        dataCoverage.inhaNeedsReviewAdmissionDepartments.length === 0
          ? "모든 인하대 모집단위가 출처 기반 과목 신호를 제공합니다."
          : `${dataCoverage.inhaNeedsReviewAdmissionDepartments.join(", ")}는 공식 수강신청에서 전공탐색 1개 과목만 확인되어 리포트에서 needs-review로 표시됩니다.`,
    },
    {
      id: "student-validation-scenarios",
      label: "학생 검증 시나리오",
      ok:
        studentValidationScenarios.length >= 3 &&
        inhaScenarioDepartments.has("컴퓨터공학과") &&
        inhaScenarioDepartments.has("인공지능공학과") &&
        inhaScenarioDepartments.has("데이터사이언스학과"),
      severity: "blocker",
      detail: `${studentValidationScenarios.length}개 인하대 파일럿 시나리오가 API smoke test에 연결되어 있습니다: ${[...inhaScenarioDepartments].join(", ")}.`,
    },
    {
      id: "funnel-telemetry",
      label: "전환 funnel 계측",
      ok:
        ["report_viewed", "signup_completed", "recommendation_clicked", "intent_created"].every(
          (eventName) => eventName in counts,
        ),
      severity: "blocker",
      detail: "리포트 조회, 가입, 추천 클릭, 참여 의사 이벤트가 집계됩니다.",
    },
    {
      id: "intent-aggregation",
      label: "참여 의사 운영 집계",
      ok: Array.isArray(intentSummary.targets),
      severity: "blocker",
      detail: `${intentSummary.totalIntents}개 참여 의사가 PII 없이 집계됩니다.`,
    },
    {
      id: "sample-size",
      label: "초기 표본 수",
      ok: counts.report_viewed >= 10,
      severity: "warning",
      detail: `${counts.report_viewed}회 리포트 조회가 집계되었습니다. 10회 전까지 전환율 해석은 보류합니다.`,
    },
  ];
  const hasBlockingIssue = checks.some((check) => check.severity === "blocker" && !check.ok);

  return {
    status: hasBlockingIssue
      ? "blocked"
      : counts.report_viewed >= 10
        ? "ready-for-private-pilot"
        : "ready-to-collect",
    checks,
    nextAction:
      counts.report_viewed >= 10
        ? "첫 학생 인터뷰 결과를 funnel과 intent summary로 검토하세요."
        : "학생 10명에게 리포트를 보여주고 추천 클릭/참여 의사까지 관찰하세요.",
  };
}

app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "career-scope-api",
    storage: prisma ? "postgres" : "memory-demo-fallback",
    curriculumSource: await resolveCurriculumSource(),
  });
});

app.get("/api/insights", async (req, res) => {
  const school =
    typeof req.query.school === "string" && req.query.school.trim()
      ? req.query.school
      : defaultDemoSchool;
  const department =
    typeof req.query.department === "string" && req.query.department.trim()
      ? req.query.department
      : defaultDemoDepartment;
  const grade = typeof req.query.grade === "string" ? req.query.grade : "";
  const semester =
    typeof req.query.semester === "string" ? req.query.semester : "";
  const yearTerm =
    typeof req.query.yearTerm === "string" ? req.query.yearTerm : "";

  const options = {
    grade: grade || undefined,
    semester: semester || undefined,
    yearTerm: yearTerm || undefined,
  };
  const insight = buildInsight(school, department, options);
  const curriculumSimilarity = await buildCurriculumSimilarityFromDatabase({
    school,
    department,
    ...options,
  });
  const curriculumReport = buildCurriculumReport(curriculumSimilarity);
  const displayCurriculumSimilarity = {
    ...curriculumSimilarity,
    base: {
      ...curriculumSimilarity.base,
      school: insight.target.school,
      department: insight.target.department,
    },
  };
  const topComparison = curriculumSimilarity.rankings[0];
  const topComparisonLabel = topComparison
    ? `${topComparison.school} ${topComparison.department}`
    : "비교군";
  const curriculumSource = await resolveInsightCurriculumSource({ school, department });

  res.json({
    ...insight,
    ...curriculumReport,
    headline: `${insight.target.school} ${insight.target.department}는 ${topComparisonLabel}와 커리큘럼 구조가 가장 가깝습니다.`,
    curriculumSimilarity: displayCurriculumSimilarity,
    curriculumSource,
    curriculumTrust: buildCurriculumTrustSnapshot({
      curriculumSource,
      school,
      department,
    }),
  });
});

app.get("/api/curriculum-similarity", async (req, res) => {
  const school =
    typeof req.query.school === "string" && req.query.school.trim()
      ? req.query.school
      : defaultDemoSchool;
  const department =
    typeof req.query.department === "string" && req.query.department.trim()
      ? req.query.department
      : defaultDemoDepartment;
  const grade = typeof req.query.grade === "string" ? req.query.grade : "";
  const semester =
    typeof req.query.semester === "string" ? req.query.semester : "";
  const yearTerm =
    typeof req.query.yearTerm === "string" ? req.query.yearTerm : "";

  res.json(
    await buildCurriculumSimilarityFromDatabase({
      school,
      department,
      grade: grade || undefined,
      semester: semester || undefined,
      yearTerm: yearTerm || undefined,
    }),
  );
});

app.post("/api/deep-report", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const school = requireString(body, "school") || "";
  const department = requireString(body, "department") || "";

  if (!school || !department) {
    return res.status(400).json({
      error: "Missing required fields",
      missing: [!school ? "school" : null, !department ? "department" : null].filter(Boolean),
    });
  }

  try {
    const report = await buildGeminiDeepReport({
      school,
      department,
      field: typeof body.field === "string" ? body.field : undefined,
      headline: typeof body.headline === "string" ? body.headline : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      activities: body.activities,
      comparisons: body.comparisons,
      curriculum: body.curriculum,
      portfolioStats: body.portfolioStats,
      analysis: body.analysis,
      curriculumSimilarity: body.curriculumSimilarity,
    });

    return res.json(report);
  } catch (error) {
    if (error instanceof GeminiReportError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Failed to generate deep report." });
  }
});

app.post("/api/complement-matches", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const school = requireString(body, "school");
  const department = requireString(body, "department");
  const matchingDistance = body.matchingDistance;
  const portfolioStats = readPortfolioStats(body.portfolioStats);

  if (!school || !department || !isMatchingDistance(matchingDistance) || !portfolioStats) {
    const missing = [
      !school ? "school" : null,
      !department ? "department" : null,
      !isMatchingDistance(matchingDistance) ? "matchingDistance" : null,
      !portfolioStats ? "portfolioStats" : null,
    ].filter(Boolean);
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const curriculumSimilarity = await buildCurriculumSimilarityFromDatabase({
    school,
    department,
  });
  const weaknessAreas = curriculumSimilarity.rankings[0]?.differentAreas ?? [];
  const insight = buildInsight(school, department);
  const intentSignals = await countMeetingIntentTargets("peer");

  res.json(
    buildComplementMatches({
      peers: insight.peers,
      weaknessAreas,
      portfolioStats,
      matchingDistance,
      intentSignals,
    }),
  );
});

app.post("/api/signup", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const profile = {
    school: requireString(body, "school"),
    department: requireString(body, "department"),
    email: requireString(body, "email"),
    name: requireString(body, "name"),
    role: requireString(body, "role"),
    interest: requireString(body, "interest"),
    wantsToMeet: requireString(body, "wantsToMeet"),
    intro: requireString(body, "intro"),
  };

  const missing = Object.entries(profile)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const profileToken = generateProfileToken();
  const profileTokenHash = hashProfileToken(profileToken);
  const matchingDistance = isMatchingDistance(body.matchingDistance)
    ? body.matchingDistance
    : "balanced";
  const portfolioStats = readPortfolioStats(body.portfolioStats) ?? {};
  const payload = {
    school: profile.school as string,
    department: profile.department as string,
    email: profile.email as string,
    name: profile.name as string,
    role: profile.role as string,
    interest: profile.interest as string,
    wantsToMeet: profile.wantsToMeet as string,
    intro: profile.intro as string,
    portfolio: typeof body.portfolio === "string" ? body.portfolio.trim() : "",
    selectedField: profile.interest as string,
    matchingDistance,
    portfolioStats: JSON.stringify(portfolioStats),
    profileTokenHash,
  };

  if (prisma) {
    if (!(await ensurePrismaRuntimeSchema())) {
      return res.status(503).json({ error: "Profile storage is temporarily unavailable" });
    }

    const saved = await prisma.profile.create({ data: payload });
    await createEventLog({
      eventName: "signup_completed",
      profileId: saved.id,
      source: "signup",
      metadata: JSON.stringify({ school: payload.school, department: payload.department }),
    });
    return res.status(201).json({
      profileId: saved.id,
      profileToken,
      profile: toPublicProfile(saved),
    });
  }

  const id = `profile-${memoryProfiles.length + 1}`;
  const saved: StoredProfile = {
    id,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  memoryProfiles.push(saved);
  await createEventLog({
    eventName: "signup_completed",
    profileId: id,
    source: "signup",
    metadata: JSON.stringify({ school: payload.school, department: payload.department }),
  });
  return res.status(201).json({
    profileId: id,
    profileToken,
    profile: toPublicProfile(saved),
  });
});

app.post("/api/meeting-intents", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const profileId = requireString(body, "profileId");
  const profileToken = requireString(body, "profileToken");
  const targetType = body.targetType;
  const targetId = requireString(body, "targetId");
  const source = body.source;

  if (
    !profileId ||
    !profileToken ||
    !isMeetingIntentTarget(targetType) ||
    !targetId ||
    !isMeetingIntentSource(source)
  ) {
    const missing = [
      !profileId ? "profileId" : null,
      !profileToken ? "profileToken" : null,
      !isMeetingIntentTarget(targetType) ? "targetType" : null,
      !targetId ? "targetId" : null,
      !isMeetingIntentSource(source) ? "source" : null,
    ].filter(Boolean);
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  if (!(await verifyProfileToken(profileId, profileToken))) {
    return res.status(401).json({ error: "Invalid profile token" });
  }

  const payload = {
    profileId,
    targetType,
    targetId,
    source,
    reason: typeof body.reason === "string" ? body.reason.trim() : "",
  };

  if (prisma) {
    if (!(await ensurePrismaRuntimeSchema())) {
      return res.status(503).json({ error: "Intent storage is temporarily unavailable" });
    }

    const saved = await prisma.meetingIntent.create({ data: payload });
    await createEventLog({
      eventName: "intent_created",
      profileId,
      source,
      metadata: JSON.stringify({ targetType, targetId }),
    });
    return res.status(201).json({ ok: true, intentId: saved.id });
  }

  const saved: StoredMeetingIntent = {
    id: `intent-${memoryMeetingIntents.length + 1}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  memoryMeetingIntents.push(saved);
  await createEventLog({
    eventName: "intent_created",
    profileId,
    source,
    metadata: JSON.stringify({ targetType, targetId }),
  });
  return res.status(201).json({ ok: true, intentId: saved.id });
});

app.post("/api/events", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const eventName = body.eventName;
  const profileId = requireString(body, "profileId");
  const profileToken = requireString(body, "profileToken");
  const source = requireString(body, "source") || "";

  if (!isEventName(eventName)) {
    return res.status(400).json({ error: "Missing required fields", missing: ["eventName"] });
  }

  if (profileId && (!profileToken || !(await verifyProfileToken(profileId, profileToken)))) {
    return res.status(401).json({ error: "Invalid profile token" });
  }

  const saved = await createEventLog({
    eventName,
    profileId,
    source,
    metadata: JSON.stringify(body.metadata ?? {}),
  });
  return res.status(201).json({ ok: true, eventId: saved.id });
});

app.get("/api/funnel", async (_req, res) => {
  const counts = await countEventsByName();
  res.json(buildFunnelSnapshot(counts));
});

app.get("/api/intent-summary", async (_req, res) => {
  res.json(await buildMeetingIntentSummary());
});

app.get("/api/inha-departments", (_req, res) => {
  res.json({
    source: "2026학년도 인하대학교 수시모집요강 II. 모집단위별 입학정원",
    sourceUrl: inhaAdmissionsSourceUrl,
    supplementalCurriculumSource: inhaSupplementalCurriculumEvidence,
    supplementalCurriculumSourceUrl: inhaSupplementalCurriculumSourceUrl,
    officialSugangCurriculumSource: inhaOfficialSugangEvidence,
    officialSugangCurriculumSourceUrl: inhaOfficialSugangSourceUrl,
    curriculumCoverage: inhaSupplementalCurriculumCoverage,
    departmentCount: inhaDepartmentSeedTargets.length,
    departments: inhaDepartmentSeedTargets.map((target) => ({
      college: target.college,
      department: target.department,
      admissionCapacity: target.admissionCapacity,
      academicTrack: target.academicTrack,
      curriculumSourceKind: target.curriculumSourceKind,
      curriculumSourceUrl: target.curriculumSourceUrl,
      curriculumEvidenceFile: target.curriculumEvidenceFile,
      adigaRuCd: target.adigaRuCd,
      sugangDepartmentCodes: target.sugangDepartmentCodes,
      sourceCourseSignalCount: target.sourceCourseSignalCount,
      officialSugangCourseSignalCount: target.officialSugangCourseSignalCount,
      focus: target.focus,
      courseSignalCount: target.courses.length,
      courseSignals: target.courses.slice(0, 12),
      careerFields: target.careerFields.slice(0, 8),
    })),
  });
});

app.get("/api/validation-status", async (_req, res) => {
  const counts = await countEventsByName();
  const dataCoverage = buildDataCoverageSnapshot();
  const warnings = buildValidationWarnings({ counts, dataCoverage });

  res.json({
    generatedAt: new Date().toISOString(),
    storage: prisma ? "postgres" : "memory-demo-fallback",
    curriculumSource: await resolveCurriculumSource(),
    funnel: buildFunnelSnapshot(counts),
    dataCoverage,
    qaWarnings: warnings,
    readiness:
      warnings.length === 0
        ? "ready-to-interpret"
        : counts.report_viewed > 0
          ? "collecting-signal"
          : "needs-traffic",
  });
});

app.get("/api/pilot-readiness", async (_req, res) => {
  res.json(await buildPilotReadiness());
});

app.get("/api/peers", (_req, res) => {
  res.json(buildInsight().peers);
});

export { app };

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (!process.env.VERCEL && entrypoint === import.meta.url) {
  app.listen(port, () => {
    console.log(
      `CareerScope API listening on http://localhost:${port} (${prisma ? "postgres" : "memory"} storage)`,
    );
  });
}
