# 문제 해결 가이드

## 빠른 해결

### 404 에러
```bash
pnpm guard:emergency
```

### 빌드 실패
```bash
rm -rf .next out node_modules
pnpm install
pnpm build:export
```

### 배포 실패
```bash
pnpm deploy:quick
```

---

## 빌드 문제

### API 폴더 에러

**증상**: `Error: Page "/api/..." is incompatible with "output: export"`

**원인**: API 폴더가 정적 export와 충돌

**해결**:
```bash
# 자동 해결 (권장)
pnpm build:export

# 수동 해결
mv app/api app/api_temp
pnpm next build
mv app/api_temp app/api
```

### 의존성 에러

**증상**: `Module not found` 또는 `Cannot find package`

**해결**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript 에러

**증상**: 타입 에러로 빌드 실패

**해결**:
```bash
# 타입 체크 스킵 (임시)
pnpm build:export

# 타입 수정 (권장)
pnpm tsc --noEmit
```

---

## 배포 문제

### AWS 자격증명 에러

**증상**: `Unable to locate credentials`

**해결**:
```bash
# 자격증명 확인
aws configure list

# 재설정
aws configure
```

### S3 업로드 실패

**증상**: `Access Denied` 또는 `Bucket not found`

**해결**:
```bash
# 버킷 접근 확인
aws s3 ls s3://g2-frontend-ver2

# IAM 권한 확인
aws iam get-user
```

### CloudFront 무효화 실패

**증상**: `InvalidDistributionId` 또는 `AccessDenied`

**해결**:
```bash
# 배포 ID 확인
aws cloudfront list-distributions

# 수동 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

---

## 런타임 문제

### 페이지 로딩 실패

**증상**: 빈 화면 또는 무한 로딩

**해결**:
1. 브라우저 콘솔 확인 (F12)
2. 네트워크 탭에서 실패한 요청 확인
3. CloudFront 캐시 무효화

### API 호출 실패

**증상**: `Failed to fetch` 또는 `Network error`

**해결**:
```bash
# Lambda 함수 확인
aws lambda get-function \
  --function-name sedaily-chatbot-dev-handler

# CloudWatch 로그 확인
aws logs tail /aws/lambda/sedaily-chatbot-dev-handler --follow
```

### 챗봇 응답 없음

**증상**: 챗봇 메시지 전송 후 응답 없음

**해결**:
1. 브라우저 콘솔에서 에러 확인
2. Lambda 함수 로그 확인
3. BigKinds API 키 확인

---

## 데이터 문제

### 퀴즈 데이터 없음

**증상**: "퀴즈를 불러오는 중..." 무한 표시

**해결**:
```bash
# DynamoDB 테이블 확인
aws dynamodb describe-table \
  --table-name sedaily-quiz-data

# 데이터 확인
aws dynamodb scan \
  --table-name sedaily-quiz-data \
  --limit 5
```

### 캐시 문제

**증상**: 오래된 데이터 표시

**해결**:
```javascript
// 브라우저 콘솔에서 실행
localStorage.clear()
location.reload()
```

---

## 성능 문제

### 느린 로딩

**원인**:
- CloudFront 캐시 미스
- Lambda Cold Start
- BigKinds API 지연

**해결**:
1. CloudFront 캐시 정책 확인
2. Lambda 메모리 증가 (1024MB → 2048MB)
3. BigKinds API 타임아웃 조정

### 높은 비용

**원인**:
- Lambda 과다 실행
- CloudFront 데이터 전송량
- DynamoDB 읽기/쓰기

**해결**:
1. CloudWatch 메트릭 확인
2. 캐싱 전략 강화
3. Lambda 동시 실행 제한

---

## 로그 확인

### 배포 로그
```bash
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json | jq
```

### Lambda 로그
```bash
aws logs tail /aws/lambda/sedaily-chatbot-dev-handler --follow
aws logs tail /aws/lambda/quiz-handler --follow
```

### CloudFront 로그
```bash
# S3 버킷에서 로그 확인 (설정된 경우)
aws s3 ls s3://your-cloudfront-logs-bucket/
```

---

## 긴급 상황

### 웹사이트 다운

1. **즉시 확인**:
```bash
curl -I https://g2.sedaily.ai
```

2. **응급 복구**:
```bash
pnpm guard:emergency
```

3. **재배포**:
```bash
pnpm deploy:quick
```

### 데이터 손실

1. **DynamoDB 백업 확인**:
```bash
aws dynamodb list-backups \
  --table-name sedaily-quiz-data
```

2. **백업 복원**:
```bash
aws dynamodb restore-table-from-backup \
  --target-table-name sedaily-quiz-data \
  --backup-arn arn:aws:dynamodb:...
```

---

## 연락처

**긴급 상황**: GitHub Issues  
**일반 문의**: Repository Discussions  
**버그 리포트**: `.github/ISSUE_TEMPLATE/bug_report.md`

---

*마지막 업데이트: 2025-11-24*  
*문서 버전: 2.0*
