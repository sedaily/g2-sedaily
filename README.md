# 서울경제 뉴스게임 플랫폼

경제 뉴스를 기반으로 한 인터랙티브 퀴즈 게임 플랫폼입니다.

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://d1nbq51yydvkc9.cloudfront.net)
[![GitHub](https://img.shields.io/badge/GitHub-sedaily/g2--clone-blue)](https://github.com/sedaily/g2-clone)
[![AWS](https://img.shields.io/badge/AWS-Lambda%20%2B%20CloudFront-orange)](https://aws.amazon.com/)

**🌐 Live Demo:** https://g2.sedaily.ai  
**📊 최근 업데이트:** 2025-11-24  
**🚀 버전:** v2.6.0  
**⚡ 타입:** 하이브리드 (정적 + REST API)

## 🎮 게임 종류

- **BlackSwan (g1)**: 경제 이벤트 예측 게임
- **Prisoner's Dilemma (g2)**: 경제 딜레마 상황 게임  
- **Signal Decoding (g3)**: 경제 신호 해석 게임
- **Card Matching (quizlet)**: Quizlet 스타일 경제 용어 매칭 게임 (CSV 업로드 지원)

## 🏗 아키텍처

### Frontend (Next.js 15.2.4)
- **App Router**: 최신 Next.js 라우팅 시스템
- **정적 생성**: SSG (Static Site Generation)
- **배포**: CloudFront + S3

### Backend (Lambda - Python 3.11)
- **Function**: `sedaily-chatbot-dev-handler`
- **Region**: us-east-1 (Bedrock Claude 3 Sonnet)
- **AI Engine**: Claude 3 Sonnet (AWS Bedrock)
- **RAG Sources**: BigKinds API + 퀴즈 컨텍스트 + 관련 기사
- **Database**: DynamoDB (`sedaily-quiz-data`)

## 🔧 기술 스택

### Frontend
- Next.js 15.2.4, React 19, TypeScript 5
- Tailwind CSS 4.1.9, Framer Motion
- Radix UI, pnpm

### Backend
- AWS Lambda (Python 3.11, us-east-1)
- Claude 3 Sonnet (AWS Bedrock)
- BigKinds API (경제 뉴스)
- DynamoDB

### Infrastructure
- **CDN**: CloudFront (E8HKFQFSQLNHZ)
- **Storage**: S3 (g2-frontend-ver2)
- **API**: API Gateway + Lambda
- **데이터베이스**: DynamoDB
- **모니터링**: CloudWatch + SNS

## 📁 프로젝트 구조

```
g2-clone/
├── app/                    # Next.js 15 App Router
├── components/             # React 컴포넌트
├── hooks/                  # 커스텀 React 훅
├── lib/                    # 유틸리티 라이브러리
├── backend/                # Python Lambda
│   ├── lambda/
│   │   ├── enhanced-chatbot-handler.py
│   │   └── requirements.txt
│   └── serverless.yml
├── scripts/                # 배포 자동화
│   ├── config.mjs          # 통합 설정
│   ├── utils.mjs           # 유틸리티 함수
│   ├── ultimate-deploy.mjs
│   ├── quick-deploy.mjs
│   └── deploy-backend.mjs
├── docs/                   # 문서
└── .deploy-logs/           # 배포 로그
```

## 🚀 개발 & 배포

### 개발
```bash
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버
```

### 배포
```bash
# Vercel (권장)
vercel                            # 개발 배포
vercel --prod                     # 프로덕션 배포

# 또는 AWS Amplify
# GitHub 연결 후 자동 배포

# Backend Lambda
node scripts/deploy-backend.mjs

# 모니터링 & 자동화
pnpm monitor:dashboard           # 성능 대시보드
pnpm monitor:watch               # 실시간 모니터링
pnpm monitor:html                # HTML 대시보드 생성
pnpm auto:redeploy               # 자동 재배포 시작
pnpm notify:test                 # 알림 테스트

# AWS 고급 설정
pnpm aws:setup                   # AWS 전체 설정
pnpm aws:dashboard               # CloudWatch 대시보드

# 관리
pnpm guard:emergency             # 응급 복구
ls -la .deploy-logs/             # 배포 로그
```

### AWS 인프라
- **CloudFront**: `E8HKFQFSQLNHZ` (3 Origins)
- **S3**: `g2-frontend-ver2` (정적 파일)
- **API Gateway**: Quiz API (8p2pmss2i7), Chatbot API
- **Lambda**: `sedaily-chatbot-dev-handler`, `sedaily-quiz-handler`
- **DynamoDB**: `sedaily-quiz-data`
- **Region**: us-east-1

## 🎯 주요 기능

### RAG 기반 AI 챗봇
- **3단계 지식 통합**:
  1. BigKinds API (최신 30일 경제 뉴스)
  2. 퀴즈 관련 기사 URL
  3. 퀴즈 문제 컨텍스트
- **게임별 전문화**: BlackSwan, PrisonersDilemma, SignalDecoding
- **Intelligent Fallback**: API 실패 시 순수 Claude 응답

### 퀴즈 시스템
- 날짜별 퀴즈 (localStorage 진행 상태)
- Play 버튼 → 최신 퀴즈 자동 이동
- 테스트 퀴즈 폴백 (DynamoDB 비어있을 때)
- 반응형 디자인

### Admin 패널 (`/admin/quiz`)
- 혴즈 관리 (객관식/주관식) - 즉시 DynamoDB 저장
- Quizlet 관리 (CSV 업로드)
- 캐시 관리 (localStorage)
- 배포 관리
  - 원클릭 CloudFront 캐시 무효화
  - 실시간 메트릭 (DynamoDB, Lambda)
  - 자동 새로고침

## 🛠️ 환경 변수

```env
# Frontend
NEXT_PUBLIC_CHATBOT_API_URL=https://api.g2.sedaily.ai/dev/chat
NEXT_PUBLIC_QUIZ_API_URL=https://api.g2.sedaily.ai/dev/quizzes/all

# Backend
BIGKINDS_API_KEY=your_key
DYNAMODB_TABLE=sedaily-quiz-data
AWS_REGION=us-east-1
```

## 📊 프로젝트 현황

### 🚀 핵심 시스템
- ✅ Frontend: Next.js 15.2.4 정적 사이트
- ✅ Backend: Lambda 함수 (us-east-1)
- ✅ RAG System: BigKinds + Claude 3 Sonnet
- ✅ Website: https://g2.sedaily.ai 정상 작동

### 🎯 성능 최적화
- ✅ 이미지: PNG → WebP (90% 감소)
- ✅ 컴포넌트: 546줄 → 80줄 (86% 감소)
- ✅ API: 날짜별 API + 다층 캐싱
- ✅ 배포: 중복 코드 70% 감소

### 🛡️ 안정성
- ✅ Deploy Guard (404 방지)
- ✅ 구체적 예외 처리
- ✅ CloudWatch 메트릭
- ✅ IAM 최소 권한
- ✅ 민감 정보 마스킹

## 🚀 최근 개선사항

**퀴즈 시스템 v2.2.0 (2025-11-24)**
- ✅ Play 버튼 → 최신 날짜 퀴즈 자동 이동
- ✅ 테스트 퀴즈 폴백 시스템
- ✅ DynamoDB 퀴즈 우선 로드

**버그 수정 v2.1.1 (2025-11-24)**
- ✅ 404 에러 해결 (distDir 제거)
- ✅ 퀴즈 답변 선택 로직 수정
- ✅ 퀴즈 재시작 기능 개선

**백엔드 v2.1 (2025-11-20)**
- ✅ 17개 상수 중앙 관리
- ✅ 구체적 예외 처리
- ✅ IAM 최소 권한
- ✅ 민감 정보 마스킹

**성능 최적화 (2025-11-17)**
- ✅ 컴포넌트 모듈화 (86% 감소)
- ✅ 이미지 최적화 (90% 감소)
- ✅ 다층 캐싱 시스템

**하이브리드 아키텍처 v2.6.0 (2025-11-24)**
- ✅ CloudFront + API Gateway 통합
- ✅ 3개 Origins (S3, Quiz API, Chatbot API)
- ✅ REST API 라우팅 (/api/quiz/*, /api/admin/*, /api/chat/*)
- ✅ 정적 사이트 + 동적 API
- ✅ 기존 인프라 활용 (S3, CloudFront)
- ✅ 자동 배포 스크립트

**AWS 고급 기능 통합 v2.4.0 (2025-01-24)**
- ✅ DynamoDB Streams + Lambda 자동 배포 트리거
- ✅ CloudWatch Dashboard + Alarms
- ✅ SNS 알림 시스템
- ✅ S3 Bucket Policy 보안 강화
- ✅ 관리자 페이지 배포 관리 탭

**모니터링 & 자동화 v2.3.0 (2025-01-24)**
- ✅ 자동 재배포 시스템 (DynamoDB 모니터링)
- ✅ Slack/Discord 알림 통합
- ✅ 성능 모니터링 대시보드 (CLI + HTML)
- ✅ CloudWatch 메트릭 조회

## 🔄 향후 계획

**단기 (1개월)**
- ✅ 자동 재배포 시스템
- ✅ Slack/Discord 알림
- ✅ 성능 모니터링 대시보드
- ✅ 동적 사이트 전환 (API Routes)
- ✅ 실시간 데이터 업데이트 (30초 폴링)

**중기 (3개월)**
- [ ] WebSocket 실시간 통신
- [ ] 다중 AI 모델 지원
- [ ] 사용자 인증 시스템

**장기 (6개월)**
- [ ] 벡터 DB 도입
- [ ] 멀티모달 AI

## 📊 성과 지표

- **이미지**: 8.4MB → 848KB (90% 감소)
- **Frontend 코드**: 546줄 → 80줄 (86% 감소)
- **배포 코드**: 중복 70% 감소
- **API**: 전체 로딩 → 개별 요청
- **캐싱**: 3단계 (localStorage + 서버 + API)

---

**🔗 주요 링크**
- 🌐 [Live Demo](https://g2.sedaily.ai)
- 📱 [GitHub](https://github.com/sedaily/g2-clone)
- 🛠️ [관리자 패널](https://g2.sedaily.ai/admin/quiz)
- 📚 [배포 가이드](docs/DEPLOYMENT.md)
- 🏗️ [배포 아키텍처](docs/DEPLOYMENT_ARCHITECTURE.md)
- 🔧 [백엔드 아키텍처](docs/BACKEND_ARCHITECTURE.md)
- 🛡️ [404 에러 방지 가이드](docs/404_PREVENTION.md)
- 📊 [모니터링 & 자동화](docs/MONITORING.md)
- 👨‍💻 [관리자 페이지 통합 가이드](docs/ADMIN_DEPLOY.md)
- ☁️ [AWS 최적화 가이드](docs/AWS_OPTIMIZATION.md)
- 🚀 [동적 배포 가이드](docs/DYNAMIC_DEPLOYMENT.md)

**📞 Contact & Info**
- Repository: sedaily/g2-clone
- Platform: CloudFront + S3 + API Gateway + Lambda
- AI: Claude 3 Sonnet (AWS Bedrock) + BigKinds API
- Region: us-east-1
- Last Updated: 2025-11-24
- Version: v2.6.0
- Type: 하이브리드 (정적 + REST API)
- Status: 운영 중 ✅
