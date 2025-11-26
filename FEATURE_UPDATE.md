# 기능 업데이트 - 퀴즈 수정 기능 (v2.10.1)

**버전**: v2.10.1  
**업데이트 날짜**: 2025-11-26  
**배포 상태**: ✅ 완료

## ✅ 새로운 기능

### 한 날짜에 여러 문제 추가
관리자 페이지에서 한 날짜(세트)에 여러 개의 문제를 추가할 수 있습니다.

## 🎯 사용 방법

### 관리자 페이지
1. https://g2.sedaily.ai/admin/quiz 접속
2. 날짜 선택 (예: 2025-11-26)
3. 첫 번째 문제 작성
4. **"+ 문제 추가"** 버튼 클릭
5. 두 번째 문제 작성
6. **"+ 문제 추가"** 버튼 클릭
7. 세 번째 문제 작성
8. **"저장"** 버튼 → 3개 문제가 한 세트로 저장됨

### 네비게이션
- **이전/다음** 버튼: 문제 간 이동
- **문제 1 / 3** 표시: 현재 위치 확인
- **삭제** 버튼: 현재 문제 삭제 (2개 이상일 때만)

## 🔧 기술 구조

### Frontend (app/admin/quiz/page.tsx)
```typescript
// 상태 관리
const [questions, setQuestions] = useState<QuizQuestion[]>([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

// 문제 추가
const addNewQuestion = () => {
  const newQuestion = { /* ... */ }
  setQuestions([...questions, newQuestion])
  setCurrentQuestionIndex(questions.length)
}

// 일괄 저장
await saveToLambda(questions, date, apiUrl)
```

### Backend (aws/quiz-lambda/handler.py)
```python
# DynamoDB 저장 형식
{
  'PK': 'QUIZ#PrisonersDilemma',
  'SK': 'DATE#2025-11-26',
  'questions': [
    { id, question, options, answer, ... },
    { id, question, options, answer, ... },
    { id, question, options, answer, ... }
  ]
}
```

### 데이터 흐름
```
관리자 페이지
  ↓ (3개 문제 작성)
saveToLambda(questions[])
  ↓
Lambda API Gateway
  ↓
DynamoDB (한 세트로 저장)
  ↓
사용자 Archive 페이지
  ↓
3개 문제 표시
```

## 📊 변경된 파일

1. `/app/admin/quiz/page.tsx` - 여러 문제 관리 UI
2. `/lib/admin-utils.ts` - 이미 여러 문제 지원 (변경 없음)
3. `/aws/quiz-lambda/handler.py` - 이미 여러 문제 지원 (변경 없음)

## 🚀 배포

```bash
# 배포 명령어 (권장)
bash scripts/deploy.sh

# build-export는 사용하지 마세요 (에러 발생)
# pnpm build:export ❌
```

## ✅ 검증

### 테스트 시나리오
1. 관리자 페이지에서 3개 문제 작성
2. "저장" 버튼 클릭
3. Archive 페이지에서 해당 날짜 확인
4. 3개 문제가 모두 표시되는지 확인

### 예상 결과
- DynamoDB: 1개 레코드 (3개 문제 포함)
- Archive: 1개 날짜 카드
- Play: 3개 문제 순차 표시

## 📝 주의사항

### 퀴즈 삭제
- "퀴즈 삭제" 탭에서 날짜 선택 시 **전체 세트(모든 문제) 삭제**
- 개별 문제만 삭제하려면 관리자 페이지에서 수정 후 재저장

### 게임 타입
- 한 세트 내 모든 문제는 **같은 게임 타입**이어야 함
- 첫 번째 문제의 테마가 전체 세트의 테마로 설정됨

### 저장 검증
- 모든 문제가 검증을 통과해야 저장 가능
- 하나라도 오류가 있으면 전체 저장 실패

---

## 📚 관련 문서

- [README.md](./README.md) - 프로젝트 개요
- [CHANGELOG.md](./CHANGELOG.md) - 전체 변경 이력
- [VERSION_UPDATE_SUMMARY.md](./VERSION_UPDATE_SUMMARY.md) - 버전 업데이트 요약
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 배포 가이드

---

**버전**: v2.10.1  
**업데이트 날짜**: 2025-11-26  
**배포 상태**: ✅ 완료  
**웹사이트**: https://g2.sedaily.ai
