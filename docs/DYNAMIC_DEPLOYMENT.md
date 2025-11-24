# 동적 사이트 배포 가이드

## 개요

G2 플랫폼은 **동적 Next.js 애플리케이션**으로 전환되었습니다.
- ✅ API Routes 활성화
- ✅ 실시간 데이터 업데이트
- ✅ 서버 사이드 렌더링 (SSR)
- ✅ 관리자 → 사용자 실시간 소통

## 배포 옵션

### 옵션 1: Vercel (권장) ⭐

**장점**:
- 자동 배포
- 글로벌 CDN
- 서버리스 함수 자동 스케일링
- 무료 플랜 사용 가능

**배포 방법**:
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

**환경 변수 설정**:
```bash
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION
```

### 옵션 2: AWS Amplify

**장점**:
- AWS 생태계 통합
- 자동 CI/CD
- 커스텀 도메인

**배포 방법**:
1. AWS Amplify 콘솔 접속
2. "New app" → "Host web app"
3. GitHub 연결
4. 빌드 설정:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 옵션 3: Docker + ECS/EKS

**장점**:
- 완전한 제어
- 커스텀 설정
- 엔터프라이즈급

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 실시간 업데이트 구조

### 데이터 흐름

```
관리자 페이지
    ↓ (POST /api/admin/quiz)
DynamoDB 저장
    ↓
사용자 페이지 (30초 폴링)
    ↓ (GET /api/quiz/latest)
실시간 업데이트
```

### API 엔드포인트

#### 1. 퀴즈 저장
```typescript
POST /api/admin/quiz
Body: {
  gameType: "BlackSwan",
  quizDate: "2025-01-24",
  data: { questions: [...] }
}
```

#### 2. 최신 퀴즈 조회
```typescript
GET /api/quiz/latest?gameType=BlackSwan
Response: {
  success: true,
  data: { ... },
  updatedAt: "2025-01-24T10:30:00Z"
}
```

#### 3. 캐시 무효화
```typescript
POST /api/admin/deploy
Body: { paths: ["/*"] }
```

#### 4. 메트릭 조회
```typescript
GET /api/admin/metrics
Response: {
  dynamodb: { itemCount: 100 },
  lambda: { invocations: 500 }
}
```

## 환경 변수

### 필수
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### 선택
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 성능 최적화

### 1. 캐싱 전략
```typescript
// API Route에서
export const revalidate = 0; // 실시간 데이터
// 또는
export const revalidate = 60; // 1분 캐시
```

### 2. 폴링 간격 조정
```typescript
// 30초 폴링 (기본)
useRealtimeQuiz('BlackSwan', 30000);

// 10초 폴링 (빠른 업데이트)
useRealtimeQuiz('BlackSwan', 10000);
```

### 3. DynamoDB 최적화
- GSI (Global Secondary Index) 사용
- Query 대신 Scan 최소화
- BatchGetItem 활용

## 모니터링

### CloudWatch 메트릭
- API 응답 시간
- DynamoDB 읽기/쓰기 용량
- Lambda 호출 횟수

### 로그 확인
```bash
# Vercel
vercel logs

# AWS CloudWatch
aws logs tail /aws/lambda/g2-api --follow
```

## 문제 해결

### API 응답 느림
```bash
# DynamoDB 인덱스 확인
aws dynamodb describe-table --table-name sedaily-quiz-data

# CloudWatch 메트릭 확인
pnpm monitor:dashboard
```

### 실시간 업데이트 안됨
1. 폴링 간격 확인
2. API 엔드포인트 확인
3. 브라우저 콘솔 에러 확인

### 배포 실패
```bash
# 로컬 빌드 테스트
pnpm build

# 환경 변수 확인
vercel env ls
```

## 비용 예상

### Vercel (권장)
- **Hobby**: 무료
- **Pro**: $20/월
- **Enterprise**: 커스텀

### AWS Amplify
- **빌드**: $0.01/분
- **호스팅**: $0.15/GB
- **예상**: $10-30/월

### Docker + ECS
- **Fargate**: $0.04/시간
- **ALB**: $0.0225/시간
- **예상**: $30-50/월

## 마이그레이션 체크리스트

- [ ] AWS 자격증명 설정
- [ ] 환경 변수 설정
- [ ] 로컬 빌드 테스트
- [ ] Vercel/Amplify 배포
- [ ] 도메인 연결
- [ ] SSL 인증서 설정
- [ ] 모니터링 설정
- [ ] 알림 설정

---

**다음 단계**: [Vercel 배포 가이드](https://vercel.com/docs)
