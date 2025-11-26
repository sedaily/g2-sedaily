# 최근 변경사항 (2025-11-26)

## v2.10.1 - 퀴즈 수정 기능

### 핵심 수정
1. **기존 퀴즈 불러오기**: Lambda에서 기존 퀴즈 데이터 로드
2. **수정 모드 UI**: "수정 모드" 배지 표시
3. **데이터 변환**: Lambda Question ↔ QuizQuestion 자동 변환
4. **기존 값 유지**: 모든 필드 자동 채워짐 (문제, 선택지, 정답, 해설, 관련 기사, 태그)
5. **탭 이름 변경**: "퀴즈 삭제" → "퀴즈 수정"

### 사용 방법
```
1. 관리자 페이지 접속 (/admin/quiz)
2. "퀴즈 수정" 탭 클릭
3. 게임 타입 선택 (BlackSwan, PrisonersDilemma, SignalDecoding)
4. 날짜 선택
5. "수정" 버튼 클릭
6. 기존 문제들이 자동으로 로드됨
7. 수정 후 "저장" → DynamoDB 업데이트
```

### QuizList UI 기능
```typescript
// components/admin/QuizList.tsx

// 상태 관리
const [gameType, setGameType] = useState<GameType>("BlackSwan")
const [dates, setDates] = useState<string[]>([])
const [selectedDate, setSelectedDate] = useState<string | null>(null)
const [questions, setQuestions] = useState<Question[]>([])
const [loading, setLoading] = useState(false)
const [deleting, setDeleting] = useState(false)

// 게임 타입 선택 버튼 (3개)
<Button onClick={() => setGameType("BlackSwan")}>블랙스완</Button>
<Button onClick={() => setGameType("PrisonersDilemma")}>죄수의 딜레마</Button>
<Button onClick={() => setGameType("SignalDecoding")}>시그널 디코딩</Button>

// 새로고침 버튼
<Button onClick={loadDates}>
  <RefreshCw className={loading ? "animate-spin" : ""} />
</Button>

// 날짜 드롭다운
<select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
  {dates.map(date => <option key={date} value={date}>{date}</option>)}
</select>

// 문제 미리보기
<Badge>{questions.length}개 문제</Badge>
{questions.map((q, idx) => (
  <div>Q{idx + 1}: {q.question.substring(0, 50)}...</div>
))}
```

### 기술 세부사항
```typescript
// components/admin/QuizList.tsx

const handleEdit = async (gameType: string, date: string) => {
  // 1. Lambda에서 기존 퀴즈 불러오기
  const response = await fetch(`${API_BASE}/quiz/${gameType}/${date}`)
  const data = await response.json()
  
  // 2. Lambda Question → QuizQuestion 변환
  const loadedQuestions: QuizQuestion[] = data.questions.map((q: any) => ({
    id: q.id,
    date: date,
    theme: gameType as GameTheme,
    questionType: q.questionType,
    question_text: q.question,
    choices: q.questionType === "객관식" 
      ? q.options 
      : [q.answer],  // 주관식은 answer를 choices[0]에
    correct_index: q.questionType === "객관식" 
      ? parseInt(q.answer) - 1  // "1" → 0
      : null,
    explanation: q.explanation,
    related_article: q.relatedArticle ? {
      title: q.relatedArticle.title,
      snippet: q.relatedArticle.excerpt,
      url: q.newsLink
    } : undefined,
    creator: "",
    tags: q.tags
  }))
  
  // 3. 관리자 페이지로 전달
  onEdit(loadedQuestions, date)
}

// app/admin/quiz/page.tsx

const [isEditMode, setIsEditMode] = useState(false)

// QuizList에서 onEdit 호출 시
onEdit={(loadedQuestions, date) => {
  setQuestions(loadedQuestions)  // 기존 문제들 설정
  setSelectedDate(new Date(date))  // 날짜 설정
  setCurrentQuestionIndex(0)  // 첫 번째 문제로
  setIsEditMode(true)  // 수정 모드 활성화
  setActiveTab("quiz")  // 퀴즈 관리 탭으로 이동
}}
```

---

## v2.10.0 - 여러 문제 추가 기능

### 핵심 수정
1. **여러 문제 추가**: 한 날짜에 여러 문제 작성 가능
2. **문제 네비게이션**: 이전/다음 버튼
3. **문제 카운터**: "문제 1 / 3" 표시
4. **문제 삭제**: 현재 문제 삭제
5. **배포 개선**: `bash scripts/deploy.sh` 권장

### 사용 방법
```
1. 날짜 선택 (2025-11-26)
2. 첫 번째 문제 작성
3. "+ 문제 추가" 클릭
4. 두 번째 문제 작성
5. "+ 문제 추가" 클릭
6. 세 번째 문제 작성
7. "저장" → 3개 문제가 한 세트로 저장
```

---

## v2.9.0 - 정적 사이트 동적 라우트 문제 해결 (CRITICAL)

### 핵심 수정
1. **동적 라우트 제거**: `/games/g2/[date]` 폴더 삭제
2. **정적 /play 페이지**: query param으로 모든 날짜 처리
3. **빌드 성공**: `output: 'export'`와 호환
4. **UniversalQuizPlayer 개선**: 키보드 단축키 (A,B,C,D), 완료 화면 수정
5. **자동 캐시 초기화**: 퀴즈 저장/삭제 시 자동 반영
6. **Vercel 의존성 제거**: @vercel/analytics 삭제
7. **배포 관리 페이지 제거**: 불필요한 UI 간소화

### 문제 해결 과정
```
문제: Archive 카드 클릭 → 404 에러
원인: output: 'export'는 동적 라우트 불가
해결: /play?date=20251126 형식 사용
결과: 정적 페이지 1개로 모든 날짜 처리 ✅
```

### 라우트 구조 변경
**Before (동적 - 작동 안 함)**
```
/games/g2/[date]/page.tsx  ← 404 에러
dynamicParams: true + output: 'export' 충돌
```

**After (정적 - 작동함)**
```
/games/g2/play/page.tsx?date=20251126  ← ✅
useSearchParams() + normalizeDate() + Lambda API
정적 페이지 1개로 모든 날짜 처리
```

### 자동 캐시 초기화
**Before**
```
퀴즈 저장/삭제 → 수동 캐시 초기화 필요
```

**After**
```
퀴즈 저장/삭제 → 자동 캐시 초기화 ✅
- clearQuizDataCache() (메모리 + localStorage)
- clearDateCache() (게임별 캐시)
```

### 관리자 페이지 간소화
- ❌ 배포 관리 탭 제거 (터미널에서만 배포 가능)
- ✅ 4개 탭으로 축소: 퀴즈 관리, Quizlet 관리, 퀴즈 수정, 캐시 관리

---

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
3. "퀴즈 수정" 탭 → 날짜 선택 → 수정 → 저장
4. "퀴즈 수정" 탭 → 날짜 선택 → 삭제

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

- ✅ 퀴즈 CRUD 완전 작동 (생성/조회/수정/삭제)
- ✅ Archive 실시간 반영
- ✅ 사용자 경험 개선
- ✅ 문서화 완료
- ✅ 퀴즈 수정 기능 (v2.10.1)

---

**작성일**: 2025-11-26  
**작성자**: Amazon Q
