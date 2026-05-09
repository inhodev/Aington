"use client";

import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  EyeOff,
  Folder,
  Globe2,
  HomeIcon,
  Info,
  Lightbulb,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Send,
  Settings,
  ShieldCheck,
  Tag,
  Target,
  Trophy,
  TrendingUp,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Insight = {
  target: {
    school: string;
    department: string;
    track: string;
  };
  headline: string;
  summary: string;
  activities: Array<{
    title: string;
    stat: string;
    why: string;
  }>;
  comparisons: Array<{
    school: string;
    department: string;
    signal: string;
    delta: string;
  }>;
  curriculumSimilarity: {
    base: {
      school: string;
      department: string;
      courseCount: number;
      filters: {
        grade?: string;
        semester?: string;
        yearTerm?: string;
      };
    };
    rankings: Array<{
      rank: number;
      school: string;
      department: string;
      score: number;
      components: {
        semantic: number;
        jaccard: number;
        area: number;
        structure: number;
      };
      sharedCourses: string[];
      sharedAreas: string[];
      differentAreas: string[];
      comparedCourseCount: number;
    }>;
    availableTargets: Array<{
      school: string;
      department: string;
      courseCount: number;
    }>;
  };
  curriculum: Array<{
    name: string;
    strength: string;
    caution: string;
  }>;
  lockedReport: {
    price: number;
    bullets: string[];
  };
  dashboard: {
    percentile: number;
    averageContestCount: number;
    myContestCount: number;
    profileCompletion: number;
  };
  analysis: {
    totalScore: number;
    delta: number;
    metrics: Array<{
      label: string;
      score: number;
    }>;
    strengths: string[];
    weaknesses: string[];
  };
  peers: Array<{
    id: string;
    name: string;
    schoolHidden: string;
    avatar?: string;
    intro: string;
    portfolio: string;
    tags: string[];
    strengthTags?: string[];
    focusAreas?: string[];
    activityStats?: PortfolioStats;
    matchScore?: number;
    matchReasons?: string[];
    complementTags?: string[];
    activityGaps?: PortfolioCategory[];
    matchMode?: "complement";
  }>;
};

type DeepReport = {
  generatedAt: string;
  model: string;
  executiveSummary: string;
  benchmarkInsights: Array<{
    title: string;
    detail: string;
    scoreImpact: string;
  }>;
  portfolioPriorities: Array<{
    title: string;
    why: string;
    nextStep: string;
  }>;
  activityMix: Array<{
    name: string;
    reason: string;
    confidence: "높음" | "중간" | "낮음";
  }>;
  curriculumRecommendations: string[];
  riskNotes: string[];
  sources: string[];
  chartData: {
    radarChart: {
      labels: string[];
      mySchool: number[];
      avgSchool: number[];
    };
    barChart: Array<{
      category: string;
      me: number;
      avg: number;
      unit: string;
    }>;
  };
};

type DeepReportStatus = "idle" | "loading" | "ready" | "error";

type Step =
  | "landing"
  | "analyzing"
  | "report"
  | "signupNotice"
  | "signup"
  | "dashboard";

