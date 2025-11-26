# 배포 가이드

## 🚀 빠른 배포

### 수동 배포 (현재 방식)

```bash
# 1. API 폴더 임시 이동
mv app/api ../api_backup

# 2. 빌드
rm -rf .next out
pnpm next build

# 3. S3 업로드
aws s3 sync ./out s3://g2-frontend-ver2 --delete

# 4. CloudFront 무효화
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"

# 5. API 폴더 복원
mv ../api_backup app/api
```

---

## 📋 배포 전 체크리스트

### 필수 확인사항
- [ ] 로컬 개발 서버 정상 작동: `pnpm dev`
- [ ] 빌드 성공: `pnpm build:export`
- [ ] AWS 자격증명 설정: `aws configure list`
- [ ] S3 버킷 접근: `aws s3 ls s3://g2-frontend-ver2`
- [ ] 리전 확인: `us-east-1`

### 환경 변수 확인
```bash
# .env.local 파일 확인
cat .env.local

# 필수 변수
NEXT_PUBLIC_CHATBOT_API_URL=...           # 챗봇 API
NEXT_PUBLIC_QUIZ_API_URL=...              # Quiz API Gateway
NEXT_PUBLIC_QUIZ_SAVE_URL=...             # Quiz 저장 API
```

---

## 🔧 AWS 인프라

### Frontend
- **S3 Bucket**: `g2-frontend-ver2`
- **CloudFront**: `E8HKFQFSQLNHZ`
- **도메인**: https://g2.sedaily.ai
- **SSL**: AWS Certificate Manager

### Backend
- **Lambda Chatbot**: `sedaily-chatbot-dev-handler`
- **Lambda Quiz API**: `sedaily-quiz-api` (새로 추가)
- **API Gateway**: Quiz API (동적 퀴즈 데이터)
- **Bedrock**: Claude 3 Sonnet
- **DynamoDB**: `sedaily-quiz-data`
- **Region**: us-east-1

---

## 📦 빌드 시스템

### 자동 빌드
```bash
pnpm run build:export
```

**동작 방식**:
1. `next.config.export.mjs` 자동 적용
2. `pnpm next build` 실행
3. `out/` 폴더에 정적 파일 생성
4. 중요 파일 검증
5. 원본 설정 복원

### 수동 빌드 (문제 발생 시)
```bash
# 캐시 삭제
rm -rf .next out

# 재빌드
pnpm run build:export

# 결과 확인
ls -la out/
ls out/index.html out/404.html out/games/index.html
```

---

## 📊 배포 후 확인

### 1. 웹사이트 접속
```bash
curl -I https://g2.sedaily.ai
```

**확인 페이지**:
- 메인: https://g2.sedaily.ai
- 게임 허브: https://g2.sedaily.ai/games
- BlackSwan: https://g2.sedaily.ai/games/g1
- Prisoner's Dilemma: https://g2.sedaily.ai/games/g2
- Signal Decoding: https://g2.sedaily.ai/games/g3
- Quizlet: https://g2.sedaily.ai/games/quizlet
- 관리자: https://g2.sedaily.ai/admin/quiz

### 2. 기능 테스트
- [ ] 게임 로딩
- [ ] AI 챗봇 응답
- [ ] 퀴즈 진행
- [ ] 관리자 패널 접속
- [ ] 404 페이지 표시

### 3. 배포 로그 확인
```bash
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json
```

---

## 🐛 문제 해결

### 1. 빌드 실패

**증상**: `pnpm build:export` 실패

**해결**:
```bash
# 캐시 및 의존성 초기화
rm -rf .next out node_modules
pnpm install
pnpm build:export
```

### 2. S3 업로드 실패

**증상**: S3 업로드 중 에러

**해결**:
```bash
# AWS 자격증명 확인
aws sts get-caller-identity

# S3 버킷 접근 확인
aws s3 ls s3://g2-frontend-ver2

# 수동 업로드
aws s3 cp ./out s3://g2-frontend-ver2 --recursive
```

### 3. 404 에러 발생

**증상**: 웹사이트 접속 시 404 에러

**해결**:
```bash
# 응급 복구 (404.html 강제 업로드)
pnpm guard:emergency

# 수동 복구
aws s3 cp public/404.html s3://g2-frontend-ver2/404.html
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/404.html"
```

### 4. CloudFront 캐시 문제

**증상**: 변경사항이 반영되지 않음

**해결**:
```bash
# 코드 변경 시: CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"

# 퀴즈 데이터 변경 시: 브라우저 강력 새로고침（Cmd+Shift+R)
```

### 7. Archive 페이지 빈 데이터 문제

**증상**: "아카이브 데이터가 없습니다" 표시

**해결**:
```bash
# 1. 환경 변수 확인
cat .env.local | grep QUIZ_API

# 2. 빌드된 파일에 API URL 포함 확인
grep -r "u8ck54y36j" out/_next/static/chunks/*.js

# 3. Archive 페이지에서 강력 새로고침
# https://g2.sedaily.ai/games/g2/archive 접속 후 Cmd+Shift+R
```

### 5. Lambda 배포 실패

**증상**: Backend 배포 실패

