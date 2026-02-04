# Phase 2: Quiz UI/UX Improvements

**Date**: 2026-02-04  
**Status**: ✅ Completed  
**Type**: Frontend Enhancement

---

## Overview

퀴즈 플레이 경험을 개선하기 위한 UI/UX 업데이트입니다. 사용자가 스크롤 없이 한 화면에서 퀴즈를 풀 수 있도록 컴팩트한 레이아웃으로 재설계하고, 30초 타이머 기능을 추가했습니다.

---

## Objectives

1. **컴팩트 레이아웃**: 전체 퀴즈 문제를 스크롤 없이 한 화면에 표시
2. **타이머 추가**: 문제당 30초 제한 시간으로 긴장감 부여
3. **시각적 정리**: 불필요한 배경 이미지 제거, 깔끔한 UI
4. **정보 최적화**: 진행 상황 표시 간소화
5. **투명성**: AI 생성 콘텐츠 안내 문구 추가

---

## Key Changes

### 1. 컴팩트 레이아웃 구현

#### NewsHeaderBlock 크기 축소
- **제목 크기**: `text-3xl~5xl` → `text-lg~xl` (60% 축소)
- **본문 크기**: `text-base~lg` → `text-sm~base` (30% 축소)
- **여백**: `mt-8 mb-4` → `mt-3 mb-2`

#### QuizQuestion 컴포넌트 최적화
- **패딩**: `p-6 md:p-8` → `p-4 md:p-5`
- **간격**: `space-y-4` → `space-y-2`
- **질문 크기**: `text-[22px] md:text-2xl` → `text-base md:text-lg`

#### 선택지 버튼 축소
- **패딩**: `p-4` → `p-3`
- **간격**: `space-y-5` → `space-y-2`
- **라벨 크기**: `w-7 h-7` → `w-6 h-6`
- **텍스트**: `text-[15px] md:text-base` → `text-sm md:text-base`

### 2. 진행 바 개선

**변경 사항:**
- 배경 박스와 테두리 제거 (미니멀 디자인)
- "정답: x / y" 표시 제거 (정보 과부하 방지)
- 날짜 표시 추가 (왼쪽 정렬)
- 문제 번호만 우측에 표시

**레이아웃:**
```
[날짜]                    [문제 1/2] [⏱️ 25s]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. 30초 타이머 기능

**구현 내용:**
- 각 문제마다 30초 카운트다운
- 시계 아이콘과 함께 우측 상단 표시
- 10초 이하일 때 빨간색으로 변경 (긴박감)
- 시간 초과 시 자동 오답 처리 및 정답 표시
- 답변 완료 시 타이머 숨김
- 문제 전환 시 타이머 리셋

**타임아웃 처리:**
```typescript
// 시간 초과 시
handleTimeout(questionIndex) {
  // 1. 오답으로 처리
  // 2. 정답과 해설 표시
  // 3. 사용자가 직접 "다음 문제" 클릭
}
```

### 4. 배경 이미지 제거

**변경된 페이지:**
- `/games/g1/play` (블랙 스완)
- `/games/g2/play` (죄수의 딜레마)
- `/games/g3/play` (시그널 디코딩)

**변경 내용:**
- 백조 이미지 등 배경 제거
- 그라데이션 오버레이 제거
- 순수 흰색 배경 (`bg-white`)으로 변경

### 5. 원문 기사 링크 추가

**위치**: 질문 헤더 ("객관식" 배지 옆)

**디자인:**
- 작은 외부 링크 아이콘
- "원문 기사" 텍스트
- 호버 시 테마 색상으로 변경

### 6. AI 생성 안내 문구

**위치**: 퀴즈 하단 우측 정렬

**문구:**
```
※ 본 퀴즈는 AI로 자동 생성되어 일부 오류가 있을 수 있습니다.
```

**스타일:**
- 작은 글씨 (`text-xs`)
- 낮은 투명도 (`opacity-50`)
- 배경/테두리 없음 (자연스러운 표시)

---

## Technical Implementation

### Modified Files

```
components/games/
├── UniversalQuizPlayer.tsx    # 타이머 로직, 진행 바 개선
├── QuizQuestion.tsx            # 컴팩트 레이아웃, 원문 링크
└── NewsHeaderBlock.tsx         # 크기 축소

hooks/
└── useQuizState.ts             # handleTimeout 추가

