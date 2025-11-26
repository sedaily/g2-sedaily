# 트러블슈팅 가이드

## 퀴즈 관련 문제

### Archive 페이지에 퀴즈가 표시되지 않음

**증상**:
- 관리자 페이지에서 퀴즈 저장 완료
- Archive 페이지에서 "아카이브 데이터가 없습니다" 표시

**원인**:
1. 브라우저 캐시 문제
2. 환경 변수 누락
3. API 호출 실패

**해결 방법**:

#### 1단계: 브라우저 강력 새로고침
```
Archive 페이지에서 직접:
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R
```

#### 2단계: 브라우저 콘솔 확인
```
F12 → Console 탭

정상:
[v0] Found 1 dates for PrisonersDilemma

비정상:
[v0] Found 0 dates for PrisonersDilemma
```

#### 3단계: API 직접 테스트
```bash
curl https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/PrisonersDilemma/dates

# 정상 응답:
{"dates": ["2025-11-26"]}
```

#### 4단계: 환경 변수 확인
```bash
cat .env.local | grep QUIZ_API

# 있어야 함:
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
```

#### 5단계: 빌드 파일 확인
```bash
grep -r "u8ck54y36j" out/_next/static/chunks/*.js

# API URL이 포함된 파일이 있어야 함
```

---

## 관리자 페이지 문제

### 저장 버튼 502 에러

**증상**:
```
POST https://g2.sedaily.ai/api/admin/quizzes 502 (Bad Gateway)
```

**원인**:
- 정적 사이트에 `/api/admin/*` 라우트 없음

**해결**:
- 이미 수정됨 (v2.8.0)
- Lambda API Gateway로 직접 호출

---

## 배포 문제

### CloudFront 캐시 무효화

**퀴즈 데이터 변경 시**:
```bash
# 불필요 - 브라우저 새로고침만 하면 됨
```

**코드 변경 시**:
```bash
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

---

## API 문제

### CORS 에러

**증상**:
```
Access to fetch has been blocked by CORS policy
```

**해결**:
- 이미 수정됨 (v2.8.0)
- API Gateway에 OPTIONS 메서드 및 CORS 헤더 추가

---

## 환경 변수 문제

### 빌드 시 환경 변수 누락

**증상**:
- 빌드된 JavaScript에 API URL 없음

**원인**:
- `.env` 파일만 있고 `.env.local` 없음

**해결**:
```bash
cp .env .env.local
pnpm build
```

---

## 브라우저 캐시 문제

### 완전 캐시 삭제

**Chrome**:
1. 설정 → 개인정보 및 보안
2. 인터넷 사용 기록 삭제
3. 시간 범위: 전체 기간
4. 캐시된 이미지 및 파일 체크
5. 데이터 삭제

**Safari**:
1. 개발자 → 캐시 비우기
2. 또는 Cmd + Option + E

---

## Lambda 문제

### Lambda 로그 확인

```bash
# 최근 로그
aws logs tail /aws/lambda/sedaily-quiz-api --follow --region us-east-1

# 에러만 필터링
aws logs filter-log-events \
  --log-group-name /aws/lambda/sedaily-quiz-api \
  --filter-pattern "ERROR" \
  --region us-east-1
```

---

## DynamoDB 문제

### 데이터 확인

```bash
# 전체 스캔
aws dynamodb scan \
  --table-name sedaily-quiz-data \
  --region us-east-1

# 특정 항목 조회
aws dynamodb get-item \
  --table-name sedaily-quiz-data \
  --key '{"PK":{"S":"QUIZ#PrisonersDilemma"},"SK":{"S":"DATE#2025-11-26"}}' \
  --region us-east-1
```

---

## 긴급 상황

### 퀴즈가 전혀 표시되지 않음

```bash
# 1. API 테스트
curl https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/BlackSwan/dates

# 2. DynamoDB 확인
aws dynamodb scan --table-name sedaily-quiz-data --region us-east-1

# 3. Lambda 로그 확인
aws logs tail /aws/lambda/sedaily-quiz-api --region us-east-1

# 4. 재배포
cd /path/to/g2-clone
bash scripts/deploy.sh

# 5. CloudFront 무효화
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
```

---

**마지막 업데이트**: 2025-11-26  
**문서 버전**: 1.0
