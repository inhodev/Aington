import assert from "node:assert/strict";
import test from "node:test";
import {
  findInhaSupplementalCurriculum,
  inhaSupplementalCurricula,
  summarizeInhaSupplementalCurriculum,
} from "./inhaSupplementalCurriculum.js";

test("inha supplemental ADIGA catalog contains public course-backed departments", () => {
  assert.ok(inhaSupplementalCurricula.length >= 65);
  assert.ok(inhaSupplementalCurricula.filter((item) => item.courses.length > 0).length >= 55);

  const computerScience = findInhaSupplementalCurriculum("컴퓨터공학과");
  assert.ok(computerScience);
  assert.ok(computerScience.sourceUrl.includes("adiga.kr"));
  assert.ok(computerScience.courses.some((course) => course.includes("운영체")));
  assert.ok(computerScience.courses.includes("데이터베이스"));
});

test("inha supplemental lookup maps admission sub-majors to public department pages", () => {
  const architecture = findInhaSupplementalCurriculum("건축공학전공");

  assert.ok(architecture);
  assert.equal(architecture.department, "건축학부");
  assert.ok(architecture.courses.length > 20);
});

test("inha supplemental summary keeps archetype-only gaps visible", () => {
  const summary = summarizeInhaSupplementalCurriculum([
    "컴퓨터공학과",
    "건축공학전공",
    "의예과",
  ]);

  assert.equal(summary.matchedAdmissionDepartmentCount, 2);
  assert.deepEqual(summary.missingAdmissionDepartments, ["의예과"]);
  assert.equal(summary.archetypeOnlyDepartmentCount, 1);
});