type DashboardTab = "home" | "report" | "networking" | "profile" | "settings";
type MatchingDistance = "similar" | "balanced" | "diverse";
type PortfolioCategory = "프로젝트" | "논문" | "대회" | "기타";
type PortfolioEntry = {
  id: number;
  category: PortfolioCategory;
  title: string;
  description: string;
};
type PortfolioStats = Record<PortfolioCategory, number>;
type ChatMessage = {
  id: string;
  from: "me" | "peer";
  text: string;
  time: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const deepReportLoadingSteps = [
  "커리큘럼 비교 신호 정렬",
  "Gemini 3 Flash 심화 분석",
  "포트폴리오 우선순위 편집",
];
const LOGIN_STORAGE_KEY = "career-scope-logged-in";
const FIELD_STORAGE_KEY = "career-scope-selected-field";
const CURRENT_USER_ID = "user-current";
const DEFAULT_DEMO_SCHOOL = "경기대학교";
const DEFAULT_DEMO_DEPARTMENT = "컴퓨터공학과";
const schoolOptions = [
  "경기대학교",
  "인하대학교",
  "서울대학교",
  "연세대학교",
  "고려대학교",
  "한양대학교",
  "아주대학교",
  "인천대학교",
  "가천대학교",
  "용인대학교",
];
const majorOptions = [
  "컴퓨터공학과",
  "소프트웨어학과",
  "컴퓨터학과",
  "컴퓨터과학과",
  "컴퓨터소프트웨어학부",
  "인공지능학과",
  "데이터사이언스학과",
  "정보보호학과",
  "전자공학과",
  "산업공학과",
];
const schoolMajorOptions: Record<string, string[]> = {
  인하대학교: ["컴퓨터공학과", "인공지능공학과", "데이터사이언스학과", "정보통신공학과"],
  서울대학교: ["컴퓨터공학과", "컴퓨터공학부", "전기정보공학부"],
  연세대학교: ["컴퓨터과학과", "인공지능학과", "소프트웨어학부"],
  고려대학교: ["컴퓨터학과", "데이터과학과", "스마트보안학부"],
  한양대학교: ["컴퓨터소프트웨어학부", "데이터사이언스학부", "정보시스템학과"],
  아주대학교: ["소프트웨어학과", "사이버보안학과", "인공지능융합학과"],
  인천대학교: ["인공지능학과", "컴퓨터공학부", "정보통신공학과"],
  가천대학교: ["데이터사이언스학과", "컴퓨터공학과", "소프트웨어전공"],
  경기대학교: ["컴퓨터공학과", "인공지능전공", "산업경영공학과"],
  용인대학교: ["전자공학과", "컴퓨터과학전공", "AI융합학부"],
};
const careerFieldOptions = [
  "웹/앱 개발",
  "인공지능",
  "데이터베이스",
  "네트워크",
  "임베디드",
  "컴퓨터 그래픽스",
  "정보보호 및 사이버 보안",
  "클라우드 컴퓨팅",
  "시스템 소프트웨어",
  "데이터 과학 및 빅데이터",
  "소프트웨어 공학",
  "게임 개발",
  "HCI",
  "블록체인",
];
const legacyCareerFieldMap: Record<string, string> = {
  백엔드: "웹/앱 개발",
  프론트엔드: "웹/앱 개발",
  모바일: "웹/앱 개발",
  "웹/앱 개발 (Web/App)": "웹/앱 개발",
  "AI/ML": "인공지능",
  "인공지능 (AI)": "인공지능",
  "데이터베이스 (DB)": "데이터베이스",
  "네트워크 (Network)": "네트워크",
  "임베디드 (Embedded)": "임베디드",
  "컴퓨터 그래픽스 (Graphics)": "컴퓨터 그래픽스",
  "정보보호 및 사이버 보안 (Security)": "정보보호 및 사이버 보안",
  "클라우드 컴퓨팅 (Cloud)": "클라우드 컴퓨팅",
  "시스템 소프트웨어 (System)": "시스템 소프트웨어",
  "데이터 과학 및 빅데이터 (Data Science)": "데이터 과학 및 빅데이터",
  "소프트웨어 공학 (Software Engineering)": "소프트웨어 공학",
  "게임 개발 (Game)": "게임 개발",
  "HCI (인간-컴퓨터 상호작용)": "HCI",
  "블록체인 (Blockchain)": "블록체인",
  데이터분석: "데이터 과학 및 빅데이터",
  알고리즘: "소프트웨어 공학",
  시스템: "시스템 소프트웨어",
  보안: "정보보호 및 사이버 보안",
  클라우드: "클라우드 컴퓨팅",
  오픈소스: "소프트웨어 공학",
  "인턴 준비": "소프트웨어 공학",
  공모전: "소프트웨어 공학",
  해커톤: "소프트웨어 공학",
  "창업 지향": "소프트웨어 공학",
};

type DummyStudent = {
  id: string;
  school: string;
  major: string;
  curriculum: string;
  fields: string[];
};

const dummyStudents: DummyStudent[] = [
  { id: "stu-1", school: "인하대학교", major: "컴퓨터공학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "소프트웨어 공학", "데이터 과학 및 빅데이터"] },
  { id: "stu-2", school: "인하대학교", major: "컴퓨터공학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "시스템 소프트웨어", "데이터베이스"] },
  { id: "stu-3", school: "서울대학교", major: "컴퓨터공학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "인공지능", "소프트웨어 공학"] },
  { id: "stu-4", school: "고려대학교", major: "컴퓨터학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "정보보호 및 사이버 보안", "네트워크"] },
  { id: "stu-5", school: "연세대학교", major: "컴퓨터과학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "클라우드 컴퓨팅", "데이터베이스"] },
  { id: "stu-6", school: "한양대학교", major: "컴퓨터소프트웨어학부", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "시스템 소프트웨어", "정보보호 및 사이버 보안"] },
  { id: "stu-7", school: "아주대학교", major: "소프트웨어학과", curriculum: "소프트웨어학과", fields: ["웹/앱 개발", "HCI", "소프트웨어 공학"] },
  { id: "stu-8", school: "인천대학교", major: "인공지능학과", curriculum: "인공지능학과", fields: ["인공지능", "데이터 과학 및 빅데이터", "컴퓨터 그래픽스"] },
  { id: "stu-9", school: "가천대학교", major: "데이터사이언스학과", curriculum: "데이터사이언스학과", fields: ["데이터 과학 및 빅데이터", "인공지능", "데이터베이스"] },
  { id: "stu-10", school: "경기대학교", major: "컴퓨터공학과", curriculum: "컴퓨터공학과", fields: ["웹/앱 개발", "시스템 소프트웨어", "네트워크"] },
  { id: "stu-11", school: "용인대학교", major: "전자공학과", curriculum: "전자공학과", fields: ["임베디드", "시스템 소프트웨어", "네트워크"] },
  { id: "stu-12", school: "서울대학교", major: "컴퓨터공학과", curriculum: "컴퓨터공학과", fields: ["소프트웨어 공학", "웹/앱 개발", "게임 개발"] },
  { id: "stu-13", school: "고려대학교", major: "컴퓨터학과", curriculum: "컴퓨터공학과", fields: ["블록체인", "웹/앱 개발", "네트워크"] },
  { id: "stu-14", school: "한양대학교", major: "컴퓨터소프트웨어학부", curriculum: "컴퓨터공학과", fields: ["컴퓨터 그래픽스", "웹/앱 개발", "클라우드 컴퓨팅"] },
];

const curriculumComparisonRows = [
  { category: "알고리즘/자료구조", mine: 4, other: 3 },
  { category: "AI/머신러닝", mine: 2, other: 5 },
  { category: "데이터베이스", mine: 3, other: 3 },
  { category: "보안/시스템", mine: 1, other: 3 },
  { category: "프로젝트/실습", mine: 4, other: 3 },
];
const networkFilterTags = ["전체", ...careerFieldOptions];
const portfolioCategoryOptions: PortfolioCategory[] = ["프로젝트", "논문", "대회", "기타"];
const emptyPortfolioStats: PortfolioStats = {
  프로젝트: 0,
  논문: 0,
  대회: 0,
  기타: 0,
};
const defaultPortfolioStats: PortfolioStats = {
  프로젝트: 4,
  논문: 0,
  대회: 2,
  기타: 1,
};
const matchingDistanceOptions: Array<{
  value: MatchingDistance;
  label: string;
  range: string;
  description: string;
}> = [
  {
    value: "similar",
    label: "비슷한 동료 우선",
    range: "유사도 70% 이상 매칭",
    description: "비슷한 전공, 비슷한 활동 이력을 가진 동료를 추천합니다",
  },
  {
    value: "balanced",
    label: "균형있게",
    range: "유사도 40~70% 매칭",
    description: "다양한 배경의 동료를 골고루 추천합니다",
  },
  {
    value: "diverse",
    label: "다른 시각 우선",
    range: "유사도 40% 이하 매칭",
    description: "다른 전공, 다른 활동 배경을 가진 동료를 추천합니다",
  },
];

const avatarPalette = ["#4F46E5", "#7C3AED", "#10B981", "#F59E0B", "#F43F5E"];

const privacySettings: Array<{ label: string; icon: LucideIcon; checked: boolean }> = [
  { label: "학교명은 익명 처리", icon: EyeOff, checked: true },
  { label: "포트폴리오 미리보기만 공개", icon: Folder, checked: true },
  { label: "수락 후 연락처 공개", icon: Mail, checked: true },
];

const notificationSettings: Array<{ label: string; icon: LucideIcon; checked: boolean }> = [
  { label: "새 메시지 도착", icon: Bell, checked: true },
  { label: "추천 동료 업데이트", icon: Users, checked: true },
  { label: "심화 리포트 할인 알림", icon: Tag, checked: false },
];

const fallbackInsight: Insight = {
  target: {
    school: DEFAULT_DEMO_SCHOOL,
    department: DEFAULT_DEMO_DEPARTMENT,
    track: "컴퓨터공학/소프트웨어 계열",
  },
  headline: "컴퓨터공학과 학생 중 실전 프로젝트 경험이 빠르게 격차를 만드는 구간이에요.",
  summary:
    "선택한 학과는 공모전, 오픈소스, 인턴십 경험이 포트폴리오 신뢰도를 크게 좌우하는 계열입니다.",
  activities: [
    {
      title: "해커톤/서비스 MVP 제작",
      stat: "상위권 학생 10명 중 7명이 1회 이상 참여",
      why: "문제 정의, 구현, 발표까지 한 번에 보여줄 수 있어요.",
    },
    {
      title: "AI/데이터 분석 공모전",
      stat: "수도권 컴공 계열 관심도 2위 활동",
      why: "데이터로 문제를 해석하는 힘을 보여주기 좋아요.",
    },
    {
      title: "오픈소스/기술 블로그",
      stat: "기술 면접 전환율이 높은 학생군에서 반복 관찰",
      why: "코드와 사고 과정을 동시에 공개할 수 있어요.",
    },
  ],
  comparisons: [
    {
      school: "고려대학교",
      department: "컴퓨터학과",
      signal: "알고리즘/연구실 프로젝트 비중이 높음",
      delta: "+18%",
    },
    {
      school: "연세대학교",
      department: "컴퓨터과학과",
      signal: "스타트업 인턴 및 창업 동아리 연결이 강함",
      delta: "+11%",
    },
    {
      school: "한양대학교",
      department: "컴퓨터소프트웨어학부",
      signal: "산학 프로젝트와 실무형 포트폴리오가 강함",
      delta: "+15%",
    },
  ],
  curriculumSimilarity: {
    base: {
      school: DEFAULT_DEMO_SCHOOL,
      department: DEFAULT_DEMO_DEPARTMENT,
      courseCount: 47,
      filters: {},
    },
    rankings: [
      {
        rank: 1,
        school: "아주대",
        department: "소프트웨어학과",
        score: 0.74,
        components: {
          semantic: 0.78,
          jaccard: 0.36,
          area: 0.86,
          structure: 0.62,
        },
        sharedCourses: ["자료구조", "운영체제", "데이터베이스", "알고리즘"],
        sharedAreas: ["프로그래밍", "자료구조", "알고리즘", "운영체제"],
        differentAreas: ["AI/머신러닝", "보안"],
        comparedCourseCount: 60,
      },
    ],
    availableTargets: [],
  },
  curriculum: [
    {
      name: "자료구조/알고리즘",
      strength: "기술 면접과 코딩테스트 기반 직군에 바로 연결됩니다.",
      caution: "프로덕트 경험이 부족하면 결과물이 추상적으로 보일 수 있습니다.",
    },
    {
      name: "데이터베이스/백엔드",
      strength: "서비스 구조와 안정성에 관심 있는 학생에게 강한 축입니다.",
      caution: "사용자 문제와 연결한 프로젝트 설명이 필요합니다.",
    },
    {
      name: "인공지능/머신러닝",
      strength: "데이터 기반 문제 해결 역량을 보여주기 좋습니다.",
      caution: "모델 사용보다 데이터 해석과 실험 설계가 중요합니다.",
    },
  ],
  lockedReport: {
    price: 4900,
    bullets: [
      "내 계열 상위 20% 학생들의 활동 조합",
      "학교별 컴공 학생 포트폴리오 신호 비교",
      "지금 선택하면 좋은 커리큘럼/대외활동 우선순위",
      "비슷한 목표를 가진 학생 추천 및 모임 초대",
    ],
  },
  dashboard: {
    percentile: 63,
    averageContestCount: 3,
    myContestCount: 1,
    profileCompletion: 72,
  },
  analysis: {
    totalScore: 72,
    delta: 7,
    metrics: [
      { label: "의미근접", score: 78 },
      { label: "과목일치", score: 36 },
      { label: "분야균형", score: 86 },
      { label: "학기구조", score: 62 },
      { label: "전공폭", score: 74 },
    ],
    strengths: [
      "자료구조, 운영체제, 데이터베이스 과목이 비교군과 직접 겹칩니다.",
      "프로그래밍, 자료구조, 알고리즘 분야가 공통 강점으로 나타납니다.",
      "유사 대학과 비교 가능한 커리큘럼 데이터가 충분합니다.",
      "전공 기초와 프로젝트 과목을 함께 설명하기 좋습니다.",
    ],
    weaknesses: [
      "전공필수/학점 정보가 비어 있는 과목이 많아 학점 가중 비교는 제한적입니다.",
      "학년별 선택과목 데이터가 더 채워지면 구조 비교 정확도가 올라갑니다.",
      "AI/머신러닝, 보안 분야는 학교별 편차가 커서 추가 확인이 필요합니다.",
      "과목 설명 기반 의미 비교를 붙이면 더 정밀해집니다.",
    ],
  },
  peers: [
    {
      id: "peer-1",
      name: "웹/앱 개발 지망 3학년",
      schoolHidden: "서울대학교 컴퓨터공학과",
      avatar: "/assets/peer-profile-1.webp",
      intro: "분산 시스템과 API 설계에 관심이 많고, 팀 프로젝트 경험을 같이 쌓을 사람을 찾고 있어요.",
      portfolio: "github.com/demo/backend-student",
      tags: ["웹/앱 개발", "데이터베이스", "API"],
    },
    {
      id: "peer-2",
      name: "AI 프로덕트 빌더",
      schoolHidden: "연세대학교 인공지능학과",
      avatar: "/assets/peer-profile-2.webp",
      intro: "데이터 분석 공모전과 해커톤을 같이 나갈 컴공 계열 동료를 찾고 있어요.",
      portfolio: "notion.site/demo-ai-builder",
      tags: ["인공지능", "데이터 과학 및 빅데이터", "HCI"],
    },
  ],
};

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [field, setField] = useState("");
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("김하늘");
  const [introLength, setIntroLength] = useState(43);
  const [signupField, setSignupField] = useState("");
  const [matchingDistance, setMatchingDistance] = useState<MatchingDistance>("balanced");
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([
    { id: 1, category: "프로젝트", title: "", description: "" },
  ]);
  const [profilePortfolioStats, setProfilePortfolioStats] =
    useState<PortfolioStats>(defaultPortfolioStats);

  const activeInsight = insight || fallbackInsight;
  const majorSuggestions = useMemo(() => getMajorOptionsForSchool(school), [school]);
  const schoolComparison = useMemo(
    () => buildSchoolMajorComparison(school, department, field),
    [school, department, field],
  );
  const completedPortfolioEntries = useMemo(
    () =>
      portfolioEntries.filter(
        (entry) => entry.title.trim().length > 0 || entry.description.trim().length > 0,
      ),
    [portfolioEntries],
  );
  const portfolioStats = useMemo(
    () => buildPortfolioStats(completedPortfolioEntries),
    [completedPortfolioEntries],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      const storedField = window.sessionStorage.getItem(FIELD_STORAGE_KEY);
      const selectedSchool = params.get("school") || "";
      const selectedMajor = normalizeMajorName(params.get("major") || "");
      const rawField = params.get("field") || (view ? storedField : null);
      const selectedField = rawField ? normalizeCareerField(rawField) : "";

      setSchool(selectedSchool);
      setDepartment(selectedMajor);
      setField(selectedField);
      setSignupField(selectedField);
      window.sessionStorage.setItem(FIELD_STORAGE_KEY, selectedField);

      if (view === "report") {
        setInsight(fallbackInsight);
        setStep("report");
        return;
      }
      if (view === "signup") {
        setStep("signup");
        return;
      }
      if (view === "notice") {
        setStep("signupNotice");
        return;
      }
      if (view === "dashboard") {
        window.localStorage.setItem(LOGIN_STORAGE_KEY, "true");
        setIsLoggedIn(true);
        setInsight(fallbackInsight);
        setStep("dashboard");
        return;
      }

      setIsLoggedIn(window.localStorage.getItem(LOGIN_STORAGE_KEY) === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function selectField(nextField: string) {
    setField(nextField);
    setSignupField(nextField);
    window.sessionStorage.setItem(FIELD_STORAGE_KEY, nextField);
  }

  function addPortfolioEntry() {
    if (portfolioEntries.length >= 10) {
      return;
    }

    setPortfolioEntries((entries) => [
      ...entries,
      {
        id: Date.now(),
        category: "프로젝트",
        title: "",
        description: "",
      },
    ]);
  }

  function updatePortfolioEntry(
    id: number,
    key: keyof Omit<PortfolioEntry, "id">,
    value: string,
  ) {
    setPortfolioEntries((entries) =>
      entries.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    );
  }

  function removePortfolioEntry(id: number) {
    setPortfolioEntries((entries) => {
      if (entries.length === 1) {
        return entries;
      }
      return entries.filter((entry) => entry.id !== id);
    });
  }

  async function handleAnalyze() {
    if (!school.trim() || !department.trim() || !field) {
      return;
    }

    setStep("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const delay = new Promise((resolve) => window.setTimeout(resolve, 4500));
    const selectedSchool = resolveSchoolOption(school);
    const selectedDepartment = resolveMajorOption(department, getMajorOptionsForSchool(selectedSchool));
    const selectedField = field;
    setSchool(selectedSchool);
    setDepartment(selectedDepartment);
    window.sessionStorage.setItem(FIELD_STORAGE_KEY, selectedField);
    const landingParams = new URLSearchParams({
      school: selectedSchool,
      major: selectedDepartment,
      field: selectedField,
    });
    window.history.replaceState(null, "", `/?${landingParams.toString()}`);

    try {
      const query = new URLSearchParams({
        school: selectedSchool,
        major: selectedDepartment,
        department: selectedDepartment,
        field: selectedField,
      }).toString();
      const [response] = await Promise.all([
        fetch(`${API_URL}/api/insights?${query}`),
        delay,
      ]);
      if (!response.ok) {
        throw new Error("Insight API failed");
      }
      const data = (await response.json()) as Insight;
      setInsight(data);
    } catch {
      setInsight({
        ...fallbackInsight,
        target: { ...fallbackInsight.target, school: selectedSchool, department: selectedDepartment },
      });
      await delay;
    } finally {
      setStep("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      school,
      department,
      email: "student@kyonggi.ac.kr",
      name: "김하늘",
      role: String(form.get("role") || signupField),
      interest: signupField,
      wantsToMeet: matchingDistance,
      intro: String(form.get("intro") || ""),
      matchingDistance,
      portfolioEntries: completedPortfolioEntries,
      portfolioStats,
      portfolio: JSON.stringify(completedPortfolioEntries),
    };

    setProfileName(payload.name || "김하늘");
    setProfilePortfolioStats(portfolioStats);
    window.sessionStorage.setItem(FIELD_STORAGE_KEY, payload.role);
    window.sessionStorage.setItem("career-scope-signup", JSON.stringify(payload));

    try {
      await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Demo flow continues even if the local API is not running.
    }

    try {
      const response = await fetch(`${API_URL}/api/complement-matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school,
          department,
          matchingDistance,
          portfolioStats,
        }),
      });

      if (response.ok) {
        const matchedPeers = (await response.json()) as Insight["peers"];
        setInsight((currentInsight) => {
          const baseInsight = currentInsight || {
            ...fallbackInsight,
            target: { ...fallbackInsight.target, school, department },
          };
          return { ...baseInsight, peers: matchedPeers };
        });
      }
    } catch {
      // Keep the existing demo recommendations if complement matching is unavailable.
    }

    completeLogin();
  }

  function continueToSignup() {
    setStep("signup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeLogin() {
    window.localStorage.setItem(LOGIN_STORAGE_KEY, "true");
    setIsLoggedIn(true);
    setStep("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function logout() {
    window.localStorage.removeItem(LOGIN_STORAGE_KEY);
    window.localStorage.removeItem("career-scope-token");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("authToken");
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    setIsLoggedIn(false);
    setStep("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setStep(isLoggedIn ? "dashboard" : "landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCompareFlow() {
    if (isLoggedIn) {
      goHome();
      return;
    }

    setStep("signupNotice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      {step !== "dashboard" && (
        <Header
          isLoggedIn={isLoggedIn}
          onHome={goHome}
          onLogin={completeLogin}
        />
      )}

      {step === "landing" && (
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">전공 데이터 기반 커리어 리포트</p>
            <h1>
              데이터로 찾는
              <br />
              나만의 <span>커리어 가능성</span>
            </h1>
            <p className="hero-description">
              학교와 학과만 입력하면 컴퓨터공학과 학생을 위한 활동,
              커리큘럼, 비교 인사이트가 바로 열립니다.
            </p>
          </div>

          <div className="analyze-panel" aria-label="커리어 분석 입력">
            <AutocompleteInput
              icon="🏫"
              label="학교"
              placeholder="예: 경기, 경기대, 경기대학교"
              value={school}
              options={schoolOptions}
              popularOptions={[DEFAULT_DEMO_SCHOOL, "서울대학교", "연세대학교"]}
              onChange={(nextSchool) => {
                setSchool(nextSchool);
                const nextMajorOptions = getMajorOptionsForSchool(nextSchool);
                if (department && !nextMajorOptions.includes(department)) {
                  setDepartment("");
                }
              }}
            />

            <AutocompleteInput
              icon="📚"
              label="학과"
              placeholder="예: 컴퓨터, 컴공, 소프트웨어"
              value={department}
              options={majorSuggestions}
              popularOptions={majorSuggestions.slice(0, 3)}
              onChange={(nextDepartment) => {
                setDepartment(nextDepartment);
              }}
            />

            <FieldChipDropdown
              value={field}
              disabled={!department}
              options={careerFieldOptions}
              onChange={selectField}
            />

            <button
              className="primary-cta"
              disabled={!school.trim() || !department.trim() || !field}
              onClick={handleAnalyze}
            >
              <TrendingUp size={24} />
              커리어 분석 시작하기
              <ArrowRight className="cta-arrow" size={22} />
            </button>

            <div className="social-proof-badge" aria-label="분석 완료 사용자 수">
              <span className="proof-avatar">김</span>
              <span className="proof-avatar">이</span>
              <span className="proof-avatar">박</span>
              <strong>이미 2,847명이 분석했어요</strong>
            </div>
          </div>
        </section>
      )}

      {step === "analyzing" && (
        <section className="analyzing-shell" aria-live="polite">
          <div className="analysis-equalizer" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">분석 리포트 생성 중</p>
          <h2>
            {school} {department}
            <br />
            커리어 신호를 불러오고 있어요
          </h2>
          <div className="analysis-status">
            <span>전국 커리큘럼 DB 검색 중...</span>
            <span>비교군 데이터 매핑 중...</span>
            <span>커리어 인사이트 생성 중...</span>
          </div>
          <div className="analysis-progress">
            <div />
          </div>
          <div className="analysis-skeleton-grid" aria-hidden="true">
            <span className="skeleton-card" />
            <span className="skeleton-card" />
            <span className="skeleton-card" />
          </div>
        </section>
      )}

      {step === "report" && (
        <section className="result-page">
          <div className="breadcrumb">
            <HomeIcon size={17} />
            <ChevronRight size={16} />
            <span>분석 리포트</span>
            <ChevronRight size={16} />
            <strong>결과 보기</strong>
          </div>

          <article className="career-report-card">
            <div className="report-card-header">
              <div className="report-identity">
                <div className="university-seal">仁</div>
                <div>
                  <h1 className="report-title">
                    {school}
                    <span className="report-department-pill">
                      {department}
                    </span>
                  </h1>
                  <p>{activeInsight.summary}</p>
                </div>
              </div>
              <button className="download-button">
                <Download size={18} />
                리포트 다운로드
              </button>
            </div>

            <div className="report-meta-row">
              <div className="report-meta">
                <span>
                  <BookOpen size={18} />
                </span>
                <div>
                  <small>분석 기준</small>
                  <strong>Neon 커리큘럼 DB</strong>
                </div>
              </div>
              <div className="report-meta">
                <span>
                  <CalendarDays size={18} />
                </span>
                <div>
                  <small>분석 일자</small>
                  <strong>2026.05.09</strong>
                </div>
              </div>
              <div className="report-meta">
                <span>
                  <Users size={18} />
                </span>
                <div>
                  <small>비교 대상</small>
                  <strong>10개 대학 커리큘럼</strong>
                </div>
              </div>
            </div>

            <FieldComparisonReport
              school={school}
              major={department}
              field={field}
              schoolComparison={schoolComparison}
            />

            <section className="locked-report result-lock">
              <div>
                <p className="eyebrow">심화 리포트 미리보기</p>
                <h3>4,900원 리포트에서 잠금 해제되는 정보</h3>
                <div className="locked-list">
                  {activeInsight.lockedReport.bullets.map((bullet) => (
                    <span key={bullet}>
                      <LockKeyhole size={16} />
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
              <button className="secondary-cta" onClick={openCompareFlow}>
                다른 학생이랑 비교하기
                <ArrowRight size={20} />
              </button>
            </section>
          </article>
        </section>
      )}

      {step === "signupNotice" && (
        <section className="signup-notice-shell" aria-live="polite">
          <div className="signup-notice-card">
            <div className="notice-mark">
              <ShieldCheck size={42} />
            </div>
            <p className="eyebrow">로그인 또는 회원가입</p>
            <h2>다른 학생과 비교하려면 먼저 계정으로 이어가야 해요</h2>
            <p>
              로그인하면 바로 메인에서 비교 결과를 볼 수 있고, 처음이라면 간단한
              회원가입 온보딩 후 메인으로 이동합니다.
            </p>
            <div className="auth-action-row">
              <button className="secondary-cta" onClick={completeLogin}>
                로그인하고 메인으로
                <ArrowRight size={20} />
              </button>
              <button className="ghost-cta" onClick={continueToSignup}>
                회원가입하기
              </button>
            </div>
          </div>
        </section>
      )}

      {step === "signup" && (
        <section className="onboarding-shell">
          <div className="onboarding-steps" aria-label="회원가입 온보딩 단계">
            <OnboardingStep active step="1" label="STEP 1" title="기본 정보" />
            <OnboardingStep step="2" label="STEP 2" title="동료 매칭" />
            <OnboardingStep step="3" label="STEP 3" title="포트폴리오 등록" />
          </div>

          <div className="onboarding-heading">
            <h2>회원가입 온보딩</h2>
            <p>더 정확한 매칭을 위해 정보를 입력해주세요. 모든 정보는 언제든지 수정할 수 있어요.</p>
          </div>

          <form className="onboarding-card" id="onboarding-form" onSubmit={handleSignup}>
            <section className="onboarding-section basic-section">
              <SectionNumber number="1" />
              <div className="section-copy">
                <h3>기본 정보</h3>
                <p>나를 소개하고 기본 정보를 입력해주세요.</p>
              </div>
              <label className="intro-field">
                <span>
                  자기소개 <small>100자 이내</small>
                </span>
                <textarea
                  maxLength={100}
                  name="intro"
                  onChange={(event) => setIntroLength(event.target.value.length)}
                  defaultValue="서비스를 실제로 만들어보며 성장하는 것을 좋아합니다."
                  required
                />
                <b>{introLength} / 100</b>
              </label>
              <label className="role-field">
                <span>
                  직군/분야 <em>*</em>
                </span>
                <select
                  name="role"
                  value={signupField}
                  onChange={(event) => {
                    setSignupField(event.target.value);
                    window.sessionStorage.setItem(FIELD_STORAGE_KEY, event.target.value);
                  }}
                  required
                >
                  {careerFieldOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={20} />
              </label>
            </section>

            <section className="onboarding-section match-section">
              <SectionNumber number="2" />
              <div className="section-copy">
                <h3>어떤 동료를 만나고 싶으신가요?</h3>
                <p>추천 동료의 유사도 거리를 선택해주세요.</p>
              </div>
              <MatchingDistanceSlider
                value={matchingDistance}
                onChange={setMatchingDistance}
              />
            </section>

            <section className="onboarding-section portfolio-section">
              <SectionNumber number="3" />
              <div className="section-copy">
                <h3>포트폴리오 등록 <span>(선택)</span></h3>
                <p>
                  등록한 활동은 프로필 활동 이력으로 자동 집계됩니다.
                  포트폴리오를 등록하면 더 좋은 기회를 만날 수 있어요.
                </p>
                <div className="match-boost">
                  <SparkIcon />
                  포트폴리오 등록 시 매칭률 <strong>+40%</strong>
                </div>
              </div>
              <PortfolioEntryEditor
                entries={portfolioEntries}
                stats={portfolioStats}
                onAdd={addPortfolioEntry}
                onRemove={removePortfolioEntry}
                onUpdate={updatePortfolioEntry}
              />
            </section>
          </form>

          <button className="onboarding-submit" form="onboarding-form" type="submit">
            다음 단계
            <ArrowRight size={20} />
          </button>
          <p className="onboarding-note">입력한 내용은 언제든지 수정할 수 있습니다.</p>
        </section>
      )}

      {step === "dashboard" && (
        <AppDashboard
          field={field}
          insight={activeInsight}
          profileName={profileName}
          portfolioStats={profilePortfolioStats}
          onLogout={logout}
        />
      )}
    </main>
  );
}

function Header({
  isLoggedIn,
  onHome,
  onLogin,
}: {
  isLoggedIn: boolean;
  onHome: () => void;
  onLogin: () => void;
}) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome}>
        <span className="logo-mark">
          <Image
            src="/assets/gwayeon-logo.png"
            alt=""
            width={72}
            height={79}
            priority
            unoptimized
          />
        </span>
        <span>
          <strong>과연</strong>
          <small>데이터로 설계하는 당신의 커리어</small>
        </span>
      </button>
      <nav>
        {isLoggedIn ? (
          <>
            <button className="icon-nav-button" aria-label="알림">
              <Bell size={21} />
            </button>
            <button className="icon-nav-button" aria-label="프로필">
              <User size={21} />
            </button>
          </>
        ) : (
          <button className="nav-text-button" onClick={onLogin}>
            로그인
          </button>
        )}
        <button onClick={onHome}>메인</button>
      </nav>
    </header>
  );
}

function AppDashboard({
  field,
  insight,
  profileName,
  portfolioStats,
  onLogout,
}: {
  field: string;
  insight: Insight;
  profileName: string;
  portfolioStats: PortfolioStats;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    const tab = new URLSearchParams(window.location.search).get("tab");
    return isDashboardTab(tab) ? tab : "home";
  });
  const [deepReport, setDeepReport] = useState<DeepReport | null>(null);
  const [deepReportStatus, setDeepReportStatus] = useState<DeepReportStatus>("idle");
  const [deepReportError, setDeepReportError] = useState("");
  const [showOperatorNotice, setShowOperatorNotice] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMessagePeer, setActiveMessagePeer] = useState<Insight["peers"][number] | null>(
    null,
  );
  const [messageDraft, setMessageDraft] = useState("");
  const [messageThreads, setMessageThreads] = useState<Record<string, ChatMessage[]>>({});
  const [profileUserId, setProfileUserId] = useState(() => {
    if (typeof window === "undefined") {
      return CURRENT_USER_ID;
    }
    return new URLSearchParams(window.location.search).get("profileUserId") || CURRENT_USER_ID;
  });
  const peers = [...insight.peers, ...dashboardExtraPeers].slice(0, 5);
  const tabHeading = dashboardTabHeadings[activeTab];

  function selectTab(tab?: DashboardTab) {
    if (!tab) {
      return;
    }

    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("view", "dashboard");
    if (tab === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    if (tab === "profile") {
      setProfileUserId(CURRENT_USER_ID);
      url.searchParams.delete("profileUserId");
    }
    window.history.replaceState(null, "", url);
  }

  function openMessage(peer: Insight["peers"][number]) {
    setActiveMessagePeer(peer);
    setMessageDraft("");
    setMessageThreads((threads) => {
      if (threads[peer.id]) {
        return threads;
      }

      const interest = peer.tags[0] || "관심 분야";
      return {
        ...threads,
        [peer.id]: [
          {
            id: `${peer.id}-peer-welcome`,
            from: "peer",
            text: `안녕하세요! ${interest} 쪽으로 같이 이야기 나눠보고 싶어요.`,
            time: "방금 전",
          },
          {
            id: `${peer.id}-me-welcome`,
            from: "me",
            text: "좋아요. 어떤 활동을 같이 준비하고 있나요?",
            time: "방금 전",
          },
        ],
      };
    });
  }

  function sendMessage() {
    if (!activeMessagePeer) {
      return;
    }

    const text = messageDraft.trim();
    if (!text) {
      return;
    }

    const peer = activeMessagePeer;
    const interest = peer.tags[0] || "관심 분야";
    const time = formatChatTime();

    setMessageThreads((threads) => ({
      ...threads,
      [peer.id]: [
        ...(threads[peer.id] || []),
        {
          id: `${peer.id}-me-${Date.now()}`,
          from: "me",
          text,
          time,
        },
        {
          id: `${peer.id}-peer-${Date.now()}`,
          from: "peer",
          text: `${interest} 얘기부터 맞춰보면 좋겠어요. 이번 주 가능한 시간 알려주세요.`,
          time,
        },
      ],
    }));
    setMessageDraft("");
  }

  function viewPeerProfile(peerId: string) {
    setProfileUserId(peerId);
    setActiveTab("profile");
    const url = new URL(window.location.href);
    url.searchParams.set("view", "dashboard");
    url.searchParams.set("tab", "profile");
    url.searchParams.set("profileUserId", peerId);
    window.history.replaceState(null, "", url);
  }

  async function unlockDeepReport() {
    if (deepReportStatus === "loading") {
      return;
    }

    setDeepReportStatus("loading");
    setDeepReportError("");

    try {
      const response = await fetch(`${API_URL}/api/deep-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: insight.target.school,
          department: insight.target.department,
          headline: insight.headline,
          summary: insight.summary,
          activities: insight.activities,
          comparisons: insight.comparisons,
          curriculum: insight.curriculum,
          field,
          portfolioStats,
          analysis: insight.analysis,
          curriculumSimilarity: insight.curriculumSimilarity,
        }),
      });
      const payload = (await response.json()) as DeepReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "심화 리포트 생성에 실패했습니다.");
      }

      setDeepReport(payload as DeepReport);
      setDeepReportStatus("ready");
    } catch (error) {
      setDeepReportStatus("error");
      setDeepReportError(
        error instanceof Error && error.message !== "Load failed"
          ? error.message
          : "API 서버에 연결하지 못했습니다. 서버 실행 상태와 CORS 설정을 확인해주세요.",
      );
    }
  }

  return (
    <div className="app-dashboard">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <span className="logo-mark">
            <Image
              src="/assets/gwayeon-logo.png"
              alt=""
              width={58}
              height={64}
              priority
              unoptimized
            />
          </span>
          <strong>과연</strong>
        </div>

        <nav className="app-nav" aria-label="메인 대시보드 메뉴">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                aria-disabled={!item.tab && !item.href}
                className={item.tab === activeTab ? "active" : ""}
                key={item.label}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href;
                    return;
                  }
                  selectTab(item.tab);
                }}
                type="button"
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="app-main">
        <div className="app-topbar">
          <div>
            <h1>{tabHeading.title}</h1>
            <p>{tabHeading.description}</p>
          </div>
          <div className="app-user-tools">
            <div className="notification-shell">
              <button
                aria-expanded={showOperatorNotice}
                aria-label="운영자 알림"
                onClick={() => setShowOperatorNotice((isOpen) => !isOpen)}
                type="button"
              >
                <Bell size={23} />
                <span />
              </button>
              {showOperatorNotice && (
                <div className="operator-notice-popover" role="status">
                  <div className="section-title">
                    <Bell size={18} />
                    <h3>운영자 알림</h3>
                  </div>
                  {operatorNotices.map((notice) => (
                    <article key={notice.title}>
                      <strong>{notice.title}</strong>
                      <p>{notice.message}</p>
                      <small>{notice.time}</small>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="app-profile-shell">
              <button
                className="app-profile"
                type="button"
                aria-expanded={showUserMenu}
                onClick={() => setShowUserMenu((isOpen) => !isOpen)}
              >
              <span
                className="avatar initial-avatar"
                style={{ "--avatar-color": "#4F46E5" } as React.CSSProperties}
                aria-hidden="true"
              >
                {Array.from(profileName)[0]}
              </span>
              <strong>{profileName}</strong>
              <ChevronDown size={18} />
              </button>
              {showUserMenu && (
                <div className="user-menu" role="menu">
                  <button
                    className="logout-menu-item"
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === "home" && (
          <>
        <section className="distribution-card">
          <Image
            className="distribution-art"
            src="/assets/dashboard-distribution.webp"
            alt=""
            fill
            sizes="(max-width: 980px) 100vw, calc(100vw - 250px)"
            priority
            unoptimized
          />
          <div className="distribution-meta">
            <Info size={18} />
            <span>기준: 컴퓨터공학 계열 · 2,345명</span>
          </div>
          <div className="curve-graph" aria-label="상위 72% 위치 분포 그래프">
            <svg viewBox="0 0 980 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="curve-area"
                d="M30 170 C160 168 240 156 330 126 C445 88 535 42 675 72 C770 94 830 142 950 164 L950 176 L30 176 Z"
              />
              <path
                className="curve-line"
                d="M30 170 C160 168 240 156 330 126 C445 88 535 42 675 72 C770 94 830 142 950 164"
              />
              {[180, 485, 670, 820].map((x) => (
                <line className="curve-guide" key={x} x1={x} x2={x} y1="60" y2="176" />
              ))}
            </svg>
            <div className="position-marker">
              <span>
                <strong>상위 72%</strong>
                <small>컴퓨터공학 계열 2,345명 중</small>
              </span>
              <b />
            </div>
            <div className="curve-axis">
              {["0% 하위", "10%", "25%", "50% 평균", "75%", "90%", "100% 상위"].map(
                (label) => (
                  <span key={label}>{label}</span>
                ),
              )}
            </div>
          </div>
        </section>

        <div className="stat-grid">
          {dashboardStats.map((stat, index) => (
            <article
              className="stat-card"
              key={stat.label}
              style={{ "--stat-accent": stat.accent } as React.CSSProperties}
            >
              <Image
                className="stat-card-art"
                src={stat.asset}
                alt=""
                width={58}
                height={58}
                unoptimized
              />
              <div>
                <h3>{stat.label}</h3>
                <strong>{stat.value}</strong>
              </div>
              <footer>
                <span className={getStatRankTone(stat.rank)}>{stat.rank}</span>
                <small className={stat.deltaTone}>{stat.delta}</small>
              </footer>
              <svg
                className="stat-sparkline"
                viewBox="0 0 60 24"
                role="img"
                aria-label={`${stat.label} 추세`}
              >
                <polyline
                  points={dashboardSparklines[index % dashboardSparklines.length]}
                />
              </svg>
            </article>
          ))}
        </div>

        <section className="similar-users">
          <div className="section-heading-row">
            <h2>나를 보완하는 사용자</h2>
            <button onClick={() => selectTab("networking")} type="button">
              더보기
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="similar-user-marquee" aria-label="나와 비슷한 사용자 목록">
            <div className="similar-user-track">
              {[0, 1].map((groupIndex) => (
                <div
                  className="similar-user-group"
                  aria-hidden={groupIndex === 1}
                  key={groupIndex}
                >
                  {peers.map((peer, index) => {
                    const matchingRate = peer.matchScore ?? peerMatchingRates[index % peerMatchingRates.length];
                    return (
                      <article className="similar-user-card" key={`${peer.id}-${groupIndex}`}>
                        <Image
                          className="peer-avatar"
                          src={getPeerAvatar(peer, index)}
                          alt={groupIndex === 0 ? `${peer.name} 프로필 사진` : ""}
                          width={48}
                          height={48}
                          unoptimized
                        />
                        <h3>{peer.name}</h3>
                        <span className={`match-badge ${getMatchBadgeTone(matchingRate)}`}>
                          {matchingRate}% 매칭
                        </span>
                        <p>{peer.schoolHidden}</p>
                        <div className="peer-chip-row">
                          {peer.tags.slice(0, 3).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        {peer.complementTags && peer.complementTags.length > 0 && (
                          <p>
                            보완: {peer.complementTags.slice(0, 2).join(", ")}
                          </p>
                        )}
                        <footer>
                          <span>공모전 {peer.id === "peer-1" ? "9회" : "7회"}</span>
                          <span>프로젝트 {peer.id === "peer-2" ? "4개" : "5개"}</span>
                        </footer>
                        <button
                          className="letter-button"
                          onClick={() => openMessage(peer)}
                          type="button"
                        >
                          <MessageSquareText size={16} />
                          메시지 보내기
                        </button>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
          </>
        )}

        {activeTab === "report" && (
          <DashboardReportPage
            deepReport={deepReport}
            deepReportError={deepReportError}
            deepReportStatus={deepReportStatus}
            field={field}
            insight={insight}
            onUnlock={unlockDeepReport}
          />
        )}
        {activeTab === "networking" && (
          <NetworkingPage
            peers={peers}
            onMessagePeer={openMessage}
            onViewProfile={viewPeerProfile}
          />
        )}
        {activeTab === "profile" && (
          <ProfilePage
            currentUserId={CURRENT_USER_ID}
            onMessagePeer={openMessage}
            profileUserId={profileUserId}
            profileName={profileName}
            portfolioStats={portfolioStats}
            peer={peers.find((peer) => peer.id === profileUserId)}
          />
        )}
        {activeTab === "settings" && <SettingsPage />}

        <MessageChatModal
          draft={messageDraft}
          messages={activeMessagePeer ? messageThreads[activeMessagePeer.id] || [] : []}
          onClose={() => setActiveMessagePeer(null)}
          onDraftChange={setMessageDraft}
          onSend={sendMessage}
          peer={activeMessagePeer}
        />
      </section>
    </div>
  );
}

function DashboardReportPage({
  deepReport,
  deepReportError,
  deepReportStatus,
  field,
  insight,
  onUnlock,
}: {
  deepReport: DeepReport | null;
  deepReportError: string;
  deepReportStatus: DeepReportStatus;
  field: string;
  insight: Insight;
  onUnlock: () => void;
}) {
  return (
    <section className="dashboard-report-page">
      <article className="report-free-card">
        <div className="report-free-header">
          <span>
            <BarChart3 size={22} />
          </span>
          <div>
            <p className="eyebrow">기본 리포트</p>
            <h2>무료로 제공되는 핵심 분석</h2>
            <p>{insight.summary}</p>
          </div>
          <strong>무료</strong>
        </div>

        <p className="report-target-line">
          분석 대상: {insight.target.school} {insight.target.department} · {field}
        </p>

        <div className="report-free-grid">
          <div className="report-score-tile">
            <small>커리큘럼 종합 점수</small>
            <strong>{insight.analysis.totalScore.toFixed(1)}</strong>
            <span>비교군 대비 +{insight.analysis.delta}%</span>
          </div>
          {insight.analysis.strengths.slice(0, 3).map((strength) => (
            <div className="report-signal-tile" key={strength}>
              <CheckCircle2 size={18} />
              <p>{strength}</p>
            </div>
          ))}
        </div>
      </article>

      <section className="report-insight-grid">
        <article className="report-section-card">
          <div className="section-title">
            <BookOpen size={22} />
            <h3>커리큘럼 해석</h3>
          </div>
          <div className="report-list">
            {insight.curriculum.map((item) => (
              <div key={item.name}>
                <strong>{item.name}</strong>
                <p>{item.strength}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="report-section-card">
          <div className="section-title">
            <Trophy size={22} />
            <h3>추천 활동</h3>
          </div>
          <div className="report-list">
            {insight.activities.map((activity) => (
              <div key={activity.title}>
                <strong>{activity.title}</strong>
                <p>{activity.why}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <DeepReportPreview
        error={deepReportError}
        onUnlock={onUnlock}
        report={deepReport}
        status={deepReportStatus}
      />
    </section>
  );
}

function DeepReportPreview({
  error,
  onUnlock,
  report,
  status,
}: {
  error: string;
  onUnlock: () => void;
  report: DeepReport | null;
  status: DeepReportStatus;
}) {
  if (status === "ready" && report) {
    return <DeepReportResult report={report} />;
  }

  const isGenerating = status === "loading";

  return (
    <section className={`compare-preview-page${isGenerating ? " is-generating" : ""}`}>
      <div className="compare-hero-copy">
        <span>
          <LockKeyhole size={16} />
          심화 리포트 · 4,900원
        </span>
        <h2>비교 보기는 심화 리포트에 포함돼요</h2>
        <p>
          내 분석 결과와 다른 학생의 데이터를 비교해 강점과 성장 가능성을 더 명확히
          볼 수 있습니다.
        </p>
      </div>

      <div className="compare-preview-grid">
        <article className="compare-card mine">
          <div className="compare-card-title">
            <span>
              <User size={24} />
            </span>
            <h3>내 분석 결과</h3>
            <em>내 데이터</em>
          </div>
          <MiniBarChart />
          <div className="compare-lower-grid">
            <div>
              <h4>역량 레이더 차트</h4>
              <MiniRadar />
            </div>
            <div className="summary-metrics">
              <h4>요약 지표</h4>
              {compareSummary.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="compare-tip">
            <Lightbulb size={18} />
            AI 역량과 창의적 사고가 강점이에요. 데이터 분석 역량을 더 발전시켜 보세요!
          </div>
        </article>

        <article className="compare-card locked" aria-busy={isGenerating}>
          <div className="locked-preview-content">
            <div className="compare-card-title">
              <span>
                <User size={24} />
              </span>
              <h3>다른 학생의 분석 결과</h3>
              <em>비교 대상</em>
            </div>
            <MiniBarChart muted />
            <div className="compare-lower-grid">
              <MiniRadar />
              <div className="summary-metrics ghost">
                {compareSummary.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="compare-lock-overlay">
            {isGenerating ? (
              <DeepReportGenerating />
            ) : (
              <>
                <div className="compare-lock-icon">
                  <LockKeyhole size={32} />
                </div>
                <h3>심화 리포트 결제 후 확인</h3>
                <p>비교 보기, 학교별 활동 조합, 포트폴리오 보완 우선순위가 함께 열립니다.</p>
                <ul className="locked-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    타학교 비교 상세 데이터
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    상위 20% 활동 조합 분석
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    맞춤 커리큘럼 추천
                  </li>
                </ul>
                {status === "error" && (
                  <p className="deep-report-error" role="alert">
                    {error}
                  </p>
                )}
                <small className="unlock-note">
                  Gemini API로 커리큘럼 비교 데이터를 실시간 분석합니다.
                </small>
                <button onClick={onUnlock} type="button">
                  심화 리포트 생성하기 · 4,900원
                </button>
              </>
            )}
          </div>
        </article>
      </div>

      <p className="compare-privacy-note">
        <ShieldCheck size={17} />
        모든 데이터는 익명으로 처리되며, 개인정보는 안전하게 보호됩니다.
      </p>
    </section>
  );
}

function DeepReportGenerating() {
  return (
    <div className="deep-report-generating" role="status" aria-live="polite">
      <div className="generation-orb" aria-hidden="true">
        <span />
        <b />
      </div>
      <div className="generation-copy">
        <small>Vertex AI Gemini 3 Flash</small>
        <h3>심화 리포트를 조립하는 중</h3>
        <p>경기대학교 컴퓨터공학과 데이터를 비교하고 실행 우선순위를 정리하고 있어요.</p>
      </div>
      <div className="generation-progress" aria-hidden="true">
        <span />
      </div>
      <ol className="generation-steps">
        {deepReportLoadingSteps.map((step, index) => (
          <li key={step} style={{ "--step-index": index } as CSSProperties}>
            <CheckCircle2 size={15} />
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function DeepReportResult({ report }: { report: DeepReport }) {
  const [openInsightIndex, setOpenInsightIndex] = useState(0);
  const summary = splitExecutiveSummary(report.executiveSummary);

  return (
    <section className="deep-report-result" aria-live="polite">
      <header className="deep-report-header">
        <div className="deep-report-header-top">
          <span>✦ 프리미엄 심화 리포트</span>
          <small>
            {report.model} · {new Date(report.generatedAt).toLocaleString("ko-KR")}
          </small>
        </div>
        <div className="executive-summary-list">
          <p className="summary-strength">
            <span>✓</span>
            {summary[0]}
          </p>
          <p className="summary-risk">
            <span>⚠</span>
            {summary[1]}
          </p>
          <p className="summary-action">
            <span>→</span>
            {summary[2]}
          </p>
        </div>
      </header>

      <DeepReportCharts chartData={report.chartData} />

      <section className="report-section-block report-accordion">
        <div className="deep-section-heading">
          <BarChart3 size={20} />
          <h3>비교군 인사이트</h3>
        </div>
        <div className="report-accordion-list">
          {report.benchmarkInsights.map((item, index) => {
            const isOpen = openInsightIndex === index;
            return (
              <article className="report-accordion-item" key={item.title}>
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpenInsightIndex(isOpen ? -1 : index)}
                  type="button"
                >
                  <span>{item.title}</span>
                  <em>{item.scoreImpact}</em>
                </button>
                {isOpen && <p>{item.detail}</p>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="report-section-block portfolio-steps">
        <div className="deep-section-heading">
          <Target size={20} />
          <h3>포트폴리오 우선순위</h3>
        </div>
        <div className="portfolio-step-list">
          {report.portfolioPriorities.map((item, index) => (
            <article className="portfolio-step-card" key={item.title}>
              <span>{index + 1}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.why}</p>
                <div className="next-step-box">
                  <strong>→ 지금 바로:</strong>
                  {item.nextStep}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section-block">
        <div className="deep-section-heading">
          <Trophy size={20} />
          <h3>추천 활동 조합</h3>
        </div>
        <div className="activity-card-grid">
          {report.activityMix.map((item) => (
            <article className="activity-mix-card" key={item.name}>
              <span className={`confidence-badge confidence-${item.confidence}`}>
                {item.confidence}
              </span>
              <h4>{item.name}</h4>
              <p>{item.reason}</p>
              {item.confidence === "높음" && <small>✦ 우선 추천</small>}
            </article>
          ))}
        </div>
      </section>

      <div className="deep-report-bottom">
        <article className="curriculum-card">
          <h3>커리큘럼 추천</h3>
          <ul>
            {report.curriculumRecommendations.map((item) => (
              <li key={item}>
                <span>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="risk-card">
          <h3>주의할 점</h3>
          <ul>
            {report.riskNotes.map((item) => (
              <li key={item}>
                <span>⚠</span>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <section className="report-sources">
        {report.sources.length > 0 && (
          <>
            <h3>분석 근거</h3>
            <div>
              {report.sources.map((item) => (
                <span key={item}>🔗 {item}</span>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}

function DeepReportCharts({ chartData }: { chartData: DeepReport["chartData"] }) {
  return (
    <section className="deep-report-chart-grid" aria-label="심화 리포트 차트 데이터">
      <DeepReportRadarChart radarChart={chartData.radarChart} />
      <DeepReportBarChart barChart={chartData.barChart} />
    </section>
  );
}

function DeepReportRadarChart({
  radarChart,
}: {
  radarChart: DeepReport["chartData"]["radarChart"];
}) {
  const data = radarChart.labels.map((label, index) => ({
    label,
    mySchool: radarChart.mySchool[index] ?? 0,
    avgSchool: radarChart.avgSchool[index] ?? 0,
  }));

  return (
    <article className="deep-report-chart-card radar">
      <div className="chart-card-heading">
        <h3>커리큘럼 역량 비교</h3>
        <p>나의 학교 vs 동일 분야 타학교 평균</p>
      </div>
      <div className="report-chart-canvas">
        <ResponsiveContainer width="100%" height={310}>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="avgSchool"
              fill="rgba(148,163,184,0.15)"
              fillOpacity={1}
              name="타학교 평균"
              stroke="#94A3B8"
              strokeWidth={2}
            />
            <Radar
              dataKey="mySchool"
              fill="rgba(99,102,241,0.3)"
              fillOpacity={1}
              name="내 학교"
              stroke="#4F46E5"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="report-chart-legend">
        <span><i className="legend-indigo" />내 학교</span>
        <span><i className="legend-slate" />타학교 평균</span>
      </div>
    </article>
  );
}

function DeepReportBarChart({
  barChart,
}: {
  barChart: DeepReport["chartData"]["barChart"];
}) {
  return (
    <article className="deep-report-chart-card bars">
      <div className="chart-card-heading">
        <h3>활동 이력 비교</h3>
        <p>나 vs 동일 커리큘럼 선택 학생 평균</p>
      </div>
      <div className="report-chart-canvas">
        <ResponsiveContainer width="100%" height={310}>
          <BarChart data={barChart} layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 10 }}>
            <XAxis axisLine={false} tickLine={false} type="number" />
            <YAxis
              axisLine={false}
              dataKey="category"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }}
              tickLine={false}
              type="category"
              width={82}
            />
            <Bar dataKey="me" fill="#4F46E5" name="내 수치" radius={[0, 8, 8, 0]}>
              <LabelList
                position="right"
                style={{ fill: "#4F46E5", fontSize: 12, fontWeight: 800 }}
                valueAccessor={(entry) => {
                  const payload = entry.payload as DeepReport["chartData"]["barChart"][number];
                  return `${entry.value ?? 0}${payload.unit}`;
                }}
              />
            </Bar>
            <Bar dataKey="avg" fill="#E2E8F0" name="평균" radius={[0, 8, 8, 0]}>
              <LabelList
                position="right"
                style={{ fill: "#64748B", fontSize: 12, fontWeight: 800 }}
                valueAccessor={(entry) => {
                  const payload = entry.payload as DeepReport["chartData"]["barChart"][number];
                  return `${entry.value ?? 0}${payload.unit}`;
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bar-value-list">
        {barChart.map((item) => (
          <span key={item.category}>
            {item.category}
            <strong>
              나 {item.me}
              {item.unit} · 평균 {item.avg}
              {item.unit}
            </strong>
          </span>
        ))}
      </div>
    </article>
  );
}

function splitExecutiveSummary(summary: string) {
  const sentences = summary
    .split(/(?<=[.!?。]|[다요음임함됨음]\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return [
    sentences[0] || summary,
    sentences[1] || "비교군 대비 보완이 필요한 항목을 추가 분석해야 합니다.",
    sentences[2] || "오늘 바로 포트폴리오 1개를 선택해 실행 기록을 추가하세요.",
  ] as const;
}

function NetworkingPage({
  peers,
  onMessagePeer,
  onViewProfile,
}: {
  peers: Insight["peers"];
  onMessagePeer: (peer: Insight["peers"][number]) => void;
  onViewProfile: (peerId: string) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const featuredPeers = peers.map((peer, index) => ({
    ...peer,
    avatar: getPeerAvatar(peer, index),
    matchScore: peer.matchScore ?? ([92, 88, 84, 81, 78][index] || 76),
    intent:
      peer.matchMode === "complement"
        ? "단점 보완 매칭"
        : ["해커톤 팀빌딩", "공모전 동료", "포트폴리오 피드백", "사이드프로젝트", "커피챗"][index] || "협업",
    note:
      peer.matchReasons?.[0] ??
      ([
        "웹/앱 개발과 API 관심사가 겹치고 프로젝트 준비 단계가 비슷합니다.",
        "인공지능과 데이터 과학 관심사가 함께 잡혀 팀 구성 가능성이 높습니다.",
        "소프트웨어 공학과 시스템 소프트웨어 역량을 서로 보완할 수 있습니다.",
        "데이터 분석 경험을 같이 확장하기 좋은 프로필입니다.",
        "HCI와 웹/앱 개발 협업 목표가 맞물립니다.",
      ][index] ||
        "관심 분야와 활동 목표가 가깝습니다."),
  }));
  const filteredPeers =
    selectedTags.length === 0
      ? featuredPeers
      : featuredPeers.filter((peer) =>
          selectedTags.some((tag) => [...peer.tags, ...(peer.complementTags ?? [])].includes(tag)),
        );
  const activeFilterCopy = getNetworkFilterCopy(selectedTags);

  function toggleNetworkTag(tag: string) {
    if (tag === "전체") {
      setSelectedTags([]);
      return;
    }

    setSelectedTags((tags) =>
      tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
    );
  }

  return (
    <section className="networking-page">
      <div className="networking-toolbar">
        {networkFilterTags.map((filter) => {
          const isActive =
            filter === "전체" ? selectedTags.length === 0 : selectedTags.includes(filter);
          return (
          <button
            className={isActive ? "active" : ""}
            key={filter}
            onClick={() => toggleNetworkTag(filter)}
            type="button"
          >
            {filter}
          </button>
          );
        })}
      </div>

      <div className="networking-layout">
        <div className="networking-main">
          <section className="networking-hero-card">
            <div>
              <p className="eyebrow">{activeFilterCopy.eyebrow}</p>
              <h2>{activeFilterCopy.title}</h2>
              <p>{activeFilterCopy.description}</p>
            </div>
            <div className="networking-hero-stats">
              <strong>{filteredPeers.length}명</strong>
              <span>오늘 추천</span>
            </div>
          </section>

          <div className="networking-grid">
            {filteredPeers.map((peer) => (
              <article className="networking-card" key={peer.id}>
                <header>
                  <Image
                    className="networking-avatar"
                    src={peer.avatar}
                    alt={`${peer.name} 프로필 사진`}
                    width={58}
                    height={58}
                    unoptimized
                  />
                  <div>
                    <h3>{peer.name}</h3>
                    <p>{peer.schoolHidden}</p>
                  </div>
                  <strong className={`networking-match ${getMatchBadgeTone(peer.matchScore)}`}>
                    {peer.matchScore}%
                  </strong>
                </header>
                <div className="networking-intent">
                  <span aria-hidden="true">◎</span>
                  {peer.intent}
                </div>
                <p>{peer.note}</p>
                {peer.complementTags && peer.complementTags.length > 0 && (
                  <div className="networking-intent">
                    보완: {peer.complementTags.slice(0, 3).join(", ")}
                  </div>
                )}
                <div className="networking-tags">
                  {peer.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <footer>
                  <button type="button" onClick={() => onViewProfile(peer.id)}>
                    프로필 보기
                  </button>
                  <button onClick={() => onMessagePeer(peer)} type="button">
                    <MessageSquareText size={16} />
                    메시지 보내기
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>

        <aside className="networking-side">
          <section className="networking-request-card">
            <div className="section-title">
              <Bell size={20} />
              <h3>요청함</h3>
              <span className="request-count-badge">{networkRequests.length}</span>
            </div>
            {networkRequests.map((request, index) => (
              <div className="network-request" key={request.name}>
                <span
                  className="request-avatar initial-avatar"
                  style={
                    { "--avatar-color": avatarPalette[index % avatarPalette.length] } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  {Array.from(request.name)[0]}
                </span>
                <div className="request-copy">
                  <strong>{request.name}</strong>
                  <p>{request.message}</p>
                </div>
                <div>
                  <button type="button">수락</button>
                  <button type="button">나중에</button>
                </div>
              </div>
            ))}
          </section>

        </aside>
      </div>
    </section>
  );
}

function MessageChatModal({
  draft,
  messages,
  onClose,
  onDraftChange,
  onSend,
  peer,
}: {
  draft: string;
  messages: ChatMessage[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  peer: Insight["peers"][number] | null;
}) {
  if (!peer) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
  }

  return (
    <div className="message-modal-backdrop" role="presentation">
      <section
        aria-labelledby="message-modal-title"
        aria-modal="true"
        className="message-modal"
        role="dialog"
      >
        <header className="message-modal-header">
          <span
            aria-hidden="true"
            className="message-peer-avatar initial-avatar"
            style={{ "--avatar-color": avatarPalette[0] } as React.CSSProperties}
          >
            {Array.from(peer.name)[0]}
          </span>
          <div>
            <h3 id="message-modal-title">{peer.name}</h3>
            <p>{peer.schoolHidden}</p>
            <div className="message-peer-tags">
              {peer.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <button aria-label="메시지 창 닫기" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <div className="message-thread" aria-label={`${peer.name}님과의 메시지`}>
          {messages.map((message) => (
            <div className={`message-row ${message.from}`} key={message.id}>
              <div className="message-bubble">
                <p>{message.text}</p>
                <small>{message.time}</small>
              </div>
            </div>
          ))}
        </div>

        <form className="message-composer" onSubmit={handleSubmit}>
          <textarea
            aria-label="메시지 입력"
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="메시지를 입력하세요"
            rows={2}
            value={draft}
          />
          <button disabled={!draft.trim()} type="submit">
            <Send size={16} />
            전송
          </button>
        </form>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <section className="settings-page">
      <article className="settings-card">
        <div className="section-title">
          <ShieldCheck size={22} />
          <h3>공개 범위</h3>
        </div>
        {privacySettings.map((item) => {
          const Icon = item.icon;
          return (
            <label className="settings-row" key={item.label}>
              <span className="settings-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
              <input defaultChecked={item.checked} type="checkbox" />
              <span className="toggle-track" aria-hidden="true">
                <span />
              </span>
            </label>
          );
        })}
      </article>

      <article className="settings-card">
        <div className="section-title">
          <Bell size={22} />
          <h3>알림</h3>
        </div>
        {notificationSettings.map((item) => {
          const Icon = item.icon;
          return (
            <label className="settings-row" key={item.label}>
              <span className="settings-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
              <input defaultChecked={item.checked} type="checkbox" />
              <span className="toggle-track" aria-hidden="true">
                <span />
              </span>
            </label>
          );
        })}
      </article>
    </section>
  );
}

function ProfilePage({
  currentUserId,
  onMessagePeer,
  profileUserId,
  profileName,
  portfolioStats,
  peer,
}: {
  currentUserId: string;
  onMessagePeer: (peer: Insight["peers"][number]) => void;
  profileUserId: string;
  profileName: string;
  portfolioStats: PortfolioStats;
  peer?: Insight["peers"][number];
}) {
  const isOwnProfile = currentUserId === profileUserId;
  const displayName = isOwnProfile ? profileName : peer?.name || "김O현";
  const displayStats = isOwnProfile ? portfolioStats : defaultPortfolioStats;
  const profileActivities = buildActivityHistory(displayStats);

  return (
    <section className="profile-page">
      <section className="profile-top-grid">
        <article className="profile-main-card">
          <div className="profile-avatar-shell">
            <Image
              className="profile-large-avatar"
              src="/assets/avatar-peer-1.webp"
              alt=""
              width={176}
              height={176}
              unoptimized
            />
            <span aria-hidden="true" />
          </div>
          <h2>{displayName}</h2>
          <div className="profile-tag-row">
            {["백엔드 개발자", "데이터 분석", "PM/기획", "문제 해결", "협업 지향", "성장 지향"].map(
              (tag) => (
                <span className={getProfileTagTone(tag)} key={tag}>{tag}</span>
              ),
            )}
          </div>
          <div className="profile-bio">
            <strong>자기소개</strong>
            <p>
              데이터와 기술로 사람들의 일상을 더 편리하게 만드는 서비스를 만들고 싶습니다.
              사용자 중심의 사고와 빠른 실행, 지속적인 개선을 통해 팀과 함께 의미 있는
              결과를 만들어내는 개발자가 되겠습니다.
            </p>
            <small>97/100</small>
          </div>
          {!isOwnProfile && (
            <div className="profile-action-row">
              <button
                className="profile-primary-button"
                disabled={!peer}
                onClick={() => peer && onMessagePeer(peer)}
                type="button"
              >
                <MessageSquareText size={16} />
                메시지 보내기
              </button>
              <button className="profile-secondary-button" type="button">
                <BookOpen size={16} />
                북마크
              </button>
            </div>
          )}
          <div className="profile-section-divider" />
          <section className="profile-activity-section">
            <h3>활동 이력</h3>
            <div className="activity-list">
              {profileActivities.map((item) => {
                const Icon = item.icon;
                return (
                  <div className={`activity-item ${item.tone}`} key={item.label}>
                    <span>
                      <Icon size={28} />
                    </span>
                    <strong>{item.label}</strong>
                    <em>{item.count}</em>
                  </div>
                );
              })}
            </div>
          </section>
        </article>

        <article className="profile-panel service-activity-panel">
          <div className="service-activity-heading">
            <div>
              <p className="eyebrow">과연 활동 내역</p>
              <h3>서비스 활동</h3>
            </div>
            <span>{isOwnProfile ? "내 기록" : "공개 기록"}</span>
          </div>

          <div className="service-activity-list">
            {buildServiceActivityHistory(displayStats).map((item) => {
              const Icon = item.icon;
              return (
                <div className={`service-activity-item ${item.tone}`} key={item.label}>
                  <span>
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.description}</p>
                  </div>
                  <b>{item.value}</b>
                </div>
              );
            })}
          </div>

          <div className="service-activity-summary">
            <CheckCircle2 size={18} />
            <p>
              최근 활동을 기준으로 네트워킹 추천과 모임 초대 우선순위가 업데이트됩니다.
            </p>
          </div>
        </article>
      </section>

      <section className="portfolio-area">
        <div className="section-heading-row">
          <div className="portfolio-title">
            <h2>포트폴리오</h2>
            <span>총 6개</span>
          </div>
          <button>
            전체 보기
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="portfolio-grid">
          {portfolioItems.map((item) => (
            <article className={`portfolio-card ${item.locked ? "locked" : ""}`} key={item.title}>
              <div className="portfolio-image-wrap">
                <Image src={item.image} alt="" width={520} height={330} unoptimized />
                <span className="portfolio-category">{item.category}</span>
                {item.locked && (
                  <div className="portfolio-lock">
                    <LockKeyhole size={24} />
                    <strong>🔒 프리미엄에서 확인</strong>
                  </div>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="portfolio-tech-row">
                {item.tech.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <time>{item.date}</time>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function MiniBarChart({ muted = false }: { muted?: boolean }) {
  return (
    <div className={`mini-bar-chart ${muted ? "muted" : ""}`}>
      {compareBars.map((bar) => (
        <div key={bar.label}>
          <span>{bar.value}</span>
          <b style={{ height: `${bar.value * 1.28}px` }} />
          <small>{bar.label}</small>
        </div>
      ))}
    </div>
  );
}

function MiniRadar() {
  return (
    <div className="mini-radar">
      <svg viewBox="0 0 220 190" aria-label="역량 레이더 차트">
        <polygon className="mini-radar-grid" points="110,16 192,64 192,132 110,178 28,132 28,64" />
        <polygon className="mini-radar-grid" points="110,46 166,78 166,118 110,150 54,118 54,78" />
        <polygon className="mini-radar-value" points="110,58 158,82 148,126 110,142 66,122 74,84" />
      </svg>
    </div>
  );
}

const dashboardNavItems = [
  { label: "홈", icon: HomeIcon, tab: "home" },
  { label: "분석 리포트", icon: BarChart3, tab: "report" },
  { label: "네트워킹", icon: Users, tab: "networking" },
  { label: "모임", icon: CalendarDays, href: "/meetings" },
  { label: "프로필", icon: User, tab: "profile" },
  { label: "설정", icon: Settings, tab: "settings" },
] satisfies Array<{
  label: string;
  icon: LucideIcon;
  tab?: DashboardTab;
  href?: string;
}>;

const dashboardTabHeadings: Record<DashboardTab, { title: string; description: string }> = {
  home: {
    title: "같은 계열 내 내 위치",
    description: "나와 비슷한 사용자 그룹 내 상대적 위치를 확인해보세요.",
  },
  report: {
    title: "분석 리포트",
    description: "기본 리포트는 무료로 보고, 비교 보기는 4,900원 심화 리포트에서 확인하세요.",
  },
  networking: {
    title: "네트워킹",
    description: "나와 목표가 가까운 동료를 찾고 메시지로 협업을 시작해보세요.",
  },
  profile: {
    title: "마이페이지",
    description: "내 공개 프로필과 포트폴리오를 확인해보세요.",
  },
  settings: {
    title: "설정",
    description: "프로필 공개 범위와 네트워킹 알림을 관리하세요.",
  },
};

function isDashboardTab(tab: string | null): tab is DashboardTab {
  return (
    tab === "home" ||
    tab === "report" ||
    tab === "networking" ||
    tab === "profile" ||
    tab === "settings"
  );
}

const portfolioItems = [
  {
    title: "실시간 공공 데이터 대시보드",
    description: "공공데이터 API를 활용한 실시간 시각화 대시보드 서비스",
    category: "개발",
    date: "'24년 3월",
    image: "/assets/portfolio-dashboard.webp",
    tech: ["Python", "FastAPI", "React"],
  },
  {
    title: "스터디 매칭 플랫폼 '스터디온'",
    description: "관심사 기반 스터디 매칭 및 일정 관리 서비스",
    category: "프로젝트",
    date: "'24년 1월",
    image: "/assets/portfolio-matching.webp",
    tech: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    title: "AI 기반 이력서 분석 서비스",
    description: "채용 공고에 맞춘 이력서 분석 및 개선 가이드 제공",
    category: "개인 프로젝트",
    date: "'23년 11월",
    image: "/assets/portfolio-ai-resume.webp",
    tech: ["Python", "LangChain", "OpenAI"],
  },
  {
    title: "팀 협업 API 서버",
    description: "권한 관리와 알림 기능을 포함한 협업 백엔드 API",
    category: "개발",
    date: "'23년 10월",
    image: "/assets/portfolio-dashboard.webp",
    tech: ["Node.js", "MongoDB"],
  },
  {
    title: "E-commerce 백엔드 API",
    description: "소형몰 서비스 백엔드 API 개발",
    category: "개발",
    date: "'23년 9월",
    image: "/assets/portfolio-matching.webp",
    tech: ["Spring Boot", "MySQL"],
    locked: true,
  },
  {
    title: "사용자 행동 분석 리포트",
    description: "로그 데이터 기반 사용자 행동 분석 및 인사이트 도출",
    category: "데이터 분석",
    date: "'23년 7월",
    image: "/assets/portfolio-ai-resume.webp",
    tech: ["Python", "Pandas"],
    locked: true,
  },
];

const compareBars = [
  { label: "AI 역량", value: 82 },
  { label: "데이터 분석", value: 74 },
  { label: "문제 해결력", value: 68 },
  { label: "창의적 사고", value: 79 },
  { label: "의사소통", value: 71 },
];

const compareSummary = [
  { label: "종합 점수", value: "74 /100", icon: TrendingUp },
  { label: "상위 백분위", value: "상위 28%", icon: Trophy },
  { label: "강점 영역", value: "AI 역량", icon: Target },
  { label: "성장 가능 영역", value: "데이터 분석", icon: BarChart3 },
];

const networkRequests = [
  {
    name: "AI 프로덕트 빌더",
    message: "이번 주말 해커톤에서 데이터 분석 파트를 같이 해보고 싶대요.",
  },
  {
    name: "서비스 기획형 동료",
    message: "포트폴리오 피드백을 서로 주고받자는 요청을 보냈어요.",
  },
];

const operatorNotices = [
  {
    title: "운영자 공지",
    message: "네트워킹 요청은 상대가 수락한 뒤에만 연락처가 공개됩니다.",
    time: "방금 전",
  },
  {
    title: "심화 리포트 안내",
    message: "비교 보기와 활동 우선순위는 4,900원 심화 리포트에 포함되어 있어요.",
    time: "10분 전",
  },
  {
    title: "매칭 품질 업데이트",
    message: "포트폴리오 태그를 추가하면 추천 동료 정확도가 더 올라갑니다.",
    time: "오늘",
  },
];

const dashboardStats = [
  {
    label: "공모전 참가 횟수 / 상위 퍼센트",
    value: "8회",
    rank: "상위 68%",
    delta: "▲ 12%",
    deltaTone: "positive",
    accent: "#4F46E5",
    asset: "/assets/stat-contest.webp",
  },
  {
    label: "어학성적",
    value: "TOEIC 920",
    rank: "상위 63%",
    delta: "▲ 7%",
    deltaTone: "positive",
    accent: "#10B981",
    asset: "/assets/stat-language.webp",
  },
  {
    label: "프로젝트 수",
    value: "5개",
    rank: "상위 71%",
    delta: "▲ 9%",
    deltaTone: "positive",
    accent: "#7C3AED",
    asset: "/assets/stat-project.webp",
  },
  {
    label: "자격증 수",
    value: "3개",
    rank: "상위 54%",
    delta: "— 0%",
    deltaTone: "neutral",
    accent: "#F59E0B",
    asset: "/assets/stat-certificate.webp",
  },
];

const dashboardSparklines = [
  "2,18 28,10 58,6",
  "2,16 28,8 58,12",
  "2,20 28,13 58,4",
  "2,12 28,12 58,11",
];

const peerMatchingRates = [94, 88, 79, 91, 83];

const peerAvatarAssets = [
  "/assets/peer-profile-1.webp",
  "/assets/peer-profile-2.webp",
  "/assets/peer-profile-3.webp",
  "/assets/peer-profile-4.webp",
  "/assets/peer-profile-5.webp",
];

function getPeerAvatar(peer: Insight["peers"][number], index: number) {
  return peer.avatar ?? peerAvatarAssets[index % peerAvatarAssets.length];
}

function formatChatTime() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

type SchoolMajorComparison = {
  matchedStudents: number;
  schools: Array<{
    school: string;
    major: string;
    count: number;
  }>;
};

function getCurriculumKey(major: string) {
  if (major.includes("컴퓨터")) {
    return "컴퓨터공학과";
  }
  if (major.includes("소프트웨어")) {
    return "소프트웨어학과";
  }
  if (major.includes("데이터")) {
    return "데이터사이언스학과";
  }
  return major || "컴퓨터공학과";
}

function buildSchoolMajorComparison(
  school: string,
  major: string,
  field: string,
): SchoolMajorComparison {
  const curriculum = getCurriculumKey(major);
  const matchedStudents = dummyStudents.filter(
    (student) => student.curriculum === curriculum && student.fields.includes(field),
  );
  const counts = new Map<string, { school: string; major: string; count: number }>();

  matchedStudents.forEach((student) => {
    const key = `${student.school}||${student.major}`;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
      return;
    }
    counts.set(key, {
      school: student.school,
      major: student.major,
      count: 1,
    });
  });

  if (counts.size === 0) {
    counts.set(`${school}||${major}`, { school, major, count: 0 });
  }

  return {
    matchedStudents: matchedStudents.length,
    schools: [...counts.values()].sort((a, b) => b.count - a.count || a.school.localeCompare(b.school, "ko")),
  };
}

function FieldComparisonReport({
  school,
  major,
  field,
  schoolComparison,
}: {
  school: string;
  major: string;
  field: string;
  schoolComparison: SchoolMajorComparison;
}) {
  return (
    <div className="field-report">
      <section className="field-summary-section">
        <div className="field-section-heading">
          <p className="eyebrow">같은 분야 타학교 비교</p>
          <h2>
            같은 분야({field}) 타학교 대비 우리 학교 강점
          </h2>
          <span>
            {school} {major} · 동일 커리큘럼/분야 학생 {schoolComparison.matchedStudents}명 기준
          </span>
        </div>

        <div className="field-summary-grid">
          <FieldFindingCard
            tone="strong"
            title="강점"
            items={[
              "자료구조/알고리즘 과목 비중이 타학교 대비 높음",
              "실습 중심 프로젝트 과목이 커리큘럼에 포함됨",
              "데이터베이스 관련 과목 다양성이 높음",
            ]}
          />
          <FieldFindingCard
            tone="weak"
            title="약점"
            items={[
              "AI/머신러닝 관련 과목이 타학교 대비 부족함",
              "산학협력 연계 과목 비중이 낮음",
              "보안 관련 과목이 커리큘럼에 미포함",
            ]}
          />
        </div>
      </section>

      <section className="subject-comparison-section">
        <div className="field-section-heading compact">
          <h2>타학교 대비 과목 비교</h2>
          <span>같은 {field} 분야, 같은 커리큘럼 선택 학생 기준</span>
        </div>

        <div className="subject-comparison-table">
          {curriculumComparisonRows.map((row) => (
            <SubjectComparisonRow key={row.category} {...row} />
          ))}
        </div>

        <div className="subject-legend">
          <span>
            <i className="mine" />
            우리학교
          </span>
          <span>
            <i className="average" />
            타학교 평균
          </span>
        </div>

        <div className="dynamic-school-summary">
          {schoolComparison.schools.slice(0, 4).map((item) => (
            <span key={`${item.school}-${item.major}`}>
              {item.school} {item.major} <b>{item.count}명</b>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function FieldFindingCard({
  tone,
  title,
  items,
}: {
  tone: "strong" | "weak";
  title: string;
  items: string[];
}) {
  return (
    <article className={`field-finding-card ${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span>{tone === "strong" ? "✓" : "!"}</span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function SubjectComparisonRow({
  category,
  mine,
  other,
}: {
  category: string;
  mine: number;
  other: number;
}) {
  const tone = mine > other ? "strong" : mine < other ? "weak" : "same";
  const max = 5;
  return (
    <div className={`subject-row ${tone}`}>
      <strong>{category}</strong>
      <div className="subject-bar-cell">
        <span className="subject-track">
          <i style={{ width: `${(mine / max) * 100}%` }} />
        </span>
        <b>{mine}개</b>
      </div>
      <div className="subject-bar-cell average">
        <span className="subject-track">
          <i style={{ width: `${(other / max) * 100}%` }} />
        </span>
        <b>{other}개</b>
      </div>
    </div>
  );
}

const dashboardExtraPeers: Insight["peers"] = [
  {
    id: "peer-extra-1",
    name: "시스템형 동료",
    schoolHidden: "한양대 컴퓨터공학과",
    avatar: "/assets/peer-profile-3.webp",
    intro: "시스템 소프트웨어와 보안 설계에 관심이 많아요.",
    portfolio: "demo",
    tags: ["시스템 소프트웨어", "정보보호 및 사이버 보안", "네트워크"],
  },
  {
    id: "peer-extra-2",
    name: "데이터 분석형 동료",
    schoolHidden: "고려대 컴퓨터학과",
    avatar: "/assets/peer-profile-4.webp",
    intro: "데이터 분석과 Python 프로젝트를 준비 중이에요.",
    portfolio: "demo",
    tags: ["인공지능", "데이터 과학 및 빅데이터", "Python"],
  },
  {
    id: "peer-extra-3",
    name: "웹/앱 기획형 동료",
    schoolHidden: "성균관대 소프트웨어학과",
    avatar: "/assets/peer-profile-5.webp",
    intro: "웹/앱 서비스와 HCI 기반 협업을 좋아해요.",
    portfolio: "demo",
    tags: ["웹/앱 개발", "HCI", "Firebase"],
  },
];

function getMatchBadgeTone(rate: number) {
  if (rate >= 90) {
    return "match-high";
  }
  if (rate >= 80) {
    return "match-mid";
  }
  return "match-low";
}

function getStatRankTone(rank: string) {
  const percentile = Number(rank.match(/\d+/)?.[0] || 100);

  if (percentile <= 60) {
    return "rank-good";
  }

  if (percentile <= 70) {
    return "rank-watch";
  }

  return "rank-risk";
}

function normalizeCareerField(field?: string | null) {
  if (!field) {
    return careerFieldOptions[0];
  }

  if (careerFieldOptions.includes(field)) {
    return field;
  }

  return legacyCareerFieldMap[field] || careerFieldOptions[0];
}

function getMajorOptionsForSchool(schoolInput: string) {
  if (!schoolInput.trim()) {
    return majorOptions;
  }

  const resolvedSchool = resolveSchoolOption(schoolInput);
  return getUniqueOptions([...(schoolMajorOptions[resolvedSchool] || []), ...majorOptions]);
}

function resolveSchoolOption(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  return (
    schoolOptions.find((option) => option === trimmed) ||
    schoolOptions.find((option) => optionMatchesQuery(option, trimmed)) ||
    trimmed
  );
}

function resolveMajorOption(input: string, options: string[]) {
  const trimmed = normalizeMajorName(input.trim());
  if (!trimmed) {
    return "";
  }

  return (
    options.find((option) => option === trimmed) ||
    options.find((option) => optionMatchesQuery(option, trimmed)) ||
    trimmed
  );
}

function normalizeMajorName(major: string) {
  if (["컴퓨터공학전공", "컴퓨터공학부", "컴공", "컴퓨터 공학과"].includes(major.trim())) {
    return "컴퓨터공학과";
  }

  return major;
}

function getAutocompleteMatches(query: string, options: string[]) {
  const uniqueOptions = getUniqueOptions(options);
  if (!query.trim()) {
    return uniqueOptions;
  }

  return uniqueOptions.filter((option) => optionMatchesQuery(option, query));
}

function optionMatchesQuery(option: string, query: string) {
  const normalizedQuery = normalizeSearchText(query).replace("컴공", "컴퓨터공학");
  const aliases = [
    option,
    option.replace("대학교", "대"),
    option.replace("대학교", ""),
    option.replace("학과", ""),
    option.replace("전공", ""),
  ].map(normalizeSearchText);

  return aliases.some((alias) => alias.includes(normalizedQuery));
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s()/-]/g, "");
}

function getUniqueOptions(options: string[]) {
  return Array.from(new Set(options));
}

function getNetworkFilterCopy(selectedTags: string[]) {
  const label = selectedTags.length > 0 ? selectedTags.join(", ") : "전체";
  return {
    eyebrow: selectedTags.length > 0 ? "태그 기반 추천" : "커리어 동료 추천",
    title:
      selectedTags.length > 0
        ? `${label} 태그를 가진 사용자`
        : "함께 성장할 가능성이 높은 사용자",
    description:
      selectedTags.length > 0
        ? "선택한 태그 중 하나라도 보유한 사용자를 OR 조건으로 보여줍니다."
        : "전공, 활동 이력, 관심 태그를 기준으로 지금 연락하기 좋은 동료를 우선 추천합니다.",
    template:
      selectedTags.length > 0
        ? `“${selectedTags[0]} 관심사가 보여 연락드려요. 서로의 경험을 나누며 같이 성장해보고 싶습니다.”`
        : "“같은 웹/앱 개발 관심사라 연락드려요. 이번 프로젝트에서 API 설계와 배포를 같이 맡아볼 동료를 찾고 있습니다.”",
  };
}

function buildPortfolioStats(entries: PortfolioEntry[]): PortfolioStats {
  return entries.reduce<PortfolioStats>(
    (stats, entry) => ({
      ...stats,
      [entry.category]: stats[entry.category] + 1,
    }),
    { ...emptyPortfolioStats },
  );
}

function buildActivityHistory(stats: PortfolioStats) {
  return [
    { label: "프로젝트", count: `${stats.프로젝트}개`, icon: Code2, tone: "blue" },
    { label: "논문", count: `${stats.논문}편`, icon: BookOpen, tone: "green" },
    { label: "대회", count: `${stats.대회}회`, icon: Trophy, tone: "violet" },
    { label: "기타", count: `${stats.기타}개`, icon: Globe2, tone: "blue" },
  ];
}

function buildServiceActivityHistory(stats: PortfolioStats) {
  const portfolioTotal = Object.values(stats).reduce((total, count) => total + count, 0);

  return [
    {
      label: "분석 리포트",
      description: "최근 커리큘럼 비교 리포트를 확인했어요.",
      value: "3회",
      icon: BarChart3,
      tone: "indigo",
    },
    {
      label: "메시지",
      description: "관심 분야가 가까운 동료와 대화를 시작했어요.",
      value: "8건",
      icon: MessageSquareText,
      tone: "emerald",
    },
    {
      label: "모임",
      description: "참여 가능한 분야 모임을 둘러봤어요.",
      value: "2개",
      icon: CalendarDays,
      tone: "amber",
    },
    {
      label: "포트폴리오 등록",
      description: "등록한 활동이 추천 정확도에 반영돼요.",
      value: `${portfolioTotal}개`,
      icon: Folder,
      tone: "violet",
    },
  ];
}

function getProfileTagTone(tag: string) {
  if (tag.includes("개발") || tag.includes("백엔드") || tag.includes("프론트엔드")) {
    return "tag-dev";
  }
  if (tag.includes("데이터") || tag.includes("AI")) {
    return "tag-data";
  }
  if (tag.includes("PM") || tag.includes("기획")) {
    return "tag-pm";
  }
  if (tag.includes("디자인")) {
    return "tag-design";
  }
  return "tag-etc";
}

function AutocompleteInput({
  icon,
  label,
  placeholder,
  value,
  options,
  popularOptions,
  onChange,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  popularOptions: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const selectRef = useRef<HTMLDivElement>(null);
  const query = value.trim();
  const suggestions = getAutocompleteMatches(value, options);
  const quickOptions = getUniqueOptions(popularOptions).filter((option) =>
    options.includes(option),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function selectOption(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div className={`autocomplete-select ${isOpen ? "open" : ""}`} ref={selectRef}>
      <label className={`autocomplete-trigger ${value ? "selected" : ""}`}>
        <span className="custom-select-label">
          <span className="custom-select-icon" aria-hidden="true">
            {icon}
          </span>
          <span>{label}</span>
        </span>
        <input
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-label={label}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && suggestions[0]) {
              event.preventDefault();
              selectOption(suggestions[0]);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          value={value}
        />
        <ChevronDown className="custom-select-chevron" size={20} />
      </label>

      {isOpen && (
        <div
          className="custom-select-menu autocomplete-menu"
          id={listboxId}
          role="listbox"
          aria-label={label}
        >
          {!query && quickOptions.length > 0 && (
            <div className="popular-options" aria-label="추천 옵션">
              {quickOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === value ? "active" : ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <div className="select-option-list">
            {suggestions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))}
            {suggestions.length === 0 && (
              <span className="autocomplete-empty">유사한 항목이 없어요</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldChipDropdown({
  value,
  disabled = false,
  options,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function selectField(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div
      className={`custom-select field-chip-select ${isOpen ? "open" : ""} ${
        disabled ? "disabled" : ""
      }`}
      ref={selectRef}
    >
      <button
        className={`custom-select-trigger ${value ? "selected" : ""}`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="custom-select-label">
          <span className="custom-select-icon" aria-hidden="true">
            🎯
          </span>
          <span>분야</span>
        </span>
        <span className="custom-select-value">
          {value || (disabled ? "학과를 먼저 선택하세요" : "분야를 선택하세요")}
        </span>
        <ChevronDown className="custom-select-chevron" size={20} />
      </button>

      {isOpen && !disabled && (
        <div className="custom-select-menu field-chip-menu" role="listbox" aria-label="분야">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              className={option === value ? "active" : ""}
              onClick={() => selectField(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingStep({
  active = false,
  step,
  label,
  title,
}: {
  active?: boolean;
  step: string;
  label: string;
  title: string;
}) {
  return (
    <div className={`onboarding-step ${active ? "active" : ""}`}>
      <span>{step}</span>
      <small>{label}</small>
      <strong>{title}</strong>
    </div>
  );
}

function SectionNumber({ number }: { number: string }) {
  return <span className="section-number">{number}</span>;
}

function MatchingDistanceSlider({
  value,
  onChange,
}: {
  value: MatchingDistance;
  onChange: (value: MatchingDistance) => void;
}) {
  const selectedIndex = matchingDistanceOptions.findIndex((option) => option.value === value);
  const selectedOption = matchingDistanceOptions[selectedIndex] || matchingDistanceOptions[1];

  return (
    <div className="matching-distance-control">
      <div className="matching-distance-labels">
        <span>
          나와 비슷한 동료
          <small>(유사도 높음)</small>
        </span>
        <span>
          다른 시각의 동료
          <small>(유사도 낮음)</small>
        </span>
      </div>
      <input
        aria-label="동료 유사도 거리"
        max={2}
        min={0}
        step={1}
        type="range"
        value={selectedIndex}
        onChange={(event) => onChange(matchingDistanceOptions[Number(event.target.value)].value)}
      />
      <div className="matching-distance-options">
        {matchingDistanceOptions.map((option) => (
          <button
            className={option.value === value ? "active" : ""}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p>
        <strong>{selectedOption.label}</strong>
        <span>{selectedOption.range}</span>
        {selectedOption.description}
      </p>
    </div>
  );
}

function PortfolioEntryEditor({
  entries,
  stats,
  onAdd,
  onRemove,
  onUpdate,
}: {
  entries: PortfolioEntry[];
  stats: PortfolioStats;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, key: keyof Omit<PortfolioEntry, "id">, value: string) => void;
}) {
  return (
    <div className="portfolio-entry-editor">
      <div className="portfolio-entry-list">
        {entries.map((entry, index) => (
          <article className="portfolio-entry-form" key={entry.id}>
            {entries.length > 1 && (
              <button
                className="portfolio-entry-remove"
                type="button"
                aria-label={`${index + 1}번째 포트폴리오 항목 삭제`}
                onClick={() => onRemove(entry.id)}
              >
                ×
              </button>
            )}
            <label>
              <span>분류</span>
              <select
                value={entry.category}
                onChange={(event) =>
                  onUpdate(entry.id, "category", event.target.value as PortfolioCategory)
                }
              >
                {portfolioCategoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span>제목</span>
              <input
                maxLength={60}
                placeholder="예: 실시간 공공 데이터 대시보드"
                value={entry.title}
                onChange={(event) => onUpdate(entry.id, "title", event.target.value)}
              />
            </label>
            <label>
              <span>설명</span>
              <textarea
                maxLength={160}
                placeholder="역할, 사용 기술, 결과를 간단히 적어주세요."
                rows={2}
                value={entry.description}
                onChange={(event) => onUpdate(entry.id, "description", event.target.value)}
              />
            </label>
          </article>
        ))}
      </div>
      <div className="portfolio-entry-footer">
        <div className="portfolio-stats-preview">
          {portfolioCategoryOptions.map((category) => (
            <span key={category}>
              {category} <b>{stats[category]}</b>
            </span>
          ))}
        </div>
        <button type="button" onClick={onAdd} disabled={entries.length >= 10}>
          항목 추가 +
        </button>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <span className="spark-icon" aria-hidden="true">
      ✦
    </span>
  );
}
