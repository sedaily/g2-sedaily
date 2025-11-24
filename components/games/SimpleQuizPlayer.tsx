"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import type { Question } from "@/lib/games-data"
import { getThemeStyles, type GameType } from "@/lib/quiz-themes"

type SimpleQuizPlayerProps = {
  questions: Question[]
  gameType: GameType
  onComplete?: (score: number) => void
}

export function SimpleQuizPlayer({ questions, gameType, onComplete }: SimpleQuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null))
  const [showResults, setShowResults] = useState<boolean[]>(Array(questions.length).fill(false))
  
  const theme = getThemeStyles(gameType)
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentIndex]
  const showResult = showResults[currentIndex]
  
  const score = answers.filter((ans, idx) => ans === questions[idx].answer).length
  const allAnswered = answers.every(ans => ans !== null)

  const handleAnswer = (answer: string) => {
    if (showResult) return
    
    const newAnswers = [...answers]
    newAnswers[currentIndex] = answer
    setAnswers(newAnswers)
    
    const newShowResults = [...showResults]
    newShowResults[currentIndex] = true
    setShowResults(newShowResults)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (allAnswered && onComplete) {
      onComplete(score)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 진행 상황 */}
      <div className={`${theme.paperBg} border ${theme.hairline} rounded-xl p-4`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${theme.inkColor}`}>
            문제 {currentIndex + 1} / {questions.length}
          </span>
          <span className={`text-sm font-medium ${theme.accentText}`}>
            정답: {score} / {answers.filter(a => a !== null).length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              backgroundColor: theme.accentColor,
            }}
          />
        </div>
      </div>

      {/* 문제 카드 */}
      <div className={`${theme.paperBg} border ${theme.hairline} rounded-xl p-8 space-y-6`}>
        {/* 문제 */}
        <div>
          <h2 className={`text-2xl font-bold ${theme.inkColor} mb-4`}>
            {currentQuestion.question}
          </h2>
          {currentQuestion.newsLink && (
            <a
              href={currentQuestion.newsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ${theme.accentText} hover:underline`}
            >
              관련 뉴스 보기 →
            </a>
          )}
        </div>

        {/* 객관식 선택지 */}
        {currentQuestion.questionType === "객관식" && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentAnswer === option
              const isCorrect = option === currentQuestion.answer
              const showFeedback = showResult

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                    showFeedback && isCorrect
                      ? "border-green-500 bg-green-50"
                      : showFeedback && isSelected && !isCorrect
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? `bg-gray-100`
                      : "hover:bg-gray-50"
                  } ${showResult ? "cursor-default" : "cursor-pointer"}`}
                  style={{
                    borderColor: showFeedback && isCorrect ? "#22c55e" : 
                                showFeedback && isSelected && !isCorrect ? "#ef4444" :
                                isSelected ? theme.accentColor : undefined
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${theme.inkColor}`}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className={`flex-1 ${theme.inkColor}`}>{option}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* 해설 */}
        {showResult && (
          <div className={`p-4 rounded-xl border-l-4`} style={{ 
            borderLeftColor: theme.accentColor,
            backgroundColor: `${theme.accentColor}10`
          }}>
            <p className={`text-sm font-semibold ${theme.inkColor} mb-2`}>해설</p>
            <p className={`text-sm ${theme.inkColor}`}>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="outline"
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          이전
        </Button>
        <Button
          onClick={handleNext}
          disabled={!showResult}
          className="flex-1"
          style={{ backgroundColor: theme.accentColor }}
        >
          {currentIndex === questions.length - 1 ? "완료" : "다음"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* 완료 화면 */}
      {allAnswered && currentIndex === questions.length - 1 && (
        <div className={`${theme.paperBg} border ${theme.hairline} rounded-xl p-8 text-center space-y-4`}>
          <h3 className={`text-3xl font-bold ${theme.inkColor}`}>퀴즈 완료!</h3>
          <p className={`text-5xl font-bold ${theme.accentText}`}>
            {score} / {questions.length}
          </p>
          <p className={`text-xl ${theme.inkColor}`}>
            정답률: {Math.round((score / questions.length) * 100)}%
          </p>
        </div>
      )}
    </div>
  )
}
