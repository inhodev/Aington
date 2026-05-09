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
  Mail,
  MessageSquareText,
  School,
  ThumbsUp,
  Trophy,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

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

type Step = "landing" | "analyzing" | "report" | "signup" | "dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  const [insight, setInsight] = useState<Insight | null>(null);
  const [profileName, setProfileName] = useState("김하늘");

  const activeInsight = insight || fallbackInsight;

  const progressWidth = useMemo(
    () => `${Math.min(activeInsight.dashboard.percentile, 100)}%`,
    [activeInsight.dashboard.percentile],
  );

  const radarPoints = useMemo(
    () => buildRadarPoints(reportMetrics.map((metric) => metric.score)),
    [],
  );

  async function handleAnalyze() {
    setStep("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const delay = new Promise((resolve) => window.setTimeout(resolve, 2100));

    try {
      const query = new URLSearchParams({ school, department }).toString();
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
      email: String(form.get("email") || ""),
      name: String(form.get("name") || ""),
      role: String(form.get("role") || ""),
      interest: String(form.get("interest") || ""),
      wantsToMeet: String(form.get("wantsToMeet") || ""),
      intro: String(form.get("intro") || ""),
      portfolio: String(form.get("portfolio") || ""),
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

  return (
    <main>
      <Header active={step} onHome={() => setStep("landing")} />

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
                <option>성균관대학교</option>
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
              <ReportMeta icon={<BookOpen size={18} />} label="분석 기준" value="전국 대학 평균" />
              <ReportMeta icon={<CalendarDays size={18} />} label="분석 일자" value="2026.05.09" />
              <ReportMeta icon={<Users size={18} />} label="비교 대상" value="동일 전공 학생" />
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
                    <polygon className="radar-grid" points="160,24 289,98 289,222 160,296 31,222 31,98" />
                    <polygon className="radar-grid" points="160,60 258,116 258,204 160,260 62,204 62,116" />
                    <polygon className="radar-grid" points="160,96 227,135 227,185 160,224 93,185 93,135" />
                    <line x1="160" y1="160" x2="160" y2="24" />
                    <line x1="160" y1="160" x2="289" y2="98" />
                    <line x1="160" y1="160" x2="289" y2="222" />
                    <line x1="160" y1="160" x2="160" y2="296" />
                    <line x1="160" y1="160" x2="31" y2="222" />
                    <line x1="160" y1="160" x2="31" y2="98" />
                    <polygon className="radar-fill" points={radarPoints} />
                    <polygon className="radar-line" points={radarPoints} />
                    {reportMetrics.map((metric) => (
                      <circle
                        className="radar-dot"
                        cx={metric.point[0]}
                        cy={metric.point[1]}
                        key={metric.label}
                        r="5"
                      />
                    ))}
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
              <button className="secondary-cta" onClick={() => setStep("signup")}>
                다른 학교 학생과 비교하기
                <ArrowRight size={20} />
              </button>
            </section>
          </article>
        </section>
      )}

      {step === "signup" && (
        <section className="signup-shell">
          <div className="signup-copy">
            <p className="eyebrow">회원가입 후 비교 리포트 열기</p>
            <h2>학교 메일 인증과 기본 소개로 비슷한 계열 학생을 찾아요.</h2>
            <p>
              실제 메일 발송은 데모에서 생략하고, 가입 후 바로 메인 화면으로
              이동합니다.
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSignup}>
            <label>
              학교 메일
              <input name="email" defaultValue="student@snu.ac.kr" type="email" required />
            </label>
            <label>
              이름
              <input name="name" defaultValue="김하늘" required />
            </label>
            <label>
              희망 직군
              <select name="role" defaultValue="백엔드 개발자" required>
                <option>백엔드 개발자</option>
                <option>AI 엔지니어</option>
                <option>프론트엔드 개발자</option>
                <option>데이터 분석가</option>
              </select>
            </label>
            <label>
              원하는 분야
              <input name="interest" defaultValue="AI 서비스와 백엔드 아키텍처" required />
            </label>
            <label>
              만나고 싶은 사람
              <input
                name="wantsToMeet"
                defaultValue="해커톤과 인턴 준비를 같이 할 컴공 계열 학생"
                required
              />
            </label>
            <label className="wide-field">
              소개
              <textarea
                name="intro"
                defaultValue="서비스를 실제로 만들어보며 성장하는 것을 좋아합니다. 비슷한 목표를 가진 학생들과 정보를 나누고 싶어요."
                required
              />
            </label>
            <label className="wide-field optional-field">
              포트폴리오
              <input name="portfolio" defaultValue="github.com/demo/student" />
            </label>
            <button className="primary-cta" type="submit">
              <Mail size={22} />
              인증 완료하고 메인으로
            </button>
          </form>
        </section>
      )}

      {step === "dashboard" && (
        <section className="dashboard-shell">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">내 컴공 계열 포지션</p>
              <h2>{profileName}님의 비교 대시보드</h2>
            </div>
            <button className="price-button">
              심화 리포트 데모 결제 4,900원
              <LockKeyhole size={18} />
            </button>
          </div>

          <div className="dashboard-grid">
            <section className="position-panel">
              <div className="section-title">
                <TrendingUp size={22} />
                <h3>현재 위치 그래프</h3>
              </div>
              <div className="percentile">
                <strong>상위 {100 - activeInsight.dashboard.percentile}% 근접</strong>
                <span>{activeInsight.dashboard.percentile} percentile</span>
              </div>
              <div className="progress-track">
                <div style={{ width: progressWidth }} />
              </div>
              <p>
                같은 계열 평균은 공모전 {activeInsight.dashboard.averageContestCount}회,
                현재 입력 기준은 {activeInsight.dashboard.myContestCount}회로 보여요.
                다음 추천 행동은 해커톤 MVP 1개 완성입니다.
              </p>
            </section>

            <section className="position-panel compact-panel">
              <div className="section-title">
                <CheckCircle2 size={22} />
                <h3>프로필 완성도</h3>
              </div>
              <strong>{activeInsight.dashboard.profileCompletion}%</strong>
              <p>포트폴리오와 활동 경험을 추가하면 추천 정확도가 올라갑니다.</p>
            </section>
          </div>

          <section className="peer-section">
            <div className="section-title">
              <Users size={22} />
              <h3>나와 비슷한 계열의 학생</h3>
            </div>
            <div className="peer-grid">
              {activeInsight.peers.map((peer) => (
                <article className="peer-card" key={peer.id}>
                  <span className="hidden-school">{peer.schoolHidden}</span>
                  <h4>{peer.name}</h4>
                  <p>{peer.intro}</p>
                  <div className="tag-row">
                    {peer.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="peer-actions">
                    <button>
                      <MessageSquareText size={17} />
                      편지 보내기
                    </button>
                    <button>상세 보기</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
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

const reportMetrics = [
  {
    label: "전공심화",
    score: 78,
    icon: GraduationCap,
    position: "top",
    point: [160, 54],
  },
  {
    label: "취업률",
    score: 72,
    icon: Briefcase,
    position: "right-top",
    point: [236, 116],
  },
  {
    label: "공모전",
    score: 64,
    icon: Trophy,
    position: "right-bottom",
    point: [221, 226],
  },
  {
    label: "어학",
    score: 68,
    icon: Globe2,
    position: "left-bottom",
    point: [103, 232],
  },
  {
    label: "프로젝트",
    score: 81,
    icon: Code2,
    position: "left-top",
    point: [79, 112],
  },
];

function buildRadarPoints(scores: number[]) {
  const center = 160;
  const radius = 132;
  return scores
    .map((score, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / scores.length;
      const scaled = (score / 100) * radius;
      const x = center + Math.cos(angle) * scaled;
      const y = center + Math.sin(angle) * scaled;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
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
