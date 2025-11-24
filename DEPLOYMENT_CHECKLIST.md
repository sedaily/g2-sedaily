# 배포 체크리스트

## 사전 준비

### 1. 환경 변수 확인
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION (us-east-1)
- [ ] ADMIN_PASSWORD (선택)

### 2. AWS 리소스 확인
```bash
# DynamoDB 테이블 확인
aws dynamodb describe-table --table-name sedaily-quiz-data

# Lambda 함수 확인
aws lambda get-function --function-name sedaily-chatbot-dev-handler

# CloudFront 배포 확인
aws cloudfront get-distribution --id E8HKFQFSQLNHZ
```

### 3. 로컬 빌드 테스트
```bash
pnpm install
pnpm build
pnpm start
```

## Vercel 배포

### 1단계: CLI 설치
```bash
npm i -g vercel
vercel login
```

### 2단계: 프로젝트 연결
```bash
cd /path/to/g2-clone
vercel
```

### 3단계: 환경 변수 설정
```bash
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
```

### 4단계: 프로덕션 배포
```bash
vercel --prod
```

### 5단계: 도메인 연결 (선택)
```bash
vercel domains add g2.sedaily.ai
```

## 배포 후 확인

### 1. 기본 기능
- [ ] 홈페이지 로딩 (/)
- [ ] 게임 페이지 (/games)
- [ ] 관리자 페이지 (/admin/quiz)

### 2. API 테스트
```bash
# 최신 퀴즈 조회
curl https://your-domain.vercel.app/api/quiz/latest?gameType=BlackSwan

# 메트릭 조회
curl https://your-domain.vercel.app/api/admin/metrics
```

### 3. 실시간 업데이트 테스트
1. 관리자 페이지에서 퀴즈 저장
2. 30초 대기
3. 사용자 페이지에서 새 퀴즈 확인

### 4. 캐시 무효화 테스트
1. 관리자 페이지 → 배포 관리
2. "캐시 무효화" 버튼 클릭
3. 성공 메시지 확인

### 5. 메트릭 확인
- [ ] DynamoDB 아이템 수
- [ ] Lambda 호출 횟수
- [ ] 에러 발생 여부

## 문제 해결

### 빌드 실패
```bash
# 로컬 빌드 로그 확인
pnpm build 2>&1 | tee build.log

# Vercel 로그 확인
vercel logs
```

### API 오류
```bash
# AWS 자격증명 확인
aws sts get-caller-identity

# 환경 변수 확인
vercel env ls
```

### 실시간 업데이트 안됨
1. 브라우저 콘솔 확인 (F12)
2. 네트워크 탭에서 API 호출 확인
3. 30초 대기 후 재확인

## 롤백 절차

### Vercel
```bash
# 이전 배포로 롤백
vercel rollback
```

### Git
```bash
# 이전 버전으로 되돌리기
git revert HEAD
git push origin main
```

## 모니터링

### CloudWatch
```bash
# 메트릭 확인
pnpm monitor:dashboard

# 실시간 모니터링
pnpm monitor:watch
```

### Vercel Analytics
- Vercel 대시보드에서 확인
- 실시간 트래픽 모니터링

## 완료 확인

- [ ] 배포 성공
- [ ] 모든 페이지 정상 작동
- [ ] API 정상 응답
- [ ] 실시간 업데이트 작동
- [ ] 관리자 기능 정상
- [ ] 메트릭 수집 정상
- [ ] 도메인 연결 (선택)
- [ ] SSL 인증서 활성화

---

**배포 완료 시간**: ___________  
**배포자**: ___________  
**버전**: v2.5.0  
**상태**: ✅ 완료
