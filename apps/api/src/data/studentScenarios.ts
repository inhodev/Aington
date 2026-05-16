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
    id: "cs-backend-practical",
    label: "컴공 백엔드 실전형",
    school: "경기대학교",
    department: "컴퓨터공학과",
    field: "백엔드",
    role: "백엔드",
    matchingDistance: "balanced",
    intro: "수업 프로젝트는 해봤지만 배포와 협업 경험이 부족한 3학년입니다.",
    portfolioStats: { 프로젝트: 1, 논문: 0, 대회: 0, 기타: 0 },
    expectedSignal: "프로젝트",
  },
  {
    id: "ai-research-gap",
    label: "AI 연구 입문형",
    school: "서울대학교",
    department: "컴퓨터공학과",
    field: "AI/머신러닝",
    role: "AI/머신러닝",
    matchingDistance: "diverse",
    intro: "머신러닝 수업은 들었지만 논문 읽기와 데이터 실험 루틴이 약합니다.",
    portfolioStats: { 프로젝트: 2, 논문: 0, 대회: 1, 기타: 0 },
    expectedSignal: "AI",
  },
  {
    id: "data-portfolio-gap",
    label: "데이터 포트폴리오형",
    school: "고려대학교",
    department: "컴퓨터학과",
    field: "데이터 과학 및 빅데이터",
    role: "데이터 분석",
    matchingDistance: "similar",
    intro: "데이터 분석 프로젝트를 취업 포트폴리오로 정리하고 싶습니다.",
    portfolioStats: { 프로젝트: 0, 논문: 0, 대회: 1, 기타: 1 },
    expectedSignal: "데이터",
  },
];
