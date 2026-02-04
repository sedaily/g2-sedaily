/**
 * 개별 퀴즈 질문 컴포넌트
 * UniversalQuizPlayer에서 질문 렌더링 로직 분리
 */

import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Lightbulb, ExternalLink } from "lucide-react"
import type { Question } from "@/lib/games-data"
import type { QuestionState } from "@/hooks/useQuizState"
import type { ThemeStyles, AccentColors } from "@/lib/quiz-themes"
import { NewsHeaderBlock } from "./NewsHeaderBlock"
import { AIChatbot } from "./AIChatbot"

type QuizQuestionProps = {
  question: Question
  questionIndex: number
  state: QuestionState
  themeStyles: ThemeStyles
  accent: AccentColors
  gameType: "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"
  onMultipleChoiceAnswer: (questionIndex: number, option: string) => void
  onShortAnswerSubmit: (questionIndex: number) => void
  onToggleHint: (questionIndex: number) => void
  onInputChange: (questionIndex: number, value: string) => void
}

export function QuizQuestion({
  question,
  questionIndex,
  state,
  themeStyles,
  accent,
  gameType,
  onMultipleChoiceAnswer,
  onShortAnswerSubmit,
  onToggleHint,
  onInputChange,
}: QuizQuestionProps) {
  return (
    <article
      className={`${themeStyles.paperBg} border ${themeStyles.hairline} rounded-2xl shadow-sm p-4 md:p-5 space-y-2 ${
        questionIndex > 0 ? "border-t-2 border-dashed pt-6" : ""
      }`}
      style={{
        backgroundColor: gameType === "PrisonersDilemma" ? "#F0E7D8" : undefined,
      }}
    >
      {/* 관련 기사 헤더 */}
      {question.relatedArticle && (
        <NewsHeaderBlock
          headline={question.relatedArticle.title}
          lede={question.relatedArticle.excerpt}
          themeStyles={themeStyles}
        />
      )}

      {/* 질문 헤더 */}
      <header
        className="flex items-center justify-between border-b pb-2"
        style={{ borderColor: themeStyles.accentColor }}
      >
        <div
          className={`inline-flex items-center gap-2 px-2 py-1 border ${themeStyles.badgeBg} ${themeStyles.badgeText}`}
        >
          <span className="text-xs uppercase tracking-widest">{question.questionType}</span>
        </div>
        {question.newsLink && (
          <a
            href={question.newsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${themeStyles.inkColor} hover:${themeStyles.accentText} transition-colors`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>원문 기사</span>
          </a>
        )}
      </header>

      {/* 질문 제목 */}
      <div>
        <h3
          className={`text-base md:text-lg font-bold leading-tight ${themeStyles.inkColor}`}
          style={{ lineHeight: "1.4", letterSpacing: "-0.2px", fontWeight: 700 }}
        >
          {questionIndex + 1}. {question.question}
        </h3>
      </div>

      {/* 구분선 */}
      <div
        className="border-t-2 border-dotted my-2"
        style={{ borderColor: themeStyles.accentColor, opacity: 0.3 }}
      />

      {/* 객관식 선택지 */}
      {question.questionType === "객관식" && question.options && (
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = state.userAnswer === option
            const isCorrectOption = option === question.answer
            const showResult = state.isAnswered

            return (
              <button
                key={idx}
                onClick={() => onMultipleChoiceAnswer(questionIndex, option)}
                disabled={state.isAnswered}
                className={`w-full p-3 text-left border-2 transition-all choice-card newspaper-focus rounded-xl ${
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
                <div className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-6 h-6 border-2 flex items-center justify-center text-xs font-bold rounded-sm"
                    style={{
                      color: showResult && isCorrectOption ? "#FFFFFF" : accent.hex,
                      borderColor: accent.hex,
                      backgroundColor: showResult && isCorrectOption ? accent.hex : "transparent",
                    }}
                  >
                    {isSelected && showResult ? (isCorrectOption ? "●" : "○") : String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={`flex-1 text-sm md:text-base ${themeStyles.inkColor}`}
                    style={{ lineHeight: "1.5", fontWeight: 500 }}
                  >
                    {option}
                  </span>
                  {showResult && isCorrectOption && (
                    <CheckCircle2
                      className="flex-shrink-0 h-4 w-4"
                      style={{ color: themeStyles.accentColor }}
                    />
                  )}
                  {showResult && isSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-red-600" />}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 주관식 입력 */}
      {question.questionType === "주관식" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="답을 입력하세요"
              value={state.userAnswer}
              onChange={(e) => onInputChange(questionIndex, e.target.value)}
              disabled={state.isAnswered}
              className={`w-full text-lg p-4 border-2 rounded-xl ${themeStyles.hairline} ${themeStyles.paperBg} ${themeStyles.inkColor} newspaper-focus`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !state.isAnswered) {
                  onShortAnswerSubmit(questionIndex)
                }
              }}
            />
            {!state.isAnswered && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onShortAnswerSubmit(questionIndex)}
                  disabled={!state.userAnswer.trim()}
                  className={`flex-1 rounded-xl ${themeStyles.buttonBg} ${themeStyles.buttonText}`}
                >
                  제출하기
                </Button>
                {question.hint && (
                  <Button
                    onClick={() => onToggleHint(questionIndex)}
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

          {/* 힌트 표시 */}
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

          {/* 주관식 결과 표시 */}
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

      {/* AI 챗봇 */}
      <div className="pt-4">
        <AIChatbot
          gameType={gameType}
          questionIndex={questionIndex}
          questionText={question.question}
          isAnswered={state.isAnswered}
          quizArticleUrl={question.newsLink}
        />
      </div>

      {/* 해설 */}
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
}