# Changelog v2.8.1

**날짜**: 2025-11-26  
**버전**: v2.8.1

## 🎯 주요 변경사항

### ✅ Archive 페이지 캐시 문제 해결
- **문제**: `cache: "force-cache"`가 빈 응답을 브라우저에 캐시
- **증상**: Archive 페이지에서 "아카이브 데이터가 없습니다" 표시
- **해결**: `quiz-api-client.ts`의 `fetchAvailableDates` 함수에서 `cache: "no-store"`로 변경
- **결과**: 퀴즈 저장 후 즉시 Archive에 반영

### ✅ 환경 변수 빌드 포함 확인
- **문제**: `.env` 파일이 빌드 시 읽히지 않음
- **해결**: `.env` 내용을 `.env.local`로 복사
- **결과**: API URL이 빌드된 JavaScript에 정상 포함

### ✅ 퀴즈 데이터 실시간 반영 완료
- 관리자 페이지에서 퀴즈 저장 → DynamoDB 저장
- 사용자가 Archive 페이지 강력 새로고침 → 퀴즈 즉시 표시
- CloudFront 캐시 무효화 불필요 (퀴즈 데이터는 API로 동적 로딩)

## 🔧 기술적 변경사항

### Frontend
```typescript
// lib/quiz-api-client.ts
// 변경 전
cache: "force-cache", // 날짜 목록은 캐시 허용

// 변경 후
cache: "no-store", // 항상 최신 데이터 가져오기
```

### 환경 변수
```bash
# .env 파일 내용을 .env.local로 복사
cp .env .env.local

# Next.js는 .env.local을 우선적으로 읽음
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
```

## 🐛 수정된 버그

### 1. Archive 페이지 빈 데이터 문제
**증상**:
```
[v0] Found 0 dates for PrisonersDilemma
```

**원인**:
- `force-cache`가 이전 빈 응답을 캐시
- 새로운 퀴즈를 저장해도 캐시된 빈 응답 반환

**해결**:
- `no-store`로 변경하여 항상 서버에서 최신 데이터 가져오기

### 2. 환경 변수 누락 문제
**증상**:
- 빌드된 JavaScript에 API URL 없음
- Archive 페이지가 API 호출 불가

**원인**:
- Next.js가 `.env` 파일을 읽지 못함
- `.env.local`이 우선순위가 높음

**해결**:
- `.env` 내용을 `.env.local`로 복사

## 📊 API 동작 확인

### 정상 동작
```bash
# 날짜 목록 조회
curl https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/PrisonersDilemma/dates
# 응답: {"dates": ["2025-11-26"]}

# 퀴즈 데이터 조회
curl https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/PrisonersDilemma/2025-11-26
# 응답: {date, questions: [...], gameType, ...}
```

### 브라우저 콘솔 (정상)
```
[v0] Getting available dates for PrisonersDilemma (multi-layer cache)
[v0] Fetching available dates for PrisonersDilemma from: https://...
[v0] Found 1 dates for PrisonersDilemma
```

## 🚀 사용자 워크플로우

### 관리자 (퀴즈 생성)
1. https://g2.sedaily.ai/admin/quiz 접속
2. "퀴즈 관리" 탭에서 퀴즈 작성
3. "저장" 버튼 클릭 → DynamoDB 저장 완료

### 사용자 (퀴즈 플레이)
1. https://g2.sedaily.ai/games/g2/archive 접속
2. `Cmd + Shift + R` (강력 새로고침)
3. 2025-11-26 날짜 클릭
4. 퀴즈 플레이

## ⚠️ 중요 사항

### 캐시 전략
- **퀴즈 데이터**: `cache: "no-store"` (항상 최신)
- **정적 파일**: CloudFront 캐시 (HTML/CSS/JS)
- **브라우저 캐시**: 강력 새로고침 필요

### 환경 변수 우선순위
```
.env.local > .env
```

Next.js는 `.env.local`을 먼저 읽으므로, 로컬 개발 시 `.env.local`에 환경 변수 설정 필요

### 배포 후 확인
```bash
# 빌드된 파일에 API URL 포함 확인
grep -r "u8ck54y36j" out/_next/static/chunks/*.js

# 결과: API URL이 포함된 JavaScript 파일 목록 표시
```

## 🔗 관련 이슈

- Archive 페이지 빈 데이터 문제 해결
- 환경 변수 빌드 포함 확인
- 브라우저 캐시 전략 최적화

## 📝 다음 단계

- ✅ 퀴즈 CRUD 완전 작동
- ✅ Archive 페이지 실시간 반영
- ✅ 사용자 경험 개선 완료

---

**작성자**: Amazon Q  
**날짜**: 2025-11-26
