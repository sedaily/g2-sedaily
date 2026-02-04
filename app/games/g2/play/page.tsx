"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { UniversalQuizPlayer } from "@/components/games/UniversalQuizPlayer"
import { getQuestionsForDate, getMostRecentDate, type Question } from "@/lib/games-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

function normalizeDate(date: string): string | null {
  if (/^\d{8}$/.test(date)) {
    const yyyy = date.substring(0, 4)
    const mm = date.substring(4, 6)
    const dd = date.substring(6, 8)
    const month = Number.parseInt(mm)
    const day = Number.parseInt(dd)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${yyyy}-${mm}-${dd}`
    }
  }
  if (/^\d{6}$/.test(date)) {
    const mm = Number.parseInt(date.substring(2, 4))
    const dd = Number.parseInt(date.substring(4, 6))
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      const year = `20${date.substring(0, 2)}`
      const month = date.substring(2, 4)
      const day = date.substring(4, 6)
      return `${year}-${month}-${day}`
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [, mm, dd] = date.split("-")
    const month = Number.parseInt(mm)
    const day = Number.parseInt(dd)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return date
    }
  }
  return null
}

export default function G2PlayPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [normalizedDate, setNormalizedDate] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    async function loadQuiz() {
      try {
        const dateParam = searchParams.get("date")
        
        if (dateParam) {
          const normalized = normalizeDate(dateParam)
          if (!normalized) {
            setError("잘못된 날짜 형식입니다.")
            setLoading(false)
            return
          }
          setNormalizedDate(normalized)
          const quizData = await getQuestionsForDate("PrisonersDilemma", normalized)
          setQuestions(quizData)
        } else {
          const latestDate = await getMostRecentDate("PrisonersDilemma")
          if (latestDate) {
            setNormalizedDate(latestDate)
            const quizData = await getQuestionsForDate("PrisonersDilemma", latestDate)
            setQuestions(quizData)
          } else {
            setError("사용 가능한 퀴즈가 없습니다.")
          }
        }
      } catch (err) {
        console.error("[v0] Error loading quiz:", err)
        setError("퀴즈를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/backgrounds/g2-silhouettes-clean.webp')" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#EFECE7]/40 via-[#E7DFD3]/35 to-[#E2DAD2]/40" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#8B5E3C]" />
            <p className="text-lg text-[#8B5E3C]">퀴즈를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !normalizedDate) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "퀴즈를 찾을 수 없습니다."}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>이 날짜에 대한 퀴즈가 없습니다.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <UniversalQuizPlayer
          questions={questions}
          date={normalizedDate}
          gameType="PrisonersDilemma"
          themeColor="#8B5E3C"
        />
      </div>
    </div>
  )
}
