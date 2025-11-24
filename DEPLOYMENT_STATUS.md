# 🚀 배포 상태

**마지막 업데이트:** 2025-11-24  
**버전:** v2.6.0  
**상태:** ✅ 운영 중

## 📊 현재 아키텍처

### Frontend
- **플랫폼**: CloudFront + S3
- **빌드**: Next.js 15.2.4 (SSG)
- **배포 방식**: 정적 사이트 생성

### Backend
- **API Gateway**: 
  - Quiz API: 8p2pmss2i7.execute-api.us-east-1.amazonaws.com
  - Chatbot API: vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com
- **Lambda Functions**:
  - sedaily-quiz-handler (Python 3.11)
  - sedaily-chatbot-dev-handler (Python 3.11)
- **Database**: DynamoDB (sedaily-quiz-data)

### Infrastructure
- **CloudFront**: E8HKFQFSQLNHZ
  - Origin 1: S3 (정적 파일)
  - Origin 2: Quiz API Gateway
  - Origin 3: Chatbot API Gateway
- **S3 Bucket**: g2-frontend-ver2
- **Region**: us-east-1

## 🔗 API 라우팅

| 경로 | 대상 | 설명 |
|------|------|------|
| `/api/quiz/*` | Quiz API Gateway | 퀴즈 데이터 조회/저장 |
| `/api/admin/*` | Quiz API Gateway | 관리자 기능 |
| `/api/chat/*` | Chatbot API Gateway | AI 챗봇 |
| `/*` | S3 | 정적 파일 (HTML, JS, CSS) |

## ✅ 배포 완료 항목

- [x] CloudFront 3개 Origins 설정
- [x] API Gateway 라우팅 설정
- [x] 정적 파일 S3 업로드
- [x] CloudFront 캐시 무효화
- [x] 프론트엔드 API 경로 업데이트
- [x] 환경 변수 설정
- [x] 빌드 스크립트 업데이트

## 🌐 접속 URL

- **메인 사이트**: https://g2.sedaily.ai
- **관리자 패널**: https://g2.sedaily.ai/admin/quiz
- **게임 허브**: https://g2.sedaily.ai/games

## 📝 배포 명령어

### 프론트엔드 배포
```bash
# 빌드
pnpm build

# S3 업로드
aws s3 sync .next/static s3://g2-frontend-ver2/_next/static --delete
aws s3 cp .next/server/app s3://g2-frontend-ver2/ --recursive --exclude "*" --include "*.html"

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
```

### CloudFront 설정 업데이트
```bash
node scripts/update-cloudfront.mjs
```

### 환경 변수 검증
```bash
pnpm verify:env
```

## 🔧 문제 해결

### CloudFront 배포 상태 확인
```bash
aws cloudfront get-distribution --id E8HKFQFSQLNHZ --query 'Distribution.Status'
```

### API Gateway 테스트
```bash
curl https://g2.sedaily.ai/api/quiz/quizzes/all
```

### Lambda 함수 테스트
```bash
aws lambda invoke --function-name sedaily-quiz-handler \
  --payload '{"httpMethod":"GET","path":"/quizzes"}' \
  /tmp/response.json
```

## 📊 모니터링

- **CloudWatch**: 메트릭 및 로그
- **CloudFront**: 실시간 트래픽
- **Lambda**: 실행 로그 및 에러

## 🎯 다음 단계

- [ ] API Gateway 엔드포인트 검증
- [ ] Lambda 함수 경로 매핑 확인
- [ ] 전체 기능 테스트
- [ ] 성능 모니터링 설정
