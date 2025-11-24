# 🛠️ 관리자 페이지 통합 가이드

## 개요

관리자 페이지(`/admin/quiz`)에서 퀴즈 관리부터 배포까지 모든 작업을 처리할 수 있습니다.

## 🎯 주요 기능

### 1. 퀴즈 관리
- 객관식/주관식 퀴즈 생성
- 날짜별 퀴즈 관리
- 실시간 미리보기
- DynamoDB 자동 저장

### 2. Quizlet 관리
- CSV 파일 업로드
- 용어-정의 매칭 게임
- 자동 검증

### 3. 캐시 관리
- localStorage 캐시 초기화
- 게임별 캐시 관리
- 전체 캐시 삭제

### 4. 배포 관리 ⭐ NEW
- **원클릭 배포**: 버튼 하나로 프론트엔드 배포
- **캐시 무효화**: CloudFront 캐시 즉시 무효화
- **실시간 메트릭**: DynamoDB, CloudFront, Lambda 상태 확인
- **배포 정보**: S3, CloudFront 설정 확인

## 📋 사용 방법

### 배포 프로세스

1. **퀴즈 작성 및 저장**
   - "퀴즈 관리" 탭에서 퀴즈 작성
   - "저장" 버튼 클릭
   - DynamoDB에 자동 저장

2. **배포 실행**
   - "배포 관리" 탭으로 이동
   - "빠른 배포" 버튼 클릭
   - 2-3분 대기

3. **캐시 무효화**
   - "캐시 무효화" 버튼 클릭
   - 5-10분 후 전체 반영

### 시스템 상태 확인

**DynamoDB**
- 현재 저장된 퀴즈 아이템 수
- 테이블 크기
- 상태 (ACTIVE/ERROR)

**CloudFront**
- 총 요청 수
- 대역폭 사용량
- 에러율

**Lambda**
- 함수 호출 횟수
- 에러 발생 수
- 평균 응답 시간

## 🔧 기술 구현

### API 엔드포인트

```typescript
// 배포 실행
POST /api/admin/deploy
Body: { type: 'quick' | 'full' }

// 메트릭 조회
GET /api/admin/metrics

// 캐시 무효화
POST /api/admin/invalidate-cache
```

### 컴포넌트 구조

```
app/admin/quiz/page.tsx          # 메인 관리자 페이지
├── QuizEditor                    # 퀴즈 편집기
├── QuizletUploader              # Quizlet 업로더
├── CacheManager                 # 캐시 관리
└── DeployManager                # 배포 관리 ⭐

app/api/admin/
├── deploy/route.ts              # 배포 API
├── metrics/route.ts             # 메트릭 API
└── invalidate-cache/route.ts    # 캐시 무효화 API
```

## ⚠️ 주의사항

### 배포 시

1. **빌드 확인**: 로컬에서 `pnpm build` 테스트
2. **백업**: 중요한 변경 전 백업
3. **시간**: 배포는 2-3분, 캐시 무효화는 5-10분 소요
4. **동시 배포 금지**: 배포 중 다시 배포하지 않기

### 권한

- AWS CLI 설정 필요
- S3 쓰기 권한
- CloudFront 무효화 권한
- DynamoDB 읽기 권한

## 🚀 워크플로우 예시

### 일일 퀴즈 업데이트

```
1. 관리자 페이지 접속 (/admin/quiz)
2. 날짜 선택 (캘린더)
3. 퀴즈 작성 (퀴즈 관리 탭)
4. 저장 버튼 클릭
5. 배포 관리 탭으로 이동
6. 빠른 배포 클릭
7. 완료 메시지 확인
8. 5-10분 후 사이트 확인
```

### 긴급 수정

```
1. 퀴즈 수정 후 저장
2. 배포 관리 → 빠른 배포
3. 즉시 캐시 무효화 클릭
4. 5분 후 반영 확인
```

## 🔍 문제 해결

### 배포 실패

```bash
# 로컬에서 직접 배포
pnpm deploy:quick

# 로그 확인
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json
```

### 메트릭 조회 실패

```bash
# AWS 자격증명 확인
aws sts get-caller-identity

# DynamoDB 접근 확인
aws dynamodb describe-table --table-name sedaily-quiz-data
```

### 캐시 무효화 안됨

```bash
# 수동 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

## 📊 모니터링

### 배포 후 체크리스트

- [ ] 홈페이지 로딩 확인
- [ ] 새 퀴즈 표시 확인
- [ ] 게임 플레이 테스트
- [ ] 모바일 반응형 확인
- [ ] 404 페이지 확인

### 정기 점검 (주 1회)

- [ ] DynamoDB 아이템 수 확인
- [ ] CloudFront 요청 수 확인
- [ ] Lambda 에러율 확인
- [ ] 배포 로그 검토

## 🎯 Best Practices

1. **퀴즈 작성 → 저장 → 배포** 순서 준수
2. **배포 전 미리보기**로 내용 확인
3. **피크 시간 피해** 배포 (오전 9시, 오후 6시 피하기)
4. **배포 후 5분 대기** 후 확인
5. **문제 발생 시** 즉시 롤백 (`pnpm guard:emergency`)

## 🔗 관련 문서

- [배포 가이드](DEPLOYMENT.md)
- [모니터링 가이드](MONITORING.md)
- [404 방지 가이드](404_PREVENTION.md)

---

**💡 Tip**: 관리자 페이지를 북마크하고 비밀번호를 안전하게 보관하세요!
