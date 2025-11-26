# 코드베이스 분석 - 서울경제 뉴스게임 플랫폼

**분석 날짜**: 2025-11-26  
**버전**: v2.10.1  
**분석자**: Amazon Q

---

## 🏗️ 전체 아키텍처

### 하이브리드 아키텍처
```
정적 사이트 (S3 + CloudFront)
  ↓
Next.js 15.2.4 (SSG - Static Site Generation)
  ↓
동적 API (Lambda + API Gateway)
  ↓
DynamoDB + Bedrock (Claude 3 Sonnet)
```

### 핵심 특징
- **정적 페이지**: 게임 UI는 빌드 시 HTML 생성
- **동적 데이터**: 퀴즈 데이터는 Lambda API로 실시간 로드
- **Query Param 라우팅**: `/play?date=20251126` 형식으로 정적 빌드 호환
- **RAG 기반 AI**: BigKinds API + 퀴즈 컨텍스트로 Claude 3 Sonnet 활용

---

## 📁 디렉토리 구조

### Frontend (Next.js App Router)
```
app/
├── layout.tsx              # 루트 레이아웃 (헤더, 푸터)
├── page.tsx                # 홈 (→ /games 리다이렉트)
├── games/
│   ├── page.tsx            # 게임 허브 (4개 게임 카드)
│   ├── g1/ (BlackSwan)
│   │   ├── page.tsx        # → /play 리다이렉트
│   │   ├── play/page.tsx   # 퀴즈 플레이어 (query param)
│   │   └── archive/page.tsx # 과거 퀴즈 목록
│   ├── g2/ (PrisonersDilemma)
│   │   ├── page.tsx
│   │   ├── play/page.tsx
│   │   └── archive/page.tsx
│   ├── g3/ (SignalDecoding)
│   │   ├── page.tsx
│   │   ├── play/page.tsx
│   │   └── archive/page.tsx
│   └── quizlet/
│       └── page.tsx        # 카드 매칭 게임
└── admin/
    └── quiz/page.tsx       # 관리자 패널 (v2.10.1 - 퀴즈 수정)
```

### Components
```
components/
├── games/
│   ├── UniversalQuizPlayer.tsx  # 통합 퀴즈 플레이어 (키보드 단축키)
│   ├── QuizQuestion.tsx         # 개별 문제 렌더링
│   ├── QuizCompletion.tsx       # 완료 화면
│   ├── AIChatbot.tsx            # RAG 기반 AI 챗봇
│   ├── ArchiveCard.tsx          # 아카이브 카드
│   └── GameCard.tsx             # 게임 허브 카드
├── admin/
│   ├── QuizEditor.tsx           # 문제 편집기 (v2.10.1)
│   ├── QuizPreview.tsx          # 미리보기
│   ├── QuizList.tsx             # 퀴즈 수정/삭제
│   ├── QuizletUploader.tsx      # CSV 업로드
│   └── CacheManager.tsx         # 캐시 관리
└── ui/                          # Radix UI 기반 컴포넌트
```

### Library
```
lib/
├── games-data.ts           # 게임 메타데이터, 퀴즈 로딩 로직
├── quiz-api-client.ts      # Lambda API 클라이언트 (다층 캐싱)
├── quiz-cache.ts           # localStorage 캐시 관리
├── admin-utils.ts          # 관리자 유틸 (저장, 검증)
├── chatbot-api.ts          # AI 챗봇 API 클라이언트
├── quiz-themes.ts          # 게임별 테마 스타일
└── date-utils.ts           # 날짜 유틸리티
```

### Backend
```
aws/quiz-lambda/
├── handler.py              # Quiz API Lambda (Python 3.11)
└── deploy.sh               # 배포 스크립트

backend/lambda/
├── enhanced-chatbot-handler.py  # RAG 챗봇 Lambda
└── requirements.txt        # boto3, requests, beautifulsoup4
```

---

## 🎮 게임 시스템

### 4가지 게임 타입
```typescript
// lib/games-data.ts
export const GAMES: GameMeta[] = [
  {
    id: "g1",
    title: "블랙 스완",
    gameType: "BlackSwan",
    playUrl: "/games/g1/play",
    color: "#3B82F6"
  },
  {
    id: "g2",
    title: "죄수의 딜레마",
    gameType: "PrisonersDilemma",
    playUrl: "/games/g2/play",
    color: "#10B981"
  },
  {
    id: "g3",
    title: "시그널 디코딩",
    gameType: "SignalDecoding",
    playUrl: "/games/g3/play",
    color: "#F59E0B"
  },
  {
    id: "quizlet",
    title: "카드 매칭",
    playUrl: "/games/quizlet",
    color: "#EC4899"
  }
]
```

