# CareerScope API 명세서

## 1. 서비스 개요

CareerScope API는 사용자의 학교와 학과 정보를 기반으로 커리큘럼 유사도, 비교 리포트, 추천 활동, 동료 후보, 심화 리포트 생성 기능을 제공하는 백엔드 API입니다. 프론트엔드 대시보드는 이 API를 호출해 커리어 분석 결과와 네트워킹 추천 데이터를 화면에 표시합니다.

## 2. 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:4000` |
| 인증 | 현재 인증 없음 |
| 요청/응답 형식 | JSON |
| 공통 요청 헤더 | `Content-Type: application/json` |
| CORS 허용 Origin | `WEB_ORIGIN`, `http://localhost:3000`, `http://127.0.0.1:3000` |

## 3. 백엔드 스택

| 구분 | 기술 |
| --- | --- |
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database ORM | Prisma |
| Primary Database | PostgreSQL / Neon (`DATABASE_URL`) |
| Fallback Database | MongoDB / Mongoose (`MONGODB_URI`) |
| Demo Fallback | In-memory storage |
| External AI | Gemini API (`GEMINI_API_KEY`, `GEMINI_MODEL`) |

저장소 우선순위는 `DATABASE_URL`이 있으면 PostgreSQL/Neon을 사용하고, 없으면 MongoDB 연결을 시도합니다. MongoDB 연결도 불가능하면 데모용 메모리 저장소로 동작합니다.

## 4. 엔드포인트 요약

| Method | Path | 목적 | 주요 상태코드 |
| --- | --- | --- | --- |
| GET | `/health` | API 상태와 현재 저장소 확인 | `200` |
| GET | `/api/insights` | 커리큘럼 분석, 비교 리포트, 추천 활동 조회 | `200`, `500` |
| GET | `/api/curriculum-similarity` | 커리큘럼 유사도 계산 결과 조회 | `200`, `500` |
| POST | `/api/deep-report` | Gemini 기반 유료 심화 리포트 생성 | `200`, `400`, `502`, `503`, `504`, `500` |
| POST | `/api/signup` | 사용자 프로필 저장 | `201`, `400`, `500` |
| GET | `/api/peers` | 추천 동료 목록 조회 | `200` |

프론트엔드에서 현재 직접 호출하는 API는 `/api/insights`, `/api/deep-report`, `/api/signup`입니다. `/api/curriculum-similarity`와 `/api/peers`는 독립 조회용 API로 제공됩니다.

## 5. 공통 에러 형식

필수 입력값이 누락되면 다음 형식의 `400 Bad Request` 응답을 반환합니다.

```json
{
  "error": "Missing required fields",
  "missing": ["school", "department"]
}
```

AI 리포트 생성 API는 외부 Gemini API 오류에 따라 다음과 같이 응답할 수 있습니다.

```json
{
  "error": "Gemini API key is not configured. Set GEMINI_API_KEY in apps/api/.env."
}
```

그 외 처리 중 예외는 Express 기본 오류 처리 또는 API별 `500` 응답으로 반환될 수 있습니다.

## 6. API 상세

### GET `/health`

API 서버의 동작 여부와 현재 저장소 종류를 확인합니다.

#### Request

Query parameter 없음.

#### Success Response `200`

```json
{
  "ok": true,
  "service": "career-scope-api",
  "storage": "neon-postgres"
}
```

`storage` 값은 `neon-postgres`, `mongodb`, `memory-demo-fallback` 중 하나입니다.

#### Example

```bash
curl http://localhost:4000/health
```

---

### GET `/api/insights`

선택한 학교/학과 기준의 커리큘럼 분석, 비교 대학, 추천 활동, 대시보드 지표, 추천 동료 데이터를 반환합니다.

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `school` | string | 아니오 | 분석 대상 학교명 |
| `department` | string | 아니오 | 분석 대상 학과명 |
| `grade` | string | 아니오 | 학년 필터 |
| `semester` | string | 아니오 | 학기 필터 |
| `yearTerm` | string | 아니오 | 연도/학기 필터 |
| `major` | string | 아니오 | 프론트엔드에서 함께 전달하지만 현재 백엔드 로직에서는 직접 사용하지 않음 |
| `field` | string | 아니오 | 프론트엔드에서 함께 전달하지만 현재 백엔드 로직에서는 직접 사용하지 않음 |

