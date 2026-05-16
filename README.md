# Aington

학교와 학과만 입력하면 전공 기반 커리어 인사이트를 보고, 나를 보완하는 학생과 모임까지 이어지는 커리어 네트워크 MVP입니다.
프론트엔드에서는 리포트, 온보딩, 네트워킹 전환을 제공하고, 백엔드에서는 커리큘럼 seed fallback, 프로필 토큰, 참여 의사 저장 흐름을 제공합니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)
![Postgres](https://img.shields.io/badge/Postgres-ready-4169E1?style=flat-square&logo=postgresql&logoColor=white)

## 핵심 기능

- 학교/학과 기반 커리어 인사이트 리포트 생성
- 추천 활동, 커리큘럼 강점/주의점, 학교별 비교 시그널 제공
- 심화 리포트는 결제보다 관심 등록/수요 검증 흐름으로 제공
- 관심사와 포트폴리오를 받는 가입/프로필 입력 플로우 및 서버 발급 프로필 토큰
- Prisma/Postgres 연결 시 프로필과 참여 의사 저장, 미연결 시 인메모리 MVP 저장소 fallback
- 비슷하거나 보완되는 학생 추천 카드와 모임 참여 의사 기록
- 커리큘럼 CSV가 없어도 버전관리 seed로 핵심 API 재현

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Monorepo | npm workspaces |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | CSS Modules가 아닌 전역 CSS, lucide-react 아이콘 |
| Backend | Node.js, Express 5, TypeScript, tsx |
| Database | Prisma, Postgres, in-memory MVP fallback |
| Tooling | ESLint, TypeScript compiler, npm scripts |

## 프로젝트 구조

```text
career-scope/
├── apps/
│   ├── api/                  # Express API 서버
│   │   ├── src/data/demo.ts  # 데모 인사이트 데이터
│   │   ├── src/data/curriculumSeed.ts # API 재현용 커리큘럼 seed
│   │   ├── src/index.ts      # API 엔트리포인트
│   │   └── src/models/       # Mongoose 모델
│   └── web/                  # Next.js 웹 앱
│       └── src/app/          # App Router 기반 화면
├── package.json              # 워크스페이스 스크립트
└── package-lock.json
```

## 빠른 시작

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- API health check: http://localhost:4000/health

`npm install` 중 로컬 postinstall 스크립트 문제를 만나면 아래 명령으로 설치할 수 있습니다.

```bash
npm install --ignore-scripts
```

## 환경 변수

Neon Postgres를 연결해서 커리큘럼, 프로필, 참여 의사를 저장하려면 예시 파일을 복사한 뒤 값을 조정합니다. `DATABASE_URL`이 없어도 API는 커리큘럼 seed와 인메모리 저장소로 동작합니다.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### apps/api/.env

```env
PORT=4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### apps/web/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`DATABASE_URL`이 있으면 API는 Neon Postgres를 우선 사용합니다. 없으면 인메모리 MVP 저장소와 커리큘럼 seed로 fallback되어 DB 없이도 리포트/가입/참여 의사 흐름을 확인할 수 있습니다.

### Neon 초기화

```bash
npm run prisma:generate --workspace @career-scope/api
npm run db:push --workspace @career-scope/api
npm run db:seed --workspace @career-scope/api
```

## 주요 스크립트

```bash
npm run dev        # API와 Web을 함께 실행
npm run dev:web    # Web만 실행
npm run dev:api    # API만 실행
npm run build      # API와 Web 빌드
npm run lint       # Web ESLint 검사
npm run typecheck  # 전체 워크스페이스 타입 검사
npm run data:collect --workspace @career-scope/api # 공식 웹 출처 수집/정제 QA
npm run data:collect:inha --workspace @career-scope/api # ADIGA 인하대 학과/교육과정 수집 QA
```

## API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/health` | 서버 상태와 저장소 모드 확인 |
| GET | `/api/insights?school=&department=` | 학교/학과 기반 데모 인사이트 반환 |
| POST | `/api/signup` | 사용자 프로필 저장 및 `profileId`, `profileToken` 발급 |
| POST | `/api/meeting-intents` | 추천 학생/모임 참여 의사 저장 |
| POST | `/api/events` | MVP funnel 이벤트 저장 |
| GET | `/api/funnel` | 리포트 조회 → 가입 → 추천 클릭 → 참여 의사 집계 |
| GET | `/api/intent-summary` | 추천 학생/모임 관심 표시를 PII 없이 집계 |
| GET | `/api/inha-departments` | 인하대 파일럿용 공식 모집단위/학과 catalog 확인 |
| GET | `/api/validation-status` | funnel, 저장소, 커리큘럼 출처 커버리지, QA 경고를 한 번에 확인 |
| GET | `/api/pilot-readiness` | private pilot 전 blocker/warning 체크리스트 확인 |
| GET | `/api/peers` | 추천 학생 데모 목록 반환 |

## 개발 메모

- 현재 데이터는 해커톤 MVP 검증용 seed와 데모 데이터입니다.
- 인하대 파일럿 데이터는 2026학년도 인하대학교 수시모집요강의 모집단위별 입학정원을 기준으로 모든 모집단위를 seed catalog에 넣었습니다.
- ADIGA 대입정보포털 학과정보를 보조 출처로 수집해 58개 인하대 모집단위는 공개 교육과정 과목명으로 seed를 대체했습니다.
- ADIGA가 비어 있던 18개 모집단위는 인하대학교 공식 수강신청 2026학년도 1학기 강의시간표를 추가 수집했고, 15개는 `inha-sugang-course-schedule`, 3개는 아직 `archetype-seed`로 명시합니다.
- `apps/api/src/data/webSourceCatalog.ts`는 공식 웹 출처 카탈로그이고, `data:collect`는 fetch 결과와 정제 경고를 JSON으로 출력합니다.
- 학생 검증 인터뷰는 `docs/student-test-scenarios.md`의 3개 시나리오를 기준으로 반복합니다.
- private pilot 직전에는 `docs/pilot-release-checklist.md`와 `/api/pilot-readiness`를 함께 확인합니다.
- Postgres를 연결하면 가입 프로필과 참여 의사는 Prisma 모델로 저장됩니다.
- 프론트엔드는 API가 꺼져 있어도 기본 리포트 fallback은 보여주지만, 서버 저장이 필요한 프로필/참여 의사 액션은 API 연결이 필요합니다.
