import {
  findInhaSupplementalCurriculum,
  inhaSupplementalCurriculumEvidence,
  summarizeInhaSupplementalCurriculum,
  type InhaSupplementalCurriculum,
} from "./inhaSupplementalCurriculum.js";
import {
  findInhaOfficialSugangDepartment,
  inhaOfficialSugangEvidence,
  inhaOfficialSugangMinimumCourseSignals,
  inhaOfficialSugangSourceUrl,
  summarizeInhaOfficialSugangCoverage,
  type InhaOfficialSugangDepartment,
} from "./inhaOfficialSugangCourses.js";

export type InhaCurriculumSourceKind =
  | "adiga-public-department"
  | "inha-sugang-course-schedule"
  | "archetype-seed";

export type InhaDepartmentSeedTarget = {
  university: "인하대";
  college: string;
  department: string;
  admissionCapacity: number | null;
  academicTrack: string;
  courses: string[];
  focus: string[];
  admissionSourceUrl: string;
  curriculumSourceKind: InhaCurriculumSourceKind;
  curriculumSourceUrl: string;
  curriculumEvidenceFile: string;
  adigaRuCd: string | null;
  sugangDepartmentCodes: string[];
  sourceCourseSignalCount: number;
  officialSugangCourseSignalCount: number;
  careerFields: string[];
  sourceUrl: string;
  evidenceFile: string;
};

export const inhaAdmissionsSourceUrl =
  "https://admission.inha.ac.kr/ajaxfile/CMN_SVC/FileView.do?GBN=X04_1&TEMP_CODE=IPSI_A&CONFIG_CD=C1405&CONFIG_SEQ=6&SITE_NO=2&SUB_SEQ=8&FD=Y";

const inhaAdmissionsEvidence = "2026학년도 인하대학교 수시모집요강 II. 모집단위별 입학정원";

