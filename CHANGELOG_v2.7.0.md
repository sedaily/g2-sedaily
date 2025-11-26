# v2.7.0 변경사항 (2025-11-24)

## 🎯 주요 변경사항

### 동적 퀴즈 시스템 구현
- ✅ API Gateway + Lambda + DynamoDB 통합
- ✅ 정적 사이트는 그대로, 퀴즈 데이터만 동적 처리
- ✅ 관리자 페이지에서 퀴즈 생성 → DynamoDB 저장
- ✅ Archive 페이지에서 동적 퀴즈 목록 로드

### 새로운 파일
- `aws/quiz-lambda/handler.py` - Quiz API Lambda 함수
- `aws/quiz-lambda/deploy.sh` - Lambda 배포 스크립트
- `aws/quiz-lambda/README.md` - Lambda 가이드
- `docs/DYNAMIC_QUIZ_SETUP.md` - 동적 퀴즈 설정 가이드
- `scripts/deploy.sh` - 간소화된 배포 스크립트
- `next.config.export.mjs` - Export 전용 설정
- `next.config.dev.mjs` - 개발 환경 설정
- `tailwind.config.ts` - Tailwind CSS 4 설정

### 업데이트된 파일
- `lib/quiz-api-client.ts` - API Gateway 엔드포인트 사용
- `.env.local` - Quiz API URL 추가
- `docs/DEPLOYMENT.md` - 수동 배포 프로세스 업데이트
- `README.md` - 현재 아키텍처 반영

### 삭제된 파일
- `docs/404_PREVENTION.md` - Outdated
- `docs/MONITORING.md` - Outdated
- `docs/ADMIN_DEPLOY.md` - Outdated
- `docs/AWS_OPTIMIZATION.md` - Outdated
- `docs/DYNAMIC_DEPLOYMENT.md` - DYNAMIC_QUIZ_SETUP.md로 대체

## 📦 배포 방법

### Frontend
```bash
./scripts/deploy.sh
```

### Backend (Quiz API)
```bash
cd aws/quiz-lambda
./deploy.sh
```

## 🔧 환경 변수 설정 필요

`.env.local`에 추가:
```
NEXT_PUBLIC_QUIZ_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/quiz
```

## 📚 다음 단계

1. `docs/DYNAMIC_QUIZ_SETUP.md` 가이드 따라 API Gateway 설정
2. Lambda 함수 배포
3. 환경 변수 설정
4. Frontend 재배포
