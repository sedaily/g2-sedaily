# Technology Stack

## Programming Languages

### Frontend
- **TypeScript 5**: 타입 안전성, 최신 ES 기능
- **JavaScript (ES6+)**: 유틸리티 스크립트, 이미지 로더
- **CSS**: Tailwind CSS 4.1.9 (PostCSS 기반)

### Backend
- **Python 3.11**: AWS Lambda 런타임
  - boto3: AWS SDK
  - requests: HTTP 클라이언트
  - json, os, logging: 표준 라이브러리

## Core Frameworks & Libraries

### Frontend Framework
- **Next.js 15.2.4**: React 메타 프레임워크
  - App Router (파일 시스템 기반 라우팅)
  - API Routes (서버리스 API)
  - Server Components & Client Components
  - Image Optimization (커스텀 로더)
  - Incremental Static Regeneration (ISR)

### UI Framework
- **React 19**: UI 라이브러리
  - Hooks (useState, useEffect, useCallback, useMemo)
  - Context API (ThemeProvider)
  - Suspense & Error Boundaries

### UI Component Library
- **Radix UI**: 접근성 우선 헤드리스 컴포넌트
  - @radix-ui/react-dialog
  - @radix-ui/react-select
  - @radix-ui/react-toast
  - @radix-ui/react-tooltip
  - @radix-ui/react-navigation-menu
  - 20+ 추가 컴포넌트

### Styling
- **Tailwind CSS 4.1.9**: 유틸리티 우선 CSS 프레임워크
  - @tailwindcss/postcss: PostCSS 플러그인
  - tailwindcss-animate: 애니메이션 유틸리티
  - tailwind-merge: 클래스 병합 유틸리티
- **Framer Motion**: 애니메이션 라이브러리
- **class-variance-authority (CVA)**: 조건부 스타일링
- **clsx**: 클래스 이름 조합

### State Management
- **React Hooks**: 로컬 상태 관리
- **localStorage**: 클라이언트 영속성
- **Custom Hooks**: 비즈니스 로직 캡슐화
  - useQuizState: 퀴즈 상태 관리
  - useRealtimeQuiz: 실시간 데이터 폴링
  - useQuizKeyboard: 키보드 단축키

### Form Handling
- **react-hook-form**: 폼 상태 관리 및 검증

### Date Handling
- **date-fns**: 날짜 유틸리티 라이브러리

### Icons
- **lucide-react 0.454.0**: 아이콘 라이브러리

### Analytics
- **@vercel/analytics**: Vercel 분석 도구

## Backend Technologies

### AI & Machine Learning
- **AWS Bedrock**: Claude 3 Sonnet 호스팅
  - 모델: anthropic.claude-3-sonnet-20240229-v1:0
  - Region: us-east-1
  - Max Tokens: 4096
  - Temperature: 0.7

### External APIs
- **BigKinds API**: 경제 뉴스 검색
  - 최신 30일 뉴스
  - 키워드 기반 검색
  - 날짜 범위 필터링

### Serverless Functions
- **AWS Lambda**: 서버리스 컴퓨팅
  - Runtime: Python 3.11
  - Region: us-east-1
  - Functions:
    - sedaily-chatbot-dev-handler (RAG 챗봇)
    - g2-auto-deploy-trigger (자동 배포)
    - unified-quiz-api (퀴즈 CRUD)

### Database
- **AWS DynamoDB**: NoSQL 데이터베이스
  - Table: sedaily-quiz-data
  - Partition Key: date (String)
  - Sort Key: gameType (String)
  - Streams: Enabled (NEW_AND_OLD_IMAGES)
  - Indexes: GSI for efficient queries

