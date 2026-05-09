# Aington

학교와 학과만 입력하면 전공 기반 커리어 인사이트를 빠르게 보여주는 해커톤 MVP입니다.  
프론트엔드에서는 사용자가 학교/학과를 선택해 리포트를 확인하고, 백엔드에서는 데모 인사이트와 가입 프로필 저장 흐름을 제공합니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-ready-47A248?style=flat-square&logo=mongodb&logoColor=white)

## 핵심 기능

- 학교/학과 기반 커리어 인사이트 리포트 생성
- 추천 활동, 커리큘럼 강점/주의점, 학교별 비교 시그널 제공
- 유료 리포트 전환을 가정한 잠금 영역 UI
- 관심사와 포트폴리오를 받는 가입/프로필 입력 플로우
- MongoDB 연결 시 프로필 저장, 미연결 시 인메모리 데모 저장소 자동 fallback
- 비슷한 목표를 가진 학생 추천 카드 제공

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Monorepo | npm workspaces |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | CSS Modules가 아닌 전역 CSS, lucide-react 아이콘 |
| Backend | Node.js, Express 5, TypeScript, tsx |
| Database | MongoDB, Mongoose |
| Tooling | ESLint, TypeScript compiler, npm scripts |

## 프로젝트 구조

```text
career-scope/
├── apps/
│   ├── api/                  # Express API 서버
│   │   ├── src/data/demo.ts  # 데모 인사이트 데이터
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

Neon Postgres를 연결해서 커리큘럼과 프로필을 저장하려면 예시 파일을 복사한 뒤 값을 조정합니다.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### apps/api/.env

```env
PORT=4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
MONGODB_URI=mongodb://localhost:27017/career-scope
```

### apps/web/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`DATABASE_URL`이 있으면 API는 Neon Postgres를 우선 사용합니다. 없으면 MongoDB, 인메모리 데모 저장소 순서로 fallback되어 DB 없이도 해커톤 시연 흐름을 바로 확인할 수 있습니다.

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
```

## API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/health` | 서버 상태와 저장소 모드 확인 |
| GET | `/api/insights?school=&department=` | 학교/학과 기반 데모 인사이트 반환 |
| POST | `/api/signup` | 사용자 프로필 저장 |
| GET | `/api/peers` | 추천 학생 데모 목록 반환 |

## 개발 메모

- 현재 데이터는 해커톤 MVP용 데모 데이터입니다.
- MongoDB를 연결하면 가입 프로필은 `Profile` 모델로 저장됩니다.
- 프론트엔드는 API가 꺼져 있어도 fallback 인사이트로 시연이 이어지도록 구성되어 있습니다.
