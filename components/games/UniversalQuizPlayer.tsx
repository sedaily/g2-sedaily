"use client"

import { useState, useEffect } from "react"
import type { Question } from "@/lib/games-data"
import { useQuizState } from "@/hooks/useQuizState"
import { useQuizKeyboard } from "@/hooks/useQuizKeyboard"
import { getThemeStyles, ACCENT_COLORS, type GameType } from "@/lib/quiz-themes"
import { QuizQuestion } from "./QuizQuestion"
import { QuizCompletion } from "./QuizCompletion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

type QuizPlayerProps = {
  questions: Question[]
  date: string
  gameType: GameType
  themeColor: string
  disableSaveProgress?: boolean
}

export function UniversalQuizPlayer({
  questions,
  date,
  gameType,
  disableSaveProgress = false,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  // 상태 관리
  const {
    questionStates,
    score,
    answeredCount,
    isComplete,
    accuracy,
    handleMultipleChoiceAnswer,
    handleShortAnswerSubmit,
    handleToggleHint,
    handleInputChange,
    handleRestart,
    handleTimeout,
  } = useQuizState({ questions, gameType, date, disableSaveProgress })

  // 테마 스타일
  const themeStyles = getThemeStyles(gameType)
  const accent = ACCENT_COLORS[gameType]

  // 타이머 효과
  useEffect(() => {
    const currentState = questionStates[currentQuestionIndex]
    
    // 이미 답변한 문제는 타이머 작동 안 함
    if (currentState?.isAnswered) {
      return
    }

    // 타이머 시작
    setTimeLeft(30)
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 시간 종료 - 오답 처리하고 정답 표시
          clearInterval(timer)
          handleTimeout(currentQuestionIndex)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, questionStates, handleTimeout])

  // 키보드 단축키
  useQuizKeyboard({
    questions,
    questionStates,
    answeredCount,
    onMultipleChoiceAnswer: handleMultipleChoiceAnswer,
  })

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  if (questionStates.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className={`${themeStyles.paperBg} border ${themeStyles.hairline} p-12 text-center rounded-2xl shadow-sm`}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: accent.hex }} />
            <p className={`text-lg ${themeStyles.inkColor}`}>퀴즈를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentState = questionStates[currentQuestionIndex]

  // 날짜 포맷팅 (2026-02-03 → 2026년 2월 3일)
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ padding: "1rem 0" }}>
      {/* 진행 상황 표시 */}
      <div className="mb-3 p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-medium ${themeStyles.inkColor} opacity-60`}>
            {formatDate(date)}
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${themeStyles.inkColor}`}>
              문제 {currentQuestionIndex + 1} / {questions.length}
            </span>
            {/* 타이머 */}
            {!currentState?.isAnswered && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" style={{ color: timeLeft <= 10 ? '#DC2626' : accent.hex }} />
                <span 
                  className={`text-xs font-bold ${timeLeft <= 10 ? 'text-red-600' : themeStyles.accentText}`}
                >
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              backgroundColor: accent.hex,
            }}
          />
        </div>
      </div>

      {/* 현재 문제 */}
      {currentState && (
        <QuizQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          state={currentState}
          themeStyles={themeStyles}
          accent={accent}
          gameType={gameType}
          onMultipleChoiceAnswer={handleMultipleChoiceAnswer}
          onShortAnswerSubmit={handleShortAnswerSubmit}
          onToggleHint={handleToggleHint}
          onInputChange={handleInputChange}
        />
      )}

      {/* 네비게이션 버튼 */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className={`flex-1 ${themeStyles.paperBg} ${themeStyles.inkColor} border-2 ${themeStyles.hairline}`}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          이전 문제
        </Button>
        {currentQuestionIndex < questions.length - 1 && (
          <Button
            onClick={handleNext}
            className={`flex-1 ${themeStyles.buttonBg} ${themeStyles.buttonText}`}
          >
            다음 문제
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* 완료 화면 - 모든 문제를 답변했을 때 표시 */}
      {isComplete && (
        <QuizCompletion
          score={score}
          totalQuestions={questions.length}
          accuracy={accuracy}
          themeStyles={themeStyles}
          onRestart={handleRestart}
        />
      )}

      {/* AI 생성 안내 */}
      <div className="mt-4 text-right">
        <p className={`text-xs ${themeStyles.inkColor} opacity-50`}>
          ※ 본 퀴즈는 AI로 자동 생성되어 일부 오류가 있을 수 있습니다.
        </p>
      </div>
    </div>
  )
}
