import assert from "node:assert/strict";
import test from "node:test";
import { buildCurriculumSimilarityFromDatabase } from "./curriculumSimilarity.js";
import { curriculumSeedCourses } from "./curriculumSeed.js";
import {
  inhaDepartmentSeedTargets,
  inhaSupplementalCurriculumCoverage,
} from "./inhaDepartments.js";

test("inha admissions-backed seed covers the full undergraduate pilot catalog", () => {
  const departments = new Set(inhaDepartmentSeedTargets.map((target) => target.department));

  assert.ok(departments.size >= 70);
  for (const department of [
    "컴퓨터공학과",
    "인공지능공학과",
    "데이터사이언스학과",
    "기계공학과",
    "경영학과",
    "의예과",
    "자유전공융합학부",
    "바이오식품공학과",
  ]) {
    assert.ok(departments.has(department), `${department} should be present`);
  }
});

test("inha seed courses are source-backed and queryable by department", async () => {
  const inhaCourses = curriculumSeedCourses.filter((course) => course.university === "인하대");
  const sourceBackedDepartments = new Set(
    inhaCourses.filter((course) => course.sourceUrl).map((course) => course.department),
  );

  assert.ok(inhaCourses.length >= inhaDepartmentSeedTargets.length * 8);
  assert.equal(sourceBackedDepartments.size, inhaDepartmentSeedTargets.length);
  assert.ok(inhaSupplementalCurriculumCoverage.matchedAdmissionDepartmentCount >= 55);
  assert.ok(
    inhaSupplementalCurriculumCoverage.officialSugangCourseBackedAdmissionDepartmentCount >= 15,
  );
  assert.ok(inhaSupplementalCurriculumCoverage.sourceBackedAdmissionDepartmentCount >= 70);
  assert.ok(inhaSupplementalCurriculumCoverage.archetypeOnlyDepartmentCount <= 5);
  assert.ok(inhaSupplementalCurriculumCoverage.adigaMissingAdmissionDepartments.length >= 18);
  assert.deepEqual(inhaSupplementalCurriculumCoverage.missingAdmissionDepartments, [
    "경영융합학부",
    "사회과학융합학부",
    "인문융합학부",
  ]);
  assert.ok(
    inhaSupplementalCurriculumCoverage.curriculumSourceKindCounts[
      "adiga-public-department"
    ] >= 55,
  );
  assert.ok(
    inhaSupplementalCurriculumCoverage.curriculumSourceKindCounts[
      "inha-sugang-course-schedule"
    ] >= 15,
  );
  assert.equal(
    inhaSupplementalCurriculumCoverage.curriculumSourceKindCounts["archetype-seed"],
    3,
  );

  const similarity = await buildCurriculumSimilarityFromDatabase({
    school: "인하대학교",
    department: "인공지능공학과",
  });

  assert.equal(similarity.base.school, "인하대");
  assert.equal(similarity.base.department, "인공지능공학과");
  assert.ok(similarity.base.courseCount >= 20);
  assert.ok(similarity.rankings.length > 0);
});

test("inha catalog marks source tier for ADIGA, official sugang, and remaining archetype units", () => {
  const computerScience = inhaDepartmentSeedTargets.find(
    (target) => target.department === "컴퓨터공학과",
  );
  const electrical = inhaDepartmentSeedTargets.find(
    (target) => target.department === "전기전자공학부",
  );
  const medicine = inhaDepartmentSeedTargets.find((target) => target.department === "의예과");
  const businessFusion = inhaDepartmentSeedTargets.find(
    (target) => target.department === "경영융합학부",
  );

  assert.equal(computerScience?.curriculumSourceKind, "adiga-public-department");
  assert.ok(computerScience?.curriculumSourceUrl.includes("adiga.kr"));
  assert.ok(computerScience?.adigaRuCd);
  assert.equal(electrical?.curriculumSourceKind, "inha-sugang-course-schedule");
  assert.ok(electrical?.curriculumSourceUrl.includes("sugang.inha.ac.kr"));
  assert.ok((electrical?.sugangDepartmentCodes.length ?? 0) >= 1);
  assert.ok((electrical?.sourceCourseSignalCount ?? 0) >= 60);
  assert.equal(medicine?.curriculumSourceKind, "inha-sugang-course-schedule");
  assert.ok(medicine?.courses.some((course) => course.includes("의과학")));
  assert.equal(businessFusion?.curriculumSourceKind, "archetype-seed");
  assert.ok(businessFusion?.curriculumSourceUrl.includes("admission.inha.ac.kr"));
});
