# 서울경제 뉴스게임 플랫폼

경제 뉴스를 기반으로 한 인터랙티브 퀴즈 게임 플랫폼입니다.

**🌐 Live:** https://g2.sedaily.ai  
**📊 업데이트:** 2025-11-26  
**🚀 버전:** v2.8.1  
**⚡ 타입:** 정적 사이트 + 동적 API

## 🎮 게임 종류

- **BlackSwan (g1)**: 경제 이벤트 예측 게임
- **Prisoner's Dilemma (g2)**: 경제 딜레마 상황 게임  
- **Signal Decoding (g3)**: 경제 신호 해석 게임
- **Card Matching (quizlet)**: 경제 용어 매칭 게임

## 🏗 아키텍처

### Frontend (Next.js 15.2.4)
- **정적 사이트**: SSG (Static Site Generation)
- **배포**: S3 + CloudFront
- **게임 페이지**: 정적 HTML (변경 없음)

### Backend (Lambda - Python 3.11)
- **Chatbot Lambda**: `sedaily-chatbot-dev-handler`
  - AI: Claude 3 Sonnet (AWS Bedrock)
  - RAG: BigKinds API + 퀴즈 컨텍스트
- **Quiz API Lambda**: `sedaily-quiz-api` (신규)
  - API Gateway 통한 동적 퀴즈 CRUD
  - DynamoDB 연동
- **Database**: DynamoDB (`sedaily-quiz-data`)
- **Region**: us-east-1

## 🔧 기술 스택

- Next.js 15.2.4, React 19, TypeScript 5
- Tailwind CSS 4.1.9, Framer Motion, Radix UI
- AWS Lambda (Python 3.11), Claude 3 Sonnet
- DynamoDB, API Gateway, CloudFront, S3

## 🚀 개발 & 배포

### 개발
```bash
pnpm install
pnpm dev
```

### 배포
```bash
# Frontend
./scripts/deploy.sh

# Backend (Quiz API)
cd aws/quiz-lambda
./deploy.sh
```

## 🎯 주요 기능

### 동적 퀴즈 시스템 (신규)
- 관리자 페이지에서 퀴즈 생성 → API Gateway → DynamoDB 저장
- Archive 페이지에서 동적으로 퀴즈 목록 로드
- 정적 사이트는 그대로, 퀴즈 데이터만 동적 처리

### RAG 기반 AI 챗봇
- BigKinds API (최신 30일 경제 뉴스)
- 퀴즈 관련 기사 URL + 문제 컨텍스트
- 게임별 전문화 응답

### Admin 패널
- 퀴즈 생성/삭제 (객관식/주관식)
- Quizlet 관리 (CSV 업로드)
- 캐시 관리
- 배포 가이드

## 🛠️ 환경 변수

```env
NEXT_PUBLIC_CHATBOT_API_URL=https://...
NEXT_PUBLIC_QUIZ_API_URL=https://...
NEXT_PUBLIC_QUIZ_SAVE_URL=https://...
```

## 📚 문서

- [배포 가이드](docs/DEPLOYMENT.md)
- [동적 퀴즈 설정](docs/DYNAMIC_QUIZ_SETUP.md)
- [배포 아키텍처](docs/DEPLOYMENT_ARCHITECTURE.md)
- [백엔드 아키텍처](docs/BACKEND_ARCHITECTURE.md)

## 📊 최근 업데이트

**v2.8.1 (2025-11-26)**
- ✅ Archive 페이지 캐시 문제 해결 (force-cache → no-store)
- ✅ 환경 변수 빌드 포함 확인 (.env → .env.local)
- ✅ 퀴즈 데이터 실시간 반영 완료

**v2.8.0 (2025-11-26)**
- ✅ 퀴즈 CRUD 완전 구현 (생성/조회/삭제)
- ✅ API Gateway CORS 설정 완료
- ✅ Lambda 함수 문법 에러 수정
- ✅ 관리자 페이지 퀴즈 삭제 기능 추가
- ✅ 정적 사이트 API 라우트 제거

**v2.7.0 (2025-11-24)**
- ✅ 동적 퀴즈 시스템 구현 (API Gateway + Lambda)
- ✅ 정적 사이트 유지 + 퀴즈 데이터만 동적 처리
- ✅ Archive 페이지 동적 로딩
- ✅ 수동 배포 스크립트 간소화

**v2.6.0 (2025-11-24)**
- ✅ 정적 export 빌드 시스템
- ✅ Tailwind CSS 4 설정
- ✅ 동적 라우트 최적화

---

**Contact**
- Repository: sedaily/g2-clone
- Platform: S3 + CloudFront + API Gateway + Lambda
- Region: us-east-1
- Status: 운영 중 ✅
