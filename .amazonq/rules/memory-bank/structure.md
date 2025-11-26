# Project Structure

## Directory Organization

### Frontend (Next.js App Router)
```
app/
├── admin/quiz/          # 관리자 퀴즈 관리 페이지
├── api/                 # API 라우트 (정적 빌드에서 제외)
│   ├── admin/          # 관리자 API 엔드포인트
│   ├── chat/           # 챗봇 API 프록시
│   └── quiz/           # 퀴즈 API 프록시
├── games/              # 게임 페이지
│   ├── g1/            # BlackSwan 게임
│   ├── g2/            # Prisoner's Dilemma 게임
│   ├── g3/            # Signal Decoding 게임
│   ├── g4/            # 예비 게임 슬롯
│   └── quizlet/       # Card Matching 게임
├── test-chatbot/       # 챗봇 테스트 페이지
├── layout.tsx          # 루트 레이아웃
├── page.tsx            # 메인 랜딩 페이지
└── globals.css         # 전역 스타일
```

### Components
```
components/
├── admin/              # 관리자 전용 컴포넌트
│   ├── QuizEditor.tsx      # 퀴즈 작성 에디터
│   ├── QuizList.tsx        # 퀴즈 목록 및 삭제
│   ├── QuizletUploader.tsx # CSV 업로드
│   ├── CacheManager.tsx    # 캐시 관리
│   └── DeployManager.tsx   # 배포 가이드
├── games/              # 게임 관련 컴포넌트
│   ├── QuizPlayer.tsx          # 범용 퀴즈 플레이어
│   ├── BlackSwanQuizPlayer.tsx # g1 전용 플레이어
│   ├── QuizletMatchGame.tsx    # Quizlet 게임 로직
│   ├── AIChatbot.tsx           # AI 챗봇 UI
│   ├── ArchiveCard.tsx         # Archive 날짜 카드
│   └── GameCard.tsx            # 게임 선택 카드
├── navigation/         # 네비게이션 컴포넌트
│   ├── SedailyHeader.tsx   # 헤더
│   └── Footer.tsx          # 푸터
└── ui/                 # Radix UI 기반 재사용 컴포넌트
    ├── button.tsx
    ├── dialog.tsx
    ├── sidebar.tsx
    └── [30+ UI components]
```

### Backend (AWS Lambda)
```
backend/lambda/
├── enhanced-chatbot-handler.py  # RAG 챗봇 Lambda (Python 3.11)
├── auto-deploy-trigger.py       # 자동 배포 트리거
├── requirements.txt             # Python 의존성
└── requirements-auto-deploy.txt

aws/quiz-lambda/
├── handler.py           # 퀴즈 CRUD Lambda (Python 3.11)
├── deploy.sh           # Lambda 배포 스크립트
├── setup-api-gateway.sh # API Gateway 설정
└── trust-policy.json   # IAM 정책
```

### Library & Utilities
```
lib/
├── quiz-api-client.ts   # Lambda API 클라이언트 (no-store 캐시)
├── chatbot-api.ts       # 챗봇 API 클라이언트
├── admin-utils.ts       # 관리자 유틸리티
├── bigkinds.ts          # BigKinds API 연동
├── games-data.ts        # 게임 메타데이터
├── quiz-themes.ts       # 게임별 테마 설정
└── utils.ts             # 공통 유틸리티

hooks/
├── useQuizState.ts      # 퀴즈 상태 관리
├── useQuizKeyboard.ts   # 키보드 단축키
└── useRealtimeQuiz.ts   # 실시간 퀴즈 로딩

types/
├── quiz.ts              # 퀴즈 타입 정의
└── shims-recharts-vaul.d.ts
```

### Configuration & Scripts
```
scripts/
├── deploy.sh            # 프론트엔드 배포 (S3 + CloudFront)
├── build-export.mjs     # 정적 빌드 스크립트
├── config.mjs           # 배포 설정
└── utils.mjs            # 배포 유틸리티

docs/
├── DEPLOYMENT.md                # 배포 가이드
├── DYNAMIC_QUIZ_SETUP.md        # 동적 퀴즈 설정
├── BACKEND_ARCHITECTURE.md      # 백엔드 아키텍처
├── DEPLOYMENT_ARCHITECTURE.md   # 배포 아키텍처
└── TROUBLESHOOTING.md           # 트러블슈팅
```

## Core Components Relationships

### 1. 퀴즈 플레이 플로우
```
User → GameCard → QuizPlayer → quiz-api-client → API Gateway → Lambda → DynamoDB
                              ↓
                         AIChatbot → chatbot-api → Lambda → Bedrock + BigKinds
```

### 2. 관리자 퀴즈 생성 플로우
```
Admin → QuizEditor → admin-utils → API Gateway → Lambda → DynamoDB
```

### 3. Archive 조회 플로우
```
User → Archive Page → quiz-api-client.getDates() → Lambda → DynamoDB
                   ↓
              ArchiveCard → quiz-api-client.getQuiz() → Lambda → DynamoDB
```

## Architectural Patterns

### 1. 하이브리드 렌더링
- **정적 페이지**: 게임 UI, 레이아웃, 네비게이션 (SSG)
- **동적 데이터**: 퀴즈 콘텐츠, 챗봇 응답 (API)
- **이점**: 빠른 로딩 + 실시간 업데이트

### 2. 서버리스 아키텍처
- **Frontend**: S3 + CloudFront (정적 호스팅)
- **Backend**: Lambda + API Gateway (서버리스 API)
- **Database**: DynamoDB (NoSQL)
- **AI**: AWS Bedrock (Claude 3 Sonnet)

### 3. 컴포넌트 계층 구조
```
Layout (app/layout.tsx)
├── Navigation (SedailyHeader, Footer)
├── Page (app/games/[gameType]/page.tsx)
│   ├── Game Components (QuizPlayer, BlackSwanQuizPlayer)
│   │   ├── UI Components (Button, Dialog, Card)
│   │   └── Hooks (useQuizState, useQuizKeyboard)
│   └── AIChatbot
└── Theme Provider
```

### 4. 상태 관리 패턴
- **로컬 상태**: React useState (UI 상태)
- **커스텀 훅**: useQuizState (퀴즈 로직)
- **API 상태**: fetch + no-store 캐시 (실시간 데이터)
- **테마**: next-themes (다크모드)

### 5. 타입 안전성
- **TypeScript 5**: 전체 코드베이스 타입 정의
- **types/quiz.ts**: 퀴즈 데이터 구조 중앙 관리
- **API 응답**: 타입 가드로 런타임 검증

## Key Design Decisions

### 1. 정적 빌드 + 동적 API
- 게임 UI는 변경 빈도가 낮아 정적 생성
- 퀴즈 데이터는 자주 변경되어 API로 분리
- CloudFront 캐싱으로 글로벌 성능 최적화

### 2. Lambda 함수 분리
- **quiz-lambda**: 퀴즈 CRUD (us-east-1)
- **chatbot-lambda**: AI 챗봇 (ap-northeast-2)
- 각 기능별 독립적 배포 및 스케일링

### 3. no-store 캐시 정책
- Archive 페이지에서 최신 퀴즈 즉시 반영
- force-cache 문제 해결 (v2.8.1)

### 4. Radix UI 기반 컴포넌트
- 접근성 (a11y) 기본 지원
- 커스터마이징 용이
- Tailwind CSS와 완벽 통합
