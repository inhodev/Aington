import type { Course } from "./curriculumSimilarity.js";
import { inhaDepartmentSeedTargets } from "./inhaDepartments.js";
import { findWebSource } from "./webSourceCatalog.js";

const baseTargetCourses: Array<{
  university: string;
  department: string;
  courses: string[];
  focus: string[];
  sourceUrl?: string;
  evidenceFile?: string;
}> = [
  {
    university: "경기대",
    department: "컴퓨터공학과",
    courses: [
      "프로그래밍",
      "객체지향프로그래밍",
      "자료구조",
      "알고리즘",
      "운영체제",
      "데이터베이스",
      "컴퓨터네트워크",
      "소프트웨어공학",
      "인공지능",
      "캡스톤디자인",
    ],
    focus: ["서비스 프로젝트", "백엔드", "실전 포트폴리오"],
  },
  {
    university: "아주대",
    department: "소프트웨어학과",
    courses: [
      "프로그래밍기초",
      "자료구조",
      "알고리즘",
      "운영체제",
      "데이터베이스",
      "소프트웨어공학",
      "웹시스템",
      "클라우드컴퓨팅",
      "인공지능",
      "소프트웨어캡스톤",
    ],
    focus: ["산학 프로젝트", "소프트웨어 설계", "클라우드"],
  },
  {
    university: "한양대",
    department: "컴퓨터소프트웨어학부",
    courses: [
      "C프로그래밍",
      "자료구조론",
      "알고리즘설계",
      "컴퓨터구조",
      "운영체제",
      "데이터베이스시스템",
      "네트워크",
      "소프트웨어공학",
      "머신러닝",
      "종합설계",
    ],
    focus: ["시스템", "AI/머신러닝", "종합설계"],
  },
  {
    university: "고려대",
    department: "컴퓨터학과",
    courses: [
      "컴퓨터프로그래밍",
      "이산수학",
      "자료구조",
      "알고리즘",
      "컴퓨터구조",
      "운영체제",
      "데이터베이스",
      "컴퓨터네트워크",
      "정보보호",
      "캡스톤프로젝트",
    ],
    focus: ["알고리즘", "보안", "연구 프로젝트"],
  },
  {
    university: "연세대",
    department: "컴퓨터과학과",
    courses: [
      "프로그래밍원리",
      "자료구조",
      "알고리즘분석",
      "컴퓨터시스템",
      "운영체제",
      "데이터베이스",
      "네트워크",
      "소프트웨어종합설계",
      "딥러닝",
      "창업실습",
    ],
    focus: ["스타트업", "딥러닝", "창업 실습"],
  },
  {
    university: "서울대",
    department: "컴퓨터공학과",
    courses: [
      "프로그래밍방법론",
      "이산수학",
      "자료구조",
      "알고리즘",
      "컴퓨터구조",
      "운영체제",
      "데이터베이스",
      "컴퓨터네트워크",
      "인공지능",
      "연구프로젝트",
    ],
    focus: ["연구", "알고리즘", "AI/머신러닝"],
  },
  {
    university: "가천대",
    department: "데이터사이언스학과",
    courses: [
      "파이썬프로그래밍",
      "자료구조",
      "확률통계",
      "데이터베이스",
      "데이터마이닝",
      "머신러닝",
      "딥러닝",
      "빅데이터처리",
      "데이터시각화",
      "데이터캡스톤",
    ],
    focus: ["데이터", "통계", "시각화"],
  },
  {
    university: "인천대",
    department: "인공지능학과",
    courses: [
      "프로그래밍",
      "자료구조",
      "선형대수",
      "확률통계",
      "알고리즘",
      "데이터베이스",
      "머신러닝",
      "딥러닝",
      "컴퓨터비전",
      "AI캡스톤",
    ],
    focus: ["AI/머신러닝", "데이터", "컴퓨터비전"],
  },
  {
    university: "용인대",
    department: "전자공학과",
    courses: [
      "C언어",
      "이산수학",
      "자료구조",
      "디지털논리회로",
      "마이크로프로세서",
      "운영체제",
      "임베디드시스템",
      "통신네트워크",
      "IoT프로젝트",
      "종합설계",
    ],
    focus: ["임베디드", "IoT", "하드웨어 시스템"],
  },
];

const targetCourses = [...baseTargetCourses, ...inhaDepartmentSeedTargets];

export const curriculumSeedCourses: Course[] = targetCourses.flatMap((target) =>
  target.courses.map((title, index) => {
    const source = findWebSource(target.university, target.department);
    const sourceUrl = target.sourceUrl ?? source?.url ?? null;
    const evidenceFile = target.evidenceFile ?? (source
      ? `apps/api/src/data/webSourceCatalog.ts#${source.id}`
      : "apps/api/src/data/curriculumSeed.ts");
    return {
      university: target.university,
      department: target.department,
      yearTerm: `${Math.floor(index / 3) + 1}-${(index % 2) + 1}`,
      title,
      canonicalTitle: title,
      area: inferSeedArea(title, target.focus),
      text: [title, ...target.focus].join(" "),
      credits: index >= 8 ? 2 : 3,
      requirementType: index < 6 ? "전공필수" : "전공선택",
      track: target.focus[0],
      category: "course",
      notes: `MVP 검증용 ${target.focus.join(", ")} 커리큘럼 seed`,
      sourceUrl,
      evidenceFile,
    };
  }),
);

function inferSeedArea(title: string, focus: string[]) {
  const text = `${title} ${focus.join(" ")}`;
  if (/자료구조/.test(text)) {
    return "자료구조";
  }
  if (/알고리즘/.test(text)) {
    return "알고리즘";
  }
  if (/이산|선형|확률|통계/.test(text)) {
    return "수학/통계";
  }
  if (/컴퓨터구조|논리회로/.test(text)) {
    return "컴퓨터구조";
  }
  if (/운영체제/.test(text)) {
    return "운영체제";
  }
  if (/데이터베이스/.test(text)) {
    return "데이터베이스";
  }
  if (/네트워크|통신/.test(text)) {
    return "네트워크";
  }
  if (/소프트웨어|종합설계|캡스톤|프로젝트/.test(text)) {
    return "캡스톤/프로젝트";
  }
  if (/인공지능|머신러닝|딥러닝|AI|비전/.test(text)) {
    return "AI/머신러닝";
  }
  if (/데이터|빅데이터|마이닝|시각화/.test(text)) {
    return "데이터/빅데이터";
  }
  if (/보안/.test(text)) {
    return "보안";
  }
  if (/웹|클라우드|창업/.test(text)) {
    return "웹/앱";
  }
  if (/임베디드|IoT|마이크로프로세서/.test(text)) {
    return "시스템/임베디드";
  }
  return "프로그래밍";
}
