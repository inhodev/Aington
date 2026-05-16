import type { MatchingDistance, PortfolioStats } from "./complementMatching.js";

export type StudentValidationScenario = {
  id: string;
  label: string;
  school: string;
  department: string;
  field: string;
  role: string;
  matchingDistance: MatchingDistance;
  intro: string;
  portfolioStats: PortfolioStats;
  expectedSignal: string;
};

export const studentValidationScenarios: StudentValidationScenario[] = [
  {
    id: "inha-cs-builder",
    label: "인하대 컴공 서비스 빌더형",
    school: "인하대학교",
    department: "컴퓨터공학과",
    field: "웹/앱 개발",
    role: "웹/앱 개발",
    matchingDistance: "balanced",
    intro: "전공 프로젝트는 해봤지만 실제 배포와 협업 경험이 부족한 인하대 컴공 학생입니다.",
    portfolioStats: { 프로젝트: 1, 논문: 0, 대회: 0, 기타: 0 },
    expectedSignal: "프로젝트",
  },
  {
    id: "inha-ai-research-gap",
    label: "인하대 AI 연구 입문형",
    school: "인하대학교",
    department: "인공지능공학과",
    field: "인공지능",
    role: "인공지능",
    matchingDistance: "diverse",
    intro: "AI 전공 수업은 들었지만 논문 읽기와 데이터 실험 루틴을 같이 만들 동료가 필요합니다.",
    portfolioStats: { 프로젝트: 2, 논문: 0, 대회: 1, 기타: 0 },
    expectedSignal: "AI",
  },
  {
    id: "inha-data-portfolio-gap",
    label: "인하대 데이터 포트폴리오형",
    school: "인하대학교",
    department: "데이터사이언스학과",
    field: "데이터 과학 및 빅데이터",
    role: "데이터 분석",
    matchingDistance: "similar",
    intro: "데이터 분석 결과물을 취업 포트폴리오로 정리하고 싶은 인하대 데이터 전공 학생입니다.",
    portfolioStats: { 프로젝트: 0, 논문: 0, 대회: 1, 기타: 1 },
    expectedSignal: "데이터",
  },
];
