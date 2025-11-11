"use client"

import { useState, useEffect } from "react"
import { QuizPlayer } from "@/components/games/QuizPlayer"
// import { fetchTodayQuiz, getTodayKST, toYYMMDD } from "@/lib/quiz-api"
import { getTodayKST, toYYMMDD } from "@/lib/quiz-api"
import type { QuizResponse, QuizItem } from "@/lib/quiz-api"
import { getQuestionsForDate, type Question } from "@/lib/games-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function G1ClientPage() {
  const [data, setData] = useState<QuizResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true)
        setError(null)

        const today = getTodayKST()
        const date = toYYMMDD(today)
        setDateStr(date)

        // 더미데이터 사용 (API 호출 대신)
        const yy = date.substring(0, 2)
        const mm = date.substring(2, 4)
        const dd = date.substring(4, 6)
        const formattedDate = `20${yy}-${mm}-${dd}`
        
        if (process.env.NODE_ENV === 'development') {
          console.log("[v0] Loading dummy quiz data for date:", formattedDate)
        }
        const questions = await getQuestionsForDate("BlackSwan", formattedDate)
        
        // Question 타입을 QuizItem 타입으로 변환
        const quizItems: QuizItem[] = questions.map((q: Question, index) => ({
          question: q.question,
          quizDate: formattedDate,
          questionId: parseInt(q.id) || index + 1,
          options: q.options || [],
          newsLink: q.newsLink,
          answer: q.answer,
          explanation: q.explanation,
          hint: Array.isArray(q.hint) ? q.hint : q.hint ? [q.hint] : undefined
        }))
        
        const quizData: QuizResponse = { questions: quizItems }
        setData(quizData)
      } catch (err) {
        console.error("[v0] Failed to fetch today quiz:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch quiz"))
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold korean-heading mb-2 text-foreground">오늘의 경제 퀴즈</h1>
        <p className="text-muted-foreground korean-text">
          <span className="font-bold">하루 5분</span>, 경제 감각을 키워보세요
        </p>
      </div>

      {loading && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground korean-text">퀴즈를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold korean-heading mb-4 text-foreground">퀴즈를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground korean-text mb-8 leading-relaxed">
            일시적인 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline" className="korean-text bg-transparent">
              <Link href="/games">게임 허브</Link>
            </Button>
            <Button onClick={handleRetry} className="btn-primary text-on-primary korean-text">
              다시 시도
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {!data.questions || data.questions.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-2xl font-bold korean-heading mb-4 text-foreground">오늘의 퀴즈는 준비 중입니다</h2>
              <p className="text-muted-foreground korean-text mb-8 leading-relaxed">
                곧 새로운 퀴즈로 찾아뵙겠습니다.
                <br />
                이전 퀴즈를 플레이하시려면 아카이브를 확인해주세요.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline" className="korean-text bg-transparent">
                  <Link href="/games">게임 허브</Link>
                </Button>
                <Button asChild className="btn-primary text-on-primary korean-text">
                  <Link href="/games/g1/archive">아카이브 보기</Link>
                </Button>
              </div>
            </div>
          ) : (
            <QuizPlayer items={data.questions} date={dateStr} />
          )}
        </>
      )}
    </div>
  )
}
