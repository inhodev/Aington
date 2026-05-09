"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  EyeOff,
  Folder,
  Globe2,
  GraduationCap,
  HomeIcon,
  Info,
  Lightbulb,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Scale,
  Send,
  Settings,
  ShieldCheck,
  Tag,
  Target,
  ThumbsUp,
  Trophy,
  TrendingUp,
  UploadCloud,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

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
  }>;
};

type Step =
  | "landing"
  | "analyzing"
  | "report"
  | "signupNotice"
  | "signup"
  | "dashboard";

type DashboardTab = "home" | "report" | "networking" | "profile" | "settings";
type NetworkFilter = "전체" | "해커톤" | "공모전" | "포트폴리오 피드백" | "사이드프로젝트";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const LOGIN_STORAGE_KEY = "career-scope-logged-in";
const fieldChips = [
  "AI",
  "개발",
  "디자인",
  "마케팅",
  "창업",
  "기획",
  "PM",
  "데이터",
  "사이드프로젝트",
  "취업준비",
];

const networkFilters: NetworkFilter[] = [
  "전체",
  "해커톤",
  "공모전",
  "포트폴리오 피드백",
  "사이드프로젝트",
];

const networkFilterCopy: Record<
  NetworkFilter,
  { eyebrow: string; title: string; description: string; template: string }
> = {
  전체: {
    eyebrow: "커리어 동료 추천",
    title: "함께 성장할 가능성이 높은 사용자",
    description:
      "전공, 활동 이력, 관심 태그를 기준으로 지금 연락하기 좋은 동료를 우선 추천합니다.",
    template:
      "“같은 백엔드 관심사라 연락드려요. 이번 해커톤에서 API 설계와 배포를 같이 맡아볼 동료를 찾고 있습니다.”",
  },
  해커톤: {
    eyebrow: "해커톤 팀빌딩",
    title: "짧은 시간 안에 같이 만들 수 있는 동료",
    description:
      "역할이 겹치지 않고 MVP 제작 경험을 함께 쌓기 좋은 사용자를 보여줍니다.",
    template:
      "“이번 해커톤에서 API 설계와 배포를 맡을 동료를 찾고 있어요. 관심사가 비슷해서 같이 팀을 해보고 싶습니다.”",
  },
  공모전: {
    eyebrow: "공모전 동료",
    title: "문제 정의와 제출 경험을 같이 쌓을 동료",
    description:
      "AI, 데이터, 서비스 기획 태그를 기준으로 공모전 준비에 맞는 사용자를 추천합니다.",
    template:
      "“데이터 분석 공모전을 준비 중인데 역할을 나눠 같이 제출까지 해보고 싶어요. 관심 있으시면 이야기 나눠보고 싶습니다.”",
  },
  "포트폴리오 피드백": {
    eyebrow: "포트폴리오 피드백",
    title: "서로 결과물을 봐줄 수 있는 사용자",
    description:
      "프로젝트 경험과 기술 스택이 가까워 포트폴리오 리뷰를 주고받기 좋은 사용자입니다.",
    template:
      "“포트폴리오를 서로 보고 피드백을 주고받고 싶어요. 프로젝트 설명 방식과 기술 선택을 같이 점검해보면 좋겠습니다.”",
  },
  사이드프로젝트: {
    eyebrow: "사이드프로젝트",
    title: "꾸준히 같이 만들 가능성이 높은 동료",
    description:
      "서비스 기획, 백엔드, 데이터 분석처럼 장기 협업 역할이 맞물리는 사용자를 보여줍니다.",
    template:
      "“사이드프로젝트로 작게 출시까지 해볼 팀원을 찾고 있어요. 관심 분야가 맞아서 같이 이야기해보고 싶습니다.”",
  },
};

const avatarPalette = ["#4F46E5", "#7C3AED", "#10B981", "#F59E0B", "#F43F5E"];

const privacySettings: Array<{ label: string; icon: LucideIcon; checked: boolean }> = [
  { label: "학교명은 익명 처리", icon: EyeOff, checked: true },
  { label: "포트폴리오 미리보기만 공개", icon: Folder, checked: true },
  { label: "수락 후 연락처 공개", icon: Mail, checked: true },
];

