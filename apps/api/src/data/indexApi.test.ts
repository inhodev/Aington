import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { studentValidationScenarios } from "./studentScenarios.js";

process.env.VERCEL = "1";
delete process.env.DATABASE_URL;

const { app } = await import("../index.js");

async function withApi<T>(run: (baseUrl: string) => Promise<T>) {
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("insights returns seed-backed data without database or curriculum CSV", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/insights?school=${encodeURIComponent("경기대학교")}&department=${encodeURIComponent("컴퓨터공학과")}`,
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.curriculumSource, "seed");
    assert.equal(payload.curriculumTrust.sourceKind, "official-seed");
    assert.ok(payload.curriculumTrust.label.includes("공식"));
    assert.ok(payload.curriculumSimilarity.rankings.length > 0);
  });
});

test("insights exposes official sugang trust for Inha departments missing ADIGA courses", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/insights?school=${encodeURIComponent("인하대학교")}&department=${encodeURIComponent("전기전자공학부")}`,
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.curriculumTrust.sourceKind, "inha-sugang-course-schedule");
    assert.equal(payload.curriculumTrust.confidence, "medium");
    assert.ok(payload.curriculumTrust.sourceUrl.includes("sugang.inha.ac.kr"));
    assert.ok(payload.curriculumTrust.sourceCourseSignalCount >= 60);
    assert.ok(payload.curriculumTrust.description.includes("전체 4년 교육과정표는 아닙니다"));
    assert.match(payload.headline, /인하대 .+와 커리큘럼 구조가 가장 가깝습니다/);
  });
});

test("insights marks Inha free-major units as needs-review archetype seeds", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/insights?school=${encodeURIComponent("인하대학교")}&department=${encodeURIComponent("경영융합학부")}`,
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.curriculumTrust.sourceKind, "archetype-seed");
    assert.equal(payload.curriculumTrust.confidence, "needs-review");
    assert.ok(payload.curriculumTrust.description.includes("전공자율선택제"));
  });
});

test("health exposes storage and curriculum source", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.storage, "memory-demo-fallback");
    assert.equal(payload.curriculumSource, "seed");
  });
});

test("signup rejects missing required profile fields", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ school: "경기대학교" }),
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.ok(payload.missing.includes("email"));
    assert.ok(payload.missing.includes("name"));
  });
});

test("signup returns profile credentials and hides token hash", async () => {
  await withApi(async (baseUrl) => {
    const payload = await createProfile(baseUrl);

    assert.equal(typeof payload.profileId, "string");
    assert.equal(typeof payload.profileToken, "string");
    assert.equal(payload.profile.name, "이검증");
    assert.equal(payload.profile.profileTokenHash, undefined);
  });
});

test("meeting intent rejects an invalid profile token", async () => {
  await withApi(async (baseUrl) => {
    const profile = await createProfile(baseUrl);
    const response = await fetch(`${baseUrl}/api/meeting-intents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.profileId,
        profileToken: "invalid",
        targetType: "peer",
        targetId: "peer-1",
        source: "dashboard",
      }),
    });

    assert.equal(response.status, 401);
  });
});

test("meeting intent records peer and meeting targets with a valid profile token", async () => {
  await withApi(async (baseUrl) => {
    const profile = await createProfile(baseUrl);

    for (const intent of [
      { targetType: "peer", targetId: "peer-1", source: "dashboard" },
      { targetType: "meeting", targetId: "backend-api-deploy", source: "report" },
    ]) {
      const response = await fetch(`${baseUrl}/api/meeting-intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intent,
          profileId: profile.profileId,
          profileToken: profile.profileToken,
          reason: "MVP 전환 테스트",
        }),
      });
      const payload = await response.json();

      assert.equal(response.status, 201);
      assert.equal(payload.ok, true);
      assert.equal(typeof payload.intentId, "string");
    }
  });
});

test("intent summary exposes aggregate targets without profile tokens", async () => {
  await withApi(async (baseUrl) => {
    const profile = await createProfile(baseUrl);
    const intent = await fetch(`${baseUrl}/api/meeting-intents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.profileId,
        profileToken: profile.profileToken,
        targetType: "meeting",
        targetId: "backend-api-deploy",
        source: "dashboard",
      }),
    });
    assert.equal(intent.status, 201);

    const response = await fetch(`${baseUrl}/api/intent-summary`);
    const payload = await response.json();
    const target = payload.targets.find(
      (item: { targetId: string }) => item.targetId === "backend-api-deploy",
    );

    assert.equal(response.status, 200);
    assert.ok(payload.totalIntents >= 1);
    assert.equal(target.targetType, "meeting");
    assert.ok(target.count >= 1);
    assert.equal(target.profileToken, undefined);
  });
});