const inhaDepartmentRows: Array<{
  college: string;
  department: string;
  admissionCapacity: number | null;
  academicTrack: string;
}> = [
  { college: "공과대학", department: "기계공학과", admissionCapacity: 114, academicTrack: "자연" },
  { college: "공과대학", department: "항공우주공학과", admissionCapacity: 51, academicTrack: "자연" },
  { college: "공과대학", department: "조선해양공학과", admissionCapacity: 51, academicTrack: "자연" },
  { college: "공과대학", department: "산업경영공학과", admissionCapacity: 39, academicTrack: "자연" },
  { college: "공과대학", department: "화학공학과", admissionCapacity: 83, academicTrack: "자연" },
  { college: "공과대학", department: "고분자공학과", admissionCapacity: 36, academicTrack: "자연" },
  { college: "공과대학", department: "신소재공학과", admissionCapacity: 83, academicTrack: "자연" },
  { college: "공과대학", department: "사회인프라공학과", admissionCapacity: 55, academicTrack: "자연" },
  { college: "공과대학", department: "환경공학과", admissionCapacity: 37, academicTrack: "자연" },
  { college: "공과대학", department: "공간정보공학과", admissionCapacity: 32, academicTrack: "자연" },
  { college: "공과대학", department: "건축공학전공", admissionCapacity: 32, academicTrack: "자연" },
  { college: "공과대학", department: "건축학전공", admissionCapacity: 41, academicTrack: "자연" },
  { college: "공과대학", department: "에너지자원공학과", admissionCapacity: 25, academicTrack: "자연" },
  { college: "공과대학", department: "전기전자공학부", admissionCapacity: 189, academicTrack: "자연" },
  { college: "공과대학", department: "반도체시스템공학과", admissionCapacity: 80, academicTrack: "자연" },
  { college: "공과대학", department: "이차전지융합학과", admissionCapacity: 40, academicTrack: "자연" },
  { college: "자연과학대학", department: "수학과", admissionCapacity: 28, academicTrack: "자연" },
  { college: "자연과학대학", department: "통계학과", admissionCapacity: 25, academicTrack: "자연" },
  { college: "자연과학대학", department: "물리학과", admissionCapacity: 34, academicTrack: "자연" },
  { college: "자연과학대학", department: "화학과", admissionCapacity: 41, academicTrack: "자연" },
  { college: "자연과학대학", department: "해양과학과", admissionCapacity: 30, academicTrack: "자연" },
  { college: "자연과학대학", department: "식품영양학과", admissionCapacity: 22, academicTrack: "자연" },
  { college: "경영대학", department: "경영학과", admissionCapacity: 105, academicTrack: "인문" },
  { college: "경영대학", department: "파이낸스경영학과", admissionCapacity: 39, academicTrack: "인문" },
  { college: "경영대학", department: "아태물류학부", admissionCapacity: 57, academicTrack: "인문" },
  { college: "경영대학", department: "국제통상학과", admissionCapacity: 54, academicTrack: "인문" },
  { college: "사범대학", department: "국어교육과", admissionCapacity: 28, academicTrack: "인문" },
  { college: "사범대학", department: "영어교육과", admissionCapacity: 27, academicTrack: "인문" },
  { college: "사범대학", department: "사회교육과", admissionCapacity: 27, academicTrack: "인문" },
  { college: "사범대학", department: "체육교육과", admissionCapacity: 39, academicTrack: "예체능" },
  { college: "사범대학", department: "교육학과", admissionCapacity: 27, academicTrack: "인문" },
  { college: "사범대학", department: "수학교육과", admissionCapacity: 27, academicTrack: "자연" },
  { college: "사회과학대학", department: "행정학과", admissionCapacity: 52, academicTrack: "인문" },
  { college: "사회과학대학", department: "정치외교학과", admissionCapacity: 40, academicTrack: "인문" },
  { college: "사회과학대학", department: "미디어커뮤니케이션학과", admissionCapacity: 38, academicTrack: "인문" },
  { college: "사회과학대학", department: "경제학과", admissionCapacity: 51, academicTrack: "인문" },
  { college: "사회과학대학", department: "소비자학과", admissionCapacity: 22, academicTrack: "인문" },
  { college: "사회과학대학", department: "아동심리학과", admissionCapacity: 22, academicTrack: "인문" },
  { college: "사회과학대학", department: "사회복지학과", admissionCapacity: 22, academicTrack: "인문" },
  { college: "문과대학", department: "한국어문학과", admissionCapacity: 33, academicTrack: "인문" },
  { college: "문과대학", department: "사학과", admissionCapacity: 26, academicTrack: "인문" },
  { college: "문과대학", department: "철학과", admissionCapacity: 25, academicTrack: "인문" },
  { college: "문과대학", department: "중국학과", admissionCapacity: 43, academicTrack: "인문" },
  { college: "문과대학", department: "일본언어문화학과", admissionCapacity: 40, academicTrack: "인문" },
  { college: "문과대학", department: "영미유럽인문융합학부", admissionCapacity: 60, academicTrack: "인문" },
  { college: "문과대학", department: "문화콘텐츠문화경영학과", admissionCapacity: 52, academicTrack: "인문" },
  { college: "의과대학", department: "의예과", admissionCapacity: 120, academicTrack: "자연" },
  { college: "간호대학", department: "간호학과", admissionCapacity: 108, academicTrack: "자연" },
  { college: "예술체육대학", department: "조형예술학과", admissionCapacity: 27, academicTrack: "예체능" },
  { college: "예술체육대학", department: "디자인융합학과", admissionCapacity: 35, academicTrack: "예체능" },
  { college: "예술체육대학", department: "스포츠과학과", admissionCapacity: 60, academicTrack: "예체능" },
  { college: "예술체육대학", department: "연극영화학과", admissionCapacity: 27, academicTrack: "예체능" },
  { college: "예술체육대학", department: "의류디자인학과", admissionCapacity: 44, academicTrack: "인문/예체능" },
  { college: "미래융합대학", department: "메카트로닉스공학과", admissionCapacity: 1, academicTrack: "자연" },
  { college: "미래융합대학", department: "소프트웨어융합공학과", admissionCapacity: 1, academicTrack: "자연" },
  { college: "미래융합대학", department: "산업경영학과", admissionCapacity: 1, academicTrack: "인문" },
  { college: "미래융합대학", department: "금융투자학과", admissionCapacity: 1, academicTrack: "인문" },
  { college: "미래융합대학", department: "반도체산업융합학과", admissionCapacity: 1, academicTrack: "자연" },
  { college: "소프트웨어융합대학", department: "인공지능공학과", admissionCapacity: 100, academicTrack: "자연" },
  { college: "소프트웨어융합대학", department: "데이터사이언스학과", admissionCapacity: 53, academicTrack: "자연" },
  { college: "소프트웨어융합대학", department: "스마트모빌리티공학과", admissionCapacity: 43, academicTrack: "자연" },
  { college: "소프트웨어융합대학", department: "디자인테크놀로지학과", admissionCapacity: 40, academicTrack: "자연/예체능" },
  { college: "소프트웨어융합대학", department: "컴퓨터공학과", admissionCapacity: 160, academicTrack: "자연" },
  { college: "프런티어창의대학", department: "자유전공융합학부", admissionCapacity: 278, academicTrack: "인문/자연" },
  { college: "프런티어창의대학", department: "공학융합학부", admissionCapacity: 131, academicTrack: "자연" },
  { college: "프런티어창의대학", department: "자연과학융합학부", admissionCapacity: 36, academicTrack: "자연" },
  { college: "프런티어창의대학", department: "경영융합학부", admissionCapacity: 45, academicTrack: "인문" },
  { college: "프런티어창의대학", department: "사회과학융합학부", admissionCapacity: 42, academicTrack: "인문" },
  { college: "프런티어창의대학", department: "인문융합학부", admissionCapacity: 34, academicTrack: "인문" },
  { college: "국제학부", department: "IBT학과", admissionCapacity: null, academicTrack: "인문" },
  { college: "국제학부", department: "ISE학과", admissionCapacity: null, academicTrack: "자연" },
  { college: "국제학부", department: "KLC학과", admissionCapacity: null, academicTrack: "인문" },
  { college: "바이오시스템융합학부", department: "생명공학과", admissionCapacity: 45, academicTrack: "자연" },
  { college: "바이오시스템융합학부", department: "생명과학과", admissionCapacity: 35, academicTrack: "자연" },
  { college: "바이오시스템융합학부", department: "첨단바이오의약학과", admissionCapacity: 23, academicTrack: "자연" },
  { college: "바이오시스템융합학부", department: "바이오식품공학과", admissionCapacity: 22, academicTrack: "자연" },
];

