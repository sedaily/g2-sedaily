# 서울경제 뉴스게임 플랫폼

경제 뉴스를 기반으로 한 인터랙티브 퀴즈 게임 플랫폼입니다.

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://d37wz4zxwakwl0.cloudfront.net)
[![GitHub](https://img.shields.io/badge/GitHub-sedaily/g2--clone-blue)](https://github.com/sedaily/g2-clone)
[![AWS](https://img.shields.io/badge/AWS-Lambda%20%2B%20CloudFront-orange)](https://aws.amazon.com/)

**🌐 Live Demo:** https://d37wz4zxwakwl0.cloudfront.net

## 🎮 게임 종류

- **BlackSwan (g1)**: 경제 이벤트 예측 게임
- **Prisoner's Dilemma (g2)**: 경제 딜레마 상황 게임  
- **Signal Decoding (g3)**: 경제 신호 해석 게임

## 🏗 아키텍처

### Frontend (Next.js 15.2.4)
**정적 사이트 생성 (Static Site Generation)**
- **App Router**: 최신 Next.js 라우팅 시스템
- **Static Export**: 완전 정적 파일 생성 (`out/` 폴더)
- **API Routes**: 내부 챗봇 프록시 API (`/api/chat`)

```bash
pnpm dev              # 개발 서버 (http://localhost:3000)
pnpm build:export     # 정적 파일 생성 (out 폴더)
pnpm quick-deploy     # 빌드 + S3 + CloudFront 배포
```

### Backend (Lambda Architecture)
**Enhanced RAG Chatbot (Python)**
- **Function**: `sedaily-chatbot-dev-handler`
- **Runtime**: Python 3.11
- **AI Engine**: Claude 3 Sonnet (AWS Bedrock)
- **RAG Sources**: BigKinds API + 퀴즈 컨텍스트 + 관련 기사
- **Fallback**: BigKinds 실패 시 순수 Claude 응답
- **Handler**: `enhanced-chatbot-handler.lambda_handler`

## 🔧 기술 스택

### Frontend
- **Framework**: Next.js 15.2.4 (App Router, Static Export)
- **Runtime**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4.1.9, Framer Motion
- **UI Components**: Radix UI (완전한 컴포넌트 라이브러리)
- **Package Manager**: pnpm
- **State Management**: React Hooks + localStorage

### Backend
- **Serverless**: AWS Lambda (Python 3.11)
- **Function**: `sedaily-chatbot-dev-handler`
- **AI Engine**: Claude 3 Sonnet (AWS Bedrock)
- **RAG System**: 3단계 지식 통합
  - BigKinds API (30일 경제 뉴스)
  - 퀴즈 관련 기사 URL
  - 퀴즈 문제 컨텍스트
- **Intelligent Fallback**: API 실패 시 순수 Claude 응답

### Infrastructure
- **Hosting**: AWS CloudFront + S3 (정적 호스팅)
- **CDN**: CloudFront Distribution
- **CI/CD**: GitHub Actions
- **Build**: Static Site Generation
- **Deployment**: 자동화된 스크립트 (quick-deploy, full-deploy)

## 📁 프로젝트 구조

```
g2-clone/
├── app/                    # Next.js 15 App Router
│   ├── admin/quiz/        # 퀴즈 관리 도구 (비밀번호 보호)
│   ├── games/             # 게임 페이지
│   │   ├── g1/           # BlackSwan 게임
│   │   ├── g2/           # Prisoner's Dilemma 게임
│   │   └── g3/           # Signal Decoding 게임
│   ├── api/chat/         # 챗봇 프록시 API Routes
│   ├── test-chatbot/     # 챗봇 테스트 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 홈페이지
├── components/            # React 컴포넌트
│   ├── games/            # 게임 관련 컴포넌트
│   │   ├── AIChatbot.tsx        # RAG 기반 AI 챗봇
│   │   ├── UniversalQuizPlayer.tsx  # 통합 퀴즈 플레이어
│   │   ├── GameCard.tsx         # 게임 카드
│   │   └── QuizPlayer.tsx       # 기본 퀴즈 플레이어
│   ├── admin/            # 관리자 컴포넌트
│   │   ├── QuizEditor.tsx       # 퀴즈 에디터
│   │   └── PasswordModal.tsx    # 비밀번호 모달
│   ├── ui/              # Radix UI 기반 컴포넌트 (25개+)
│   └── navigation/       # 헤더, 푸터
├── lib/                  # 유틸리티 라이브러리
│   ├── chatbot-api.ts   # 챗봇 API 클라이언트
│   ├── quiz-storage.ts  # localStorage 퀴즈 상태 관리
│   ├── quiz-api.ts      # 퀴즈 데이터 API
│   └── games-data.ts    # 게임 메타데이터
├── backend/              # Python Lambda (Serverless)
│   ├── lambda/
│   │   └── enhanced-chatbot-handler.py  # RAG 기반 Claude 챗봇
│   └── serverless.yml   # Serverless Framework 설정
├── aws/chatbot-lambda/   # Node.js Lambda (미사용)
│   ├── index.js         # 기본 Claude 챗봇
│   └── package.json     # Node.js 의존성
├── scripts/              # 배포 자동화 스크립트
│   ├── quick-deploy.mjs # Frontend 빠른 배포
│   ├── full-deploy.mjs  # Frontend + Backend 전체 배포
│   └── build-export.mjs # 정적 빌드 스크립트
├── public/              # 정적 자산
│   ├── backgrounds/     # 게임별 배경 이미지
│   ├── icons/          # 게임 아이콘 (woodcut 스타일)
│   └── images/         # 로고 및 기타 이미지
├── types/               # TypeScript 타입 정의
└── out/                 # 정적 빌드 결과 (배포용)
```

## 🚀 개발 & 배포

### 개발
```bash
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버 (http://localhost:3000)
```

### 배포
```bash
# Frontend 배포 (권장)
pnpm quick-deploy     # 빌드 + S3 + CloudFront

# 전체 배포 (Frontend + Backend)
pnpm full-deploy      # Frontend + Lambda 배포

# 수동 빌드
pnpm build:export     # 정적 파일 생성 (out 폴더)
```

### AWS 인프라
- **S3 Bucket**: `g2-frontend-ver2` (정적 호스팅)
- **CloudFront**: `E8HKFQFSQLNHZ` (CDN 배포)
- **도메인**: `d37wz4zxwakwl0.cloudfront.net`
- **커스텀 도메인**: `g2-clone.ai` (SSL 인증서: `9c87fd8a-3506-4a55-86dc-03bfeb6b22d8`)
- **Lambda Function**: `sedaily-chatbot-dev-handler` (Python 3.11)
- **Bedrock**: Claude 3 Sonnet (ap-northeast-2)
- **BigKinds API**: 경제 뉴스 RAG 소스

## 🎯 주요 기능

### 게임 시스템
- **날짜별 퀴즈**: localStorage 진행 상태 저장
- **연습 모드**: 매번 새로 시작 (play 페이지)
- **반응형 디자인**: 모바일/데스크톱 최적화

### RAG 기반 AI 챗봇
- **AI 모델**: Claude 3 Sonnet (AWS Bedrock)
- **RAG 아키텍처**: 3단계 지식 통합
  1. **BigKinds API**: 최신 경제 뉴스 (30일 이내)
  2. **퀴즈 관련 기사**: 문제 첨부 URL 컨텍스트
  3. **퀴즈 문제**: 현재 문제 내용 및 게임 타입
- **게임별 전문화**: 
  - BlackSwan: 위기/리스크 분석 특화
  - Prisoner's Dilemma: 게임이론 특화
  - Signal Decoding: 경제지표 분석 특화
- **응답 최적화**: 250-350자 전문적 분석
- **Intelligent Fallback**: 
  - BigKinds 실패 → 순수 Claude 전문 응답
  - Claude 실패 → 게임별 대체 응답

## 🛠️ 관리 도구

### Admin 퀴즈 에디터 (`/admin/quiz`)
1. 비밀번호 인증
2. 날짜/게임 선택
3. 문제 작성 (객관식/주관식)
4. 자동 저장 및 초기화

### 환경 변수
```env
NEXT_PUBLIC_CHATBOT_API_URL=lambda-api-url
BIGKINDS_API_KEY=bigkinds-key
```

## 🔄 GitHub Actions 설정

자동 배포를 위해 Repository Settings → Secrets에 다음 값들을 추가하세요:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=g2-frontend-ver2
CLOUDFRONT_DISTRIBUTION_ID=E8HKFQFSQLNHZ
```

## 📊 프로젝트 현황

- ✅ **Frontend**: 배포 완료 (Next.js 15.2.4)
- ✅ **Backend**: Lambda 함수 운영 중 (`sedaily-chatbot-dev-handler`)
- ✅ **RAG System**: BigKinds API + Claude 3 Sonnet 통합
- ✅ **CI/CD**: GitHub Actions 자동 배포
- ✅ **Monitoring**: CloudFront + Lambda 로그

## 🚀 최근 업데이트 (2025-11-10)

### RAG 시스템 개선
- **Intelligent Fallback**: BigKinds API 실패 시 순수 Claude 응답 제공
- **응답 품질 향상**: 폴백 응답 → 전문적 경제 분석
- **Lambda 최적화**: Python 3.11, 1024MB 메모리, 60초 타임아웃

### GitHub Repository
- **Repository**: https://github.com/sedaily/g2-clone
- **자동 배포**: main 브랜치 push 시 CloudFront 배포
- **문서화**: 완전한 프로젝트 문서 및 배포 가이드

---

**🔗 주요 링크**
- 🌐 [Live Demo](https://d37wz4zxwakwl0.cloudfront.net)
- 📱 [GitHub Repository](https://github.com/sedaily/g2-clone)
- 🔧 [GitHub Actions](/.github/workflows/deploy.yml)
- 📋 [배포 상태](./DEPLOYMENT_STATUS.md)

**📞 Contact**
- Repository: sedaily/g2-clone
- Platform: AWS Lambda + CloudFront
- AI: Claude 3 Sonnet (AWS Bedrock)