#### Success Response `200`

```json
{
  "target": {
    "school": "인하대학교",
    "department": "컴퓨터공학과",
    "track": "컴퓨터공학/소프트웨어 계열"
  },
  "headline": "인하대 컴퓨터공학과는 아주대와 커리큘럼 구조가 가장 가깝습니다.",
  "summary": "47개 과목을 기준으로 비교했을 때 아주대 소프트웨어학과가 가장 높은 유사도를 보입니다.",
  "activities": [
    {
      "title": "백엔드 서비스 MVP",
      "stat": "선택 커리큘럼 최우선 추천 활동",
      "why": "데이터베이스 과목을 API, 인증, 배포 경험과 묶으면 실무형 백엔드 역량을 설득하기 좋습니다."
    }
  ],
  "comparisons": [
    {
      "school": "아주대",
      "department": "소프트웨어학과",
      "signal": "프로그래밍, 자료구조, 알고리즘 분야가 겹침",
      "delta": "74점"
    }
  ],
  "curriculumSimilarity": {
    "base": {
      "school": "인하대",
      "department": "컴퓨터공학과",
      "courseCount": 47,
      "filters": {}
    },
    "rankings": [
      {
        "rank": 1,
        "school": "아주대",
        "department": "소프트웨어학과",
        "score": 0.74,
        "components": {
          "semantic": 0.78,
          "jaccard": 0.36,
          "area": 0.86,
          "structure": 0.62
        },
        "sharedCourses": ["자료구조", "운영체제", "데이터베이스"],
        "sharedAreas": ["프로그래밍", "자료구조", "알고리즘"],
        "differentAreas": ["AI/머신러닝", "보안"],
        "comparedCourseCount": 60
      }
    ],
    "availableTargets": [
      {
        "school": "인하대",
        "department": "컴퓨터공학과",
        "courseCount": 47
      }
    ]
  },
  "curriculum": [
    {
      "name": "자료구조",
      "strength": "비교군에서도 반복되는 핵심 축입니다.",
      "caution": "과목 이수만으로 끝내지 말고 산출물과 연결해야 합니다."
    }
  ],
  "lockedReport": {
    "price": 4900,
    "bullets": ["내 계열 상위 20% 학생들의 활동 조합"]
  },
  "dashboard": {
    "percentile": 78,
    "averageContestCount": 3,
    "myContestCount": 1,
    "profileCompletion": 72
  },
  "analysis": {
    "totalScore": 78,
    "delta": 13,
    "metrics": [
      {
        "label": "의미근접",
        "score": 78
      }
    ],
    "strengths": ["47개 과목을 기준으로 커리큘럼 비교가 가능해졌습니다."],
    "weaknesses": ["과목 설명 기반 보강이 필요합니다."]
  },
  "peers": [
    {
      "id": "peer-1",
      "name": "백엔드 지망 3학년",
      "schoolHidden": "서울권 주요 대학",
      "intro": "분산 시스템과 API 설계에 관심이 많습니다.",
      "portfolio": "github.com/demo/backend-student",
      "tags": ["백엔드", "인턴 준비", "API"]
    }
  ]
}
```

#### Example

```bash
curl "http://localhost:4000/api/insights?school=인하대학교&department=컴퓨터공학과"
```

---

### GET `/api/curriculum-similarity`

학교/학과별 커리큘럼 유사도 계산 결과만 반환합니다. `/api/insights` 응답의 `curriculumSimilarity`와 같은 구조입니다.

#### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `school` | string | 아니오 | 기준 학교명 |
| `department` | string | 아니오 | 기준 학과명 |
| `grade` | string | 아니오 | 학년 필터 |
| `semester` | string | 아니오 | 학기 필터 |
| `yearTerm` | string | 아니오 | 연도/학기 필터 |

