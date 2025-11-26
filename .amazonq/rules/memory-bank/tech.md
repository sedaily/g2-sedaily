# Technology Stack

## Programming Languages

### Frontend
- **TypeScript 5**: 전체 프론트엔드 코드베이스
- **JavaScript (ESM)**: 빌드 스크립트 및 설정 파일
- **CSS**: Tailwind CSS 4.1.9 기반 스타일링

### Backend
- **Python 3.11**: Lambda 함수 (chatbot, quiz API)
- **Node.js**: 빌드 도구 및 스크립트

## Core Framework & Runtime

### Next.js 15.2.4
- **App Router**: 파일 기반 라우팅
- **React 19**: 최신 React 기능 활용
- **Static Export**: `output: 'export'` 설정으로 정적 사이트 생성
- **Image Optimization**: 커스텀 이미지 로더 (S3 경로)

### Build Configuration
```json
{
  "target": "ES6",
  "module": "esnext",
  "moduleResolution": "bundler",
  "jsx": "preserve"
}
```

## UI & Styling

### Tailwind CSS 4.1.9
- **PostCSS 플러그인**: `@tailwindcss/postcss`
- **애니메이션**: `tailwindcss-animate`, `tw-animate-css`
- **유틸리티**: `tailwind-merge`, `clsx`, `class-variance-authority`

### Component Libraries
- **Radix UI**: 30+ 접근성 기반 UI 프리미티브
  - Dialog, Popover, Select, Tooltip, Tabs 등
- **Lucide React**: 아이콘 라이브러리
- **Framer Motion**: 애니메이션 및 트랜지션
- **Embla Carousel**: 캐러셀 컴포넌트

## Backend & Infrastructure

### AWS Services
- **Lambda**: Python 3.11 런타임
  - `sedaily-chatbot-dev-handler` (ap-northeast-2)
  - `sedaily-quiz-api` (us-east-1)
- **API Gateway**: REST API 엔드포인트
- **DynamoDB**: `sedaily-quiz-data` 테이블
- **S3**: `g2-frontend-ver2` 버킷 (정적 호스팅)
- **CloudFront**: CDN 배포 (Distribution ID: E8HKFQFSQLNHZ)
- **Bedrock**: Claude 3 Sonnet AI 모델

### AWS SDK
```json
{
  "@aws-sdk/client-cloudfront": "^3.937.0",
  "@aws-sdk/client-cloudwatch": "^3.936.0",
  "@aws-sdk/client-dynamodb": "^3.936.0",
  "@aws-sdk/lib-dynamodb": "^3.936.0"
}
```

## External APIs

### BigKinds API
- 한국언론진흥재단 뉴스 검색 API
- 최근 30일 경제 뉴스 검색
- RAG 챗봇 컨텍스트 제공

## Development Tools

### Package Manager
- **pnpm**: 빠른 의존성 관리

### Linting & Type Checking
- **ESLint 8**: `eslint-config-next` 설정
- **TypeScript Compiler**: 엄격 모드 활성화

### Build System
- **Next.js Build**: `next build` (정적 export)
- **Custom Scripts**: `scripts/build-export.mjs`

## Key Dependencies

### State & Form Management
- **react-hook-form**: 폼 상태 관리
- **date-fns**: 날짜 유틸리티

### UI Enhancements
- **next-themes**: 다크모드 지원
- **sonner**: 토스트 알림
- **cmdk**: 커맨드 팔레트
- **input-otp**: OTP 입력 컴포넌트

### Analytics
- **@vercel/analytics**: 사용자 분석

## Development Commands

### Local Development
```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm build:export     # 정적 사이트 빌드
```

### Deployment
```bash
pnpm deploy           # 프론트엔드 배포 (S3 + CloudFront)
./scripts/deploy.sh   # Bash 배포 스크립트

# Backend
cd aws/quiz-lambda
./deploy.sh           # Lambda 함수 배포
./setup-api-gateway.sh # API Gateway 설정
```

### Verification
```bash
pnpm verify:build     # 빌드 결과 확인
pnpm verify:env       # 환경 변수 확인
pnpm aws:status       # AWS 리소스 상태 확인
```

### Cache Management
```bash
pnpm cloudfront:invalidate  # CloudFront 캐시 무효화
```

## Environment Variables

### Required (.env.local)
```env
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz
NEXT_PUBLIC_CHATBOT_API_URL=https://vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com/dev/chat
```

### Build-time Injection
- `.env.local` 파일이 빌드 시 자동 포함
- `NEXT_PUBLIC_` 접두사로 클라이언트 노출

## Version Information

### Current Version
- **Project**: v2.8.1
- **Next.js**: 15.2.4
- **React**: 19
- **TypeScript**: 5
- **Tailwind CSS**: 4.1.9

### Browser Support
- ES6+ 지원 브라우저
- 모던 브라우저 (Chrome, Firefox, Safari, Edge)

## Performance Optimizations

### Frontend
- Static Site Generation (SSG)
- CloudFront CDN 글로벌 배포
- WebP 이미지 포맷
- Code splitting (Next.js 자동)

### Backend
- Lambda 콜드 스타트 최적화
- DynamoDB 쿼리 최적화
- API Gateway 캐싱 (선택적)

### Caching Strategy
- **정적 자산**: CloudFront 장기 캐싱
- **퀴즈 데이터**: `cache: "no-store"` (실시간 반영)
- **이미지**: S3 + CloudFront 캐싱

## Security

### Authentication
- 관리자 페이지: 비밀번호 기반 인증
- API: CORS 설정 (API Gateway)

### Data Protection
- HTTPS 전송 (CloudFront)
- 환경 변수로 민감 정보 관리
- IAM 역할 기반 Lambda 권한
