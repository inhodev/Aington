import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { loadCurriculumCourses } from "../data/curriculumSimilarity.js";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const courses = loadCurriculumCourses();

  await prisma.course.deleteMany();
  await prisma.curriculumRecord.deleteMany();
  await prisma.department.deleteMany();
  await prisma.university.deleteMany();

  const universityNames = [...new Set(courses.map((course) => course.university))];
  await prisma.university.createMany({
    data: universityNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const universities = await prisma.university.findMany();
  const universityIds = new Map(
    universities.map((university) => [university.name, university.id]),
  );

  const departmentInputs = [
    ...new Map(
      courses.map((course) => [
        `${course.university}||${course.department}`,
        {
          universityId: universityIds.get(course.university) ?? "",
          name: course.department,
        },
      ]),
    ).values(),
  ].filter((department) => department.universityId);

  await prisma.department.createMany({
    data: departmentInputs,
    skipDuplicates: true,
  });

  const departments = await prisma.department.findMany({
    include: { university: true },
  });
  const departmentIds = new Map(
    departments.map((department) => [
      `${department.university.name}||${department.name}`,
      department.id,
    ]),
  );

  await prisma.course.createMany({
    data: courses.flatMap((course) => {
      const departmentId = departmentIds.get(
        `${course.university}||${course.department}`,
      );
      if (!departmentId) {
        return [];
      }
      return {
        departmentId,
        yearTerm: course.yearTerm,
        title: course.title,
        canonicalTitle: course.canonicalTitle,
        area: course.area,
        credits: course.credits,
        requirementType: course.requirementType,
        track: course.track,
        category: course.category,
        notes: course.notes,
        sourceUrl: course.sourceUrl,
        evidenceFile: course.evidenceFile,
      };
    }),
  });

  console.log(
    `Seeded ${courses.length} courses across ${departmentIds.size} departments.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
