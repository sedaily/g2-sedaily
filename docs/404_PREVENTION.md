# 404 에러 방지 가이드

## 문제 원인

404 에러가 발생하는 주요 원인:

1. **API 폴더 문제**: `app/api` 폴더가 있으면 Next.js 정적 export가 실패
2. **빌드 실패**: HTML 파일이 생성되지 않음
3. **업로드 누락**: 중요 파일(index.html, 404.html)이 S3에 업로드되지 않음
4. **캐시 문제**: CloudFront 캐시가 무효화되지 않음

## 해결 방법

### 1. 자동 방지 시스템 (권장)

모든 배포 스크립트에 자동 방지 로직이 포함되어 있습니다:

```bash
# 빠른 배포 (권장)
pnpm deploy:quick

# 완전 검증 배포
pnpm deploy

# 전체 배포 (Frontend + Backend)
pnpm deploy:full
```

### 2. 수동 빌드 시 주의사항

직접 빌드할 때는 반드시 API 폴더를 이동해야 합니다:

```bash
# 1. API 폴더 이동
mv app/api app/api_temp

# 2. 빌드
pnpm build:export

# 3. API 폴더 복원
mv app/api_temp app/api

# 4. 업로드
aws s3 sync ./out s3://g2-frontend-ver2 --delete --exclude "*.txt"

# 5. 캐시 무효화
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
```

### 3. 응급 복구

404 에러가 발생했을 때:

```bash
# 응급 복구 실행
pnpm guard:emergency

# 또는 수동으로
aws s3 cp public/404.html s3://g2-frontend-ver2/404.html
aws s3 cp out/index.html s3://g2-frontend-ver2/index.html
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
```

## 배포 스크립트 설명

### build-export.mjs

**자동 처리 항목**:
- ✅ API 폴더 자동 이동/복원
- ✅ 에러 시 API 폴더 자동 복원
- ✅ 중요 파일 검증 (deploy-guard)
- ✅ 404.html 자동 생성

### quick-deploy.mjs

**자동 처리 항목**:
- ✅ AWS 자격증명 검증
- ✅ S3 버킷 접근 확인
- ✅ API 폴더 자동 처리
- ✅ 빌드 + 업로드 + 캐시 무효화
- ✅ 배포 전후 검증

### ultimate-deploy.mjs

**자동 처리 항목**:
- ✅ 완전한 사전 검증
- ✅ API 폴더 자동 처리
- ✅ 스마트 업로드 (재시도 로직)
- ✅ 중요 파일 개별 확인
- ✅ 웹사이트 응답 테스트
- ✅ 배포 로그 저장

## 체크리스트

### 배포 전

- [ ] AWS 자격증명 확인: `aws configure list`
- [ ] S3 버킷 접근: `aws s3 ls s3://g2-frontend-ver2`
- [ ] 의존성 설치: `pnpm install`
- [ ] 로컬 빌드 테스트: `pnpm build:export`

### 배포 후

- [ ] 메인 페이지 확인: https://g2.sedaily.ai
- [ ] 게임 페이지 확인: https://g2.sedaily.ai/games/g1
- [ ] 관리자 페이지 확인: https://g2.sedaily.ai/admin/quiz
- [ ] 404 페이지 확인: https://g2.sedaily.ai/nonexistent
- [ ] 브라우저 강제 새로고침: `Cmd + Shift + R`

### 문제 발생 시

1. **빌드 로그 확인**: 터미널 출력 확인
2. **out 폴더 확인**: `ls -la out/*.html`
3. **S3 파일 확인**: `aws s3 ls s3://g2-frontend-ver2/`
4. **배포 로그 확인**: `ls -la .deploy-logs/`
5. **응급 복구 실행**: `pnpm guard:emergency`

## 변경 사항별 주의사항

### 1. Frontend 로직 변경

```bash
# 컴포넌트, 페이지, 스타일 변경
pnpm deploy:quick
```

**주의**: API 폴더가 자동으로 처리됩니다.

### 2. Frontend 구조 변경

```bash
# 새 페이지 추가, 라우팅 변경
pnpm deploy:quick
```

**주의**: 새 페이지가 `out/` 폴더에 생성되었는지 확인하세요.

### 3. Backend 로직 변경

```bash
# Lambda 함수 코드 변경
pnpm deploy:backend
```

**주의**: Frontend는 영향받지 않습니다.

### 4. Backend 구조 변경

```bash
# 새 Lambda 함수 추가, API 변경
pnpm deploy:backend
```

**주의**: serverless.yml 변경 시 재배포 필요합니다.

## 자주 묻는 질문

### Q: 왜 API 폴더를 이동해야 하나요?

A: Next.js는 `app/api` 폴더가 있으면 서버 사이드 렌더링을 시도합니다. 정적 export(`output: 'export'`)와 호환되지 않아 빌드가 실패합니다.

### Q: 배포 후 변경사항이 보이지 않아요

A: CloudFront 캐시 때문입니다. 5-10분 기다리거나 브라우저 강제 새로고침(`Cmd + Shift + R`)하세요.

### Q: 404.html이 계속 사라져요

A: `deploy-guard.mjs`가 자동으로 생성합니다. `pnpm deploy:quick` 사용을 권장합니다.

### Q: 빌드는 성공했는데 404 에러가 나요

A: S3 업로드 실패일 수 있습니다. `aws s3 ls s3://g2-frontend-ver2/`로 확인하고 `pnpm guard:emergency` 실행하세요.

## 모니터링

### 배포 로그

```bash
# 최근 배포 로그 확인
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json | jq
```

### CloudWatch 메트릭

- Lambda 함수 에러율
- CloudFront 4xx/5xx 에러
- S3 버킷 요청 수

### 수동 테스트

```bash
# 웹사이트 응답 확인
curl -I https://g2.sedaily.ai
curl -I https://g2.sedaily.ai/games/g1
curl -I https://g2.sedaily.ai/nonexistent

# S3 파일 확인
aws s3 ls s3://g2-frontend-ver2/ --recursive | grep "\.html$"

# CloudFront 캐시 상태
aws cloudfront get-distribution --id E8HKFQFSQLNHZ | jq '.Distribution.Status'
```

## 요약

**항상 사용하세요**:
```bash
pnpm deploy:quick
```

**절대 하지 마세요**:
```bash
# ❌ API 폴더 이동 없이 빌드
pnpm build

# ❌ 직접 S3 업로드 (검증 없이)
aws s3 sync ./out s3://g2-frontend-ver2

# ❌ 캐시 무효화 없이 배포
```

**문제 발생 시**:
```bash
pnpm guard:emergency
```