export const inhaDepartmentSeedTargets: InhaDepartmentSeedTarget[] = inhaDepartmentRows.map(
  (row) => {
    const fallbackProfile = buildDepartmentProfile(
      row.college,
      row.department,
      row.academicTrack,
    );
    const supplemental = findInhaSupplementalCurriculum(row.department);
    const sourceSupplemental = supplemental?.courses.length ? supplemental : null;
    const sugangSchedule = findInhaOfficialSugangDepartment(row.department);
    const sourceSugang =
      (sugangSchedule?.courses.length ?? 0) >= inhaOfficialSugangMinimumCourseSignals
        ? sugangSchedule
        : null;
    const profile =
      sourceSupplemental
        ? buildSupplementalDepartmentProfile(row.college, sourceSupplemental)
        : sourceSugang
          ? buildSugangDepartmentProfile(row.college, sourceSugang)
        : fallbackProfile;
    const curriculumSourceKind: InhaCurriculumSourceKind = sourceSupplemental
      ? "adiga-public-department"
      : sourceSugang
        ? "inha-sugang-course-schedule"
      : "archetype-seed";
    const curriculumSourceUrl = sourceSupplemental
      ? sourceSupplemental.sourceUrl
      : sourceSugang
        ? sourceSugang.sourceUrl
      : inhaAdmissionsSourceUrl;
    const curriculumEvidenceFile = sourceSupplemental
      ? `${inhaSupplementalCurriculumEvidence} (${sourceSupplemental.searchYear}, ruCd=${sourceSupplemental.ruCd})`
      : sourceSugang
        ? `${inhaOfficialSugangEvidence} (${sourceSugang.term}, dept=${sourceSugang.departmentCodes.join(",")})`
      : inhaAdmissionsEvidence;

    return {
      university: "인하대",
      ...row,
      courses: profile.courses,
      focus: profile.focus,
      admissionSourceUrl: inhaAdmissionsSourceUrl,
      curriculumSourceKind,
      curriculumSourceUrl,
      curriculumEvidenceFile,
      adigaRuCd: supplemental?.ruCd ?? null,
      sugangDepartmentCodes: sugangSchedule?.departmentCodes ?? [],
      sourceCourseSignalCount: sourceSupplemental?.courses.length ?? sourceSugang?.courses.length ?? 0,
      officialSugangCourseSignalCount: sugangSchedule?.courses.length ?? 0,
      careerFields: supplemental?.careerFields ?? [],
      sourceUrl: curriculumSourceUrl,
      evidenceFile: curriculumEvidenceFile,
    };
  },
);

