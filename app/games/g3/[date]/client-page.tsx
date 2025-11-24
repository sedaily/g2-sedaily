"use client"

import { useEffect, useState } from "react"
import { UniversalQuizPlayer } from "@/components/games/UniversalQuizPlayer"
import { getQuestionsForDate, type Question } from "@/lib/games-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

type Props = {
  date: string
}

function normalizeDate(date: string): string | null {
  // Format 1: yyyymmdd (8 digits)
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

  // Format 2: yymmdd (6 digits)
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

  // Format 3: yyyy-mm-dd (10 characters with hyphens)
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

export default function DateQuizClient({ date }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [normalizedDate, setNormalizedDate] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    async function loadQuiz() {
      try {
        const normalized = normalizeDate(date)
        if (!normalized) {
          setError("잘못된 날짜 형식입니다.")
          setLoading(false)
          return
        }
        setNormalizedDate(normalized)
        
        const quizData = await getQuestionsForDate("SignalDecoding", normalized)
        setQuestions(quizData)
      } catch (err) {
        console.error("[v0] Error loading date quiz:", err)
        setError("퀴즈를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [date])

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g3-signal-waves.webp')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#E89482]/70 via-[#F0D2C0]/65 to-[#F0D2C0]/70" />

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#184E77]" aria-hidden="true" />
            <p className="text-lg text-[#184E77] korean-text">퀴즈를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !normalizedDate) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g3-signal-waves.webp')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#E89482]/70 via-[#F0D2C0]/65 to-[#F0D2C0]/70" />

        <div className="container mx-auto px-4 py-8 relative z-10">
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
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g3-signal-waves.webp')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#E89482]/70 via-[#F0D2C0]/65 to-[#F0D2C0]/70" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>이 날짜에 대한 퀴즈가 없습니다.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/g3-signal-waves.webp')",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#E89482]/70 via-[#F0D2C0]/65 to-[#F0D2C0]/70" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <UniversalQuizPlayer
          questions={questions}
          date={normalizedDate}
          gameType="SignalDecoding"
          themeColor="#184E77"
        />
      </div>
    </div>
  )
}
