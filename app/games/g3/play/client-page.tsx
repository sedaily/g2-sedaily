"use client"

import { useEffect, useState } from "react"
import { UniversalQuizPlayer } from "@/components/games/UniversalQuizPlayer"
import { getQuestionsForDate, getMostRecentDate, type Question } from "@/lib/games-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function G3TestClientPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    async function loadQuiz() {
      try {
        const recentDate = await getMostRecentDate("SignalDecoding")
        if (!recentDate) {
          setError("사용 가능한 퀴즈가 없습니다.")
          setLoading(false)
          return
        }
        setDate(recentDate)
        
        const quizData = await getQuestionsForDate("SignalDecoding", recentDate)
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
      <div className="min-h-screen g3-bg">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    )
  }

  if (error || !date) {
    return (
      <div className="min-h-screen g3-bg">
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
      <div className="min-h-screen g3-bg">
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
          backgroundImage: "url('/backgrounds/g3-signal-waves.png')",
        }}
      />
      {/* Coral/sand overlay for theme consistency */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E89482]/70 via-[#F0D2C0]/65 to-[#F0D2C0]/70" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with icon */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src="/icons/antenna-woodcut.webp"
                alt="Signal Antenna"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#991B1B] font-serif">시그널 디코딩</h1>
          <p className="text-[#184E77] text-base md:text-lg font-serif max-w-2xl mx-auto">
            뉴스 속 핵심 신호를 해독하는 퍼즐
          </p>
        </div>

        <UniversalQuizPlayer 
          questions={questions} 
          date={date} 
          gameType="SignalDecoding" 
          themeColor="#184E77"
          disableSaveProgress={true}
        />
      </div>
    </div>
  )
}
