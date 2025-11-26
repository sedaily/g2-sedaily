# 퀴즈 수정 기능 완성 (v2.10.1)

**버전**: v2.10.1  
**업데이트 날짜**: 2025-11-26  
**배포 상태**: ✅ 완료

---

## ✨ 새로운 기능

### 퀴즈 수정 기능
기존에 저장된 퀴즈를 불러와서 수정할 수 있습니다.

---

## 🎯 사용 방법

### 1. 퀴즈 수정 탭 접속
```
1. https://g2.sedaily.ai/admin/quiz 접속
2. "퀴즈 수정" 탭 클릭 (기존 "퀴즈 삭제"에서 변경됨)
```

### 2. 수정할 퀴즈 선택
```
1. 게임 타입 선택 (블랙스완, 죄수의 딜레마, 시그널 디코딩)
2. 날짜 선택 (드롭다운)
3. 문제 목록 확인
4. "수정" 버튼 클릭 ✨
```

### 3. 퀴즈 수정
```
1. "퀴즈 관리" 탭으로 자동 이동
2. "수정 모드" 배지 표시
3. 기존 문제들이 모두 로드됨 ✅
   - 문제 내용
   - 선택지 (객관식)
   - 정답
   - 해설
   - 관련 기사 (제목, 발췌문, URL)
   - 태그
4. 원하는 내용 수정
5. "저장" 버튼 클릭
```

### 4. 저장 완료
```
1. 기존 퀴즈가 수정된 내용으로 덮어쓰기
2. 캐시 자동 초기화
3. 수정 모드 자동 해제
```

---

## 🔧 기술 구조

### 데이터 변환 흐름
```typescript
// 1. Lambda Question (DynamoDB) → QuizQuestion (Frontend)
handleEdit() {
  const convertedQuestions: QuizQuestion[] = questions.map((q) => {
    const isMultipleChoice = q.questionType === "객관식"
    
    return {
      id: q.id,
      date: selectedDate,
      theme: gameType,
      questionType: q.questionType,
      question_text: q.question,
      choices: isMultipleChoice 
        ? q.options || []
        : [q.answer], // 주관식은 answer를 choices[0]에 저장
      correct_index: isMultipleChoice 
        ? (q.answer ? parseInt(q.answer) - 1 : null)
        : null,
      explanation: q.explanation,
      related_article: {
        title: q.relatedArticle?.title || "",
        snippet: q.relatedArticle?.excerpt || "",
        url: q.newsLink
      },
      creator: "",
      tags: q.tags || ""
    }
  })

  onEdit(convertedQuestions, selectedDate)
}

// 2. 관리자 페이지에서 수정 모드 진입
onEdit={(loadedQuestions, date) => {
  setQuestions(loadedQuestions)  // 기존 값 로드
  setSelectedDate(new Date(date))
  setCurrentQuestionIndex(0)
  setIsEditMode(true)  // 수정 모드 활성화
  setActiveTab("quiz")
}}

// 3. 수정 모드일 때는 자동 초기화 방지
useEffect(() => {
  if (isAuthenticated && !isEditMode) {
    initializeQuestions()  // 수정 모드가 아닐 때만 초기화
  }
}, [selectedDate, isAuthenticated, isEditMode])
```

---

## 📊 변경된 파일

### 1. app/admin/quiz/page.tsx
```typescript
// 추가된 상태
const [isEditMode, setIsEditMode] = useState(false)

// 수정된 useEffect
useEffect(() => {
  if (isAuthenticated && !isEditMode) {
    initializeQuestions()
  }
}, [selectedDate, isAuthenticated, isEditMode])

// 탭 이름 변경
"퀴즈 삭제" → "퀴즈 수정"

// onEdit 콜백
<QuizList 
  onEdit={(loadedQuestions, date) => {
    setQuestions(loadedQuestions)
    setSelectedDate(new Date(date))
    setCurrentQuestionIndex(0)
    setIsEditMode(true)
    setActiveTab("quiz")
  }}
/>
```

### 2. components/admin/QuizList.tsx
```typescript
// Props 추가
type QuizListProps = {
  onEdit?: (questions: QuizQuestion[], date: string) => void
}

// handleEdit 함수 추가
const handleEdit = () => {
  if (!selectedDate || !onEdit) return

  // Lambda Question → QuizQuestion 변환
  const convertedQuestions: QuizQuestion[] = questions.map((q) => {
    // 변환 로직...
  })

  onEdit(convertedQuestions, selectedDate)
}

// UI 변경
제목: "퀴즈 관리" → "퀴즈 수정"
버튼: "수정" 버튼 추가
```

### 3. components/admin/QuizEditor.tsx
```typescript
// 주관식 답변 표시 로직 개선
{question.questionType === "주관식" && (
  <Input
    value={question.choices[0] || ""}  // 기존 값 표시
    onChange={(e) => {
      onUpdate({
        choices: [e.target.value],
        correct_index: null,
      })
    }}
  />
)}
```

