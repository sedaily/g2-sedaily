# 🚀 지금 바로 배포하기

## 현재 상태
- ✅ 버전: v2.5.0
- ✅ 커밋: 7800033
- ✅ 빌드: 성공
- ✅ API Routes: 5개
- ✅ 실시간 업데이트: 활성화

---

## 배포 명령어

### Vercel (1분 배포)

```bash
# 1. Vercel CLI 설치 (처음만)
npm i -g vercel

# 2. 로그인 (처음만)
vercel login

# 3. 환경 변수 설정 (처음만)
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION

# 4. 프로덕션 배포
vercel --prod
```

### AWS Amplify

1. https://console.aws.amazon.com/amplify 접속
2. "New app" → "Host web app"
3. GitHub 연결
4. 환경 변수 추가:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION=us-east-1
5. "Save and deploy"

---

## 배포 후 확인

### 1. 기본 테스트
```bash
# 홈페이지
curl -I https://your-domain.vercel.app/

# API 테스트
curl https://your-domain.vercel.app/api/quiz/latest?gameType=BlackSwan
```

### 2. 관리자 페이지
1. https://your-domain.vercel.app/admin/quiz
2. 비밀번호 입력
3. 퀴즈 저장 테스트
4. 실시간 메트릭 확인

### 3. 사용자 페이지
1. https://your-domain.vercel.app/games/g1/play
2. 30초 대기
3. 새로고침 버튼 클릭
4. 퀴즈 플레이

---

## 예상 소요 시간

- Vercel 배포: **1-2분**
- AWS Amplify: **3-5분**
- 캐시 무효화: **5-10분**

---

## 배포 완료 후

### 1. 도메인 연결
```bash
# Vercel
vercel domains add g2.sedaily.ai

# DNS 설정
# CNAME: g2 → cname.vercel-dns.com
```

### 2. 모니터링 설정
```bash
# CloudWatch 대시보드
pnpm aws:dashboard

# 실시간 모니터링
pnpm monitor:watch
```

### 3. 알림 설정
```bash
# .env에 추가
SLACK_WEBHOOK_URL=your_url
DISCORD_WEBHOOK_URL=your_url

# 테스트
pnpm notify:test
```

---

## 🎉 완료!

배포가 완료되면:
- ✅ 관리자가 퀴즈 저장 → 30초 내 사용자 반영
- ✅ 실시간 메트릭 확인
- ✅ 원클릭 캐시 무효화
- ✅ 자동 스케일링

**지금 배포하세요**: `vercel --prod`
