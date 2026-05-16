export type MatchingDistance = "similar" | "balanced" | "diverse";
export type PortfolioCategory = "프로젝트" | "논문" | "대회" | "기타";
export type PortfolioStats = Partial<Record<PortfolioCategory, number>>;

export type ComplementPeerInput = {
  id: string;
  name: string;
  schoolHidden: string;
  avatar?: string;
  intro: string;
  portfolio: string;
  tags: string[];
  strengthTags: string[];
  focusAreas: string[];
  activityStats: PortfolioStats;
};

export type ComplementMatchPeer = ComplementPeerInput & {
  matchScore: number;
  matchReasons: string[];
  complementTags: string[];
  activityGaps: PortfolioCategory[];
  observedIntentCount: number;
  networkSignalReason?: string;
  matchMode: "complement";
};

const activityGoals: Record<PortfolioCategory, number> = {
  프로젝트: 2,
  논문: 1,
  대회: 1,
  기타: 1,
};

const similarSignals = ["백엔드", "프론트엔드", "API", "소프트웨어 공학", "프로젝트/실습"];
const diverseSignals = ["AI/머신러닝", "데이터", "UX", "HCI", "보안", "보안/시스템"];

export function buildComplementMatches({
  peers,
  weaknessAreas,
  portfolioStats,
  matchingDistance,
  intentSignals = {},
}: {
  peers: ComplementPeerInput[];
  weaknessAreas: string[];
  portfolioStats: PortfolioStats;
  matchingDistance: MatchingDistance;
  intentSignals?: Record<string, number>;
}) {
  const normalizedWeaknesses = unique(
    weaknessAreas.flatMap((area) => normalizeAreaSignals(area)),
  );
  const activityGaps = getActivityGaps(portfolioStats);

  return peers
    .map((peer) =>
      scorePeer({
        peer,
        normalizedWeaknesses,
        activityGaps,
        matchingDistance,
        observedIntentCount: intentSignals[peer.id] ?? 0,
      }),
    )
    .sort((a, b) => b.matchScore - a.matchScore);
}

function scorePeer({
  peer,
  normalizedWeaknesses,
  activityGaps,
  matchingDistance,
  observedIntentCount,
}: {
  peer: ComplementPeerInput;
  normalizedWeaknesses: string[];
  activityGaps: PortfolioCategory[];
  matchingDistance: MatchingDistance;
  observedIntentCount: number;
}): ComplementMatchPeer {
  const peerSignals = unique([...peer.strengthTags, ...peer.focusAreas, ...peer.tags]);
  const complementTags = normalizedWeaknesses.filter((weakness) =>
    peerSignals.some((signal) => isRelatedSignal(signal, weakness)),
  );
  const capabilityScore =
    normalizedWeaknesses.length === 0
      ? 35
      : Math.round((complementTags.length / normalizedWeaknesses.length) * 55);
  const activityScore = scoreActivityGaps(peer.activityStats, activityGaps);
  const preferenceScore = scorePreference(peerSignals, matchingDistance);
  const intentScore = scoreIntentSignal(observedIntentCount);
  const matchScore = clampScore(capabilityScore + activityScore + preferenceScore + intentScore);
  const networkSignalReason =
    observedIntentCount > 0
      ? `실제 학생 관심 ${observedIntentCount}회가 쌓인 추천이에요.`
      : undefined;

  return {
    ...peer,
    matchScore,
    matchReasons: buildMatchReasons(
      complementTags,
      activityGaps,
      peer.activityStats,
      networkSignalReason,
    ),
    complementTags: complementTags.slice(0, 4),
    activityGaps,
    observedIntentCount,
    networkSignalReason,
    matchMode: "complement",
  };
}

function scoreActivityGaps(peerStats: PortfolioStats, activityGaps: PortfolioCategory[]) {
  if (activityGaps.length === 0) {
    return 20;
  }

  const coverage = activityGaps.reduce((sum, gap) => {
    const peerCount = peerStats[gap] ?? 0;
    return sum + Math.min(1, peerCount / activityGoals[gap]);
  }, 0);

  return Math.round((coverage / activityGaps.length) * 30);
}

function scorePreference(peerSignals: string[], matchingDistance: MatchingDistance) {
  if (matchingDistance === "balanced") {
    return 15;
  }

  const targetSignals = matchingDistance === "similar" ? similarSignals : diverseSignals;
  const hits = targetSignals.filter((signal) =>
    peerSignals.some((peerSignal) => isRelatedSignal(peerSignal, signal)),
  ).length;

  return Math.min(15, 6 + hits * 3);
}

function scoreIntentSignal(intentCount: number) {
  if (intentCount <= 0) {
    return 0;
  }

  return Math.min(8, Math.round(Math.log2(intentCount + 1) * 4));
}

function buildMatchReasons(
  complementTags: string[],
  activityGaps: PortfolioCategory[],
  peerStats: PortfolioStats,
  networkSignalReason?: string,
) {
  const reasons: string[] = [];
  if (complementTags.length > 0) {
    reasons.push(`${formatList(complementTags.slice(0, 2))} 역량을 보완할 수 있어요.`);
  }

  const coveredGap = activityGaps.find((gap) => (peerStats[gap] ?? 0) > 0);
  if (coveredGap) {
    reasons.push(`내 부족 활동인 ${coveredGap} 경험을 보완할 수 있어요.`);
  }

  if (networkSignalReason) {
    reasons.push(networkSignalReason);
  }

  if (reasons.length === 0) {
    reasons.push("관심 분야와 활동 목표가 가까워 함께 포트폴리오를 다듬기 좋아요.");
  }

  return reasons;
}

function getActivityGaps(portfolioStats: PortfolioStats) {
  return (Object.keys(activityGoals) as PortfolioCategory[]).filter(
    (category) => (portfolioStats[category] ?? 0) < activityGoals[category],
  );
}

function normalizeAreaSignals(area: string) {
  const normalized = area.trim();
  if (!normalized) {
    return [];
  }

  if (normalized.includes("AI") || normalized.includes("머신러닝") || normalized.includes("인공지능")) {
    return ["AI/머신러닝", "데이터"];
  }
  if (normalized.includes("보안") || normalized.includes("시스템")) {
    return ["보안/시스템", "운영체제"];
  }
  if (normalized.includes("데이터")) {
    return ["데이터", "데이터베이스"];
  }
  if (normalized.includes("프로젝트") || normalized.includes("실습")) {
    return ["프로젝트/실습"];
  }

  return [normalized];
}

function isRelatedSignal(signal: string, target: string) {
  const lhs = signal.toLowerCase();
  const rhs = target.toLowerCase();
  return lhs.includes(rhs) || rhs.includes(lhs);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function formatList(values: string[]) {
  return values.join(", ");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