### 라우팅 구조 (v2.9.0 변경)
**Before (동적 - 작동 안 함)**
```
/games/g2/[date]/page.tsx  ← 404 에러
dynamicParams: true + output: 'export' 충돌
```

**After (정적 - 작동함)**
```
/games/g2/play?date=20251126  ← ✅
useSearchParams() + normalizeDate() + Lambda API
```

### 날짜 정규화
```typescript
// app/games/g2/play/page.tsx
function normalizeDate(date: string): string | null {
  // YYYYMMDD → YYYY-MM-DD
  if (/^\d{8}$/.test(date)) {
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
  }
  // YYMMDD → YYYY-MM-DD
  if (/^\d{6}$/.test(date)) {
    return `20${date.substring(0, 2)}-${date.substring(2, 4)}-${date.substring(4, 6)}`
  }
  // YYYY-MM-DD (이미 정규화됨)
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  return null
}
```

---

## 🔄 데이터 흐름

### 퀴즈 생성/수정 (관리자)
```
1. 관리자 페이지 (/admin/quiz)
   ↓
2. QuizEditor - 여러 문제 작성 (v2.10.1)
   - 문제 추가 버튼
   - 이전/다음 네비게이션
   - 문제 카운터 (1/3)
   - 수정 모드 (기존 퀴즈 불러오기)
   ↓
3. saveToLambda(questions[], date, apiUrl)
   - 게임 타입별 그룹화
   - Lambda 형식 변환
   ↓
4. Lambda API Gateway (POST /quiz)
   ↓
5. DynamoDB 저장
   PK: "QUIZ#PrisonersDilemma"
   SK: "DATE#2025-11-26"
   questions: [q1, q2, q3]
   ↓
6. 자동 캐시 초기화
   - clearQuizDataCache()
   - clearDateCache(gameType, date)
```

### 퀴즈 플레이 (사용자)
```
1. Archive 페이지 (/games/g2/archive)
   ↓
2. getArchiveStructure("PrisonersDilemma")
   - fetchAvailableDates() → Lambda GET /quiz/{gameType}/dates
   - 다층 캐싱: localStorage → API
   ↓
3. 날짜 카드 클릭 → /games/g2/play?date=20251126
   ↓
4. normalizeDate("20251126") → "2025-11-26"
   ↓
5. getQuestionsForDate("PrisonersDilemma", "2025-11-26")
   - 캐시 확인 (localStorage)
   - Lambda GET /quiz/PrisonersDilemma/2025-11-26
   ↓
6. UniversalQuizPlayer 렌더링
   - 키보드 단축키 (A, B, C, D)
   - 이전/다음 버튼
   - 진행 상황 표시
   - AI 챗봇 통합
```

### AI 챗봇 (RAG)
```
1. 사용자 질문 입력
   ↓
2. sendChatbotMessage({
     question: "GDP가 뭐야?",
     gameType: "PrisonersDilemma",
     questionText: "현재 문제 내용",
     quizArticleUrl: "https://..."
   })
   ↓
3. Lambda (enhanced-chatbot-handler.py)
   ↓
4. RAG 지식 베이스 구축
   - BigKinds API (최근 30일 경제 뉴스)
   - 퀴즈 관련 기사 URL
   - 현재 문제 컨텍스트
   ↓
5. Claude 3 Sonnet (Bedrock)
   - 게임별 시스템 프롬프트
   - 250-350자 응답
   ↓
6. 응답 반환 (Intelligent Fallback)
```

---

## 💾 데이터 구조

### QuizQuestion (Frontend)
```typescript
// types/quiz.ts
export type QuizQuestion = {
  id: string
  date: string
  theme: "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"
  questionType: "객관식" | "주관식"
  question_text: string
  choices: string[]
  correct_index: number | null
  explanation?: string
  related_article?: {
    title: string
    snippet: string
    url: string
  }
  creator: string
  tags?: string
}
```

### Lambda Question (Backend)
```typescript
// lib/admin-utils.ts
export type LambdaQuestion = {
  id: string
  questionType: "객관식" | "주관식"
  question: string
  options?: string[]  // 객관식만
  answer: string      // "1", "2" 또는 실제 답변
  explanation: string
  newsLink: string
  tags?: string
  relatedArticle?: {
    title: string
    excerpt: string
  }
}
```

