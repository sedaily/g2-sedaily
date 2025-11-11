"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Lightbulb, ExternalLink } from "lucide-react"
import type { Question } from "@/lib/games-data"
import { NewsHeaderBlock } from "./NewsHeaderBlock"
import { AIChatbot } from "./AIChatbot"

type QuizPlayerProps = {
  questions: Question[]
  date: string
  gameType: "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"
  themeColor: string
  disableSaveProgress?: boolean
}

type QuestionState = {
  selectedAnswer: string | null
  userAnswer: string
  isAnswered: boolean
  isCorrect: boolean
  showHint: boolean
}

const ACCENT = {
  BlackSwan: { border: "border-[#244961]", hover: "hover:border-[#244961]", hex: "#244961" },
  PrisonersDilemma: { border: "border-[#8B5E3C]", hover: "hover:border-[#8B5E3C]", hex: "#8B5E3C" },
  SignalDecoding: { border: "border-[#DB6B5E]", hover: "hover:border-[#DB6B5E]", hex: "#DB6B5E" },
} as const

export function UniversalQuizPlayer({
  questions,
  date,
  gameType,
  disableSaveProgress = false,
}: QuizPlayerProps) {
  const router = useRouter()
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([])
  const [score, setScore] = useState(0)

  const accent = ACCENT[gameType]

  useEffect(() => {
    if (questions.length > 0 && questionStates.length === 0) {
      const initialStates = questions.map(() => ({
        selectedAnswer: null,
        userAnswer: "",
        isAnswered: false,
        isCorrect: false,
        showHint: false,
      }))
      setQuestionStates(initialStates)
    }
  }, [questions, questionStates.length])

  const answeredCount = questionStates.filter((state) => state.isAnswered).length

  const getThemeStyles = () => {
    switch (gameType) {
      case "BlackSwan":
        return {
          paperBg: "bg-[#EDEDE9]",
          inkColor: "text-[#0F2233]",
          accentColor: "#244961",
          accentText: "text-[#244961]",
          hairline: "border-[#C9C2B0]",
          badgeBg: "bg-[#244961]/10 border-[#244961]/30",
          badgeText: "text-[#0F2233]",
          correctBorder: "border-[#244961]",
          incorrectBorder: "border-[#DC2626]",
          buttonBg: "bg-[#0F2233] hover:bg-[#244961]",
          buttonText: "text-white",
          explanationBg: "bg-[#244961]/5 border-[#244961]/20",
          explanationAccent: "border-l-[#244961]",
        }
      case "PrisonersDilemma":
        return {
          paperBg: "bg-[#F5F1E6]",
          inkColor: "text-[#3B3128]",
          accentColor: "#8B5E3C",
          accentText: "text-[#8B5E3C]",
          hairline: "border-[#C0B6A4]",
          badgeBg: "bg-[#8B5E3C]/10 border-[#8B5E3C]/30",
          badgeText: "text-[#3B3128]",
          correctBorder: "border-[#8B5E3C]",
          incorrectBorder: "border-[#DC2626]",
          buttonBg: "bg-[#8B5E3C] hover:bg-[#78716C]", // Fixed missing comma after buttonBg
          buttonText: "text-white",
          explanationBg: "bg-[#8B5E3C]/5 border-[#8B5E3C]/20",
          explanationAccent: "border-l-[#8B5E3C]",
        }
      case "SignalDecoding":
        return {
          paperBg: "bg-[#EDEDE9]",
          inkColor: "text-[#184E77]",
          accentColor: "#DB6B5E",
          accentText: "text-[#DB6B5E]",
          hairline: "border-[#C9C2B0]",
          badgeBg: "bg-[#DB6B5E]/10 border-[#DB6B5E]/30",
          badgeText: "text-[#184E77]",
          correctBorder: "border-[#DB6B5E]",
          incorrectBorder: "border-[#DC2626]",
          buttonBg: "bg-[#184E77] hover:bg-[#DB6B5E]",
          buttonText: "text-white",
          explanationBg: "bg-[#DB6B5E]/5 border-[#DB6B5E]/20",
          explanationAccent: "border-l-[#DB6B5E]",
        }
    }
  }

  const themeStyles = getThemeStyles()

  const saveProgress = useCallback((states: QuestionState[], currentScore: number, complete: boolean) => {
    if (disableSaveProgress) return

    const savedKey = `quiz-progress-${gameType}-${date}`
    localStorage.setItem(
      savedKey,
      JSON.stringify({
        questionStates: states,
        score: currentScore,
        isComplete: complete,
        timestamp: Date.now(),
      }),
    )
  }, [disableSaveProgress, gameType, date])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (answeredCount === questions.length) return

      const key = e.key.toUpperCase()
      if (!["A", "B", "C", "D"].includes(key)) return

      const currentQuestionIndex = questionStates.findIndex((state) => !state.isAnswered)
      if (currentQuestionIndex === -1) return

      const question = questions[currentQuestionIndex]
      if (question.questionType !== "객관식" || !question.options) return

      const optionIndex = key.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
      if (optionIndex >= question.options.length) return

      handleMultipleChoiceAnswer(currentQuestionIndex, question.options[optionIndex])
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStates, answeredCount, questions])

  const handleMultipleChoiceAnswer = useCallback((questionIndex: number, option: string) => {
    if (!questionStates[questionIndex]) return

    const currentState = questionStates[questionIndex]
    if (currentState.isAnswered) return

    const question = questions[questionIndex]
    const isCorrect = option === question.answer
    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...currentState,
      userAnswer: option,
      isAnswered: true,
      isCorrect,
    }
    setQuestionStates(newStates)

    const correctCount = newStates.filter((state) => state.isCorrect).length
    setScore(correctCount)

    if (!disableSaveProgress) {
      saveProgress(newStates, correctCount, false)
    }
  }, [questionStates, questions, disableSaveProgress, saveProgress])

  const handleShortAnswerSubmit = (questionIndex: number) => {
    if (!questionStates[questionIndex]) return

    const currentState = questionStates[questionIndex]
    if (currentState.isAnswered || !currentState.userAnswer.trim()) return

    const question = questions[questionIndex]
    const userAnswerNormalized = currentState.userAnswer.trim().toLowerCase()
    const correctAnswerNormalized = question.answer.toLowerCase()
    const isCorrect = userAnswerNormalized === correctAnswerNormalized

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...currentState,
      isAnswered: true,
      isCorrect,
    }

    const newScore = isCorrect ? score + 1 : score
    setQuestionStates(newStates)
    setScore(newScore)
    saveProgress(
      newStates,
      newScore,
      newStates.every((state) => state.isAnswered),
    )
  }

  const handleToggleHint = (questionIndex: number) => {
    if (!questionStates[questionIndex]) return

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...questionStates[questionIndex],
      showHint: !questionStates[questionIndex].showHint,
    }
    setQuestionStates(newStates)
  }

  const handleInputChange = (questionIndex: number, value: string) => {
    if (!questionStates[questionIndex]) return

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...questionStates[questionIndex],
      userAnswer: value,
    }
    setQuestionStates(newStates)
  }

  const handleRestart = () => {
    const resetStates = questions.map(() => ({
      selectedAnswer: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: false,
      showHint: false,
    }))
    setQuestionStates(resetStates)
    setScore(0)
    saveProgress(resetStates, 0, false)
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

  return (
    <div
      className="max-w-3xl mx-auto"
      style={{
        padding: "2rem 0",
      }}
    >
      <div className="space-y-12">
        {questions.map((question, questionIndex) => {
          const state = questionStates[questionIndex]
          if (!state) return null

          return (
            <article
              key={questionIndex}
              className={`${themeStyles.paperBg} border ${themeStyles.hairline} rounded-2xl shadow-sm p-6 md:p-8 space-y-4 ${
                questionIndex > 0 ? "border-t-2 border-dashed pt-8" : ""
              }`}
              style={{
                backgroundColor: gameType === "PrisonersDilemma" ? "#F0E7D8" : undefined,
              }}
            >
              {question.relatedArticle && (
                <NewsHeaderBlock
                  logoSrc="/images/sedaily_logo.png"
                  siteUrl="https://www.sedaily.com"
                  headline={question.relatedArticle.title}
                  lede={question.relatedArticle.excerpt}
                  themeStyles={themeStyles}
                />
              )}

              <header
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: themeStyles.accentColor }}
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 border ${themeStyles.badgeBg} ${themeStyles.badgeText}`}
                >
                  <span className="text-xs uppercase tracking-widest">{question.questionType}</span>
                </div>
                {question.newsLink && (
                  <a
                    href={question.newsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm ${themeStyles.inkColor} hover:${themeStyles.accentText} transition-colors uppercase tracking-wide`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>관련 뉴스</span>
                  </a>
                )}
              </header>

              <div>
                <h3
                  className={`text-[22px] md:text-2xl font-bold leading-tight ${themeStyles.inkColor}`}
                  style={{ lineHeight: "1.4", letterSpacing: "-0.2px", fontWeight: 700 }}
                >
                  {questionIndex + 1}. {question.question}
                </h3>
              </div>

              <div
                className="border-t-2 border-dotted my-4"
                style={{ borderColor: themeStyles.accentColor, opacity: 0.3 }}
              />

              {question.questionType === "객관식" && question.options && (
                <div className="space-y-5">
                  {question.options.map((option, idx) => {
                    const isSelected = state.selectedAnswer === option
                    const isCorrectOption = option === question.answer
                    const showResult = state.isAnswered

                    return (
                      <button
                        key={idx}
                        onClick={() => handleMultipleChoiceAnswer(questionIndex, option)}
                        disabled={state.isAnswered}
                        className={`w-full p-4 text-left border-2 transition-all choice-card newspaper-focus rounded-xl ${
                          showResult && isCorrectOption
                            ? `${themeStyles.correctBorder} border-4 bg-[#F5F1E6]`
                            : showResult && isSelected && !isCorrectOption
                              ? `${themeStyles.incorrectBorder} border-4 bg-[#FEF2F2]`
                              : isSelected
                                ? `${themeStyles.correctBorder} bg-[#F5F1E6]`
                                : `${themeStyles.hairline} hover:${themeStyles.correctBorder} bg-[#FAFAF9]`
                        } ${state.isAnswered ? "cursor-default" : "cursor-pointer"}`}
                        style={{ fontFamily: "var(--font-news-body)" }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex-shrink-0 w-7 h-7 border-2 flex items-center justify-center text-sm font-bold rounded-sm"
                            style={{
                              color: showResult && isCorrectOption ? "#FFFFFF" : accent.hex,
                              borderColor: accent.hex,
                              backgroundColor: showResult && isCorrectOption ? accent.hex : "transparent",
                            }}
                          >
                            {isSelected && showResult ? (isCorrectOption ? "●" : "○") : String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            className={`flex-1 text-[15px] md:text-base ${themeStyles.inkColor}`}
                            style={{ lineHeight: "1.6", fontWeight: 500 }}
                          >
                            {option}
                          </span>
                          {showResult && isCorrectOption && (
                            <CheckCircle2
                              className="flex-shrink-0 h-5 w-5"
                              style={{ color: themeStyles.accentColor }}
                            />
                          )}
                          {showResult && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {question.questionType === "주관식" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="답을 입력하세요"
                      value={state.userAnswer}
                      onChange={(e) => handleInputChange(questionIndex, e.target.value)}
                      disabled={state.isAnswered}
                      className={`w-full text-lg p-4 border-2 rounded-xl ${themeStyles.hairline} ${themeStyles.paperBg} ${themeStyles.inkColor} newspaper-focus`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !state.isAnswered) {
                          handleShortAnswerSubmit(questionIndex)
                        }
                      }}
                    />
                    {!state.isAnswered && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleShortAnswerSubmit(questionIndex)}
                          disabled={!state.userAnswer.trim()}
                          className={`flex-1 rounded-xl ${themeStyles.buttonBg} ${themeStyles.buttonText}`}
                        >
                          제출하기
                        </Button>
                        {question.hint && (
                          <Button
                            onClick={() => handleToggleHint(questionIndex)}
                            variant="outline"
                            className={`gap-2 rounded-xl ${themeStyles.paperBg} ${themeStyles.inkColor} border-2 ${themeStyles.hairline}`}
                          >
                            <Lightbulb className="h-4 w-4" />
                            힌트
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {state.showHint && question.hint && !state.isAnswered && (
                    <div
                      className={`p-4 border-l-4 rounded-lg ${themeStyles.explanationBg} border ${themeStyles.explanationAccent}`}
                    >
                      <div className="flex gap-2">
                        <Lightbulb
                          className="h-5 w-5 flex-shrink-0 mt-0.5"
                          style={{ color: themeStyles.accentColor }}
                        />
                        <div>
                          <p className={`font-normal text-xs uppercase tracking-wide mb-1 ${themeStyles.inkColor}`}>
                            힌트
                          </p>
                          <p
                            className={`${themeStyles.inkColor} leading-relaxed`}
                            style={{ lineHeight: "1.7", fontWeight: 400 }}
                          >
                            {question.hint}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {state.isAnswered && (
                    <div
                      className={`p-4 border-l-4 rounded-lg border ${state.isCorrect ? themeStyles.correctBorder : themeStyles.incorrectBorder}`}
                      style={{
                        backgroundColor: state.isCorrect ? `${themeStyles.accentColor}10` : "#FEF2F2",
                        borderLeftColor: state.isCorrect ? themeStyles.accentColor : "#DC2626",
                      }}
                    >
                      <div className="flex gap-2">
                        {state.isCorrect ? (
                          <CheckCircle2
                            className="h-5 w-5 flex-shrink-0 mt-0.5"
                            style={{ color: themeStyles.accentColor }}
                          />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-normal text-xs uppercase tracking-wide mb-1 ${themeStyles.inkColor}`}>
                            {state.isCorrect ? "정답입니다" : "오답입니다"}
                          </p>
                          {!state.isCorrect && (
                            <p className={`text-sm ${themeStyles.inkColor}`} style={{ fontWeight: 500 }}>
                              정답: <span className="font-bold">{question.answer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RAG 기반 AI 챗봇 */}
              <div className="pt-4">
                <AIChatbot
                  gameType={gameType}
                  questionIndex={questionIndex}
                  questionText={question.question}
                  isAnswered={state.isAnswered}
                  quizArticleUrl={question.newsLink}  // RAG: 퀴즈 기사 URL 전달
                />
              </div>

              {state.isAnswered && (
                <div className="space-y-4 mt-4">
                  <div
                    className={`p-4 border-l-4 rounded-lg ${themeStyles.explanationBg} border ${themeStyles.explanationAccent}`}
                    style={{
                      backgroundColor: gameType === "PrisonersDilemma" ? "transparent" : undefined,
                      borderLeftColor: accent.hex,
                      borderColor: "rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="space-y-2">
                      <p className={`font-normal text-xs uppercase tracking-wide ${themeStyles.inkColor}`}>해설</p>
                      <p
                        className={`text-[15px] md:text-base ${themeStyles.inkColor}`}
                        style={{ lineHeight: "1.7", fontWeight: 400 }}
                      >
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {answeredCount === questions.length && (
        <div
          className={`${themeStyles.paperBg} border-2 ${themeStyles.hairline} rounded-2xl shadow-sm p-8 text-center space-y-6 letterpress mt-12`}
          style={{
            borderTop: `2px dashed ${themeStyles.accentColor}`,
          }}
        >
          <div className="border-b-2 border-dashed pb-4 mb-4" style={{ borderColor: themeStyles.accentColor }}>
            <h2 className={`text-3xl font-bold ${themeStyles.inkColor} tracking-tight`}>퀴즈 완료</h2>
          </div>

          <div className="space-y-2">
            <p className={`text-6xl font-bold ${themeStyles.accentText}`}>
              {score} / {questions.length}
            </p>
            <p className={`text-xl ${themeStyles.inkColor}`}>{Math.round((score / questions.length) * 100)}% 정답률</p>
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <Button
              onClick={handleRestart}
              size="lg"
              className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonText} tracking-wide`}
            >
              다시 도전하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`w-full ${themeStyles.paperBg} ${themeStyles.inkColor} border-2 ${themeStyles.hairline}`}
              onClick={() => router.back()}
            >
              돌아가기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
