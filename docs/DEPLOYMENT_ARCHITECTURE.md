# 배포 아키텍처

## 개요

서울경제 뉴스게임 플랫폼의 배포 시스템 아키텍처 문서입니다.

**배포 방식**: 정적 사이트 생성 (Static Site Generation)  
**인프라**: AWS S3 + CloudFront + Lambda  
**자동화**: GitHub Actions + 커스텀 스크립트  
**마지막 업데이트**: 2025-11-24

---

## 배포 플로우

```
로컬 개발 → 빌드 → S3 업로드 → CloudFront 배포 → 검증
```

### 1. 빌드 단계

```bash
# API 폴더 임시 이동
mv app/api app/api_temp

# Next.js 정적 빌드
pnpm next build

# out/ 폴더 생성 확인
ls -la out/

# API 폴더 복원
mv app/api_temp app/api
```

### 2. 업로드 단계

```bash
# S3 기존 파일 정리
aws s3 rm s3://g2-frontend-ver2 --recursive

# 새 파일 업로드
aws s3 cp ./out s3://g2-frontend-ver2 --recursive

# 중요 파일 개별 확인
aws s3 cp ./out/404.html s3://g2-frontend-ver2/404.html
```

### 3. 배포 단계

```bash
# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

### 4. 검증 단계

```bash
# 웹사이트 응답 확인
curl -I https://g2.sedaily.ai

# 주요 페이지 테스트
curl -I https://g2.sedaily.ai/games
curl -I https://g2.sedaily.ai/admin/quiz
```

---

## AWS 인프라

### S3 버킷

**이름**: `g2-frontend-ver2`  
**리전**: us-east-1  
**용도**: 정적 파일 호스팅

**설정**:
- 정적 웹사이트 호스팅 활성화
- 퍼블릭 액세스 차단 (CloudFront를 통해서만 접근)
- 버킷 정책: CloudFront OAI 허용

### CloudFront 배포

**ID**: `E8HKFQFSQLNHZ`  
**도메인**: https://g2.sedaily.ai  
**원본**: S3 버킷 (g2-frontend-ver2)

**설정**:
- SSL/TLS: AWS Certificate Manager
- 캐시 정책: CachingOptimized
- 압축: 활성화 (Gzip, Brotli)
- 에러 페이지: 404.html

### Lambda 함수

**Chatbot**: `sedaily-chatbot-dev-handler`  
**Quiz**: `quiz-handler`  
**리전**: us-east-1

---

## 배포 스크립트

### config.mjs

통합 설정 파일:

```javascript
export const CONFIG = {
  AWS: {
    REGION: 'us-east-1',
    S3_BUCKET: 'g2-frontend-ver2',
    CLOUDFRONT_ID: 'E8HKFQFSQLNHZ',
    LAMBDA_CHATBOT: 'sedaily-chatbot-dev-handler',
    LAMBDA_QUIZ: 'quiz-handler'
  },
  URLS: {
    WEBSITE: 'https://g2.sedaily.ai',
    CLOUDFRONT: 'https://d1nbq51yydvkc9.cloudfront.net',
    API_BASE: 'https://api.g2.sedaily.ai/dev'
  },
  TIMEOUTS: {
    S3_CLEAN: 60000,
    S3_UPLOAD: 300000,
    HTTP_REQUEST: 10000
  }
}
```

### utils.mjs

유틸리티 함수:

- `retryWithBackoff()`: 재시도 로직
- `safeExec()`: 안전한 명령 실행
- `saveDeployLog()`: 배포 로그 저장
- `validateAWSCredentials()`: AWS 자격증명 검증

### quick-deploy.mjs

빠른 배포 스크립트:

1. AWS 환경 검증
2. 빌드 실행
3. S3 업로드 (재시도 3회)
4. CloudFront 무효화
5. 배포 로그 저장

### ultimate-deploy.mjs

완전 검증 배포 스크립트:

1. 사전 검증 (AWS, 빌드)
2. Deploy Guard Pre
3. 빌드 + 업로드
4. CloudFront 무효화
5. Deploy Guard Post
6. 웹사이트 테스트
7. 배포 로그 저장

---

## Deploy Guard

404 에러 방지 시스템:

### Pre-deployment

```bash
node scripts/deploy-guard.mjs pre
```

**검증 항목**:
- out/ 폴더 존재 확인
- 중요 파일 존재 확인 (index.html, 404.html)
- 파일 크기 검증

### Post-deployment

```bash
node scripts/deploy-guard.mjs post
```

**검증 항목**:
- S3 파일 업로드 확인
- 웹사이트 응답 확인 (200 OK)
- 주요 페이지 접근 테스트

### Emergency

```bash
node scripts/deploy-guard.mjs emergency
```

**복구 작업**:
- 404.html 강제 업로드
- index.html 강제 업로드
- CloudFront 캐시 무효화

---

## 배포 로그

### 저장 위치

`.deploy-logs/deploy-{timestamp}.json`

### 로그 구조

```json
{
  "timestamp": "2025-11-24T10:00:00.000Z",
  "mode": "quick-deploy",
  "status": "success",
  "duration": "45.2",
  "steps": [
    { "step": "validation", "status": "success" },
    { "step": "build", "status": "success" },
    { "step": "s3-upload", "status": "success" },
    { "step": "cloudfront-invalidation", "status": "success" }
  ]
}
```

---

## GitHub Actions

### 워크플로우

`.github/workflows/deploy.yml`

**트리거**:
- `main` 브랜치 push
- Pull Request merge

**단계**:
1. Node.js 18 + pnpm 설정
2. 의존성 설치
3. 정적 빌드
4. AWS 자격증명 설정
5. S3 동기화
6. CloudFront 무효화

---

## 모니터링

### CloudWatch

**메트릭**:
- Lambda 실행 횟수
- Lambda 에러율
- CloudFront 요청 수
- CloudFront 4xx/5xx 에러

**로그 그룹**:
- `/aws/lambda/sedaily-chatbot-dev-handler`
- `/aws/lambda/quiz-handler`

### 배포 로그

```bash
# 최근 배포 확인
ls -la .deploy-logs/

# 실패한 배포 찾기
grep -l '"status": "failed"' .deploy-logs/*.json
```

---

## 보안

### IAM 권한

**최소 권한 원칙**:
- S3: GetObject, PutObject, DeleteObject (특정 버킷만)
- CloudFront: CreateInvalidation (특정 배포만)
- Lambda: InvokeFunction (특정 함수만)

### 환경 변수

**민감 정보 관리**:
- GitHub Secrets에 저장
- 로컬 `.env.local` (gitignore)
- Lambda 환경 변수

---

## 문제 해결

### 빌드 실패

```bash
rm -rf .next out node_modules
pnpm install
pnpm build:export
```

### 업로드 실패

```bash
aws sts get-caller-identity
aws s3 ls s3://g2-frontend-ver2
```

### 404 에러

```bash
pnpm guard:emergency
```

### 캐시 문제

```bash
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

---

## 추가 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md): 배포 가이드
- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md): 백엔드 아키텍처
- [404_PREVENTION.md](./404_PREVENTION.md): 404 에러 방지
- [README.md](../README.md): 프로젝트 개요

---

*마지막 업데이트: 2025-11-24*  
*문서 버전: 2.3*