app/games/
├── g1/play/page.tsx            # 배경 제거
├── g2/play/page.tsx            # 배경 제거
└── g3/play/page.tsx            # 배경 제거
```

### Key Code Changes

#### 1. 타이머 구현 (UniversalQuizPlayer.tsx)

```typescript
const [timeLeft, setTimeLeft] = useState(30)

useEffect(() => {
  const currentState = questionStates[currentQuestionIndex]
  
  if (currentState?.isAnswered) return
  
  setTimeLeft(30)
  
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer)
        handleTimeout(currentQuestionIndex)
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [currentQuestionIndex, questionStates, handleTimeout])
```

#### 2. 타임아웃 핸들러 (useQuizState.ts)

```typescript
const handleTimeout = useCallback((questionIndex: number) => {
  if (!questionStates[questionIndex]) return
  
  const currentState = questionStates[questionIndex]
  if (currentState.isAnswered) return

  const newStates = [...questionStates]
  newStates[questionIndex] = {
    ...currentState,
    isAnswered: true,
    isCorrect: false,
    userAnswer: currentState.userAnswer || '',
  }
  setQuestionStates(newStates)
  
  // 점수 업데이트 및 저장
}, [questionStates, disableSaveProgress, saveProgress])
```

---

## User Experience Improvements

### Before
- 스크롤이 필요한 긴 레이아웃
- 배경 이미지로 인한 가독성 저하
- 시간 제한 없어 긴장감 부족
- 진행 상황 정보 과다

### After
- 한 화면에 모든 내용 표시
- 깔끔한 흰색 배경으로 가독성 향상
- 30초 타이머로 게임성 강화
- 필수 정보만 간결하게 표시

---

## Design Decisions

### 1. 타이머 시간 선택 (30초)
- 뉴스 기사 기반 문제는 읽고 이해하는 시간 필요
- 너무 짧으면 스트레스, 너무 길면 지루함
- 30초는 적절한 긴장감과 충분한 사고 시간 제공

### 2. 타임아웃 시 자동 넘김 vs 정답 표시
- **선택**: 정답 표시 후 사용자가 직접 넘김
- **이유**: 학습 목적 - 정답과 해설을 확인할 시간 제공

### 3. 진행 바 정보 축소
- **제거**: "정답: x / y" 표시
- **유지**: 문제 번호, 날짜, 타이머
- **이유**: 시각적 복잡도 감소, 핵심 정보에 집중

### 4. AI 안내 문구 위치
- **위치**: 하단 우측
- **이유**: 눈에 띄지만 방해되지 않는 위치

---

## Testing Checklist

- [x] 타이머가 30초부터 정확히 카운트다운
- [x] 10초 이하일 때 빨간색으로 변경
- [x] 타임아웃 시 오답 처리 및 정답 표시
- [x] 답변 후 타이머 숨김
- [x] 문제 전환 시 타이머 리셋
- [x] 한 화면에 전체 문제 표시 (스크롤 불필요)
- [x] 모든 게임 타입에서 배경 제거 확인
- [x] 원문 기사 링크 작동
- [x] 반응형 디자인 (모바일/데스크톱)

---

## Future Enhancements

### 고려 사항
1. **타이머 설정 옵션**: 사용자가 시간 제한 on/off 선택
2. **난이도별 시간**: 쉬운 문제 20초, 어려운 문제 40초
3. **시간 보너스**: 빠르게 답할수록 추가 점수
4. **통계 추가**: 평균 답변 시간, 타임아웃 횟수
5. **애니메이션**: 타이머 종료 시 시각적 피드백

---

## Impact

### Metrics
- **화면 높이 감소**: ~40% (스크롤 제거)
- **정보 밀도**: 최적화 (불필요한 요소 제거)
- **게임성**: 향상 (타이머 추가)

### User Benefits
- ✅ 더 빠른 퀴즈 풀이 경험
- ✅ 집중력 향상 (시간 제한)
- ✅ 깔끔한 UI로 가독성 개선
- ✅ 학습 효과 유지 (정답 확인 시간 제공)

---

## Related Documentation

- [Phase 1: Quiz Auto-Generation System](./PHASE-01-quiz-auto-generation-system.md)
- [Quiz Generation Prompts](../quiz-generation/)
- [Dynamic Quiz Setup](../DYNAMIC_QUIZ_SETUP.md)

---

## Notes

- 모든 변경사항은 기존 기능과 호환됩니다
- 타이머는 클라이언트 사이드에서만 작동 (서버 부하 없음)
- localStorage 진행 상황 저장 기능 유지
- 키보드 단축키 (A, B, C, D) 기능 유지
