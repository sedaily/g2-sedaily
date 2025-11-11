"use client"

import { useEffect, useState } from "react"
import { UniversalQuizPlayer } from "@/components/games/UniversalQuizPlayer"
import { getQuestionsForDate, getMostRecentDate, type Question } from "@/lib/games-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function G2TestClientPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    async function loadQuiz() {
      try {
        const recentDate = await getMostRecentDate("PrisonersDilemma")
        if (!recentDate) {
          setError("사용 가능한 퀴즈가 없습니다.")
          setLoading(false)
          return
        }
        setDate(recentDate)
        
        const quizData = await getQuestionsForDate("PrisonersDilemma", recentDate)
        setQuestions(quizData)
      } catch (err) {
        console.error("[v0] Error loading test quiz:", err)
        setError("퀴즈를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen g2-bg">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64 bg-[#8B5E3C]/10" />
          <Skeleton className="h-64 w-full bg-[#8B5E3C]/10" />
        </div>
      </div>
    )
  }

  if (error || !date) {
    return (
      <div className="min-h-screen g2-bg">
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
      <div className="min-h-screen g2-bg">
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
          backgroundImage: "url('/backgrounds/g2-silhouettes-clean.png')",
        }}
      />
      {/* Light overlay to maintain beige theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EFECE7]/40 via-[#E7DFD3]/35 to-[#E2DAD2]/40" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Subtle grid/lattice pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px)",
          }}
        />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header with icon */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="/icons/scale-woodcut.webp"
                  alt="Balance Scale"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#44403C] font-serif">죄수의 딜레마</h1>
            <p className="text-[#8B5E3C] text-base md:text-lg font-serif max-w-2xl mx-auto">
              정책·경제 현안을 둘러싼 찬반 논리 분석
            </p>
          </div>

          <UniversalQuizPlayer 
            questions={questions} 
            date={date} 
            gameType="PrisonersDilemma" 
            themeColor="#8B5E3C"
            disableSaveProgress={true}
          />
        </div>
      </div>
    </div>
  )
}