### DynamoDB Item
```python
# aws/quiz-lambda/handler.py
{
  'PK': 'QUIZ#PrisonersDilemma',
  'SK': 'DATE#2025-11-26',
  'gameType': 'PrisonersDilemma',
  'date': '2025-11-26',
  'questions': [
    {
      'id': '...',
      'questionType': '객관식',
      'question': '...',
      'options': ['A', 'B', 'C', 'D'],
      'answer': '2',
      'explanation': '...',
      'newsLink': '...',
      'tags': '경제·금융'
    }
  ],
  'createdAt': '2025-11-26T10:00:00.000Z',
  'updatedAt': '2025-11-26T10:00:00.000Z'
}
```

---

## 🎨 UI/UX 시스템

### 테마 시스템
```typescript
// lib/quiz-themes.ts
export const THEME_STYLES = {
  BlackSwan: {
    paperBg: "bg-[#EDEDE9]",
    inkColor: "text-[#0F2233]",
    accentColor: "#244961",
    hairline: "border-[#C9C2B0]"
  },
  PrisonersDilemma: {
    paperBg: "bg-[#F5F1E6]",
    inkColor: "text-[#3B3128]",
    accentColor: "#8B5E3C",
    hairline: "border-[#C0B6A4]"
  },
  SignalDecoding: {
    paperBg: "bg-[#EDEDE9]",
    inkColor: "text-[#184E77]",
    accentColor: "#DB6B5E",
    hairline: "border-[#C9C2B0]"
  }
}
```

### 키보드 단축키 (v2.9.0)
```typescript
// hooks/useQuizKeyboard.ts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A') selectOption(0)
    if (e.key === 'b' || e.key === 'B') selectOption(1)
    if (e.key === 'c' || e.key === 'C') selectOption(2)
    if (e.key === 'd' || e.key === 'D') selectOption(3)
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [currentQuestion, isAnswered])
```

### 반응형 디자인
- **모바일**: 1열 레이아웃
- **태블릿**: 2열 그리드
- **데스크톱**: 4열 그리드 (게임 허브)

---

## 🔧 캐싱 전략

### 다층 캐싱 시스템
```typescript
// lib/quiz-api-client.ts

// 1단계: 메모리 캐시 (5분)
let cachedQuizData: QuizDataStructure | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000

// 2단계: 날짜별 캐시 (10분)
const dateCache = new Map<DateCacheKey, { data: Question[], timestamp: number }>()
const DATE_CACHE_DURATION = 10 * 60 * 1000

// 3단계: localStorage 캐시 (15분)
// lib/quiz-cache.ts
export function getCachedQuizData(gameType: string, date: string): Question[] | null {
  const key = `quiz_${gameType}_${date}`
  const cached = localStorage.getItem(key)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < 15 * 60 * 1000) {
      return data
    }
  }
  return null
}
```

### 캐시 무효화
```typescript
// 퀴즈 저장 시 자동 무효화
await saveToLambda(questions, date, apiUrl)
clearQuizDataCache()  // 전체 캐시
clearDateCache(gameType, date)  // 날짜별 캐시
```

---

## 🚀 배포 시스템

### 빌드 프로세스
```bash
# scripts/deploy.sh
1. API 폴더 임시 이동 (mv app/api ../api_backup)
2. Next.js 빌드 (pnpm next build)
3. S3 업로드 (aws s3 sync ./out s3://g2-frontend-ver2)
4. CloudFront 무효화 (aws cloudfront create-invalidation)
5. API 폴더 복원 (mv ../api_backup app/api)
```

### 환경 변수
```bash
# .env.local
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz
NEXT_PUBLIC_CHATBOT_API_URL=https://vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com/dev/chat
```

### AWS 인프라
```
S3: g2-frontend-ver2
CloudFront: E8HKFQFSQLNHZ
Lambda Quiz: sedaily-quiz-api (us-east-1)
Lambda Chatbot: sedaily-chatbot-dev-handler (us-east-1)
DynamoDB: sedaily-quiz-data (us-east-1)
Bedrock: Claude 3 Sonnet (us-east-1)
```

---

## 🆕 v2.10.1 주요 변경사항

### 퀴즈 수정 기능
```typescript
// components/admin/QuizList.tsx

const handleEdit = async (gameType: string, date: string) => {
  // Lambda에서 기존 퀴즈 불러오기
  const response = await fetch(`${API_BASE}/quiz/${gameType}/${date}`)
  const data = await response.json()
  
  // Lambda Question → QuizQuestion 변환
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
  
  // 관리자 페이지로 전달
  onEdit(loadedQuestions, date)
}
```