const inhaAdmissionDepartmentNames = inhaDepartmentRows.map((row) => row.department);
const adigaCoverage = summarizeInhaSupplementalCurriculum(inhaAdmissionDepartmentNames);
const officialSugangCoverage =
  summarizeInhaOfficialSugangCoverage(inhaAdmissionDepartmentNames);

const sourceBackedAdmissionDepartments = inhaDepartmentSeedTargets
  .filter((target) => target.curriculumSourceKind !== "archetype-seed")
  .map((target) => target.department);
const archetypeOnlyAdmissionDepartments = inhaDepartmentSeedTargets
  .filter((target) => target.curriculumSourceKind === "archetype-seed")
  .map((target) => target.department);
const curriculumSourceKindCounts = inhaDepartmentSeedTargets.reduce<
  Record<InhaCurriculumSourceKind, number>
>(
  (counts, target) => ({
    ...counts,
    [target.curriculumSourceKind]: counts[target.curriculumSourceKind] + 1,
  }),
  {
    "adiga-public-department": 0,
    "inha-sugang-course-schedule": 0,
    "archetype-seed": 0,
  },
);

export const inhaSupplementalCurriculumCoverage = {
  ...adigaCoverage,
  adigaMissingAdmissionDepartments: adigaCoverage.missingAdmissionDepartments,
  officialSugangSourceUrl: inhaOfficialSugangSourceUrl,
  officialSugangMatchedAdmissionDepartmentCount:
    officialSugangCoverage.matchedAdmissionDepartmentCount,
  officialSugangCourseBackedAdmissionDepartmentCount:
    officialSugangCoverage.courseBackedAdmissionDepartmentCount,
  officialSugangPartialAdmissionDepartmentCount:
    officialSugangCoverage.partialAdmissionDepartmentCount,
  officialSugangPartialAdmissionDepartments:
    officialSugangCoverage.partialAdmissionDepartments,
  curriculumSourceKindCounts,
  sourceBackedAdmissionDepartmentCount: sourceBackedAdmissionDepartments.length,
  sourceBackedAdmissionDepartments,
  archetypeOnlyDepartmentCount:
    inhaDepartmentRows.length - sourceBackedAdmissionDepartments.length,
  archetypeOnlyAdmissionDepartments,
  missingAdmissionDepartments: archetypeOnlyAdmissionDepartments,
};