const notificationSettings: Array<{ label: string; icon: LucideIcon; checked: boolean }> = [
  { label: "새 편지 도착", icon: Bell, checked: true },
  { label: "추천 동료 업데이트", icon: Users, checked: true },
  { label: "심화 리포트 할인 알림", icon: Tag, checked: false },
];

const fallbackInsight: Insight = {
  target: {
    school: "인하대학교",
    department: "컴퓨터공학과",
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
      school: "인하대",
      department: "컴퓨터공학과",
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
      name: "백엔드 지망 3학년",
      schoolHidden: "서울권 주요 대학",
      avatar: "/assets/peer-profile-1.webp",
      intro: "분산 시스템과 API 설계에 관심이 많고, 팀 프로젝트 경험을 같이 쌓을 사람을 찾고 있어요.",
      portfolio: "github.com/demo/backend-student",
      tags: ["백엔드", "인턴 준비", "API"],
    },
    {
      id: "peer-2",
      name: "AI 프로덕트 빌더",
      schoolHidden: "수도권 사립대",
      avatar: "/assets/peer-profile-2.webp",
      intro: "데이터 분석 공모전과 해커톤을 같이 나갈 컴공 계열 동료를 찾고 있어요.",
      portfolio: "notion.site/demo-ai-builder",
      tags: ["AI", "해커톤", "공모전"],
    },
  ],
};

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [school, setSchool] = useState("인하대학교");
  const [department, setDepartment] = useState("컴퓨터공학과");
  const [grade, setGrade] = useState("전체");
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("김하늘");
  const [introLength, setIntroLength] = useState(43);
  const [interestChips, setInterestChips] = useState(["개발"]);
  const [meetChips, setMeetChips] = useState(["개발"]);

  const activeInsight = insight || fallbackInsight;
  const reportMetrics = useMemo(
    () => buildReportMetrics(activeInsight.analysis.metrics),
    [activeInsight.analysis.metrics],
  );
  const radarPoints = useMemo(
    () => buildRadarPoints(reportMetrics.map((metric) => metric.score)),
    [reportMetrics],
  );

  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "report") {
      const timer = window.setTimeout(() => {
        setInsight(fallbackInsight);
        setStep("report");
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (view === "signup") {
      const timer = window.setTimeout(() => setStep("signup"), 0);
      return () => window.clearTimeout(timer);
    }
    if (view === "notice") {
      const timer = window.setTimeout(() => setStep("signupNotice"), 0);
      return () => window.clearTimeout(timer);
    }
    if (view === "dashboard") {
      const timer = window.setTimeout(() => {
        window.localStorage.setItem(LOGIN_STORAGE_KEY, "true");
        setIsLoggedIn(true);
        setInsight(fallbackInsight);
        setStep("dashboard");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setIsLoggedIn(window.localStorage.getItem(LOGIN_STORAGE_KEY) === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleAnalyze() {
    setStep("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const delay = new Promise((resolve) => window.setTimeout(resolve, 4500));

    try {
      const query = new URLSearchParams({
        school,
        department,
        ...(grade !== "전체" ? { grade } : {}),
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
        target: { ...fallbackInsight.target, school, department },
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
      email: "student@inha.edu",
      name: "김하늘",
      role: String(form.get("role") || ""),
      interest: interestChips.join(", "),
      wantsToMeet: meetChips.join(", "),
      intro: String(form.get("intro") || ""),
      portfolio: "demo-portfolio-upload.pdf",
    };

    setProfileName(payload.name || "김하늘");

    try {
      await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Demo flow continues even if the local API is not running.
    }

    completeLogin();
  }

  function toggleChip(kind: "interest" | "meet", chip: string) {
    const [values, setValues] =
      kind === "interest"
        ? [interestChips, setInterestChips]
        : [meetChips, setMeetChips];

    if (values.includes(chip)) {
      if (values.length === 1) {
        return;
      }
      setValues(values.filter((value) => value !== chip));
      return;
    }

    setValues([...values, chip]);
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
          active={step}
          isLoggedIn={isLoggedIn}
          onHome={goHome}
          onLogin={completeLogin}
          onSignup={continueToSignup}
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
            <CustomDropdown
              icon="🏫"
              label="학교"
              placeholder="학교를 선택하세요"
              value={school}
              options={[
                "인하대학교",
                "서울대학교",
                "연세대학교",
                "고려대학교",
                "한양대학교",
                "아주대학교",
                "인천대학교",
                "가천대학교",
                "경기대학교",
                "용인대학교",
              ]}
              popularOptions={["인하대학교", "서울대학교", "연세대학교"]}
              onChange={setSchool}
            />

            <CustomDropdown
              icon="📚"
              label="학과"
              placeholder="학과를 선택하세요"
              value={department}
              options={["컴퓨터공학과"]}
              popularOptions={["컴퓨터공학과"]}
              onChange={setDepartment}
            />

            <CustomDropdown
              icon="📅"
              label="범위"
              placeholder="분석 범위를 선택하세요"
              value={grade}
              options={["전체", "1학년", "2학년", "3학년", "4학년"]}
              popularOptions={["전체", "3학년", "4학년"]}
              onChange={(nextGrade) => {
                setGrade(nextGrade === "전체" ? "전체" : nextGrade.replace("학년", ""));
              }}
              displayValue={grade === "전체" ? "전체" : `${grade}학년`}
            />

            <button className="primary-cta" onClick={handleAnalyze}>
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
                    {activeInsight.target.school}
                    <span className="report-department-pill">
                      {activeInsight.target.department}
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
              <ReportMeta
                icon={<BookOpen size={18} />}
                label="분석 기준"
                value="Neon 커리큘럼 DB"
              />
              <ReportMeta
                icon={<CalendarDays size={18} />}
                label="분석 일자"
                value="2026.05.09"
              />
              <ReportMeta
                icon={<Users size={18} />}
                label="비교 대상"
                value="10개 대학 커리큘럼"
              />
            </div>

            <div className="report-stage">
              <section className="score-card">
                <div className="score-title">
                  <strong>커리큘럼 종합 점수</strong>
                  <Info size={16} />
                </div>
                <div className="score-value">
                  {activeInsight.analysis.totalScore.toFixed(1)} <span>/ 100</span>
                </div>
                <div className="score-bar">
                  <div style={{ width: `${activeInsight.analysis.totalScore}%` }} />
                </div>
                <p>
                  비교군 기준 대비{" "}
                  <span>
                    {activeInsight.analysis.delta >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(activeInsight.analysis.delta).toFixed(1)}
                  </span>
                </p>
              </section>

              <section className="radar-panel" aria-label="전공 역량 레이더 차트">
                <div className="radar-chart">
                  <svg viewBox="0 0 320 320" role="img" aria-label="전공 역량 점수">
                    <polygon
                      className="radar-grid"
                      points="160,24 289,98 289,222 160,296 31,222 31,98"
                    />
                    <polygon
                      className="radar-grid"
                      points="160,60 258,116 258,204 160,260 62,204 62,116"
                    />
                    <polygon
                      className="radar-grid"
                      points="160,96 227,135 227,185 160,224 93,185 93,135"
                    />
                    <line x1="160" y1="160" x2="160" y2="24" />
                    <line x1="160" y1="160" x2="289" y2="98" />
                    <line x1="160" y1="160" x2="289" y2="222" />
                    <line x1="160" y1="160" x2="160" y2="296" />
                    <line x1="160" y1="160" x2="31" y2="222" />
                    <line x1="160" y1="160" x2="31" y2="98" />
                    <polygon className="radar-fill" points={radarPoints} />
                    <polygon className="radar-line" points={radarPoints} />
                    {reportMetrics.map((metric, index) => {
                      const [x, y] = getRadarPoint(metric.score, index);
                      return (
                        <circle
                          className="radar-dot"
                          cx={x}
                          cy={y}
                          key={metric.label}
                          r="5"
                        />
                      );
                    })}
                  </svg>
                  {reportMetrics.map((metric) => (
                    <div className={`radar-label ${metric.position}`} key={metric.label}>
                      <strong>{metric.label}</strong>
                      <span>{metric.score}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="score-list-card">
                {reportMetrics.map((metric) => (
                  <ScoreRow key={metric.label} metric={metric} />
                ))}
                <p>각 항목은 선택 학과와 비교 대학 커리큘럼의 과목, 분야, 학기 구조를 기준으로 산출되었습니다.</p>
              </section>
            </div>

            <ReportNotice
              tone="good"
              icon={<ThumbsUp size={34} />}
              title="장점"
              subtitle="강점을 잘 활용하고 더 발전시켜 보세요!"
              items={activeInsight.analysis.strengths}
            />

            <ReportNotice
              tone="bad"
              icon={<AlertCircle size={34} />}
              title="단점"
              subtitle="아쉬운 부분을 보완하여 경쟁력을 높여보세요!"
              items={activeInsight.analysis.weaknesses}
            />

            <InsightEvidencePanel insight={activeInsight} />

            <CurriculumRankingPanel similarity={activeInsight.curriculumSimilarity} />

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
            <OnboardingStep step="2" label="STEP 2" title="관심 분야 및 매칭" />
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
                  직군 <em>*</em>
                </span>
                <select name="role" defaultValue="백엔드 개발자" required>
                  <option>백엔드 개발자</option>
                  <option>AI 엔지니어</option>
                  <option>프론트엔드 개발자</option>
                  <option>데이터 분석가</option>
                </select>
                <ChevronDown className="select-icon" size={20} />
              </label>
            </section>

            <section className="onboarding-section match-section">
              <SectionNumber number="2" />
              <div className="section-copy">
                <h3>관심 분야 및 매칭</h3>
                <p>관심 있는 분야와 만나고 싶은 사람을 선택해주세요.</p>
              </div>
              <ChipGroup
                label="원하는 분야"
                selected={interestChips}
                onToggle={(chip) => toggleChip("interest", chip)}
              />
              <ChipGroup
                label="만나고 싶은 사람"
                selected={meetChips}
                onToggle={(chip) => toggleChip("meet", chip)}
              />
            </section>

            <section className="onboarding-section portfolio-section">
              <SectionNumber number="3" />
              <div className="section-copy">
                <h3>포트폴리오 등록 <span>(선택)</span></h3>
                <p>포트폴리오를 등록하면 더 좋은 기회를 만날 수 있어요.</p>
                <div className="match-boost">
                  <SparkIcon />
                  포트폴리오 등록 시 매칭률 <strong>+40%</strong>
                </div>
              </div>
              <button className="upload-zone" type="button">
                <UploadCloud size={42} />
                <strong>파일을 드래그하거나 클릭하여 업로드</strong>
                <span>PDF, PPT, DOC, ZIP 파일 지원 (최대 20MB)</span>
              </button>
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
          insight={activeInsight}
          profileName={profileName}
        />
      )}
    </main>
  );
}

function Header({
  active,
  isLoggedIn,
  onHome,
  onLogin,
  onSignup,
}: {
  active: Step;
  isLoggedIn: boolean;
  onHome: () => void;
  onLogin: () => void;
  onSignup: () => void;
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
        <a>서비스 소개</a>
        <a className={active === "report" || active === "analyzing" ? "active" : ""}>
          분석 리포트
        </a>
        <a>진로 가이드</a>
        <a>데이터 인사이트</a>
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
        {isLoggedIn ? (
          <button onClick={onHome}>메인</button>
        ) : (
          <button onClick={onSignup}>회원가입</button>
        )}
      </nav>
    </header>
  );
}

function AppDashboard({
  insight,
  profileName,
}: {
  insight: Insight;
  profileName: string;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    const tab = new URLSearchParams(window.location.search).get("tab");
    return isDashboardTab(tab) ? tab : "home";
  });
  const [showPaymentDemo, setShowPaymentDemo] = useState(false);
  const [showOperatorNotice, setShowOperatorNotice] = useState(false);
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
    window.history.replaceState(null, "", url);
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
                aria-disabled={!item.tab}
                className={item.tab === activeTab ? "active" : ""}
                key={item.label}
                onClick={() => selectTab(item.tab)}
                type="button"
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="premium-card">
          <div className="premium-icon">
            <Image
              src="/assets/stat-certificate.webp"
              alt=""
              width={52}
              height={52}
              unoptimized
            />
          </div>
          <strong>프리미엄 멤버십</strong>
          <p>더 많은 분석과 인사이트를 경험해보세요.</p>
          <button onClick={() => selectTab("report")} type="button">
            업그레이드하기
            <ChevronRight size={18} />
          </button>
        </div>
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
            <div className="app-profile">
              <span
                className="avatar initial-avatar"
                style={{ "--avatar-color": "#4F46E5" } as React.CSSProperties}
                aria-hidden="true"
              >
                {Array.from(profileName)[0]}
              </span>
              <strong>{profileName}</strong>
              <ChevronDown size={18} />
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
                <span>{stat.rank}</span>
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
            <h2>나와 비슷한 사용자</h2>
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
                    const matchingRate = peerMatchingRates[index % peerMatchingRates.length];
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
                        <footer>
                          <span>공모전 {peer.id === "peer-1" ? "9회" : "7회"}</span>
                          <span>프로젝트 {peer.id === "peer-2" ? "4개" : "5개"}</span>
                        </footer>
                        <button className="letter-button">
                          <MessageSquareText size={16} />
                          편지 보내기
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
          <DashboardReportPage insight={insight} onUnlock={() => setShowPaymentDemo(true)} />
        )}
        {activeTab === "networking" && <NetworkingPage peers={peers} />}
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "settings" && <SettingsPage />}

        {showPaymentDemo && (
          <div className="demo-payment-toast" role="status">
            <strong>데모 결제 화면입니다</strong>
            <span>실제 결제 없이 4,900원 심화 리포트 해제 흐름을 시연합니다.</span>
            <button onClick={() => setShowPaymentDemo(false)} type="button">
              확인
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardReportPage({
  insight,
  onUnlock,
}: {
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

      <DeepReportPreview onUnlock={onUnlock} />
    </section>
  );
}

function DeepReportPreview({ onUnlock }: { onUnlock: () => void }) {
  return (
    <section className="compare-preview-page">
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

        <article className="compare-card locked">
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
            <small className="unlock-note">1회 구매 · 환불 불가</small>
            <button onClick={onUnlock} type="button">
              <span aria-hidden="true">🔓</span>
              심화 리포트 잠금 해제하기 · 4,900원
            </button>
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

function NetworkingPage({ peers }: { peers: Insight["peers"] }) {
  const [sentPeerId, setSentPeerId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NetworkFilter>("전체");
  const featuredPeers = peers.map((peer, index) => ({
    ...peer,
    avatar: getPeerAvatar(peer, index),
    matchScore: [92, 88, 84, 81, 78][index] || 76,
    category: ["해커톤", "공모전", "포트폴리오 피드백", "사이드프로젝트", "사이드프로젝트"][
      index
    ] as Exclude<NetworkFilter, "전체">,
    intent: ["해커톤 팀빌딩", "공모전 동료", "포트폴리오 피드백", "사이드프로젝트", "커피챗"][index] || "협업",
    note: [
      "백엔드와 API 관심사가 겹치고 인턴 준비 단계가 비슷합니다.",
      "AI/해커톤/공모전 태그가 함께 잡혀 팀 구성 가능성이 높습니다.",
      "알고리즘과 시스템 역량을 서로 보완할 수 있습니다.",
      "데이터 분석 경험을 같이 확장하기 좋은 프로필입니다.",
      "서비스 기획과 백엔드 협업 목표가 맞물립니다.",
    ][index] || "관심 분야와 활동 목표가 가깝습니다.",
  }));
  const filteredPeers =
    activeFilter === "전체"
      ? featuredPeers
      : featuredPeers.filter((peer) => peer.category === activeFilter);
  const activeFilterCopy = networkFilterCopy[activeFilter];

  return (
    <section className="networking-page">
      <div className="networking-toolbar">
        {networkFilters.map((filter) => (
          <button
            className={activeFilter === filter ? "active" : ""}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
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
                <div className="networking-tags">
                  {peer.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <footer>
                  <button type="button">프로필 보기</button>
                  <button
                    className={sentPeerId === peer.id ? "sent" : ""}
                    onClick={() => setSentPeerId(peer.id)}
                    type="button"
                  >
                    <Mail size={16} />
                    {sentPeerId === peer.id ? "요청 보냄" : "편지 보내기"}
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

          <section className="networking-template-card">
            <div className="section-title">
              <Lightbulb size={20} />
              <h3>추천 편지</h3>
            </div>
            <p>{activeFilterCopy.template}</p>
            <button type="button">
              <span aria-hidden="true">✉</span>
              템플릿으로 시작
            </button>
          </section>
        </aside>
      </div>
    </section>
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

function ProfilePage() {
  return (
    <section className="profile-page">
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
        <h2>김O현</h2>
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
        <div className="hidden-school-card">
          <LockKeyhole size={20} />
          <span>비공개 처리됨</span>
        </div>
        <button className="profile-primary-button" type="button">
          <Send size={19} />
          메시지 보내기
        </button>
        <button className="profile-secondary-button" type="button">
          <Bookmark size={19} />
          북마크
        </button>
      </article>

      <div className="profile-content">
        <section className="profile-top-grid">
          <article className="profile-panel skill-panel">
            <h3>핵심 역량</h3>
            <CompetencyRadar />
            <p>5점 만점 기준 (과연 AI 분석)</p>
          </article>

          <article className="profile-panel activity-panel">
            <div className="panel-title-row">
              <h3>활동 이력</h3>
              <Info size={17} />
            </div>
            <div className="activity-list">
              {activityHistory.map((item) => {
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
      </div>
    </section>
  );
}

function CompetencyRadar() {
  const points = [
    [150, 42],
    [232, 90],
    [232, 184],
    [150, 232],
    [68, 184],
    [68, 90],
  ];

  return (
    <div className="competency-radar">
      <svg viewBox="0 0 300 270" aria-label="핵심 역량 레이더 차트">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            className="radar-grid-line"
            key={scale}
            points={points
              .map(([x, y]) => `${150 + (x - 150) * scale},${137 + (y - 137) * scale}`)
              .join(" ")}
          />
        ))}
        {points.map(([x, y]) => (
          <line className="radar-spoke" key={`${x}-${y}`} x1="150" x2={x} y1="137" y2={y} />
        ))}
        <polygon className="radar-value" points="150,55 218,96 220,176 150,212 80,174 74,102" />
        {[
          ["문제 해결력", "4.6", 150, 20],
          ["프로그래밍", "4.3", 252, 76],
          ["데이터 분석", "4.1", 254, 188],
          ["커뮤니케이션", "4.2", 150, 256],
          ["기획력", "3.8", 45, 188],
          ["협업", "4.4", 44, 76],
        ].map(([label, score, x, y]) => (
          <text className="radar-text" key={label} x={x} y={y}>
            <tspan x={x} dy="0">
              {label}
            </tspan>
            <tspan className="radar-score" x={x} dy="17">
              {score}
            </tspan>
          </text>
        ))}
      </svg>
    </div>
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
  { label: "프로필", icon: User, tab: "profile" },
  { label: "설정", icon: Settings, tab: "settings" },
] satisfies Array<{
  label: string;
  icon: LucideIcon;
  tab?: DashboardTab;
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
    description: "나와 목표가 가까운 동료를 찾고 편지로 협업을 시작해보세요.",
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

const activityHistory = [
  { label: "공모전", count: "8회 참여", icon: Trophy, tone: "blue" },
  { label: "해커톤", count: "5회 참여", icon: Code2, tone: "green" },
  { label: "교환학생", count: "1회 참여", icon: Globe2, tone: "violet" },
];

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

const dashboardExtraPeers: Insight["peers"] = [
  {
    id: "peer-extra-1",
    name: "알고리즘형 동료",
    schoolHidden: "한양대 컴퓨터공학과",
    avatar: "/assets/peer-profile-3.webp",
    intro: "알고리즘과 시스템 설계에 관심이 많아요.",
    portfolio: "demo",
    tags: ["알고리즘", "시스템", "보안"],
  },
  {
    id: "peer-extra-2",
    name: "데이터 분석형 동료",
    schoolHidden: "고려대 컴퓨터학과",
    avatar: "/assets/peer-profile-4.webp",
    intro: "데이터 분석과 Python 프로젝트를 준비 중이에요.",
    portfolio: "demo",
    tags: ["AI/ML", "데이터분석", "Python"],
  },
  {
    id: "peer-extra-3",
    name: "서비스 기획형 동료",
    schoolHidden: "성균관대 소프트웨어학과",
    avatar: "/assets/peer-profile-5.webp",
    intro: "모바일 서비스와 백엔드 협업을 좋아해요.",
    portfolio: "demo",
    tags: ["모바일", "백엔드", "Firebase"],
  },
];

type ReportMetric = {
  label: string;
  score: number;
  icon: LucideIcon;
  position: string;
};

const reportMetricMeta: Array<Omit<ReportMetric, "score"> & { fallbackScore: number }> = [
  {
    label: "의미근접",
    fallbackScore: 78,
    icon: GraduationCap,
    position: "top",
  },
  {
    label: "과목일치",
    fallbackScore: 36,
    icon: Briefcase,
    position: "right-top",
  },
  {
    label: "분야균형",
    fallbackScore: 86,
    icon: Trophy,
    position: "right-bottom",
  },
  {
    label: "학기구조",
    fallbackScore: 62,
    icon: Globe2,
    position: "left-bottom",
  },
  {
    label: "전공폭",
    fallbackScore: 74,
    icon: Code2,
    position: "left-top",
  },
];

function buildReportMetrics(metrics: Insight["analysis"]["metrics"]): ReportMetric[] {
  return reportMetricMeta.map((metric) => ({
    label: metric.label,
    icon: metric.icon,
    position: metric.position,
    score:
      metrics.find((candidate) => candidate.label === metric.label)?.score ??
      metric.fallbackScore,
  }));
}

function buildRadarPoints(scores: number[]) {
  return scores
    .map((score, index) => getRadarPoint(score, index).join(","))
    .join(" ");
}

function getRadarPoint(score: number, index: number) {
  const center = 160;
  const radius = 132;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / reportMetricMeta.length;
  const scaled = (score / 100) * radius;
  const x = center + Math.cos(angle) * scaled;
  const y = center + Math.sin(angle) * scaled;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function ReportMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="report-meta">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ScoreRow({
  metric,
}: {
  metric: ReportMetric;
}) {
  const Icon = metric.icon;
  const tone = getScoreTone(metric.score);
  return (
    <div className={`score-row ${tone}`}>
      <span className="score-row-icon">
        <Icon size={20} />
      </span>
      <strong>{metric.label}</strong>
      <b>{metric.score}</b>
      <small>/ 100</small>
    </div>
  );
}

function ReportNotice({
  tone,
  icon,
  title,
  subtitle,
  items,
}: {
  tone: "good" | "bad";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <section className={`report-notice ${tone}`}>
      <div className="notice-label">
        <span>{icon}</span>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span className="notice-item-icon">{tone === "good" ? "✓" : "!"}</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InsightEvidencePanel({ insight }: { insight: Insight }) {
  return (
    <section className="insight-evidence">
      <div className="insight-evidence-heading">
        <p className="eyebrow">분석 근거</p>
        <h3>{insight.headline}</h3>
      </div>

      <div className="insight-evidence-grid">
        <article>
          <div className="evidence-title">
            <Trophy size={20} />
            <strong>추천 활동</strong>
          </div>
          <ul>
            {insight.activities.map((activity) => (
              <li key={activity.title}>
                <b>{activity.title}</b>
                <span>{activity.stat}</span>
                <p>{activity.why}</p>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="evidence-title">
            <BookOpen size={20} />
            <strong>커리큘럼 해석</strong>
          </div>
          <ul>
            {insight.curriculum.map((item) => (
              <li key={item.name}>
                <b>{item.name}</b>
                <span>{item.strength}</span>
                <p>{item.caution}</p>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <div className="evidence-title">
            <Scale size={20} />
            <strong>비교 시그널</strong>
          </div>
          <ul>
            {insight.comparisons.slice(0, 3).map((comparison) => (
              <li key={`${comparison.school}-${comparison.department}`}>
                <b>
                  {comparison.school} <small>{comparison.delta}</small>
                </b>
                <span>{comparison.department}</span>
                <p>{comparison.signal}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function CurriculumRankingPanel({
  similarity,
}: {
  similarity: Insight["curriculumSimilarity"];
}) {
  const topRankings = similarity.rankings.slice(0, 5);

  return (
    <section className="curriculum-ranking">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">커리큘럼 유사도</p>
          <h3>
            {similarity.base.school} {similarity.base.department}와 가까운 학교
          </h3>
          <span>
            기준 과목 {similarity.base.courseCount}개 ·{" "}
            {similarity.base.filters.grade
              ? `${similarity.base.filters.grade}학년 필터`
              : "전체 학년"}
          </span>
        </div>
        <strong>{topRankings.length}개 결과</strong>
      </div>

      <div className="curriculum-ranking-list">
        {topRankings.map((item) => (
          <article className="curriculum-rank-card" key={`${item.school}-${item.department}`}>
            <div className="rank-main">
              <span className="rank-number">{item.rank}</span>
              <div>
                <h4>
                  {item.school}
                  <small>{item.department}</small>
                </h4>
                <div className="rank-shared-courses" aria-label="공통 과목">
                  {item.sharedCourses.length > 0
                    ? item.sharedCourses.slice(0, 4).map((course) => (
                        <span key={course}>{course}</span>
                      ))
                    : <span>직접 일치 과목 적음</span>}
                </div>
              </div>
            </div>

            <div className="rank-score">
              <strong>{Math.round(item.score * 100)}</strong>
              <span>점</span>
            </div>

            <div className="rank-components">
              <MetricPill label="의미" value={item.components.semantic} />
              <MetricPill label="과목" value={item.components.jaccard} />
              <MetricPill label="분야" value={item.components.area} />
              <MetricPill label="학기" value={item.components.structure} />
            </div>

            <div className="rank-tags">
              {item.sharedAreas.slice(0, 4).map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <span>
      {label} <b>{Math.round(value * 100)}</b>
    </span>
  );
}

function getScoreTone(score: number) {
  if (score >= 75) {
    return "score-high";
  }
  if (score >= 50) {
    return "score-mid";
  }
  return "score-low";
}

function getMatchBadgeTone(rate: number) {
  if (rate >= 90) {
    return "match-high";
  }
  if (rate >= 80) {
    return "match-mid";
  }
  return "match-low";
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

function CustomDropdown({
  icon,
  label,
  placeholder,
  value,
  displayValue,
  options,
  popularOptions,
  onChange,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  displayValue?: string;
  options: string[];
  popularOptions: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedText = displayValue || value;

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
    <div className={`custom-select ${isOpen ? "open" : ""}`} ref={selectRef}>
      <button
        className={`custom-select-trigger ${selectedText ? "selected" : ""}`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="custom-select-label">
          <span className="custom-select-icon" aria-hidden="true">
            {icon}
          </span>
          <span>{label}</span>
        </span>
        <span className="custom-select-value">{selectedText || placeholder}</span>
        <ChevronDown className="custom-select-chevron" size={20} />
      </button>

      {isOpen && (
        <div className="custom-select-menu" role="listbox" aria-label={label}>
          <div className="popular-options" aria-label="인기 옵션">
            {popularOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={option === selectedText ? "active" : ""}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="select-option-list">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === selectedText}
                onClick={() => selectOption(option)}
              >
                {option}
              </button>
            ))}
          </div>
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

function ChipGroup({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: string[];
  onToggle: (chip: string) => void;
}) {
  return (
    <fieldset className="chip-group">
      <legend>
        {label} <small>(복수 선택)</small>
      </legend>
      <div>
        {fieldChips.map((chip) => {
          const isSelected = selected.includes(chip);
          return (
            <button
              aria-pressed={isSelected}
              className={isSelected ? "selected" : ""}
              key={`${label}-${chip}`}
              onClick={() => onToggle(chip)}
              type="button"
            >
              {isSelected ? "✓ " : ""}
              {chip}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SparkIcon() {
  return (
    <span className="spark-icon" aria-hidden="true">
      ✦
    </span>
  );
}
