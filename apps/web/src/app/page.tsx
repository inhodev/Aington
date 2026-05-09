"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  Globe2,
  GraduationCap,
  HomeIcon,
  Info,
  LockKeyhole,
  MessageSquareText,
  Scale,
  School,
  Settings,
  ShieldCheck,
  ThumbsUp,
  Trophy,
  TrendingUp,
  UploadCloud,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
  peers: Array<{
    id: string;
    name: string;
    schoolHidden: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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
  peers: [
    {
      id: "peer-1",
      name: "백엔드 지망 3학년",
      schoolHidden: "서울권 주요 대학",
      intro: "분산 시스템과 API 설계에 관심이 많고, 팀 프로젝트 경험을 같이 쌓을 사람을 찾고 있어요.",
      portfolio: "github.com/demo/backend-student",
      tags: ["백엔드", "인턴 준비", "API"],
    },
    {
      id: "peer-2",
      name: "AI 프로덕트 빌더",
      schoolHidden: "수도권 사립대",
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
  const [profileName, setProfileName] = useState("김하늘");
  const [introLength, setIntroLength] = useState(43);
  const [interestChips, setInterestChips] = useState(["개발"]);
  const [meetChips, setMeetChips] = useState(["개발"]);

  const activeInsight = insight || fallbackInsight;

  const radarPoints = useMemo(
    () => buildRadarPoints(reportMetrics.map((metric) => metric.score)),
    [],
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
        setInsight(fallbackInsight);
        setStep("dashboard");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (step !== "signupNotice") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStep("signup");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [step]);

  async function handleAnalyze() {
    setStep("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const delay = new Promise((resolve) => window.setTimeout(resolve, 2100));

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

    setStep("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <main>
      {step !== "dashboard" && (
        <Header active={step} onHome={() => setStep("landing")} />
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
            <FieldShell icon={<School size={24} />} label="학교">
              <select value={school} onChange={(event) => setSchool(event.target.value)}>
                <option>인하대학교</option>
                <option>서울대학교</option>
                <option>연세대학교</option>
                <option>고려대학교</option>
                <option>한양대학교</option>
                <option>아주대학교</option>
                <option>인천대학교</option>
                <option>가천대학교</option>
                <option>경기대학교</option>
                <option>용인대학교</option>
              </select>
              <ChevronDown className="select-icon" size={20} />
            </FieldShell>

            <FieldShell icon={<BookOpen size={24} />} label="학과">
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option>컴퓨터공학과</option>
              </select>
              <ChevronDown className="select-icon" size={20} />
            </FieldShell>

            <FieldShell icon={<CalendarDays size={24} />} label="범위">
              <select value={grade} onChange={(event) => setGrade(event.target.value)}>
                <option>전체</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
              </select>
              <ChevronDown className="select-icon" size={20} />
            </FieldShell>

            <button className="primary-cta" onClick={handleAnalyze}>
              <TrendingUp size={24} />
              커리어 분석 시작하기
            </button>
          </div>
        </section>
      )}

      {step === "analyzing" && (
        <section className="analyzing-shell" aria-live="polite">
          <div className="analysis-orbit">
            <span />
            <span />
            <span />
            <BarChart3 size={42} />
          </div>
          <p className="eyebrow">분석 리포트 생성 중</p>
          <h2>
            {school} {department}
            <br />
            커리어 신호를 불러오고 있어요
          </h2>
          <div className="analysis-steps">
            <span>전국 전공 평균 비교</span>
            <span>커리큘럼 강점 계산</span>
            <span>대외활동 신호 정리</span>
          </div>
          <div className="analysis-progress">
            <div />
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
                  <h2>
                    {activeInsight.target.school}
                    <span>{activeInsight.target.department}</span>
                  </h2>
                  <p>커리어 분석 리포트 결과</p>
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
                value="전국 대학 평균"
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
                  <strong>종합 점수</strong>
                  <Info size={16} />
                </div>
                <div className="score-value">
                  72.6 <span>/ 100</span>
                </div>
                <div className="score-bar">
                  <div />
                </div>
                <p>
                  전국 동일 전공 평균 대비 <span>▲ 8.4</span>
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
                <p>각 항목은 전국 동일 전공 평균을 기준으로 산출되었습니다.</p>
              </section>
            </div>

            <ReportNotice
              tone="good"
              icon={<ThumbsUp size={34} />}
              title="장점"
              subtitle="강점을 잘 활용하고 더 발전시켜 보세요!"
              items={[
                "프로젝트 경험이 우수합니다. 실습 위주의 경험이 풍부하여 실무 적응력이 높습니다.",
                "전공 심화 학습 수준이 평균보다 높습니다. 심화 과목 이수와 학점 관리가 우수합니다.",
                "어학 역량이 안정적입니다. 토익/토플 등 공인 어학 성적이 평균 이상입니다.",
                "꾸준한 학습 태도가 돋보입니다. 학업 성취도와 출석률이 안정적으로 유지되고 있습니다.",
              ]}
            />

            <ReportNotice
              tone="bad"
              icon={<AlertCircle size={34} />}
              title="단점"
              subtitle="아쉬운 부분을 보완하여 경쟁력을 높여보세요!"
              items={[
                "공모전 및 대외활동 경험이 부족합니다. 다양한 경험을 통해 실무 역량을 강화해보세요.",
                "취업률 지표가 평균보다 낮습니다. 인턴, 취업 준비 활동을 미리 계획하는 것이 좋습니다.",
                "전공 관련 자격증 보유가 적습니다. 목표 직무에 맞는 자격증 취득을 추천합니다.",
                "전공 관련 스터디나 동아리 활동 참여가 적습니다. 네트워킹과 협업 경험을 늘려보세요.",
              ]}
            />

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
              <button className="secondary-cta" onClick={() => setStep("signupNotice")}>
                다른 학교 학생과 비교하기
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
            <p className="eyebrow">회원가입 필요</p>
            <h2>다른 학교 학생과 비교하려면 회원가입이 필요해요</h2>
            <p>
              기본 정보를 입력하면 같은 계열 학생 비교와 매칭 추천을 이어서 볼 수
              있어요.
            </p>
            <div className="notice-loader">
              <div />
            </div>
            <button className="secondary-cta" onClick={continueToSignup}>
              회원가입 계속하기
              <ArrowRight size={20} />
            </button>
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

function Header({ active, onHome }: { active: Step; onHome: () => void }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome}>
        <span className="logo-mark">
          <i />
          <i />
          <i />
        </span>
        <span>
          <strong>CareerScope</strong>
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
        {active === "report" ? (
          <>
            <button className="icon-nav-button" aria-label="알림">
              <Bell size={21} />
            </button>
            <button className="icon-nav-button" aria-label="프로필">
              <User size={21} />
            </button>
          </>
        ) : (
          <a>로그인</a>
        )}
        <button>회원가입</button>
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
  const peers = [...insight.peers, ...dashboardExtraPeers].slice(0, 5);

  return (
    <div className="app-dashboard">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <span className="logo-mark">
            <i />
            <i />
            <i />
          </span>
          <strong>
            Career<span>Scope</span>
          </strong>
        </div>

        <nav className="app-nav" aria-label="메인 대시보드 메뉴">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={item.active ? "active" : ""} key={item.label}>
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
          <button>
            업그레이드하기
            <ChevronRight size={18} />
          </button>
        </div>
      </aside>

      <section className="app-main">
        <div className="app-topbar">
          <div>
            <h1>같은 계열 내 내 위치</h1>
            <p>나와 비슷한 사용자 그룹 내 상대적 위치를 확인해보세요.</p>
          </div>
          <div className="app-user-tools">
            <button aria-label="알림">
              <Bell size={23} />
              <span />
            </button>
            <div className="app-profile">
              <div className="avatar">
                <Image
                  src="/assets/avatar-peer-1.webp"
                  alt=""
                  width={42}
                  height={42}
                  unoptimized
                />
              </div>
              <strong>{profileName}</strong>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

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
                  <stop offset="0%" stopColor="#2f3cf4" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2f3cf4" stopOpacity="0.02" />
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
              <span>내 위치</span>
              <b />
              <strong>상위 72%</strong>
              <small>보다 우수한 성과예요!</small>
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
          {dashboardStats.map((stat) => (
            <article className="stat-card" key={stat.label}>
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
            </article>
          ))}
        </div>

        <section className="similar-users">
          <div className="section-heading-row">
            <h2>나와 비슷한 사용자</h2>
            <button>
              더보기
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="similar-user-grid">
            {peers.map((peer, index) => (
              <article className="similar-user-card" key={peer.id}>
                <Image
                  className="peer-avatar"
                  src={`/assets/avatar-peer-${index + 1}.webp`}
                  alt=""
                  width={62}
                  height={62}
                  unoptimized
                />
                <h3>{peer.name}</h3>
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
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

const dashboardNavItems = [
  { label: "홈", icon: HomeIcon, active: true },
  { label: "분석 리포트", icon: BarChart3 },
  { label: "비교 보기", icon: Scale },
  { label: "커리큘럼", icon: BookOpen },
  { label: "네트워킹", icon: Users },
  { label: "프로필", icon: User },
  { label: "설정", icon: Settings },
];

const dashboardStats = [
  {
    label: "공모전 참가 횟수 / 상위 퍼센트",
    value: "8회",
    rank: "상위 68%",
    delta: "▲ 12%",
    deltaTone: "positive",
    asset: "/assets/stat-contest.webp",
  },
  {
    label: "어학성적",
    value: "TOEIC 920",
    rank: "상위 63%",
    delta: "▲ 7%",
    deltaTone: "positive",
    asset: "/assets/stat-language.webp",
  },
  {
    label: "프로젝트 수",
    value: "5개",
    rank: "상위 71%",
    delta: "▲ 9%",
    deltaTone: "positive",
    asset: "/assets/stat-project.webp",
  },
  {
    label: "자격증 수",
    value: "3개",
    rank: "상위 54%",
    delta: "— 0%",
    deltaTone: "neutral",
    asset: "/assets/stat-certificate.webp",
  },
];

const dashboardExtraPeers: Insight["peers"] = [
  {
    id: "peer-extra-1",
    name: "알고리즘형 동료",
    schoolHidden: "한양대 컴퓨터공학과",
    intro: "알고리즘과 시스템 설계에 관심이 많아요.",
    portfolio: "demo",
    tags: ["알고리즘", "시스템", "보안"],
  },
  {
    id: "peer-extra-2",
    name: "데이터 분석형 동료",
    schoolHidden: "고려대 컴퓨터학과",
    intro: "데이터 분석과 Python 프로젝트를 준비 중이에요.",
    portfolio: "demo",
    tags: ["AI/ML", "데이터분석", "Python"],
  },
  {
    id: "peer-extra-3",
    name: "서비스 기획형 동료",
    schoolHidden: "성균관대 소프트웨어학과",
    intro: "모바일 서비스와 백엔드 협업을 좋아해요.",
    portfolio: "demo",
    tags: ["모바일", "백엔드", "Firebase"],
  },
];

const reportMetrics = [
  {
    label: "전공심화",
    score: 78,
    icon: GraduationCap,
    position: "top",
  },
  {
    label: "취업률",
    score: 72,
    icon: Briefcase,
    position: "right-top",
  },
  {
    label: "공모전",
    score: 64,
    icon: Trophy,
    position: "right-bottom",
  },
  {
    label: "어학",
    score: 68,
    icon: Globe2,
    position: "left-bottom",
  },
  {
    label: "프로젝트",
    score: 81,
    icon: Code2,
    position: "left-top",
  },
];

function buildRadarPoints(scores: number[]) {
  return scores
    .map((score, index) => getRadarPoint(score, index).join(","))
    .join(" ");
}

function getRadarPoint(score: number, index: number) {
  const center = 160;
  const radius = 132;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / reportMetrics.length;
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
  metric: (typeof reportMetrics)[number];
}) {
  const Icon = metric.icon;
  return (
    <div className="score-row">
      <span>
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
            {tone === "good" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {item}
          </li>
        ))}
      </ul>
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
              <span>{item.rank}</span>
              <div>
                <h4>
                  {item.school}
                  <small>{item.department}</small>
                </h4>
                <p>
                  공통 과목:{" "}
                  {item.sharedCourses.length > 0
                    ? item.sharedCourses.slice(0, 4).join(", ")
                    : "직접 일치 과목 적음"}
                </p>
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

function FieldShell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field-shell">
      <span className="field-label">
        {icon}
        {label}
      </span>
      <span className="field-control">{children}</span>
    </label>
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