function buildSupplementalDepartmentProfile(
  college: string,
  supplemental: InhaSupplementalCurriculum,
) {
  return {
    courses: supplemental.courses.map(normalizeSupplementalCourseTitle),
    focus: inferCourseFocus(college, supplemental.courses, supplemental.field),
  };
}

function buildSugangDepartmentProfile(
  college: string,
  schedule: InhaOfficialSugangDepartment,
) {
  const courses = schedule.courses.map((course) => normalizeSupplementalCourseTitle(course.title));
  return {
    courses,
    focus: inferCourseFocus(college, courses, schedule.department),
  };
}

function normalizeSupplementalCourseTitle(title: string) {
  return title.replace("운영체체론", "운영체제론");
}

function inferCourseFocus(college: string, courses: string[], fallbackFocus: string) {
  const courseText = courses.join(" ");
  const focusCandidates = [
    /인공지능|머신러닝|딥러닝|AI/i.test(courseText) ? "AI/머신러닝" : null,
    /데이터|통계|빅데이터|마이닝/.test(courseText) ? "데이터분석" : null,
    /회로|반도체|전자|전기/.test(courseText) ? "회로/반도체" : null,
    /기계(?!학습)|동역학|열역학|유체|로봇/.test(courseText) ? "기계/로봇" : null,
    /생명|바이오|의약|미생물/.test(courseText) ? "바이오/생명" : null,
    /경영|마케팅|회계|재무|물류|무역/.test(courseText) ? "비즈니스" : null,
    /교육|교과|교직/.test(courseText) ? "교육" : null,
    /설계|스튜디오|제작|작품|포트폴리오/.test(courseText) ? "프로젝트/제작" : null,
    /캡스톤|종합설계|현장실습|프로젝트/.test(courseText) ? "캡스톤" : null,
    fallbackFocus.replace("계열", ""),
    college.replace("대학", "").replace("학부", ""),
  ];

  return [...new Set(focusCandidates.filter(Boolean) as string[])].slice(0, 3);
}

function buildDepartmentProfile(college: string, department: string, academicTrack: string) {
  const overrides = getDepartmentOverride(department);
  if (overrides) {
    return overrides;
  }

  if (college.includes("공과") || college.includes("미래융합")) {
    return {
      courses: [
        "공업수학",
        "프로그래밍기초",
        `${department}개론`,
        "전공기초실험",
        "시스템설계",
        "데이터분석",
        "전공심화세미나",
        "캡스톤디자인",
      ],
      focus: ["공학설계", "산업문제해결", "캡스톤"],
    };
  }

  if (college.includes("자연과학")) {
    return {
      courses: [
        "미적분학",
        "기초과학실험",
        `${department}개론`,
        "통계적데이터분석",
        "연구방법론",
        "전공심화실험",
        "과학커뮤니케이션",
        "캡스톤연구",
      ],
      focus: ["기초과학", "데이터분석", "연구역량"],
    };
  }

  if (college.includes("경영")) {
    return {
      courses: [
        "경영학원론",
        "경제학원론",
        "회계원리",
        "통계와데이터분석",
        `${department}전공세미나`,
        "전략기획",
        "비즈니스애널리틱스",
        "산학프로젝트",
      ],
      focus: ["비즈니스", "데이터분석", "전략"],
    };
  }

  if (college.includes("사회과학") || college.includes("사범")) {
    return {
      courses: [
        "사회과학방법론",
        "통계와자료분석",
        `${department}개론`,
        "정책분석",
        "현장실습",
        "조사설계",
        "전공심화세미나",
        "캡스톤프로젝트",
      ],
      focus: ["사회문제분석", "조사방법", "정책/교육"],
    };
  }

  if (college.includes("문과")) {
    return {
      courses: [
        "인문학기초",
        "디지털리터러시",
        `${department}개론`,
        "문화연구방법론",
        "텍스트분석",
        "콘텐츠기획",
        "전공심화세미나",
        "졸업프로젝트",
      ],
      focus: ["인문콘텐츠", "문화분석", "커뮤니케이션"],
    };
  }

  if (college.includes("예술체육")) {
    return {
      courses: [
        "창작기초",
        "디자인사고",
        `${department}스튜디오`,
        "미디어표현",
        "프로젝트기획",
        "현장실습",
        "포트폴리오제작",
        "졸업작품",
      ],
      focus: ["창작", "포트폴리오", "현장실습"],
    };
  }

  if (academicTrack.includes("자연")) {
    return {
      courses: [
        "기초수학",
        "프로그래밍기초",
        `${department}개론`,
        "데이터분석",
        "연구방법론",
        "전공실험",
        "전공심화",
        "캡스톤프로젝트",
      ],
      focus: ["융합기초", "데이터", "프로젝트"],
    };
  }

  return {
    courses: [
      "글쓰기와토론",
      "디지털리터러시",
      `${department}개론`,
      "자료분석",
      "전공세미나",
      "현장연계프로젝트",
      "문제해결워크숍",
      "졸업프로젝트",
    ],
    focus: ["융합기초", "문제해결", "커뮤니케이션"],
  };
}

