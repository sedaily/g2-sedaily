# Project Structure

## Directory Organization

### `/app` - Next.js 15 App Router
Next.js 15의 App Router 기반 페이지 및 API 라우트
- **`/admin/quiz`**: 관리자 패널 (퀴즈 관리, 배포 관리, 캐시 관리)
- **`/api`**: 서버리스 API Routes
  - `/api/admin`: 관리자 API (DynamoDB, CloudFront, CloudWatch)
  - `/api/chat`: AI 챗봇 프록시 API
  - `/api/quiz`: 퀴즈 데이터 API (날짜별, 전체 조회)
- **`/games`**: 게임 페이지
  - `/games/g1`: BlackSwan 게임
  - `/games/g2`: Prisoner's Dilemma 게임
  - `/games/g3`: Signal Decoding 게임
  - `/games/quizlet`: Card Matching 게임
- **`/test-chatbot`**: 챗봇 테스트 페이지
- **Root files**: layout.tsx, page.tsx, globals.css, error.tsx, loading.tsx, not-found.tsx

### `/components` - React 컴포넌트
재사용 가능한 UI 컴포넌트 라이브러리
- **`/admin`**: 관리자 전용 컴포넌트
  - CacheManager.tsx: localStorage 캐시 관리
  - DateSetList.tsx: 날짜별 퀴즈 목록
  - DeployManager.tsx: CloudFront 캐시 무효화, 메트릭 조회
  - PasswordModal.tsx: 관리자 인증
  - QuizEditor.tsx: 퀴즈 생성/수정
  - QuizletUploader.tsx: CSV 업로드
  - QuizPreview.tsx: 퀴즈 미리보기
  - ReviewList.tsx: 퀴즈 리뷰 목록
- **`/games`**: 게임 관련 컴포넌트
  - AIChatbot.tsx: RAG 기반 AI 챗봇 UI
  - BlackSwanQuizPlayer.tsx: BlackSwan 게임 플레이어
  - CardMatchingGame.tsx: 카드 매칭 게임 로직
  - GameCard.tsx: 게임 카드 UI
  - GameHubGrid.tsx: 게임 허브 그리드
  - QuizPlayer.tsx: 범용 퀴즈 플레이어
  - UniversalQuizPlayer.tsx: 통합 퀴즈 플레이어
  - QuizCompletion.tsx: 퀴즈 완료 화면
  - QuizIntroScreen.tsx: 퀴즈 시작 화면
  - QuizQuestion.tsx: 퀴즈 문제 UI
  - QuizSettingsPanel.tsx: 퀴즈 설정 패널
  - ProgressRippleIndicator.tsx: 진행 상태 표시
- **`/navigation`**: 네비게이션 컴포넌트
  - Footer.tsx: 푸터
  - SedailyHeader.tsx: 헤더
- **`/ui`**: Radix UI 기반 재사용 컴포넌트
  - 30+ UI 컴포넌트 (button, dialog, select, sidebar, toast 등)

### `/hooks` - Custom React Hooks
재사용 가능한 React 훅
- **useQuizKeyboard.ts**: 키보드 단축키 (1-4번 답변 선택, Enter 제출)
- **useQuizState.ts**: 퀴즈 상태 관리 (진행, 점수, localStorage 저장)
- **useRealtimeQuiz.ts**: 실시간 퀴즈 데이터 폴링 (30초 간격)
- **use-mobile.ts**: 모바일 감지
- **use-toast.ts**: Toast 알림

### `/lib` - Utility Libraries
핵심 비즈니스 로직 및 유틸리티
- **admin-utils.ts**: 관리자 유틸리티 (AWS SDK 래퍼)
- **bigkinds.ts**: BigKinds API 클라이언트
- **cache-manager.ts**: 캐시 관리 로직
- **chatbot-api.ts**: 챗봇 API 클라이언트
- **date-utils.ts**: 날짜 유틸리티
- **games-data.ts**: 게임 메타데이터
- **image-loader.js**: 커스텀 이미지 로더
- **quiz-api-client.ts**: 퀴즈 API 클라이언트
- **quiz-api.ts**: 퀴즈 API 로직
- **quiz-cache.ts**: 퀴즈 캐싱 로직
- **quiz-storage.ts**: localStorage 관리
- **quiz-themes.ts**: 게임별 테마 설정
- **utils.ts**: 범용 유틸리티 (cn, clsx)