test("complement matches include observed peer intent signals", async () => {
  await withApi(async (baseUrl) => {
    const profile = await createProfile(baseUrl);

    for (let index = 0; index < 2; index += 1) {
      const response = await fetch(`${baseUrl}/api/meeting-intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileToken: profile.profileToken,
          targetType: "peer",
          targetId: "peer-2",
          source: "dashboard",
          reason: "관심 신호 추천 검증",
        }),
      });

      assert.equal(response.status, 201);
    }

    const response = await fetch(`${baseUrl}/api/complement-matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        school: "경기대학교",
        department: "컴퓨터공학과",
        matchingDistance: "balanced",
        portfolioStats: { 프로젝트: 0, 논문: 0, 대회: 0, 기타: 0 },
      }),
    });
    const payload = await response.json();
    const signaledPeer = payload.find((peer: { id: string }) => peer.id === "peer-2");

    assert.equal(response.status, 200);
    assert.ok(signaledPeer.observedIntentCount >= 2);
    assert.ok(
      signaledPeer.matchReasons.some((reason: string) => reason.includes("실제 학생 관심")),
    );
  });
});

test("events require valid profile token when profile id is present", async () => {
  await withApi(async (baseUrl) => {
    const profile = await createProfile(baseUrl);
    const response = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.profileId,
        profileToken: "wrong",
        eventName: "recommendation_clicked",
        source: "dashboard",
      }),
    });

    assert.equal(response.status, 401);
  });
});

test("funnel counts report, signup, recommendation, and intent events", async () => {
  await withApi(async (baseUrl) => {
    const reportEvent = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "report_viewed",
        source: "report",
        metadata: { school: "경기대학교", department: "컴퓨터공학과" },
      }),
    });
    assert.equal(reportEvent.status, 201);

    const profile = await createProfile(baseUrl);
    const clickEvent = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.profileId,
        profileToken: profile.profileToken,
        eventName: "recommendation_clicked",
        source: "dashboard",
        metadata: { targetType: "peer", targetId: "peer-1" },
      }),
    });
    assert.equal(clickEvent.status, 201);

    const intentEvent = await fetch(`${baseUrl}/api/meeting-intents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.profileId,
        profileToken: profile.profileToken,
        targetType: "peer",
        targetId: "peer-1",
        source: "dashboard",
      }),
    });
    assert.equal(intentEvent.status, 201);

    const funnel = await fetch(`${baseUrl}/api/funnel`);
    const payload = await funnel.json();

    assert.equal(funnel.status, 200);
    assert.equal(payload.counts.report_viewed, 1);
    assert.ok(payload.counts.signup_completed >= 1);
    assert.equal(payload.counts.recommendation_clicked, 1);
    assert.ok(payload.counts.intent_created >= 1);
    assert.ok(payload.rates.intentFromReport >= 1);
  });
});

test("validation status exposes funnel and data coverage", async () => {
  await withApi(async (baseUrl) => {
    await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "report_viewed",
        source: "report",
        metadata: { school: "경기대학교", department: "컴퓨터공학과" },
      }),
    });

    const response = await fetch(`${baseUrl}/api/validation-status`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.storage, "memory-demo-fallback");
    assert.equal(payload.curriculumSource, "seed");
    assert.ok(payload.funnel.counts.report_viewed >= 1);
    assert.ok(payload.dataCoverage.officialSourceCount >= 5);
    assert.ok(payload.dataCoverage.sourceBackedDepartmentCount >= 5);
    assert.deepEqual(payload.dataCoverage.inhaNeedsReviewAdmissionDepartments, [
      "경영융합학부",
      "사회과학융합학부",
      "인문융합학부",
    ]);
    assert.ok(Array.isArray(payload.qaWarnings));
    assert.ok(
      payload.qaWarnings.some((warning: string) => warning.includes("needs-review 모집단위")),
    );
  });
});

test("inha departments endpoint exposes the admissions-backed catalog", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/inha-departments`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.departmentCount >= 70);
    assert.ok(payload.sourceUrl.includes("admission.inha.ac.kr"));
    assert.ok(payload.supplementalCurriculumSourceUrl.includes("adiga.kr"));
    assert.ok(payload.officialSugangCurriculumSourceUrl.includes("sugang.inha.ac.kr"));
    assert.ok(payload.curriculumCoverage.matchedAdmissionDepartmentCount >= 55);
    assert.ok(payload.curriculumCoverage.sourceBackedAdmissionDepartmentCount >= 70);
    assert.ok(payload.curriculumCoverage.archetypeOnlyDepartmentCount <= 5);
    assert.ok(payload.curriculumCoverage.adigaMissingAdmissionDepartments.length >= 18);
    assert.deepEqual(payload.curriculumCoverage.missingAdmissionDepartments, [
      "경영융합학부",
      "사회과학융합학부",
      "인문융합학부",
    ]);
    assert.ok(
      payload.curriculumCoverage.curriculumSourceKindCounts["inha-sugang-course-schedule"] >= 15,
    );
    assert.ok(
      payload.departments.some(
        (department: {
          department: string;
          college: string;
          curriculumSourceKind: string;
          courseSignalCount: number;
        }) =>
          department.department === "컴퓨터공학과" &&
          department.college === "소프트웨어융합대학" &&
          department.curriculumSourceKind === "adiga-public-department" &&
          department.courseSignalCount >= 20,
      ),
    );
    assert.ok(
      payload.departments.some(
        (department: {
          department: string;
          curriculumSourceKind: string;
          sourceCourseSignalCount: number;
          officialSugangCourseSignalCount: number;
        }) =>
          department.department === "전기전자공학부" &&
          department.curriculumSourceKind === "inha-sugang-course-schedule" &&
          department.sourceCourseSignalCount >= 60 &&
          department.officialSugangCourseSignalCount >= 60,
      ),
    );
  });
});

