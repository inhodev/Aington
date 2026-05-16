import type { CurriculumSimilarityResult } from "./curriculumSimilarity.js";

type Metric = {
  label: string;
  score: number;
};

const areaActivityMap: Record<string, { title: string; why: string }> = {
  "AI/머신러닝": {
    title: "AI 모델 적용 프로젝트",
    why: "커리큘럼에 AI/머신러닝 축이 보여서 모델 성능보다 문제 정의와 실험 설계를 같이 보여주는 결과물이 잘 맞습니다.",
  },
  "데이터/빅데이터": {
    title: "데이터 분석 공모전",
    why: "데이터 과목과 연결해 수집, 정제, 해석, 시각화까지 이어지는 포트폴리오를 만들기 좋습니다.",
  },
  데이터베이스: {
    title: "백엔드 서비스 MVP",
    why: "데이터베이스 과목을 API, 인증, 배포 경험과 묶으면 실무형 백엔드 역량을 설득하기 좋습니다.",
  },
  보안: {
    title: "보안 취약점 분석 스터디",
    why: "보안 과목은 단독 수강보다 실습 리포트와 재현 가능한 분석 기록이 있을 때 강점이 커집니다.",
  },
  "캡스톤/프로젝트": {
    title: "캡스톤 확장형 사이드프로젝트",
    why: "프로젝트 과목을 졸업요건으로만 끝내지 않고 사용자 피드백과 배포 지표까지 확장하면 차별화됩니다.",
  },
  네트워크: {
    title: "네트워크 기반 시스템 프로젝트",
    why: "네트워크 과목은 트래픽, 지연시간, 안정성 같은 수치와 함께 설명할 때 직무 연결성이 좋아집니다.",
  },
};

export function buildCurriculumReport(similarity: CurriculumSimilarityResult) {
  const topRankings = similarity.rankings.slice(0, 3);
  const top = topRankings[0];
  const averageTopScore = average(topRankings.map((ranking) => ranking.score));
  const averageComponents = {
    semantic: average(topRankings.map((ranking) => ranking.components.semantic)),
    jaccard: average(topRankings.map((ranking) => ranking.components.jaccard)),
    area: average(topRankings.map((ranking) => ranking.components.area)),
    structure: average(topRankings.map((ranking) => ranking.components.structure)),
  };
  const totalScore = clampScore(45 + averageTopScore * 55);
  const sharedAreas = unique(topRankings.flatMap((ranking) => ranking.sharedAreas));
  const differentAreas = unique(topRankings.flatMap((ranking) => ranking.differentAreas));
  const sharedCourses = unique(topRankings.flatMap((ranking) => ranking.sharedCourses));

  const metrics: Metric[] = [
    { label: "의미근접", score: percent(averageComponents.semantic) },
    { label: "과목일치", score: percent(averageComponents.jaccard) },
    { label: "분야균형", score: percent(averageComponents.area) },
    { label: "학기구조", score: percent(averageComponents.structure) },
    { label: "전공폭", score: clampScore(50 + Math.min(sharedAreas.length, 8) * 6) },
  ];

  const topLabel = top ? `${top.school} ${top.department}` : "비교군";

  return {
    headline: `${similarity.base.school} ${similarity.base.department}는 ${topLabel}와 커리큘럼 구조가 가장 가깝습니다.`,
    summary: buildSummary(similarity, top, sharedAreas, differentAreas),
    activities: buildActivities(sharedAreas, differentAreas),
    comparisons: topRankings.map((ranking) => ({
      school: ranking.school,
      department: ranking.department,
      signal:
        ranking.sharedAreas.length > 0
          ? `${ranking.sharedAreas.slice(0, 3).join(", ")} 분야가 겹침`
          : "직접 겹치는 분야가 적어 세부 확인 필요",
      delta: `${Math.round(ranking.score * 100)}점`,
    })),
    curriculum: buildCurriculumItems(sharedAreas, differentAreas, sharedCourses),
    dashboard: {
      percentile: totalScore,
      averageContestCount: Math.max(2, Math.round(sharedAreas.length / 2)),
      myContestCount: Math.max(1, Math.round(differentAreas.length / 3)),
      profileCompletion: clampScore(60 + sharedCourses.length * 3),
    },
    analysis: {
      totalScore,
      delta: Math.round((totalScore - 65) * 10) / 10,
      metrics,
      strengths: buildStrengths(similarity, top, sharedAreas, sharedCourses),
      weaknesses: buildWeaknesses(similarity, top, differentAreas),
    },
  };
}

function buildSummary(
  similarity: CurriculumSimilarityResult,
  top: CurriculumSimilarityResult["rankings"][number] | undefined,
  sharedAreas: string[],
  differentAreas: string[],
) {
  if (!top) {
    return "비교 가능한 커리큘럼 데이터가 부족합니다. 과목 데이터가 보강되면 유사 대학과 세부 차이를 다시 계산할 수 있습니다.";
  }

  return `${similarity.base.courseCount}개 과목을 기준으로 비교했을 때 ${top.school} ${top.department}가 가장 높은 유사도를 보입니다. 공통 축은 ${formatList(sharedAreas.slice(0, 3))}이며, 차이가 큰 축은 ${formatList(differentAreas.slice(0, 2))}입니다.`;
}

