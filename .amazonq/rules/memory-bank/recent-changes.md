# 최근 변경사항 (2025-11-26)

## v2.8.1 - Archive 캐시 문제 해결

### 핵심 수정
1. **quiz-api-client.ts**: `cache: "force-cache"` → `cache: "no-store"`
2. **환경 변수**: `.env` → `.env.local` 복사
3. **결과**: Archive 페이지에서 퀴즈 즉시 표시

### 문제 해결 과정
```
문제: Archive 페이지 빈 데이터
→ 브라우저 콘솔: [v0] Found 0 dates
→ API 테스트: 정상 응답 {"dates": ["2025-11-26"]}
→ 원인: force-cache가 빈 응답 캐시
→ 해결: no-store로 변경
```

---

## v2.8.0 - 퀴즈 CRUD 완전 구현

### 주요 기능
1. **퀴즈 생성**: 관리자 페이지 → Lambda → DynamoDB
2. **퀴즈 조회**: Archive 페이지 → Lambda → 퀴즈 표시
3. **퀴즈 삭제**: 관리자 "퀴즈 삭제" 탭 → Lambda DELETE

### API Gateway 설정
```
POST /quiz                      # 퀴즈 생성
GET  /quiz/{gameType}/dates     # 날짜 목록
GET  /quiz/{gameType}/{date}    # 퀴즈 조회
DELETE /quiz/{gameType}/{date}  # 퀴즈 삭제
OPTIONS /quiz                   # CORS
```

### Lambda 수정
- Python 문법 에러 수정 (닫는 중괄호)
- admin-utils payload 형식 지원
- CORS 헤더 추가

### 프론트엔드 수정
- QuizList.tsx 추가 (삭제 기능)
- DeployManager.tsx 수정 (API 라우트 제거)
- RealtimeStatus 제거

---

## 주요 파일 변경

### Backend
```python
# aws/quiz-lambda/handler.py
- 문법 에러 수정
- gameType, quizDate, data.questions 지원
```

### Frontend
```typescript
// lib/quiz-api-client.ts
- cache: "no-store" 변경
- Lambda 응답 파싱 개선

// components/admin/QuizList.tsx
- 퀴즈 삭제 기능 추가

// components/admin/DeployManager.tsx
- API 라우트 제거
- CLI 명령어 안내로 변경
```

### 환경 변수
```bash
# .env.local (필수)
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz
NEXT_PUBLIC_CHATBOT_API_URL=https://vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com/dev/chat
```

---

## 사용자 워크플로우

### 관리자
1. https://g2.sedaily.ai/admin/quiz
2. "퀴즈 관리" 탭 → 퀴즈 작성 → 저장
3. "퀴즈 삭제" 탭 → 날짜 선택 → 삭제

### 사용자
1. https://g2.sedaily.ai/games/g2/archive
2. Cmd + Shift + R (강력 새로고침)
3. 날짜 클릭 → 퀴즈 플레이

---

## 트러블슈팅

### Archive 빈 데이터
```bash
# 1. 브라우저 강력 새로고침
Cmd + Shift + R

# 2. API 테스트
curl https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/PrisonersDilemma/dates

# 3. 환경 변수 확인
cat .env.local | grep QUIZ_API

# 4. 재배포
bash scripts/deploy.sh
```

### 502 에러
- 정적 사이트에 API 라우트 없음
- Lambda API Gateway로 직접 호출
- 이미 수정됨 (v2.8.0)

---

## 다음 단계

- ✅ 퀴즈 CRUD 완전 작동
- ✅ Archive 실시간 반영
- ✅ 사용자 경험 개선
- ✅ 문서화 완료

---

**작성일**: 2025-11-26  
**작성자**: Amazon Q