test("student validation scenarios complete the MVP API flow", async () => {
  await withApi(async (baseUrl) => {
    assert.deepEqual(
      studentValidationScenarios.map((scenario) => scenario.school),
      ["인하대학교", "인하대학교", "인하대학교"],
    );
    assert.deepEqual(
      studentValidationScenarios.map((scenario) => scenario.department),
      ["컴퓨터공학과", "인공지능공학과", "데이터사이언스학과"],
    );

    for (const scenario of studentValidationScenarios) {
      const query = new URLSearchParams({
        school: scenario.school,
        department: scenario.department,
      });
      const report = await fetch(`${baseUrl}/api/insights?${query}`);
      assert.equal(report.status, 200);

      const reportPayload = await report.json();
      assert.ok(reportPayload.curriculumSimilarity.rankings.length > 0);

      const reportEvent = await fetch(`${baseUrl}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "report_viewed",
          source: "report",
          metadata: { scenarioId: scenario.id },
        }),
      });
      assert.equal(reportEvent.status, 201);

      const profile = await createProfile(baseUrl, {
        school: scenario.school,
        department: scenario.department,
        email: `${scenario.id}@example.com`,
        name: scenario.label,
        role: scenario.role,
        interest: scenario.field,
        wantsToMeet: scenario.matchingDistance,
        intro: scenario.intro,
        matchingDistance: scenario.matchingDistance,
        portfolioStats: scenario.portfolioStats,
      });

      const matches = await fetch(`${baseUrl}/api/complement-matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: scenario.school,
          department: scenario.department,
          matchingDistance: scenario.matchingDistance,
          portfolioStats: scenario.portfolioStats,
        }),
      });
      const peers = await matches.json();
      assert.equal(matches.status, 200);
      assert.ok(peers[0].matchReasons.join(" ").length > 0);

      const clickEvent = await fetch(`${baseUrl}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileToken: profile.profileToken,
          eventName: "recommendation_clicked",
          source: "dashboard",
          metadata: { scenarioId: scenario.id, targetId: peers[0].id },
        }),
      });
      assert.equal(clickEvent.status, 201);

      const intent = await fetch(`${baseUrl}/api/meeting-intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileToken: profile.profileToken,
          targetType: "peer",
          targetId: peers[0].id,
          source: "dashboard",
          reason: peers[0].matchReasons[0],
        }),
      });
      assert.equal(intent.status, 201);
    }
  });
});

test("pilot readiness reports launch checks", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/pilot-readiness`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(["ready-to-collect", "ready-for-private-pilot", "blocked"].includes(payload.status));
    assert.ok(
      payload.checks.some(
        (check: { id: string; ok: boolean }) =>
          check.id === "student-validation-scenarios" && check.ok,
      ),
    );
    assert.ok(
      payload.checks.some(
        (check: { id: string; ok: boolean }) =>
          check.id === "official-source-coverage" && check.ok,
      ),
    );
    assert.ok(
      payload.checks.some(
        (check: { id: string; detail: string; severity: string }) =>
          check.id === "needs-review-transparency" &&
          check.severity === "warning" &&
          check.detail.includes("경영융합학부"),
      ),
    );
    assert.equal(typeof payload.nextAction, "string");
  });
});

async function createProfile(
  baseUrl: string,
  overrides: Partial<{
    school: string;
    department: string;
    email: string;
    name: string;
    role: string;
    interest: string;
    wantsToMeet: string;
    intro: string;
    matchingDistance: string;
    portfolioStats: Record<string, number>;
    portfolio: string;
  }> = {},
) {
  const response = await fetch(`${baseUrl}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      school: "경기대학교",
      department: "컴퓨터공학과",
      email: "test@example.com",
      name: "이검증",
      role: "백엔드",
      interest: "백엔드",
      wantsToMeet: "balanced",
      intro: "검증을 위한 테스트 프로필입니다.",
      matchingDistance: "balanced",
      portfolioStats: { 프로젝트: 1, 논문: 0, 대회: 1, 기타: 0 },
      portfolio: "[]",
      ...overrides,
    }),
  });

  assert.equal(response.status, 201);
  return (await response.json()) as {
    profileId: string;
    profileToken: string;
    profile: Record<string, unknown>;
  };
}