function getDepartmentOverride(department: string) {
  const overrides: Record<string, { courses: string[]; focus: string[] }> = {
    컴퓨터공학과: {
      courses: [
        "컴퓨터프로그래밍",
        "객체지향프로그래밍",
        "자료구조",
        "알고리즘",
        "컴퓨터구조",
        "운영체제",
        "데이터베이스",
        "컴퓨터네트워크",
        "정보보호",
        "캡스톤디자인",
      ],
      focus: ["시스템", "보안", "네트워크"],
    },
    인공지능공학과: {
      courses: [
        "파이썬프로그래밍",
        "선형대수",
        "확률통계",
        "자료구조",
        "알고리즘",
        "데이터베이스",
        "머신러닝",
        "딥러닝",
        "컴퓨터비전",
        "AI캡스톤",
      ],
      focus: ["AI/머신러닝", "데이터", "컴퓨터비전"],
    },
    데이터사이언스학과: {
      courses: [
        "파이썬프로그래밍",
        "확률통계",
        "자료구조",
        "데이터베이스",
        "데이터마이닝",
        "머신러닝",
        "빅데이터처리",
        "데이터시각화",
        "데이터캡스톤",
      ],
      focus: ["데이터", "통계", "시각화"],
    },
    전기전자공학부: {
      courses: [
        "회로이론",
        "전자기학",
        "프로그래밍",
        "디지털논리회로",
        "신호및시스템",
        "마이크로프로세서",
        "통신네트워크",
        "제어공학",
        "종합설계",
      ],
      focus: ["회로/반도체", "통신", "임베디드"],
    },
    반도체시스템공학과: {
      courses: [
        "회로이론",
        "전자기학",
        "반도체공학",
        "디지털논리회로",
        "집적회로설계",
        "반도체공정",
        "소자물리",
        "시스템반도체프로젝트",
      ],
      focus: ["반도체", "회로설계", "공정"],
    },
    스마트모빌리티공학과: {
      courses: [
        "프로그래밍",
        "동역학",
        "센서공학",
        "자율주행개론",
        "제어공학",
        "로봇공학",
        "모빌리티데이터분석",
        "스마트모빌리티캡스톤",
      ],
      focus: ["자율주행", "로봇", "모빌리티"],
    },
    의예과: {
      courses: [
        "의학입문",
        "일반생물학",
        "일반화학",
        "해부학",
        "생리학",
        "의학통계",
        "의료윤리",
        "임상의학기초",
      ],
      focus: ["의학기초", "생명과학", "임상"],
    },
    간호학과: {
      courses: [
        "간호학개론",
        "인체구조와기능",
        "기본간호학",
        "건강사정",
        "성인간호학",
        "지역사회간호학",
        "간호연구",
        "임상실습",
      ],
      focus: ["간호실무", "임상", "보건"],
    },
  };

  return overrides[department];
}