#### Success Response `200`

```json
{
  "base": {
    "school": "인하대",
    "department": "컴퓨터공학과",
    "courseCount": 47,
    "filters": {
      "grade": "3",
      "semester": "1"
    }
  },
  "rankings": [
    {
      "rank": 1,
      "school": "아주대",
      "department": "소프트웨어학과",
      "score": 0.74,
      "components": {
        "semantic": 0.78,
        "jaccard": 0.36,
        "area": 0.86,
        "structure": 0.62
      },
      "sharedCourses": ["자료구조", "운영체제"],
      "sharedAreas": ["프로그래밍", "자료구조"],
      "differentAreas": ["보안"],
      "comparedCourseCount": 60
    }
  ],
  "availableTargets": [
    {
      "school": "인하대",
      "department": "컴퓨터공학과",
      "courseCount": 47
    }
  ]
}
```

#### Example

```bash
curl "http://localhost:4000/api/curriculum-similarity?school=인하대학교&department=컴퓨터공학과"
```

---

### POST `/api/deep-report`

기본 분석 결과를 바탕으로 Gemini API를 호출해 심화 리포트를 생성합니다.

#### Request Body

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `school` | string | 예 | 리포트 대상 학교명 |
| `department` | string | 예 | 리포트 대상 학과명 |
| `headline` | string | 아니오 | 기본 리포트 헤드라인 |
| `summary` | string | 아니오 | 기본 리포트 요약 |
| `activities` | array | 아니오 | 추천 활동 목록 |
| `comparisons` | array | 아니오 | 비교 대학 목록 |
| `curriculum` | array | 아니오 | 커리큘럼 해석 목록 |
| `analysis` | object | 아니오 | 분석 점수와 강점/약점 |
| `curriculumSimilarity` | object | 아니오 | 커리큘럼 유사도 결과 |

#### Success Response `200`

```json
{
  "generatedAt": "2026-05-10T00:00:00.000Z",
  "model": "gemini-2.0-flash",
  "executiveSummary": "현재 커리큘럼은 백엔드 서비스 구현 역량을 보여주기 좋은 구조입니다.",
  "benchmarkInsights": [
    {
      "title": "비교 대학 대비 프로젝트 신호",
      "detail": "유사 커리큘럼에서 캡스톤과 데이터베이스 과목이 반복됩니다.",
      "scoreImpact": "높음"
    }
  ],
  "portfolioPriorities": [
    {
      "title": "API 기반 MVP 정리",
      "why": "데이터베이스 과목을 실무 결과물로 연결할 수 있습니다.",
      "nextStep": "2주 안에 CRUD API와 배포 URL을 포트폴리오에 추가합니다."
    }
  ],
  "activityMix": [
    {
      "name": "해커톤 + 기술 블로그",
      "reason": "짧은 기간에 구현과 설명 역량을 동시에 보여줍니다.",
      "confidence": "높음"
    }
  ],
  "curriculumRecommendations": ["데이터베이스 과목과 백엔드 프로젝트를 연결하세요."],
  "riskNotes": ["과목명만으로는 실무 역량이 충분히 드러나지 않을 수 있습니다."],
  "sources": ["입력 커리큘럼 유사도 데이터"]
}
```

#### Error Responses

`400 Bad Request`

```json
{
  "error": "Missing required fields",
  "missing": ["school", "department"]
}
```

`503 Service Unavailable`

```json
{
  "error": "Gemini API key is not configured. Set GEMINI_API_KEY in apps/api/.env."
}
```

`502 Bad Gateway` 또는 `504 Gateway Timeout`

```json
{
  "error": "Gemini API request failed."
}
```

#### Example

```bash
curl -X POST http://localhost:4000/api/deep-report \
  -H "Content-Type: application/json" \
  -d '{
    "school": "인하대학교",
    "department": "컴퓨터공학과",
    "headline": "커리큘럼 구조가 백엔드 역량과 잘 연결됩니다.",
    "summary": "데이터베이스와 프로젝트 과목을 산출물로 연결하는 전략이 유리합니다."
  }'
```