function buildActivities(sharedAreas: string[], differentAreas: string[]) {
  const selected = unique([...sharedAreas, ...differentAreas])
    .map((area) => areaActivityMap[area])
    .filter(Boolean)
    .slice(0, 3);

  const fallback = [
    {
      title: "해커톤/서비스 MVP 제작",
      why: "컴퓨터공학 커리큘럼의 기초 과목을 실제 문제 해결 결과물로 연결하기 좋습니다.",
    },
    {
      title: "기술 블로그와 코드 리뷰 기록",
      why: "과목명만으로 드러나지 않는 학습 깊이를 코드와 글로 함께 증명할 수 있습니다.",
    },
    {
      title: "전공 스터디 운영",
      why: "자료구조, 운영체제, 데이터베이스 같은 핵심 과목은 반복 학습과 설명 경험이 강한 신호가 됩니다.",
    },
  ];

  return (selected.length >= 3 ? selected : [...selected, ...fallback]).slice(0, 3).map(
    (activity, index) => ({
      title: activity.title,
      stat: index === 0 ? "선택 커리큘럼 최우선 추천 활동" : "커리큘럼 차이 보완 추천",
      why: activity.why,
    }),
  );
}

function buildCurriculumItems(
  sharedAreas: string[],
  differentAreas: string[],
  sharedCourses: string[],
) {
  const primaryAreas = sharedAreas.length > 0 ? sharedAreas : ["자료구조", "알고리즘", "데이터베이스"];
  return primaryAreas.slice(0, 3).map((area, index) => ({
    name: area,
    strength:
      index === 0
        ? `${formatList(sharedCourses.slice(0, 3))} 과목과 함께 비교군에서도 반복되는 핵심 축입니다.`
        : `${area} 분야가 유사 대학들과 함께 나타나 전공 방향성을 설명하기 좋습니다.`,
    caution:
      differentAreas[index]
        ? `${differentAreas[index]} 분야는 학교별 편차가 커서 프로젝트나 선택과목으로 보완하면 좋습니다.`
        : "과목 이수만으로 끝내지 말고 산출물과 연결해야 리포트 설득력이 커집니다.",
  }));
}

function buildStrengths(
  similarity: CurriculumSimilarityResult,
  top: CurriculumSimilarityResult["rankings"][number] | undefined,
  sharedAreas: string[],
  sharedCourses: string[],
) {
  return [
    `${similarity.base.courseCount}개 과목을 기준으로 커리큘럼 비교가 가능해졌습니다.`,
    top
      ? `${top.school} ${top.department} 기준에서 ${Math.round(top.score * 100)}점 유사도를 보여 비교 기준이 뚜렷합니다.`
      : "비교 가능한 대학 데이터가 부족해 추가 수집이 필요합니다.",
    sharedCourses.length > 0
      ? `${formatList(sharedCourses.slice(0, 4))} 과목이 여러 학교와 직접 겹칩니다.`
      : "직접 겹치는 과목명은 적지만 분야 단위 비교로 보완할 수 있습니다.",
    sharedAreas.length > 0
      ? `${formatList(sharedAreas.slice(0, 4))} 분야가 공통 강점으로 나타납니다.`
      : "공통 분야가 적어 세부 과목 설명 보강이 필요합니다.",
  ];
}

function buildWeaknesses(
  similarity: CurriculumSimilarityResult,
  top: CurriculumSimilarityResult["rankings"][number] | undefined,
  differentAreas: string[],
) {
  return [
    top && top.components.jaccard < 0.25
      ? "과목명 직접 일치도는 낮은 편이라 과목 설명 기반 보강이 필요합니다."
      : "과목명은 일부 겹치지만 난이도와 과목 설명까지 확인해야 합니다.",
    top && top.components.structure < 0.35
      ? "학년/학기 배치가 비교군과 달라 학습 순서 해석에 주의가 필요합니다."
      : "학년별 선택과목 데이터가 더 채워지면 구조 비교 정확도가 올라갑니다.",
    differentAreas.length > 0
      ? `${formatList(differentAreas.slice(0, 3))} 분야에서 학교별 차이가 크게 나타납니다.`
      : "차이 분야가 명확하지 않아 트랙/선택과목 데이터를 더 모아야 합니다.",
    similarity.base.courseCount < 30
      ? "기준 과목 수가 적어 학년 필터 결과는 참고용으로 보는 것이 안전합니다."
      : "전공필수/학점 정보가 비어 있는 과목이 많아 학점 가중 비교는 아직 제한적입니다.",
  ];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percent(value: number) {
  return clampScore(value * 100);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "추가 확인 필요";
}