**해결**:
```bash
# Lambda 함수 상태 확인
aws lambda get-function \
  --function-name sedaily-chatbot-dev-handler \
  --region us-east-1

# 수동 배포
cd backend
zip -r enhanced-chatbot.zip lambda/
aws lambda update-function-code \
  --function-name sedaily-chatbot-dev-handler \
  --zip-file fileb://enhanced-chatbot.zip \
  --region us-east-1
```

### 6. 설정 파일 복원

**증상**: `next.config.mjs` 손상

**해결**:
```bash
# Git에서 복원
git checkout next.config.mjs

# 또는 백업에서 복원
cp next.config.mjs.backup next.config.mjs
```

---

## 🔄 GitHub Actions 자동 배포

### 설정 방법

**Repository Settings → Secrets and variables → Actions**

필수 Secrets:
```
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_REGION=us-east-1
S3_BUCKET_NAME=g2-frontend-ver2
CLOUDFRONT_DISTRIBUTION_ID=E8HKFQFSQLNHZ
```

### 트리거
- `main` 브랜치 push
- Pull Request merge

### 워크플로우
1. Node.js 18 + pnpm 설정
2. 의존성 설치
3. 정적 빌드
4. S3 동기화
5. CloudFront 무효화

---

## 📈 배포 모니터링

### 배포 로그
```bash
# 최근 배포 로그 확인
ls -la .deploy-logs/

# JSON 형식으로 보기
cat .deploy-logs/deploy-*.json | jq .

# 실패한 배포 찾기
grep -l '"status": "failed"' .deploy-logs/*.json
```

### CloudWatch 로그
```bash
# Lambda 로그 확인
aws logs tail /aws/lambda/sedaily-chatbot-dev-handler --follow

# 최근 에러 확인
aws logs filter-log-events \
  --log-group-name /aws/lambda/sedaily-chatbot-dev-handler \
  --filter-pattern "ERROR"
```

### S3 파일 확인
```bash
# 업로드된 파일 목록
aws s3 ls s3://g2-frontend-ver2 --recursive

# 중요 파일 확인
aws s3 ls s3://g2-frontend-ver2/index.html
aws s3 ls s3://g2-frontend-ver2/404.html
```

---

## 🚨 응급 상황 대응

### 즉시 실행 명령어

```bash
# 1. 404 에러 응급 복구
pnpm guard:emergency

# 2. 전체 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"

# 3. 배포 로그 확인
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json | tail -1

# 4. 웹사이트 상태 확인
curl -I https://g2.sedaily.ai

# 5. S3 파일 확인
aws s3 ls s3://g2-frontend-ver2/
```

### 단계별 복구 절차

1. **배포 로그 확인**
   ```bash
   cat .deploy-logs/deploy-*.json | tail -1 | jq .
   ```

2. **에러 원인 파악**
   - 빌드 실패: 로컬 빌드 테스트
   - 업로드 실패: AWS 자격증명 확인
   - 캐시 문제: CloudFront 무효화

3. **응급 복구 실행**
   ```bash
   pnpm guard:emergency
   ```

4. **수동 재배포**
   ```bash
   pnpm deploy:quick
   ```

5. **검증**
   ```bash
   curl -I https://g2.sedaily.ai
   ```

---

## 📚 추가 문서

- **[DYNAMIC_QUIZ_SETUP.md](./DYNAMIC_QUIZ_SETUP.md)**: 동적 퀴즈 시스템 설정
- **[DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md)**: 배포 시스템 아키텍처
- **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)**: 백엔드 아키텍처
- **[README.md](../README.md)**: 프로젝트 개요

---

## 🎮 퀴즈 관리

### 퀴즈 생성
1. 관리자 페이지 접속: https://g2.sedaily.ai/admin/quiz
2. "퀴즈 관리" 탭에서 퀴즈 작성
3. "저장" 버튼 클릭 → DynamoDB에 자동 저장
4. 사용자는 브라우저 새로고침만 하면 퀴즈 표시

### 퀴즈 삭제
1. 관리자 페이지 "퀴즈 삭제" 탭
2. 게임 타입 선택 (BlackSwan, PrisonersDilemma, SignalDecoding)
3. 날짜 선택
4. "삭제" 버튼 클릭 → DynamoDB에서 삭제

### 중요 사항
- **퀴즈 데이터**: DynamoDB에 저장, API로 동적 로드 (`cache: "no-store"`)
- **CloudFront 캐시**: 퀴즈 데이터는 캐시되지 않음
- **사용자 화면**: Archive 페이지에서 강력 새로고침 (Cmd+Shift+R)
- **환경 변수**: `.env.local` 파일에 설정 (빌드 시 포함됨)

### API 엔드포인트
```bash
# 퀴즈 생성
POST https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz

# 퀴즈 조회
GET https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/{gameType}/{date}

# 날짜 목록
GET https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/{gameType}/dates

# 퀴즈 삭제
DELETE https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/{gameType}/{date}
```

---

## 💡 배포 팁

### 배포 전 로컬 테스트
```bash
# 개발 서버 테스트
pnpm dev

# 빌드 테스트 (API 폴더 제외)
mv app/api ../api_backup
pnpm next build
mv ../api_backup app/api

# 결과 확인
ls -la out/
ls out/index.html out/404.html
```

### 빠른 배포
```bash
# 위 수동 배포 명령어 사용
# 또는 scripts/deploy.sh 스크립트 사용
```

---

**마지막 업데이트**: 2025-11-26  
**문서 버전**: 2.5