---

### POST `/api/signup`

사용자 프로필 정보를 저장합니다. PostgreSQL/Neon, MongoDB, 메모리 저장소 중 현재 사용 가능한 저장소에 저장됩니다.

#### Request Body

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `school` | string | 예 | 사용자 학교명 |
| `department` | string | 예 | 사용자 학과명 |
| `email` | string | 예 | 사용자 이메일 |
| `name` | string | 예 | 사용자 이름 |
| `role` | string | 예 | 관심 직무 또는 역할 |
| `interest` | string | 예 | 관심 분야 |
| `wantsToMeet` | string | 예 | 만나고 싶은 동료 유형 |
| `intro` | string | 예 | 자기소개 |
| `portfolio` | string | 아니오 | 포트폴리오 JSON 문자열 또는 링크 |

프론트엔드는 `matchingDistance`, `portfolioEntries`, `portfolioStats`도 함께 보낼 수 있지만, 현재 백엔드 저장 로직에서는 직접 저장하지 않습니다.

#### Success Response `201`

```json
{
  "id": "clx123profile",
  "profile": {
    "id": "clx123profile",
    "school": "인하대학교",
    "department": "컴퓨터공학과",
    "email": "student@inha.edu",
    "name": "김하늘",
    "role": "백엔드",
    "interest": "백엔드",
    "wantsToMeet": "balanced",
    "intro": "API 설계와 배포 경험을 쌓고 싶습니다.",
    "portfolio": "[{\"title\":\"API 서버\"}]",
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-10T00:00:00.000Z"
  }
}
```

#### Error Response `400`

```json
{
  "error": "Missing required fields",
  "missing": ["email", "intro"]
}
```

#### Example

```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "school": "인하대학교",
    "department": "컴퓨터공학과",
    "email": "student@inha.edu",
    "name": "김하늘",
    "role": "백엔드",
    "interest": "백엔드",
    "wantsToMeet": "balanced",
    "intro": "API 설계와 배포 경험을 쌓고 싶습니다.",
    "portfolio": "https://github.com/example"
  }'
```

---

### GET `/api/peers`

추천 동료 목록을 반환합니다. 현재는 데모 인사이트 데이터의 `peers` 배열을 사용합니다.

#### Request

Query parameter 없음.

#### Success Response `200`

```json
[
  {
    "id": "peer-1",
    "name": "백엔드 지망 3학년",
    "schoolHidden": "서울권 주요 대학",
    "intro": "분산 시스템과 API 설계에 관심이 많고, 팀 프로젝트 경험을 같이 쌓을 사람을 찾고 있어요.",
    "portfolio": "github.com/demo/backend-student",
    "tags": ["백엔드", "인턴 준비", "API"]
  }
]
```

#### Example

```bash
curl http://localhost:4000/api/peers
```

## 7. 데이터 흐름 요약

1. 사용자가 프론트엔드에서 학교, 학과, 관심 분야를 선택합니다.
2. 프론트엔드가 `/api/insights`를 호출해 기본 분석 결과를 가져옵니다.
3. API는 Prisma/PostgreSQL 데이터를 우선 조회하고, 실패하거나 데이터가 없으면 CSV 기반 데모 데이터를 사용합니다.
4. 사용자가 심화 리포트를 열면 `/api/deep-report`가 Gemini API를 호출해 추가 리포트를 생성합니다.
5. 사용자가 가입 정보를 제출하면 `/api/signup`이 현재 사용 가능한 저장소에 프로필을 저장합니다.

## 8. 확장 예정 API

현재 로그인, 모임 생성, 채팅 API는 프론트엔드 데모 상태이거나 클라이언트 로컬 상태로 처리됩니다. 정식 백엔드 명세에는 포함하지 않았으며, 추후 구현 시 별도 API 문서에 추가해야 합니다.