### `/backend` - AWS Lambda Backend
Python 기반 서버리스 백엔드
- **`/lambda`**: Lambda 함수 소스
  - enhanced-chatbot-handler.py: RAG 챗봇 핸들러 (Claude 3 Sonnet + BigKinds)
  - auto-deploy-trigger.py: DynamoDB Streams 트리거 자동 배포
  - requirements.txt: Python 의존성
  - requirements-auto-deploy.txt: 자동 배포 의존성
- **serverless.yml**: Serverless Framework 설정
- **IMPROVEMENTS_APPLIED.md**: 백엔드 개선 이력

### `/aws` - AWS 통합 Lambda
통합 퀴즈 API Lambda 함수
- **`/unified-quiz-lambda`**: 퀴즈 CRUD API
  - quiz-handler.py: DynamoDB 퀴즈 CRUD 핸들러
  - requirements.txt: Python 의존성
  - deploy.sh: 배포 스크립트
  - test-api.sh: API 테스트 스크립트
  - test-data.json: 테스트 데이터

### `/scripts` - Deployment & Automation
배포 자동화 및 모니터링 스크립트
- **config.mjs**: 통합 설정 (AWS 리소스 ID, 경로)
- **utils.mjs**: 공통 유틸리티 함수
- **ultimate-deploy.mjs**: 전체 배포 (Frontend + Backend)
- **quick-deploy.mjs**: 빠른 Frontend 배포
- **deploy-backend.mjs**: Backend Lambda 배포
- **deploy-guard.mjs**: 배포 검증 (404 방지)
- **monitoring-dashboard.mjs**: 성능 모니터링 대시보드
- **auto-redeploy.mjs**: 자동 재배포 시스템
- **aws-setup.mjs**: AWS 인프라 설정 (CloudWatch, SNS)
- **notification.mjs**: Slack/Discord 알림
- **deploy-monitor.mjs**: 배포 모니터링

### `/docs` - Documentation
프로젝트 문서
- **404_PREVENTION.md**: 404 에러 방지 가이드
- **ADMIN_DEPLOY.md**: 관리자 페이지 통합 가이드
- **ADMIN_USAGE.md**: 관리자 사용 가이드
- **AWS_OPTIMIZATION.md**: AWS 최적화 가이드
- **BACKEND_ARCHITECTURE.md**: 백엔드 아키텍처
- **DEPLOYMENT_ARCHITECTURE.md**: 배포 아키텍처
- **DEPLOYMENT.md**: 배포 가이드
- **DYNAMIC_DEPLOYMENT.md**: 동적 배포 가이드
- **MONITORING.md**: 모니터링 가이드
- **TROUBLESHOOTING.md**: 트러블슈팅 가이드

### `/types` - TypeScript Types
TypeScript 타입 정의
- **quiz.ts**: 퀴즈 관련 타입 (Quiz, QuizSet, QuizletCard)
- **shims-recharts-vaul.d.ts**: 외부 라이브러리 타입 선언

### `/public` - Static Assets
정적 파일 (이미지, 아이콘, 문서)
- **`/backgrounds`**: 게임 배경 이미지 (WebP 최적화)
- **`/games`**: 게임 히어로 이미지
- **`/icons`**: 게임 아이콘 (woodcut 스타일)
- **`/images`**: 게임 썸네일 및 로고 (WebP 최적화)
- **404.html**: 커스텀 404 페이지
- **robots.txt**: SEO 설정
- **sitemap.xml**: 사이트맵
- **sample-quizlet.csv**: Quizlet CSV 샘플

### `/.deploy-logs` - Deployment Logs
배포 로그 (JSON 형식, 타임스탬프별)

### `/.github` - GitHub Configuration
- **`/workflows`**: GitHub Actions (deploy.yml)
- **ISSUE_TEMPLATE**: 이슈 템플릿
- **PULL_REQUEST_TEMPLATE.md**: PR 템플릿

## Core Components & Relationships

