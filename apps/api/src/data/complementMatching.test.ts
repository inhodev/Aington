import assert from "node:assert/strict";
import test from "node:test";
import { buildComplementMatches, type ComplementPeerInput } from "./complementMatching.js";

const basePeers: ComplementPeerInput[] = [
  {
    id: "strong-security",
    name: "보안 강점 동료",
    schoolHidden: "서울권",
    intro: "보안 프로젝트를 주로 합니다.",
    portfolio: "github.com/security",
    tags: ["백엔드", "보안"],
    strengthTags: ["보안/시스템", "운영체제"],
    focusAreas: ["보안/시스템", "프로젝트/실습"],
    activityStats: { 프로젝트: 4, 논문: 0, 대회: 1, 기타: 1 },
  },
  {
    id: "general-peer",
    name: "일반 동료",
    schoolHidden: "수도권",
    intro: "일반 개발 프로젝트를 합니다.",
    portfolio: "github.com/general",
    tags: ["백엔드"],
    strengthTags: ["백엔드"],
    focusAreas: ["웹/앱 개발"],
    activityStats: { 프로젝트: 2, 논문: 0, 대회: 0, 기타: 0 },
  },
];

test("ranks peers higher when they cover more weakness areas", () => {
  const matches = buildComplementMatches({
    peers: basePeers,
    weaknessAreas: ["보안"],
    portfolioStats: { 프로젝트: 2, 논문: 1, 대회: 1, 기타: 1 },
    matchingDistance: "balanced",
  });

  assert.equal(matches[0].id, "strong-security");
  assert.ok(matches[0].matchScore > matches[1].matchScore);
  assert.deepEqual(matches[0].complementTags, ["보안/시스템", "운영체제"]);
});

test("rewards peers that cover missing portfolio activities", () => {
  const matches = buildComplementMatches({
    peers: basePeers,
    weaknessAreas: [],
    portfolioStats: { 프로젝트: 2, 논문: 1, 대회: 0, 기타: 0 },
    matchingDistance: "balanced",
  });

  assert.equal(matches[0].id, "strong-security");
  assert.ok(matches[0].activityGaps.includes("대회"));
});

test("reflects matching distance preference in score order", () => {
  const matches = buildComplementMatches({
    peers: [
      ...basePeers,
      {
        id: "ai-ux-peer",
        name: "다른 시각 동료",
        schoolHidden: "서울권",
        intro: "AI와 UX를 함께 봅니다.",
        portfolio: "notion.site/ai-ux",
        tags: ["AI", "UX"],
        strengthTags: ["AI/머신러닝", "UX"],
        focusAreas: ["AI/머신러닝", "HCI"],
        activityStats: { 프로젝트: 2, 논문: 1, 대회: 1, 기타: 1 },
      },
    ],
    weaknessAreas: [],
    portfolioStats: { 프로젝트: 2, 논문: 1, 대회: 1, 기타: 1 },
    matchingDistance: "diverse",
  });

  assert.equal(matches[0].id, "ai-ux-peer");
});

test("adds observed intent signal to score and reasons", () => {
  const matches = buildComplementMatches({
    peers: [
      {
        ...basePeers[0],
        id: "quiet-peer",
        name: "조용한 동료",
      },
      {
        ...basePeers[0],
        id: "validated-peer",
        name: "검증된 동료",
      },
    ],
    weaknessAreas: ["보안"],
    portfolioStats: { 프로젝트: 2, 논문: 1, 대회: 1, 기타: 1 },
    matchingDistance: "balanced",
    intentSignals: {
      "validated-peer": 3,
    },
  });

  assert.equal(matches[0].id, "validated-peer");
  assert.equal(matches[0].observedIntentCount, 3);
  assert.ok(matches[0].matchReasons.some((reason) => reason.includes("실제 학생 관심 3회")));
});
