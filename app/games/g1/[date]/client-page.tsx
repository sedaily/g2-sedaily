"use client"

import { useEffect, useState } from "react"
import { UniversalQuizPlayer } from "@/components/games/UniversalQuizPlayer"
import { getQuestionsForDate, type Question } from "@/lib/games-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

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
        
        const quizData = await getQuestionsForDate("BlackSwan", normalized)
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
            backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#102C55]/60 via-[#1E3A8A]/50 to-[#2B4B8A]/60" />

        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-white" aria-hidden="true" />
            <p className="text-lg text-white korean-text">퀴즈를 불러오는 중...</p>
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
          backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
        }}
      />
        <div className="absolute inset-0 bg-gradient-to-b from-[#102C55]/60 via-[#1E3A8A]/50 to-[#2B4B8A]/60" />

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
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#102C55]/60 via-[#1E3A8A]/50 to-[#2B4B8A]/60" />

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
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#102C55]/60 via-[#1E3A8A]/50 to-[#2B4B8A]/60" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with icon */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src="/icons/swan-woodcut.webp"
                alt="Black Swan"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white font-serif">블랙스완</h1>
          <p className="text-[#E0F2FE] text-base md:text-lg font-serif max-w-2xl mx-auto">
            작은 사건이 시장 전반에 퍼지는 연쇄 반응을 추적하는 시뮬레이션
          </p>
        </div>

        <UniversalQuizPlayer questions={questions} date={normalizedDate} gameType="BlackSwan" themeColor="#3B82F6" />
      </div>
    </div>
  )
}
