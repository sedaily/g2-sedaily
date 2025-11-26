# 프로젝트 현황 (v2.7.0)

## ✅ 완료된 작업

### 아키텍처
- 정적 사이트 (S3 + CloudFront) - 게임 페이지
- 동적 API (API Gateway + Lambda + DynamoDB) - 퀴즈 데이터
- 하이브리드 구조로 최적화

### 배포
- 수동 배포 스크립트: `./scripts/deploy.sh`
- Quiz API 배포: `cd aws/quiz-lambda && ./deploy.sh`
- 현재 운영 중: https://g2.sedaily.ai

### 문서
- `docs/DEPLOYMENT.md` - 배포 가이드
- `docs/DYNAMIC_QUIZ_SETUP.md` - 동적 퀴즈 설정
- `docs/DEPLOYMENT_ARCHITECTURE.md` - 배포 아키텍처
- `docs/BACKEND_ARCHITECTURE.md` - 백엔드 아키텍처

## 📋 다음 단계

1. API Gateway 설정 (`docs/DYNAMIC_QUIZ_SETUP.md` 참고)
2. Lambda 함수 배포
3. 환경 변수 설정 (`.env.local`)
4. Frontend 재배포

## 🔧 주요 파일

### 설정
- `next.config.mjs` - 개발 환경
- `next.config.export.mjs` - 정적 export
- `tailwind.config.ts` - Tailwind CSS 4

### 배포
- `scripts/deploy.sh` - Frontend 배포
- `aws/quiz-lambda/deploy.sh` - Backend 배포

### Lambda
- `aws/quiz-lambda/handler.py` - Quiz API

## 📊 정리 결과

- 삭제된 파일: 28개
- 업데이트된 파일: 10개
- 새로 생성된 파일: 9개
- 현재 버전: v2.7.0
