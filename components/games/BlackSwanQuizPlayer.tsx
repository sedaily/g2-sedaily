"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import type { QuizItem } from "@/lib/quiz-api"
import { saveQuizProgress } from "@/lib/quiz-storage"
import { ExternalLink, ChevronDown, ChevronUp, Waves } from "lucide-react"
import { ProgressRippleIndicator } from "./ProgressRippleIndicator"
import Link from "next/link"

interface BlackSwanQuizPlayerProps {
  items?: QuizItem[]
  date: string
}

export function BlackSwanQuizPlayer({ items, date }: BlackSwanQuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [userAnswers, setUserAnswers] = useState<
    Array<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }>
  >([])

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
    setShowHint(false)
    setIsComplete(false)
    setUserAnswers([])
  }, [date])

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return

    setSelectedAnswer(option)
    setIsAnswered(true)

    const correct = option === currentQuestion?.answer
    if (correct) {
      setScore((prev) => prev + 1)
    }

    if (currentQuestion) {
      setUserAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          userAnswer: option,
          correctAnswer: currentQuestion.answer,
          isCorrect: correct,
        },
      ])
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

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: textInput.trim(),
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrectAnswer,
      },
    ])
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
      setShowHint(false)
    } else {
      setIsComplete(true)
      saveQuizProgress(date, score)
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-6">📅</div>
        <h2 className="text-2xl font-bold korean-heading mb-4 text-[#0c4a6e]">이 날짜의 퀴즈는 준비 중입니다</h2>
        <p className="text-gray-600 korean-text mb-8 leading-relaxed">
          아카이브에서 다른 날짜를 선택하거나 오늘의 퀴즈를 이용해 주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline" className="korean-text bg-transparent">
            <Link href="/games">게임 허브</Link>
          </Button>
          <Button asChild className="korean-text bg-[#0891b2] hover:bg-[#0891b2]/90">
            <Link href="/games/g1/archive">아카이브 보기</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const finalScore = score
    const percentage = Math.round((finalScore / items.length) * 100)

    let badge = ""
    let message = ""
    if (percentage >= 90) {
      badge = "🦢 블랙스완 마스터"
      message = "완벽합니다! 경제 연쇄반응을 깊이 이해하고 계시네요."
    } else if (percentage >= 70) {
      badge = "🌊 물결의 현자"
      message = "훌륭해요! 대부분의 경제 인과관계를 파악하셨습니다."
    } else if (percentage >= 50) {
      badge = "💧 청하의 탐험가"
      message = "좋은 시작입니다! 경제 연쇄반응에 대한 이해가 쌓이고 있어요."
    } else {
      badge = "🌱 호수의 초보자"
      message = "괜찮아요! 경제는 복잡하지만 계속 도전하면 실력이 늘 거예요."
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="p-8 bg-linear-to-br from-[#e0f2fe] to-white border-2 border-[#0891b2]/30">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold korean-heading text-[#0c4a6e] mb-2">퀴즈 완료!</h2>
            <div className="text-2xl font-bold text-[#0891b2] mb-2">{badge}</div>
            <p className="text-gray-600 korean-text mb-6">{message}</p>

            <div className="inline-block bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="text-5xl font-bold text-[#0891b2] mb-2">{percentage}점</div>
              <p className="text-gray-600 korean-text">
                {items.length}문제 중 <span className="font-bold text-[#0c4a6e]">{finalScore}문제</span> 정답
              </p>
            </div>

            <p className="text-sm text-gray-500 korean-text max-w-2xl mx-auto">
              당신의 선택이 만든 경제 연쇄반응: 각 문제에서의 선택은 실제 경제에서 나비효과처럼 퍼져나갑니다. 계속해서
              뉴스를 읽고 경제 감각을 키워보세요!
            </p>
          </div>

          {/* Review Table */}
          <div className="mb-8">
            <h3 className="text-xl font-bold korean-heading text-[#0c4a6e] mb-4">문제 리뷰</h3>
            <div className="space-y-3">
              {userAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    answer.isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold korean-text text-gray-700">문제 {idx + 1}</span>
                    <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                      {answer.isCorrect ? "✓ 정답" : "✗ 오답"}
                    </span>
                  </div>
                  <p className="text-sm korean-text text-gray-800 mb-2">{answer.question}</p>
                  <div className="text-sm korean-text">
                    <span className="text-gray-600">내 답변: </span>
                    <span className={answer.isCorrect ? "text-green-700 font-semibold" : "text-red-700"}>
                      {answer.userAnswer}
                    </span>
                  </div>
                  {!answer.isCorrect && (
                    <div className="text-sm korean-text mt-1">
                      <span className="text-gray-600">정답: </span>
                      <span className="text-green-700 font-semibold">{answer.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline" className="korean-text bg-transparent">
              <Link href="/games">게임 허브</Link>
            </Button>
            <Button asChild className="korean-text bg-[#0891b2] hover:bg-[#0891b2]/90">
              <Link href="/games/g1/archive">아카이브 보기</Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div>
      <ProgressRippleIndicator current={currentIndex + 1} total={items.length} score={score} progress={progress} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 mb-6 bg-linear-to-br from-[#f8fafc] to-[#e0f2fe] border-2 border-[#0891b2]/20">
              <h3 className="text-xl md:text-2xl font-bold korean-text mb-6 leading-relaxed text-[#0c4a6e]">
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
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={isAnswered}
                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                        className={`
                          w-full p-4 rounded-xl text-left transition-all korean-text shadow-sm
                          ${!isAnswered && "hover:shadow-md cursor-pointer bg-white"}
                          ${isAnswered && "cursor-not-allowed"}
                          ${showCorrect && "bg-green-100 border-2 border-green-400 shadow-lg"}
                          ${showIncorrect && "bg-red-100 border-2 border-red-400"}
                          ${!isAnswered && isSelected && "bg-[#0891b2]/10 border-2 border-[#0891b2]"}
                          ${!isAnswered && !isSelected && "bg-white border-2 border-gray-200"}
                          ${isAnswered && !showCorrect && !showIncorrect && "bg-gray-50 border-2 border-gray-200"}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              showCorrect
                                ? "text-green-700 font-semibold"
                                : showIncorrect
                                  ? "text-red-700"
                                  : "text-[#0c4a6e]"
                            }
                          >
                            {option}
                          </span>
                          {showCorrect && <span className="text-green-600 text-xl">✓</span>}
                          {showIncorrect && <span className="text-red-600 text-xl">✗</span>}
                        </div>
                      </motion.button>
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
                      className="flex-1 korean-text bg-white border-2 border-[#0891b2]/30"
                    />
                    {!isAnswered && (
                      <Button
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim()}
                        className="korean-text bg-[#0891b2] hover:bg-[#0891b2]/90"
                      >
                        제출
                      </Button>
                    )}
                  </div>
                  {isAnswered && (
                    <div
                      className={`p-4 rounded-xl ${
                        isCorrect ? "bg-green-100 border-2 border-green-400" : "bg-red-100 border-2 border-red-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold korean-text text-gray-700">내 답변:</span>
                        <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                          {isCorrect ? "✓ 정답" : "✗ 오답"}
                        </span>
                      </div>
                      <p className="korean-text text-[#0c4a6e] mb-2">{selectedAnswer}</p>
                      {!isCorrect && (
                        <>
                          <div className="text-sm font-semibold korean-text text-gray-700 mt-3 mb-1">정답:</div>
                          <p className="korean-text text-green-700 font-semibold">{currentQuestion?.answer}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {isAnswered && currentQuestion?.explanation && (
                <div className="border-t-2 border-[#0891b2]/20 pt-4 mt-4">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-2 text-[#0891b2] hover:text-[#0c4a6e] transition-colors korean-text font-semibold mb-2"
                  >
                    <Waves size={20} />
                    해설 보기
                    {showExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-white/70 rounded-lg mt-2">
                          <p className="text-sm text-[#0c4a6e] korean-text leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* News link */}
              {currentQuestion?.newsLink && (
                <div className="mt-4 pt-4 border-t-2 border-[#0891b2]/20">
                  <a
                    href={currentQuestion.newsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#0891b2] hover:text-[#0c4a6e] transition-colors korean-text font-medium"
                  >
                    관련 뉴스 보기
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </Card>

            {/* Hints */}
            {currentQuestion?.hint && currentQuestion.hint.length > 0 && !isAnswered && (
              <Card className="p-4 bg-[#e0f2fe]/50 border-2 border-[#0891b2]/30 mb-6">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-[#0891b2] hover:text-[#0c4a6e] transition-colors korean-text font-semibold mb-2"
                >
                  💡 힌트
                  {showHint ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {currentQuestion.hint?.map((hint, idx) => (
                        <li key={idx} className="text-sm text-[#0c4a6e] korean-text">
                          • {hint}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </Card>
            )}

            {/* Next button */}
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Button
                  onClick={handleNext}
                  className="w-full korean-text font-semibold py-6 text-lg bg-linear-to-r from-[#0891b2] to-[#2563eb] hover:opacity-90 transition-opacity"
                >
                  {currentIndex < items.length - 1 ? "다음 문제 🌊" : "결과 보기 🦢"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
