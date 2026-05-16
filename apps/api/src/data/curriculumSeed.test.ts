import assert from "node:assert/strict";
import test from "node:test";
import { curriculumSeedCourses } from "./curriculumSeed.js";

test("curriculum seed includes at least five official source-backed departments", () => {
  const backedTargets = new Set(
    curriculumSeedCourses
      .filter((course) => course.sourceUrl?.startsWith("https://"))
      .map((course) => `${course.university}||${course.department}`),
  );

  assert.ok(backedTargets.size >= 5);
});
