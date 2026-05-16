# Student MVP Test Scenarios

Use these scenarios for the first validation interviews. Each run should finish with a saved peer or meeting intent, not just a viewed report.

## Scenario 1: 인하대 컴공 서비스 빌더형

- Profile: 인하대학교 컴퓨터공학과, 웹/앱 개발 관심, 프로젝트 1개, 논문/대회 없음.
- Job to validate: "수업 프로젝트를 실제 배포 경험으로 확장할 협업 상대를 찾고 싶다."
- Success signal: 리포트 확인 후 추천 학생 또는 모임에 관심을 남긴다.
- Watch for: 추천 이유가 "프로젝트/실습", "배포", "보완 역량" 중 하나와 연결되는지.

## Scenario 2: 인하대 AI 연구 입문형

- Profile: 인하대학교 인공지능공학과, 인공지능 관심, 논문 경험 없음.
- Job to validate: "AI 수업 이후 논문/실험 루틴을 같이 만들 동료가 필요하다."
- Success signal: 다양한 배경의 추천 학생에게 프로필 보기 또는 메시지 액션을 한다.
- Watch for: 추천 이유가 AI 역량만 반복하지 않고 데이터/실험/논문 갭을 설명하는지.

## Scenario 3: 인하대 데이터 포트폴리오형

- Profile: 인하대학교 데이터사이언스학과, 데이터 과학 관심, 프로젝트 0개, 대회/기타 경험 있음.
- Job to validate: "데이터 분석 결과물을 취업 포트폴리오로 만들고 싶다."
- Success signal: 데이터/프로젝트 성향의 동료나 모임에 관심을 남긴다.
- Watch for: 리포트가 학과 비교에서 끝나지 않고 다음 행동을 만들었는지.

## Evidence To Capture

- `report_viewed -> signup_completed -> recommendation_clicked -> intent_created` funnel count.
- 사용자가 말한 추천 이유 이해도.
- 클릭한 대상의 `targetType`, `targetId`, `reason`.
- 이탈 지점과 혼란 문장.

The API regression test `student validation scenarios complete the MVP API flow` exercises these three paths without requiring Postgres.
