export type Meeting = {
  id: string;
  title: string;
  description: string;
  field: string;
  date: string;
  location: string;
  hostNickname: string;
  memberCount: number;
  maxMembers: number;
  members: string[];
};

export const meetingFields = [
  "백엔드",
  "프론트엔드",
  "AI/ML",
  "데이터분석",
  "알고리즘",
  "시스템",
  "보안",
  "모바일",
  "클라우드",
  "인턴 준비",
  "공모전",
  "해커톤",
  "오픈소스",
  "창업 지향",
];

export const dummyMeetings: Meeting[] = [
  {
    id: "backend-api-deploy",
    title: "백엔드 API 배포 스터디",
    description:
      "REST API 서버를 함께 구현하고 배포까지 경험하는 소규모 스터디입니다. 각자 작은 기능을 맡아 GitHub로 협업합니다.",
    field: "백엔드",
    date: "2026.05.24",
    location: "서울 강남구",
    hostNickname: "서버길잡이",
    memberCount: 4,
    maxMembers: 6,
    members: ["서버길잡이", "API러너", "배포초보", "쿼리장인"],
  },
  {
    id: "backend-interview-club",
    title: "백엔드 기술 면접 준비 모임",
    description:
      "운영체제, 네트워크, 데이터베이스 질문을 같이 정리하고 모의 면접을 진행합니다.",
    field: "백엔드",
    date: "2026.05.31",
    location: "서울 마포구",
    hostNickname: "면접메이트",
    memberCount: 6,
    maxMembers: 6,
    members: ["면접메이트", "인덱스왕", "캐시연습생", "트랜잭션러", "로그수집가", "서버정원"],
  },
  {
    id: "ai-paper-review",
    title: "AI 논문 리뷰 입문",
    description:
      "arXiv 논문을 한 편씩 읽고 핵심 아이디어와 구현 포인트를 짧게 공유합니다.",
    field: "AI/ML",
    date: "2026.05.30",
    location: "서울 성동구",
    hostNickname: "모델탐험가",
    memberCount: 3,
    maxMembers: 5,
    members: ["모델탐험가", "텐서노트", "로스커브"],
  },
  {
    id: "ai-kaggle-first",
    title: "Kaggle 입문 대회 같이 풀기",
    description:
      "초보자용 데이터셋으로 모델링 흐름을 익히고 제출 노트북을 함께 개선합니다.",
    field: "AI/ML",
    date: "2026.06.06",
    location: "서울 관악구",
    hostNickname: "캐글입문자",
    memberCount: 5,
    maxMembers: 8,
    members: ["캐글입문자", "피처메이커", "검증셋", "파라미터", "리더보드"],
  },
  {
    id: "data-dashboard",
    title: "공공데이터 대시보드 제작",
    description:
      "공공데이터를 수집해 시각화 대시보드를 만들고 포트폴리오 문서까지 정리합니다.",
    field: "데이터분석",
    date: "2026.06.07",
    location: "서울 종로구",
    hostNickname: "차트빌더",
    memberCount: 4,
    maxMembers: 7,
    members: ["차트빌더", "데이터서퍼", "시각화러", "판다스친구"],
  },
  {
    id: "data-adsp-study",
    title: "ADsP 단기 준비반",
    description:
      "기출 문제와 핵심 개념을 나누어 정리하고 매주 짧은 모의고사를 진행합니다.",
    field: "데이터분석",
    date: "2026.06.14",
    location: "서울 강남구",
    hostNickname: "분석노트",
    memberCount: 7,
    maxMembers: 7,
    members: ["분석노트", "통계연습", "SQL러", "시각화노트", "모형정리", "지표메이커", "데이터비타민"],
  },
  {
    id: "contest-planning",
    title: "공모전 문제 정의 워크숍",
    description:
      "공모전 주제를 정하고 문제 정의, 역할 분담, 제출 일정까지 함께 설계합니다.",
    field: "공모전",
    date: "2026.05.25",
    location: "서울 서초구",
    hostNickname: "기획러너",
    memberCount: 2,
    maxMembers: 5,
    members: ["기획러너", "아이디어맵"],
  },
  {
    id: "contest-portfolio",
    title: "수상작 포트폴리오 분석 모임",
    description:
      "이전 수상작의 구조를 분석하고 각자 포트폴리오에 녹일 수 있는 표현 방식을 정리합니다.",
    field: "공모전",
    date: "2026.06.13",
    location: "서울 송파구",
    hostNickname: "수상작리뷰어",
    memberCount: 4,
    maxMembers: 6,
    members: ["수상작리뷰어", "제출마감", "팀빌더", "발표연습"],
  },
];

export const meetingRecommendations: Record<string, string[]> = {
  백엔드: [
    "사이드 프로젝트: REST API 서버 구현 및 배포 경험 쌓기",
    "공모전: 교내외 해커톤 1회 이상 참여",
    "자격증: 정보처리기사 또는 AWS Solutions Architect 준비",
  ],
  "AI/ML": [
    "논문: arXiv 논문 리뷰 스터디 참여 또는 작성",
    "대회: Kaggle 입문 대회 1회 이상 참여",
    "프로젝트: 공개 데이터셋 기반 모델 구현 및 GitHub 공개",
  ],
  데이터분석: [
    "프로젝트: 공공데이터 기반 시각화 대시보드 제작",
    "대회: 빅데이터 분석 공모전 참여",
    "자격증: ADsP 또는 데이터분석 준전문가 취득",
  ],
  공모전: [
    "대회: 연간 2회 이상 공모전 참여 목표 설정",
    "프로젝트: 수상작 중심 포트폴리오 구성",
    "네트워킹: 같은 목표의 팀원 모집 및 협업 경험",
  ],
};

export const fallbackMeetingRecommendations = meetingRecommendations.백엔드;
