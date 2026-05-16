import assert from "node:assert/strict";
import test from "node:test";
import {
  findInhaOfficialSugangDepartment,
  inhaOfficialSugangDepartments,
  inhaOfficialSugangSourceUrl,
  summarizeInhaOfficialSugangCoverage,
} from "./inhaOfficialSugangCourses.js";

test("official Inha sugang schedule fills high-value ADIGA gaps", () => {
  assert.equal(inhaOfficialSugangDepartments.length, 18);
  assert.ok(inhaOfficialSugangSourceUrl.includes("sugang.inha.ac.kr"));

  const electrical = findInhaOfficialSugangDepartment("전기전자공학부");
  const nursing = findInhaOfficialSugangDepartment("간호학과");
  const battery = findInhaOfficialSugangDepartment("이차전지융합학과");

  assert.ok(electrical);
  assert.ok(electrical.courses.length >= 60);
  assert.ok(electrical.courses.some((course) => course.title.includes("회로이론")));
  assert.ok(nursing?.courses.some((course) => course.title.includes("간호학")));
  assert.ok(battery?.courses.some((course) => course.title.includes("이차전지")));
});

test("official Inha sugang coverage distinguishes course-backed and partial units", () => {
  const summary = summarizeInhaOfficialSugangCoverage([
    "전기전자공학부",
    "간호학과",
    "경영융합학부",
    "컴퓨터공학과",
  ]);

  assert.equal(summary.matchedAdmissionDepartmentCount, 3);
  assert.equal(summary.courseBackedAdmissionDepartmentCount, 2);
  assert.equal(summary.partialAdmissionDepartmentCount, 1);
  assert.deepEqual(summary.partialAdmissionDepartments, ["경영융합학부"]);
  assert.deepEqual(summary.missingAdmissionDepartments, ["컴퓨터공학과"]);
});
