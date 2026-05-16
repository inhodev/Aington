export type WebSourceKind = "official-homepage" | "official-curriculum";

export type WebSource = {
  id: string;
  university: string;
  department: string;
  title: string;
  url: string;
  kind: WebSourceKind;
  reliability: "official" | "secondary";
  notes: string;
};

export const webSourceCatalog: WebSource[] = [
  {
    id: "kgu-ai-cs-home",
    university: "경기대",
    department: "컴퓨터공학과",
    title: "경기대학교 AI컴퓨터공학부",
    url: "https://cs.kyonggi.ac.kr/",
    kind: "official-homepage",
    reliability: "official",
    notes: "학부 공식 사이트. 커리큘럼 상세 표가 공개 HTML에 없으면 학부 신뢰 출처로만 사용한다.",
  },
  {
    id: "ajou-sw-curriculum",
    university: "아주대",
    department: "소프트웨어학과",
    title: "아주대학교 소프트웨어학과 교육과정",
    url: "https://www.ajou.ac.kr/sw/department/curriculum-soft.do",
    kind: "official-curriculum",
    reliability: "official",
    notes: "소프트웨어융합대학 공식 교육과정 페이지.",
  },
  {
    id: "hanyang-cs-education",
    university: "한양대",
    department: "컴퓨터소프트웨어학부",
    title: "한양대학교 컴퓨터소프트웨어학부 교육과정",
    url: "https://cs.hanyang.ac.kr/education/edu_business.php",
    kind: "official-curriculum",
    reliability: "official",
    notes: "소프트웨어대학 컴퓨터소프트웨어학부 공식 교육 페이지.",
  },
  {
    id: "snu-cse-courses",
    university: "서울대",
    department: "컴퓨터공학과",
    title: "서울대학교 컴퓨터공학부 교과과정",
    url: "https://cse.snu.ac.kr/academics/undergraduate/courses",
    kind: "official-curriculum",
    reliability: "official",
    notes: "학부 교과목명, 구분, 학점, 학년 정보를 공개하는 공식 페이지.",
  },
  {
    id: "korea-cs-course-list",
    university: "고려대",
    department: "컴퓨터학과",
    title: "고려대학교 컴퓨터학과 교과목록",
    url: "https://cs.korea.ac.kr/cs/under/computer_course.do",
    kind: "official-curriculum",
    reliability: "official",
    notes: "컴퓨터학과 공식 학부 교과목록 페이지. COSE 과목과 전공 구분 정보를 공개한다.",
  },
  {
    id: "inha-sugang-current-term",
    university: "인하대",
    department: "전체 모집단위",
    title: "인하대학교 수강신청 강의시간표 및 강의계획서",
    url: "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    kind: "official-curriculum",
    reliability: "official",
    notes:
      "인하대학교 공식 수강신청 시스템의 2026학년도 1학기 개설 과목 검색. 전체 교육과정표가 아니라 현재 학기 개설 전공 과목 신호로 사용한다.",
  },
];

export function findWebSource(university: string, department: string) {
  return webSourceCatalog.find(
    (source) => source.university === university && source.department === department,
  );
}
