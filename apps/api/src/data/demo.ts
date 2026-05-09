export const demoInsight = {
  target: {
    school: "인하대학교",
    department: "컴퓨터공학과",
    track: "컴퓨터공학/소프트웨어 계열",
  },
  headline: "컴퓨터공학과 학생 중 실전 프로젝트 경험이 빠르게 격차를 만드는 구간이에요.",
  summary:
    "선택한 학과는 공모전, 오픈소스, 인턴십 경험이 포트폴리오 신뢰도를 크게 좌우하는 계열입니다. 지금은 탐색보다 증명 가능한 결과물을 쌓는 전략이 유리합니다.",
  activities: [
    {
      title: "해커톤/서비스 MVP 제작",
      stat: "동일 계열 상위권 학생 10명 중 7명이 1회 이상 참여",
      why: "짧은 시간 안에 문제 정의, 구현, 발표까지 보여줄 수 있어 포트폴리오 밀도가 높습니다.",
    },
    {
      title: "AI/데이터 분석 공모전",
      stat: "수도권 컴공 계열 관심도 2위 활동",
      why: "모델 성능보다 문제를 데이터로 해석하는 능력을 보여주기 좋습니다.",
    },
    {
      title: "오픈소스/기술 블로그",
      stat: "기술 면접 전환율이 높은 학생군에서 반복적으로 관찰",
      why: "코드와 사고 과정을 동시에 공개해 신뢰를 만들 수 있습니다.",
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
      caution: "모델 사용 자체보다 데이터 해석과 실험 설계가 중요합니다.",
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
    {
      id: "peer-3",
      name: "프론트엔드 전환 준비생",
      schoolHidden: "서울권 공과대학",
      intro: "사용자 경험과 인터랙션 구현에 관심이 있고, 포트폴리오 피드백을 주고받고 싶어요.",
      portfolio: "vercel.app/demo-portfolio",
      tags: ["프론트엔드", "UX", "포트폴리오"],
    },
  ],
};

export function buildInsight(
  school?: string,
  department?: string,
  _options: { grade?: string; semester?: string; yearTerm?: string } = {},
) {
  return {
    ...demoInsight,
    target: {
      ...demoInsight.target,
      school: school || demoInsight.target.school,
      department: department || demoInsight.target.department,
    },
  };
}
