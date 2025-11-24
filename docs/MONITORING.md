# 📊 모니터링 & 자동화 가이드

## 🎯 개요

G2 플랫폼의 자동 재배포, 알림, 성능 모니터링 시스템 가이드입니다.

## 🔄 자동 재배포 시스템

### 기능
- DynamoDB에 새 퀴즈 업로드 감지
- 자동으로 프론트엔드 재배포
- Slack/Discord 알림 전송

### 사용법

```bash
# 모니터링 모드 (5분마다 체크)
pnpm auto:redeploy

# 1회 체크
node scripts/auto-redeploy.mjs once

# 강제 재배포
pnpm auto:force
```

### 백그라운드 실행 (프로덕션)

```bash
# PM2 사용
pm2 start scripts/auto-redeploy.mjs --name g2-auto-redeploy

# nohup 사용
nohup node scripts/auto-redeploy.mjs > auto-redeploy.log 2>&1 &
```

## 📢 알림 시스템

### 설정

1. **Slack Webhook 생성**
   - Slack App 생성: https://api.slack.com/apps
   - Incoming Webhooks 활성화
   - Webhook URL 복사

2. **Discord Webhook 생성**
   - 서버 설정 → 연동 → 웹후크
   - 웹후크 생성 후 URL 복사

3. **환경 변수 설정**
```bash
# .env 파일에 추가
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

### 테스트

```bash
# 알림 테스트
pnpm notify:test
```

### 알림 타입

- `success`: 성공 (녹색)
- `error`: 에러 (빨간색)
- `warning`: 경고 (주황색)
- `info`: 정보 (파란색)
- `deploy`: 배포 (보라색)

## 📊 성능 모니터링 대시보드

### 기능

- Lambda 함수 메트릭 (호출, 에러, 응답시간)
- CloudFront 메트릭 (요청, 대역폭, 에러율)
- DynamoDB 메트릭 (아이템 수, 크기, 상태)
- 배포 통계 (성공/실패율)

### 사용법

```bash
# 콘솔 대시보드 (1회)
pnpm monitor:dashboard

# Watch 모드 (30초마다 갱신)
pnpm monitor:watch

# HTML 대시보드 생성
pnpm monitor:html
# → monitoring-dashboard.html 파일 생성
```

### 메트릭 설명

#### Lambda Chatbot
- **Invocations**: 총 호출 횟수
- **Errors**: 에러 발생 횟수
- **Avg Duration**: 평균 응답 시간 (ms)
- **Error Rate**: 에러율 (%)

#### CloudFront
- **Requests**: 총 요청 수
- **Bandwidth**: 전송 대역폭 (MB)
- **4xx Error Rate**: 클라이언트 에러율 (%)

#### DynamoDB
- **Items**: 저장된 아이템 수
- **Size**: 테이블 크기 (KB)
- **Status**: 테이블 상태 (ACTIVE/ERROR)

#### Deployments
- **Total**: 총 배포 횟수
- **Success**: 성공한 배포
- **Failed**: 실패한 배포
- **Last Deploy**: 마지막 배포 시간

## 🔧 통합 워크플로우

### 1. 새 퀴즈 업로드 시 자동 배포

```bash
# 1. 자동 재배포 시스템 시작
pnpm auto:redeploy

# 2. 관리자가 /admin/quiz에서 퀴즈 업로드
# 3. 시스템이 자동으로 감지하고 재배포
# 4. Slack/Discord로 알림 전송
```

### 2. 정기 모니터링

```bash
# 매일 아침 대시보드 확인
pnpm monitor:dashboard

# 또는 HTML 대시보드 생성 후 브라우저에서 확인
pnpm monitor:html
open monitoring-dashboard.html
```

### 3. 긴급 상황 대응

```bash
# 1. 모니터링으로 문제 감지
pnpm monitor:dashboard

# 2. 강제 재배포
pnpm auto:force

# 3. 응급 복구
pnpm guard:emergency
```

## 📈 CloudWatch 커스텀 메트릭

### 챗봇 메트릭
- `G2/Chatbot/BigKindsAPIAttempt`: BigKinds API 시도
- `G2/Chatbot/BigKindsAPISuccess`: BigKinds API 성공
- `G2/Chatbot/BigKindsAPIError`: BigKinds API 에러

### 조회 방법

```bash
# AWS CLI로 메트릭 조회
aws cloudwatch get-metric-statistics \
  --namespace "G2/Chatbot" \
  --metric-name "BigKindsAPISuccess" \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

## 🚨 알림 예시

### 성공 알림
```
✅ 자동 재배포 완료
Message: 배포 성공: https://g2.sedaily.ai
Time: 2025-01-24 14:30:00
Environment: Production
```

### 에러 알림
```
❌ 자동 재배포 실패
Message: Build failed: npm run build exited with code 1
Time: 2025-01-24 14:30:00
Environment: Production
```

## 🔐 보안 고려사항

1. **Webhook URL 보호**
   - `.env` 파일에만 저장
   - Git에 커밋하지 않음
   - 주기적으로 재생성

2. **AWS 권한**
   - CloudWatch 읽기 권한 필요
   - DynamoDB 읽기 권한 필요
   - 최소 권한 원칙 적용

## 📝 문제 해결

### 알림이 전송되지 않음
```bash
# 1. Webhook URL 확인
echo $SLACK_WEBHOOK_URL
echo $DISCORD_WEBHOOK_URL

# 2. 테스트 알림 전송
pnpm notify:test

# 3. 네트워크 연결 확인
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'
```

### 모니터링 데이터가 없음
```bash
# 1. AWS 자격증명 확인
aws sts get-caller-identity

# 2. CloudWatch 권한 확인
aws cloudwatch list-metrics --namespace AWS/Lambda

# 3. 리전 확인
echo $AWS_REGION
```

### 자동 재배포가 작동하지 않음
```bash
# 1. DynamoDB 접근 확인
aws dynamodb describe-table --table-name sedaily-quiz-data

# 2. 수동 체크
node scripts/auto-redeploy.mjs once

# 3. 로그 확인
tail -f auto-redeploy.log
```

## 🎯 Best Practices

1. **모니터링 주기**
   - 자동 재배포: 5분마다 체크
   - 대시보드: 매일 1회 확인
   - 알림: 즉시 확인

2. **알림 관리**
   - 중요 알림만 Slack/Discord로 전송
   - 로그는 파일로 저장
   - 알림 피로도 방지

3. **성능 최적화**
   - CloudWatch 쿼리 최소화
   - 캐싱 활용
   - 배치 처리

---

**📞 문의**
- 문제 발생 시 GitHub Issues 등록
- 긴급 상황: Slack #g2-alerts 채널