### Infrastructure
- **AWS CloudFront**: CDN
  - Distribution ID: E8HKFQFSQLNHZ
  - Cache Invalidation: /* (전체)
- **AWS S3**: 정적 파일 호스팅 (백업)
  - Bucket: g2-frontend-ver2
- **AWS CloudWatch**: 모니터링 & 로깅
  - Logs: Lambda 실행 로그
  - Metrics: DynamoDB, Lambda 메트릭
  - Alarms: 에러율, 지연시간
  - Dashboard: 통합 모니터링
- **AWS SNS**: 알림 시스템
  - Topic: g2-notifications
  - Subscribers: Slack, Discord

### Deployment Platforms
- **Vercel**: 권장 배포 플랫폼
  - 자동 빌드 & 배포
  - Edge Functions
  - Analytics
- **AWS Amplify**: 대체 배포 플랫폼
  - GitHub 연동
  - 자동 배포
  - 환경 변수 관리

## Build Tools & Package Management

### Package Manager
- **pnpm**: 빠르고 효율적인 패키지 관리자
  - Workspace 지원
  - 디스크 공간 절약
  - 빠른 설치 속도

### Build System
- **Next.js Build**: 프로덕션 빌드
  - Webpack 5 기반
  - Tree Shaking
  - Code Splitting
  - Minification

### Linting & Formatting
- **ESLint 8**: JavaScript/TypeScript 린터
  - eslint-config-next: Next.js 권장 설정
  - @eslint/eslintrc: ESLint 설정
- **TypeScript Compiler**: 타입 체크
  - strict: true
  - noEmit: true (Next.js가 빌드 담당)

### Deployment Automation
- **Serverless Framework**: Lambda 배포
  - serverless.yml: 인프라 정의
  - Plugins: serverless-python-requirements
- **Custom Scripts**: 배포 자동화
  - ultimate-deploy.mjs: 전체 배포
  - quick-deploy.mjs: 빠른 배포
  - deploy-backend.mjs: 백엔드 배포

## AWS SDK Integration

### Frontend (JavaScript)
- **@aws-sdk/client-dynamodb**: DynamoDB 클라이언트
- **@aws-sdk/lib-dynamodb**: DynamoDB Document 클라이언트
- **@aws-sdk/client-cloudfront**: CloudFront 클라이언트
- **@aws-sdk/client-cloudwatch**: CloudWatch 클라이언트

### Backend (Python)
- **boto3**: AWS SDK for Python
  - bedrock-runtime: Claude 3 Sonnet 호출
  - dynamodb: DynamoDB 작업
  - cloudfront: 캐시 무효화
  - sns: 알림 발송

## Development Commands

### Installation
```bash
pnpm install              # 의존성 설치
```

### Development
```bash
pnpm dev                  # 개발 서버 (http://localhost:3000)
pnpm lint                 # ESLint 실행
```

### Build
```bash
pnpm build                # 프로덕션 빌드
pnpm build:export         # 정적 사이트 빌드 (deprecated)
pnpm start                # 프로덕션 서버 실행
```

### Deployment
```bash
# Frontend
vercel                    # Vercel 개발 배포
vercel --prod             # Vercel 프로덕션 배포
pnpm deploy               # 전체 배포 (Frontend + Backend)
pnpm deploy:quick         # 빠른 Frontend 배포
pnpm deploy:full          # 전체 배포 (검증 포함)

# Backend
pnpm deploy:backend       # Lambda 배포
cd backend && serverless deploy  # Serverless Framework 직접 배포
cd aws/unified-quiz-lambda && ./deploy.sh  # 퀴즈 API 배포
```

### Monitoring & Automation
```bash
pnpm monitor:dashboard    # 성능 대시보드 (CLI)
pnpm monitor:watch        # 실시간 모니터링
pnpm monitor:html         # HTML 대시보드 생성
pnpm auto:redeploy        # 자동 재배포 시작
pnpm auto:force           # 강제 재배포
pnpm notify:test          # 알림 테스트
```

### AWS Management
```bash
pnpm aws:setup            # AWS 인프라 설정 (CloudWatch, SNS)
pnpm aws:dashboard        # CloudWatch 대시보드 생성
pnpm aws:status           # AWS 상태 확인
pnpm cloudfront:invalidate  # CloudFront 캐시 무효화
```

### Verification
```bash
pnpm verify:build         # 빌드 검증
pnpm guard:emergency      # 응급 복구
```

### Testing
```bash
cd aws/unified-quiz-lambda && ./test-api.sh  # 퀴즈 API 테스트
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_CHATBOT_API_URL=https://api.g2.sedaily.ai/dev/chat
NEXT_PUBLIC_QUIZ_API_URL=https://api.g2.sedaily.ai/dev/quizzes/all
```

### Backend (Lambda Environment)
```env
BIGKINDS_API_KEY=your_key
DYNAMODB_TABLE=sedaily-quiz-data
AWS_REGION=us-east-1
```

### AWS Credentials (~/.aws/credentials)
```ini
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
region=us-east-1
```

## Version Information
- **Project Version**: 2.5.0
- **Node.js**: 22+ (권장)
- **pnpm**: 8+ (권장)
- **Python**: 3.11 (Lambda 런타임)
- **AWS CLI**: 2+ (배포 스크립트용)

## Performance Optimizations
- **Image Optimization**: PNG → WebP (90% 감소)
- **Code Splitting**: Next.js 자동 코드 분할
- **Tree Shaking**: 미사용 코드 제거
- **Minification**: JavaScript/CSS 압축
- **CDN**: CloudFront 글로벌 배포
- **Caching**: 3단계 캐싱 (localStorage + API + DynamoDB)
- **Lazy Loading**: 컴포넌트 지연 로딩
- **Package Optimization**: optimizePackageImports (lucide-react, Radix UI)

## Security
- **IAM**: 최소 권한 원칙
- **Environment Variables**: 민감 정보 분리
- **HTTPS**: CloudFront SSL/TLS
- **CORS**: API Routes CORS 설정
- **Input Validation**: 폼 검증 (react-hook-form)
- **XSS Protection**: React 자동 이스케이핑
- **Secrets Masking**: 로그에서 민감 정보 마스킹