### UI 개선
- **"퀴즈 수정" 탭**: 기존 "퀴즈 삭제" 탭 이름 변경
- **수정 모드 배지**: "수정 모드" 표시
- **기존 값 유지**: 모든 필드 자동 채워짐
- **새 문제 작성 버튼**: 수정 모드에서 새 문제로 전환

### QuizList 컴포넌트 기능
- **게임 타입 선택**: 블랙스완, 죄수의 딜레마, 시그널 디코딩 버튼
- **날짜 드롭다운**: fetchAvailableDates()로 날짜 목록 로드
- **새로고침 버튼**: RefreshCw 아이콘, 로딩 스피너 애니메이션
- **문제 미리보기**: 선택한 날짜의 문제 목록 표시 (첫 50자)
- **문제 개수 배지**: "{questions.length}개 문제" 표시
- **수정/삭제 버튼**: Edit/Trash2 아이콘과 함께 표시
- **로딩 상태**: loading, deleting 상태 관리

---

## 🆕 v2.10.0 주요 변경사항

### 여러 문제 추가 기능
```typescript
// app/admin/quiz/page.tsx

// 상태 관리
const [questions, setQuestions] = useState<QuizQuestion[]>([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

// 문제 추가
const addNewQuestion = () => {
  const newQuestion = { /* ... */ }
  setQuestions([...questions, newQuestion])
  setCurrentQuestionIndex(questions.length)
}

// 문제 삭제 (2개 이상일 때만)
const removeQuestion = (index: number) => {
  if (questions.length <= 1) return
  const newQuestions = questions.filter((_, i) => i !== index)
  setQuestions(newQuestions)
  setCurrentQuestionIndex(Math.min(currentQuestionIndex, newQuestions.length - 1))
}

// 일괄 저장
const handleSave = async () => {
  // 모든 문제 검증
  for (let i = 0; i < questions.length; i++) {
    const result = validateQuestion(questions[i])
    if (result.status === "missing") {
      allErrors.push(`문제 ${i + 1}: ${result.issues.join(", ")}`)
    }
  }
  
  // 저장
  await saveToLambda(questions, date, apiUrl)
}
```

### UI 개선
- **문제 카운터**: "문제 1 / 3" 표시
- **네비게이션**: 이전/다음 버튼
- **삭제 버튼**: 2개 이상일 때만 활성화
- **저장 메시지**: "3개 문제가 성공적으로 저장되었습니다!"

---

## 📊 성능 최적화

### 코드 스플리팅
- Next.js 자동 페이지별 분할
- 동적 import로 필요 시 로드

### 이미지 최적화
- WebP 포맷 사용
- Next.js Image 컴포넌트 (unoptimized for static export)

### API 최적화
- 날짜별 개별 API 요청 (fetchQuizDataByDate)
- 메타데이터 API (fetchAvailableDates)
- 다층 캐싱으로 API 호출 최소화

---

## 🔒 보안

### 관리자 인증
```typescript
// components/admin/PasswordModal.tsx
const handleSubmit = () => {
  if (password === "sedaily2024") {
    sessionStorage.setItem("admin_authenticated", "true")
    onAuthenticated()
  }
}
```

### CORS 설정
```python
# aws/quiz-lambda/handler.py
def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
```

### IAM 권한
- Lambda 최소 권한 (DynamoDB, Bedrock, CloudWatch)
- S3 버킷 정책 (CloudFront OAI만 허용)

---

## 🐛 알려진 이슈 및 해결

### ✅ 해결됨 (v2.9.0)
- **동적 라우트 404 에러**: Query param 라우팅으로 해결
- **빌드 실패**: API 폴더 제외로 해결
- **캐시 문제**: 자동 캐시 초기화로 해결

### ⚠️ 주의사항
- `pnpm build:export` 사용 금지 (에러 발생)
- `bash scripts/deploy.sh` 권장
- 환경 변수는 `.env.local`에 설정 (빌드 시 포함)

---

## 📈 향후 개선 방향

### 단기 (1개월)
- [x] 문제 수정 기능 (v2.10.1 완료)
- [ ] 문제 순서 변경 (드래그 앤 드롭)
- [ ] 이미지 업로드 지원

### 중기 (3개월)
- [ ] 사용자 통계 (정답률, 플레이 시간)
- [ ] 리더보드 시스템
- [ ] 소셜 공유 기능

### 장기 (6개월)
- [ ] 멀티플레이어 모드
- [ ] 실시간 랭킹
- [ ] 모바일 앱 (React Native)

---

**분석 완료일**: 2025-11-26  
**다음 업데이트**: 코드 변경 시 자동 업데이트  
**유지보수**: Amazon Q
