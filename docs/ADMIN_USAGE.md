# 관리자 페이지 사용 가이드

## 접속 방법

1. **URL**: https://g2.sedaily.ai/admin/quiz
2. **비밀번호**: `sedaily2024!` (`.env` 파일의 `ADMIN_PASSWORD`)

## 기능별 사용법

### 1️⃣ 퀴즈 관리

#### 퀴즈 작성
1. 날짜 선택 (캘린더 아이콘)
2. 게임 타입 선택 (BlackSwan, PrisonersDilemma, SignalDecoding)
3. 문제 유형 선택 (객관식/주관식)
4. 문제 내용 입력
5. 선택지 입력 (객관식) 또는 힌트 입력 (주관식)
6. 정답 설정
7. 해설 작성
8. 관련 기사 URL 입력
9. **저장** 버튼 클릭

#### 미리보기
- 오른쪽 패널에서 실시간 미리보기 확인
- 실제 게임과 동일한 UI로 표시

### 2️⃣ Quizlet 관리

#### CSV 업로드
1. CSV 파일 준비 (형식: `용어,정의`)
2. 파일 선택
3. 세트 이름 입력
4. **업로드** 버튼 클릭

#### CSV 형식 예시
```csv
GDP,국내총생산
CPI,소비자물가지수
금리,자금의 대가로 지급하는 이자율
```

### 3️⃣ 캐시 관리

#### 캐시 초기화
- **전체 캐시 삭제**: 모든 게임의 캐시 삭제
- **게임별 캐시 삭제**: 특정 게임만 삭제
- **날짜별 캐시 삭제**: 특정 날짜만 삭제

#### 언제 사용?
- 퀴즈 수정 후 즉시 반영하고 싶을 때
- 오래된 데이터가 표시될 때
- 배포 후 새 데이터가 안 보일 때

### 4️⃣ 배포 관리

#### 배포 방법
관리자 페이지에서는 **안내만** 제공합니다.

**실제 배포는 터미널에서:**
```bash
# 빠른 배포 (권장)
pnpm deploy:quick

# 완전 검증 배포
pnpm deploy

# 캐시 무효화
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
```

#### 메트릭 확인
터미널에서 실시간 메트릭 확인:
```bash
# 대시보드
pnpm monitor:dashboard

# 실시간 모니터링 (30초 갱신)
pnpm monitor:watch

# HTML 대시보드
pnpm monitor:html
open monitoring-dashboard.html
```

## 워크플로우

### 일일 퀴즈 업데이트
```
1. 관리자 페이지 접속
2. 날짜 선택
3. 퀴즈 작성 및 저장
4. 터미널에서 배포: pnpm deploy:quick
5. 5-10분 대기
6. 사이트 확인
```

### 긴급 수정
```
1. 퀴즈 수정 및 저장
2. 캐시 관리 → 전체 캐시 삭제
3. 터미널에서 배포: pnpm deploy:quick
4. 터미널에서 캐시 무효화:
   aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
5. 5분 후 확인
```

## 주의사항

### ⚠️ 중요
- **배포는 터미널에서만 가능**: 정적 사이트이므로 서버 API 없음
- **메트릭은 터미널에서 확인**: `pnpm monitor:dashboard`
- **동시 작업 금지**: 여러 명이 동시에 퀴즈 작성하지 않기

### 💡 팁
- 퀴즈 작성 전 미리보기로 확인
- 저장 후 즉시 배포하지 말고 여러 퀴즈 작성 후 한번에 배포
- 배포는 피크 시간(오전 9시, 오후 6시) 피하기
- 배포 후 5-10분 대기 후 확인

## 문제 해결

### 저장이 안돼요
- 필수 항목 모두 입력했는지 확인
- 네트워크 연결 확인
- 브라우저 콘솔에서 에러 확인 (F12)

### 새 퀴즈가 안 보여요
1. 캐시 삭제 (캐시 관리 탭)
2. 브라우저 새로고침 (Ctrl+Shift+R)
3. 배포 확인 (터미널에서 `pnpm deploy:quick`)

### 배포가 안돼요
터미널에서 직접 실행:
```bash
# 1. 빌드 테스트
pnpm build

# 2. 배포
pnpm deploy:quick

# 3. 로그 확인
ls -la .deploy-logs/
cat .deploy-logs/deploy-*.json
```

## 단축키

- **Ctrl+S**: 저장 (브라우저 기본 동작)
- **F12**: 개발자 도구 (에러 확인용)
- **Ctrl+Shift+R**: 강력 새로고침 (캐시 무시)

## 지원

- 문제 발생 시: GitHub Issues
- 긴급 상황: `pnpm guard:emergency`
- 문서: [docs/](../docs/)

---

**마지막 업데이트**: 2025-01-24
