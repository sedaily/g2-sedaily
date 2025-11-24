# 배포 가이드 (v2.5.0)

## 빠른 시작

### 1. Vercel 배포 (권장) ⭐

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포
vercel

# 4. 환경 변수 설정
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION

# 5. 프로덕션 배포
vercel --prod
```

### 2. AWS Amplify 배포

1. AWS Amplify 콘솔 접속
2. "New app" → "Host web app"
3. GitHub 저장소 연결
4. 빌드 설정 자동 감지
5. 환경 변수 추가
6. 배포 시작

## 환경 변수

### 필수
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### 선택
```env
ADMIN_PASSWORD=sedaily2024!
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 로컬 개발

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 3. 개발 서버 실행
pnpm dev

# 4. 브라우저에서 확인
# http://localhost:3000
```

## 빌드 테스트

```bash
# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 배포 후 확인사항

- [ ] 홈페이지 로딩
- [ ] 관리자 페이지 접속 (/admin/quiz)
- [ ] 퀴즈 저장 테스트
- [ ] 실시간 업데이트 확인 (30초 대기)
- [ ] 캐시 무효화 테스트
- [ ] 메트릭 확인

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
pnpm build

# 에러 로그 확인
```

### API 오류
```bash
# AWS 자격증명 확인
aws sts get-caller-identity

# DynamoDB 접근 확인
aws dynamodb describe-table --table-name sedaily-quiz-data
```

### 환경 변수 누락
```bash
# Vercel
vercel env ls

# 로컬
cat .env.local
```

## 성능 최적화

- API Routes는 자동으로 서버리스 함수로 배포
- 30초 폴링으로 실시간 업데이트
- CloudFront 캐시 무효화로 즉시 반영

## 비용

### Vercel
- Hobby: 무료
- Pro: $20/월

### AWS Amplify
- 빌드: $0.01/분
- 호스팅: $0.15/GB
- 예상: $10-30/월

---

**다음**: [동적 배포 가이드](docs/DYNAMIC_DEPLOYMENT.md)