---

## 🎨 UI 변경사항

### Before (v2.10.0)
```
탭: [퀴즈 관리] [Quizlet 관리] [퀴즈 삭제] [캐시 관리]

퀴즈 삭제 탭:
- 게임 타입 선택
- 날짜 선택
- [삭제] 버튼만 존재
```

### After (v2.10.1)
```
탭: [퀴즈 관리] [Quizlet 관리] [퀴즈 수정] [캐시 관리]

퀴즈 수정 탭:
- 게임 타입 선택
- 날짜 선택
- [수정] [삭제] 버튼 존재

퀴즈 관리 탭 (수정 모드):
- "수정 모드" 배지 표시
- 기존 문제들의 모든 값 표시 ✅
  - 문제 내용
  - 선택지 (객관식)
  - 정답
  - 해설
  - 관련 기사
  - 태그
- [새 문제 작성] 버튼으로 수정 모드 해제
```

---

## ⚠️ 주의사항

### 1. 덮어쓰기 방식
- 수정 후 저장하면 **기존 퀴즈가 완전히 덮어쓰기**됩니다
- 삭제한 문제는 복구할 수 없습니다
- 저장 전에 반드시 확인하세요

### 2. 날짜 변경 불가
- 수정 모드에서는 날짜를 변경할 수 없습니다
- 날짜를 변경하려면:
  1. 기존 퀴즈 삭제
  2. 새 날짜로 다시 생성

### 3. 게임 타입 유지
- 불러온 퀴즈의 게임 타입은 자동으로 유지됩니다
- 첫 번째 문제의 theme이 전체 세트의 theme이 됩니다

### 4. 수정 모드 해제
- "새 문제 작성" 버튼 클릭 시 수정 모드 해제
- 날짜 변경 시에도 수정 모드가 유지됩니다 (기존 값 보존)

---

## 🔄 워크플로우 예시

### 시나리오: 2025-11-26 죄수의 딜레마 퀴즈 수정

```
1. 관리자 페이지 접속
   ↓
2. "퀴즈 수정" 탭 클릭
   ↓
3. "죄수의 딜레마" 선택
   ↓
4. "2025-11-26" 선택
   ↓
5. 3개 문제 확인
   ↓
6. "수정" 버튼 클릭
   ↓
7. "퀴즈 관리" 탭으로 자동 이동
   ↓
8. "수정 모드" 배지 확인
   ↓
9. 기존 문제들이 모두 표시됨 ✅
   - 문제 1: "GDP 증가율은?" (선택지 4개, 정답 B)
   - 문제 2: "금리 인상 효과는?" (선택지 4개, 정답 C)
   - 문제 3: "환율 상승 원인은?" (선택지 4개, 정답 A)
   ↓
10. 문제 1 수정
    - 문제 내용 수정
    - 선택지 B 수정
    - 해설 추가
   ↓
11. "다음" 버튼으로 문제 2 이동
   ↓
12. 문제 2 수정
   ↓
13. "문제 추가" 버튼으로 문제 4 추가
   ↓
14. "저장" 버튼 클릭
   ↓
15. "4개 문제가 성공적으로 저장되었습니다!" 메시지
   ↓
16. 수정 모드 자동 해제
   ↓
17. 완료!
```

---

## 🐛 트러블슈팅

### 문제: 수정 버튼을 눌렀는데 빈 문제가 표시됨
**원인**: 데이터 변환 오류 또는 캐시 문제  
**해결**: 
1. 브라우저 콘솔 확인
2. "캐시 관리" 탭에서 캐시 초기화
3. 페이지 새로고침 후 재시도

### 문제: 주관식 답변이 표시되지 않음
**원인**: v2.10.1에서 수정됨  
**해결**: 
- 이미 수정되어 정상 작동
- choices[0]에 답변이 표시됨

### 문제: 저장 후에도 이전 내용이 표시됨
**원인**: 캐시 문제  
**해결**:
1. "캐시 관리" 탭에서 수동 캐시 초기화
2. 브라우저 강력 새로고침 (Cmd+Shift+R)

---

## 📈 향후 개선 방향

### 단기
- [ ] 수정 전 미리보기 기능
- [ ] 변경사항 하이라이트
- [ ] Undo/Redo 기능

### 중기
- [ ] 일괄 수정 (여러 날짜)
- [ ] 문제 복사/붙여넣기
- [ ] 드래그 앤 드롭 순서 변경

### 장기
- [ ] 버전 관리 시스템
- [ ] 수정 이력 추적
- [ ] 권한 관리

---

**버전**: v2.10.1  
**작성일**: 2025-11-26  
**작성자**: Amazon Q  
**상태**: ✅ 완성 및 배포 완료