### Frontend Architecture
```
app/layout.tsx (Root Layout)
├── app/page.tsx (Home - GameHubGrid)
├── app/games/page.tsx (Games Hub)
│   ├── app/games/g1/page.tsx (BlackSwan)
│   │   └── components/games/BlackSwanQuizPlayer.tsx
│   ├── app/games/g2/page.tsx (Prisoner's Dilemma)
│   │   └── components/games/UniversalQuizPlayer.tsx
│   ├── app/games/g3/page.tsx (Signal Decoding)
│   │   └── components/games/UniversalQuizPlayer.tsx
│   └── app/games/quizlet/page.tsx (Card Matching)
│       └── components/games/QuizletMatchGame.tsx
├── app/admin/quiz/page.tsx (Admin Panel)
│   ├── components/admin/QuizEditor.tsx
│   ├── components/admin/DeployManager.tsx
│   └── components/admin/CacheManager.tsx
└── app/test-chatbot/page.tsx (Chatbot Test)
    └── components/games/AIChatbot.tsx
```

### API Architecture
```
app/api/
├── chat/route.ts (Chatbot Proxy)
│   └── backend/lambda/enhanced-chatbot-handler.py
├── quiz/
│   ├── route.ts (All Quizzes)
│   ├── [date]/route.ts (Date-specific Quiz)
│   └── aws/unified-quiz-lambda/quiz-handler.py
└── admin/
    ├── cache/route.ts (Cache Invalidation)
    ├── metrics/route.ts (CloudWatch Metrics)
    └── lib/admin-utils.ts (AWS SDK)
```

### Data Flow
```
User Request
  ↓
Next.js API Route (app/api)
  ↓
AWS Lambda (backend/lambda or aws/unified-quiz-lambda)
  ↓
DynamoDB (sedaily-quiz-data)
  ↓
DynamoDB Streams
  ↓
Auto-Deploy Lambda (backend/lambda/auto-deploy-trigger.py)
  ↓
CloudFront Invalidation
  ↓
SNS Notification (Slack/Discord)
```

### Caching Strategy
```
Level 1: localStorage (Client-side)
  ↓ (miss)
Level 2: Next.js API Route Cache (Server-side)
  ↓ (miss)
Level 3: DynamoDB Query (Database)
```

## Architectural Patterns

### 1. App Router Pattern (Next.js 15)
- 파일 시스템 기반 라우팅
- Server Components 기본, Client Components 명시적 선언
- API Routes를 통한 서버리스 API

### 2. Component Composition
- Atomic Design 원칙 (ui → games → admin)
- Radix UI 기반 접근성 우선 컴포넌트
- Compound Component Pattern (QuizPlayer + QuizQuestion)

### 3. Custom Hooks Pattern
- 비즈니스 로직 분리 (useQuizState, useRealtimeQuiz)
- 재사용 가능한 상태 관리
- localStorage 통합

### 4. RAG (Retrieval-Augmented Generation)
- 3단계 지식 통합 (BigKinds + 퀴즈 컨텍스트 + 기사 URL)
- Intelligent Fallback (API 실패 시 순수 Claude)
- 게임별 전문화된 프롬프트

### 5. Serverless Architecture
- AWS Lambda (Python 3.11)
- DynamoDB (NoSQL)
- CloudFront (CDN)
- API Gateway (REST API)

### 6. Event-Driven Architecture
- DynamoDB Streams → Lambda Trigger
- CloudWatch Events → SNS → Slack/Discord
- 30초 폴링 (Client-side)

### 7. Infrastructure as Code
- Serverless Framework (serverless.yml)
- AWS SDK (JavaScript/Python)
- 배포 스크립트 자동화 (scripts/)

## Key Design Decisions

### 1. 동적 사이트 전환 (v2.5.0)
- **이유**: 관리자-사용자 실시간 소통 필요
- **방법**: output: 'export' 제거, API Routes 활성화
- **트레이드오프**: 정적 사이트 대비 복잡도 증가, Vercel/Amplify 의존

### 2. 30초 폴링 (vs WebSocket)
- **이유**: 구현 단순성, 서버리스 친화적
- **방법**: useRealtimeQuiz 훅 + setInterval
- **트레이드오프**: 실시간성 약간 낮음, 서버 부하 낮음

### 3. DynamoDB Streams 자동 배포
- **이유**: 수동 배포 제거, 즉각적 반영
- **방법**: Streams → Lambda → CloudFront Invalidation
- **트레이드오프**: 복잡도 증가, 안정성 향상

### 4. 3단계 캐싱
- **이유**: 성능 최적화, API 호출 최소화
- **방법**: localStorage → API Cache → DynamoDB
- **트레이드오프**: 캐시 무효화 복잡도

### 5. WebP 이미지 최적화
- **이유**: 90% 용량 감소
- **방법**: PNG → WebP 변환
- **트레이드오프**: 구형 브라우저 호환성 (fallback 필요)
