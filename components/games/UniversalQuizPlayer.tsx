"use client"

import { useState } from "react"
import type { Question } from "@/lib/games-data"
import { useQuizState } from "@/hooks/useQuizState"
import { getThemeStyles, ACCENT_COLORS, type GameType } from "@/lib/quiz-themes"
import { QuizQuestion } from "./QuizQuestion"
import { QuizCompletion } from "./QuizCompletion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  } = useQuizState({ questions, gameType, date, disableSaveProgress })

  // 테마 스타일
  const themeStyles = getThemeStyles(gameType)
  const accent = ACCENT_COLORS[gameType]

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
        <div className={`${themeStyles.paperBg} border ${themeStyles.hairline} p-8 text-center rounded-2xl shadow-sm`}>
          <p className={`${themeStyles.inkColor}`}>퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentState = questionStates[currentQuestionIndex]

  return (
    <div className="max-w-3xl mx-auto" style={{ padding: "2rem 0" }}>
      {/* 진행 상황 표시 */}
      <div className={`mb-6 p-4 ${themeStyles.paperBg} border ${themeStyles.hairline} rounded-xl`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${themeStyles.inkColor}`}>
            문제 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className={`text-sm font-medium ${themeStyles.accentText}`}>
            정답: {score} / {answeredCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
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

      {/* 완료 화면 - 마지막 문제를 답변했을 때 표시 */}
      {currentQuestionIndex === questions.length - 1 && currentState?.isAnswered && (
        <QuizCompletion
          score={score}
          totalQuestions={questions.length}
          accuracy={accuracy}
          themeStyles={themeStyles}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
