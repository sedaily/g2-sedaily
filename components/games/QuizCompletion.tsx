/**
 * 퀴즈 완료 화면 컴포넌트
 * UniversalQuizPlayer에서 완료 화면 로직 분리
 */

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { ThemeStyles } from "@/lib/quiz-themes"

type QuizCompletionProps = {
  score: number
  totalQuestions: number
  accuracy: number
  themeStyles: ThemeStyles
  onRestart: () => void
}

export function QuizCompletion({
  score,
  totalQuestions,
  accuracy,
  themeStyles,
  onRestart,
}: QuizCompletionProps) {
  const router = useRouter()

  const handleRestart = () => {
    console.log('[QuizCompletion] Restart button clicked')
    onRestart()
    // 페이지 새로고침으로 완전 초기화
    window.location.reload()
  }

  const handleGoHome = () => {
    console.log('[QuizCompletion] Go home button clicked')
    router.push('/games')
  }

  return (
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
          {score} / {totalQuestions}
        </p>
        <p className={`text-xl ${themeStyles.inkColor}`}>{accuracy}% 정답률</p>
      </div>

      <div className="pt-6 flex flex-col gap-3">
        <Button
          onClick={handleRestart}
          size="lg"
          type="button"
          className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonText} tracking-wide`}
        >
          다시 도전하기
        </Button>
        <Button
          variant="outline"
          size="lg"
          type="button"
          className={`w-full ${themeStyles.paperBg} ${themeStyles.inkColor} border-2 ${themeStyles.hairline}`}
          onClick={handleGoHome}
        >
          메인으로
        </Button>
      </div>
    </div>
  )
}