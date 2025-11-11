"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import type { QuizItem } from "@/lib/quiz-api"
import { saveQuizProgress } from "@/lib/quiz-storage"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

interface QuizPlayerProps {
  items?: QuizItem[]
  date: string
}

export function QuizPlayer({ items, date }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = items ? items[currentIndex] : null
  const isMultipleChoice = currentQuestion?.options && currentQuestion.options.length > 0
  const isCorrect = selectedAnswer === currentQuestion?.answer
  const progress = items ? ((currentIndex + (isAnswered ? 1 : 0)) / items.length) * 100 : 0

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setTextInput("")
    setIsAnswered(false)
    setScore(0)
    setShowExplanation(false)
    setIsComplete(false)
  }, [date])

  useEffect(() => {
    setTextInput("")
  }, [currentIndex])

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return

    setSelectedAnswer(option)
    setIsAnswered(true)

    if (option === currentQuestion?.answer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleTextSubmit = () => {
    if (!textInput.trim() || isAnswered || !currentQuestion) return

    const normalizedInput = textInput.trim().toLowerCase()
    const normalizedAnswer = currentQuestion.answer.toLowerCase()
    const isCorrectAnswer = normalizedInput === normalizedAnswer

    setSelectedAnswer(textInput.trim())
    setIsAnswered(true)

    if (isCorrectAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextSubmit()
    }
  }

  const handleNext = () => {
    if (items && currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setTextInput("")
      setIsAnswered(false)
      setShowExplanation(false)
    } else {
      setIsComplete(true)
      if (currentQuestion && isCorrect) {
        saveQuizProgress(date, score + 1)
      } else {
        saveQuizProgress(date, score)
      }
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-6">📅</div>
        <h2 className="text-2xl font-bold korean-heading mb-4 text-foreground">이 날짜의 퀴즈는 준비 중입니다</h2>
        <p className="text-muted-foreground korean-text mb-8 leading-relaxed">
          아카이브에서 다른 날짜를 선택하거나 오늘의 퀴즈를 이용해 주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline" className="korean-text bg-transparent">
            <Link href="/games" aria-label="게임 허브로 돌아가기">
              게임 허브
            </Link>
          </Button>
          <Button asChild className="btn-primary text-on-primary korean-text">
            <Link href="/games/g1/archive" aria-label="아카이브 보기">
              아카이브 보기
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const finalScore = score + (isCorrect ? 1 : 0)
    const percentage = Math.round((finalScore / items.length) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold korean-heading mb-4 text-foreground">퀴즈 완료!</h2>
        <p className="text-xl text-muted-foreground korean-text mb-8">
          총 {items.length}문제 중 <span className="text-primary font-bold">{finalScore}문제</span> 정답
          <br />
          <span className="text-2xl font-bold text-primary">{percentage}점</span>
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline" className="korean-text bg-transparent">
            <Link href="/games" aria-label="게임 허브로 돌아가기">
              게임 허브
            </Link>
          </Button>
          <Button asChild className="btn-primary text-on-primary korean-text">
            <Link href="/games/g1/archive" aria-label="아카이브 보기">
              아카이브 보기
            </Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-muted-foreground korean-text">
            문제 {currentIndex + 1} / {items.length}
          </span>
          <span className="text-sm font-semibold text-primary korean-text">점수: {score}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 md:p-8 mb-6">
            <h3 className="text-xl md:text-2xl font-bold korean-text mb-6 leading-relaxed text-foreground">
              {currentQuestion?.question}
            </h3>

            {/* Options */}
            {isMultipleChoice ? (
              <div className="space-y-3 mb-6">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectAnswer = option === currentQuestion.answer
                  const showCorrect = isAnswered && isCorrectAnswer
                  const showIncorrect = isAnswered && isSelected && !isCorrectAnswer

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isAnswered}
                      className={`
                        w-full p-4 rounded-lg text-left transition-all korean-text
                        ${!isAnswered && "hover:bg-muted cursor-pointer"}
                        ${isAnswered && "cursor-not-allowed"}
                        ${showCorrect && "bg-success/10 border-2 border-success"}
                        ${showIncorrect && "bg-destructive/10 border-2 border-destructive"}
                        ${!isAnswered && isSelected && "bg-primary/10 border-2 border-primary"}
                        ${!isAnswered && !isSelected && "bg-card border border-border"}
                        ${isAnswered && !showCorrect && !showIncorrect && "bg-muted border border-border"}
                      `}
                      aria-label={`옵션 ${idx + 1}: ${option}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            showCorrect
                              ? "text-success font-semibold"
                              : showIncorrect
                                ? "text-destructive"
                                : "text-foreground"
                          }
                        >
                          {option}
                        </span>
                        {showCorrect && <span className="text-success">✓</span>}
                        {showIncorrect && <span className="text-destructive">✗</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="정답을 입력하세요"
                    disabled={isAnswered}
                    className="flex-1 korean-text"
                    aria-label="정답 입력"
                  />
                  {!isAnswered && (
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="btn-primary text-on-primary korean-text"
                      aria-label="제출"
                    >
                      제출
                    </Button>
                  )}
                </div>
                {isAnswered && (
                  <div
                    className={`p-4 rounded-lg ${
                      isCorrect
                        ? "bg-success/10 border-2 border-success"
                        : "bg-destructive/10 border-2 border-destructive"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold korean-text text-foreground/70">내 답변:</span>
                      <span className={isCorrect ? "text-success" : "text-destructive"}>
                        {isCorrect ? "✓ 정답" : "✗ 오답"}
                      </span>
                    </div>
                    <p className="korean-text text-foreground mb-2">{selectedAnswer}</p>
                    {!isCorrect && (
                      <>
                        <div className="text-sm font-semibold korean-text text-foreground/70 mt-3 mb-1">정답:</div>
                        <p className="korean-text text-success font-semibold">{currentQuestion?.answer}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {isAnswered && currentQuestion?.explanation && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors korean-text font-semibold mb-2"
                  aria-expanded={showExplanation}
                  aria-label="해설 보기"
                >
                  해설 보기
                  {showExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-foreground/80 korean-text leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* News link */}
            {currentQuestion?.newsLink && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={currentQuestion.newsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors korean-text"
                  aria-label="관련 뉴스 기사 보기 (새 탭)"
                >
                  관련 뉴스 보기
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </Card>

          {/* Next button */}
          {isAnswered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Button
                onClick={handleNext}
                className="w-full btn-primary text-on-primary korean-text font-semibold py-6 text-lg"
                aria-label={currentIndex < items.length - 1 ? "다음 문제로" : "결과 보기"}
              >
                {currentIndex < items.length - 1 ? "다음 문제" : "결과 보기"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hints (if available) */}
      {currentQuestion?.hint && currentQuestion.hint.length > 0 && !isAnswered && (
        <Card className="p-4 bg-sky-background border-sky-border">
          <h4 className="text-sm font-semibold text-sky-text korean-text mb-2">💡 힌트</h4>
          <ul className="space-y-1">
            {currentQuestion.hint?.map((hint, idx) => (
              <li key={idx} className="text-sm text-sky-text korean-text">
                • {hint}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
