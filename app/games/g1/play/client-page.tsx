"use client"

import { SimpleQuizPlayer } from "@/components/games/SimpleQuizPlayer"
import { type Question } from "@/lib/games-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useRealtimeQuiz } from "@/hooks/useRealtimeQuiz"
import { Button } from "@/components/ui/button"

// 테스트 퀴즈 (하드코딩)
const TEST_QUIZ: Question[] = [
  {
    id: "test-1",
    questionType: "객관식",
    question: "다음 중 블랙스완 이벤트의 특징이 아닌 것은?",
    options: [
      "예측 불가능하다",
      "매우 큰 영향을 미친다",
      "발생 후 설명 가능하다",
      "자주 발생한다"
    ],
    answer: "자주 발생한다",
    explanation: "블랙스완 이벤트는 극히 드물게 발생하는 예측 불가능한 사건입니다.",
    newsLink: "https://www.sedaily.com",
  },
  {
    id: "test-2",
    questionType: "주관식",
    question: "2008년 금융위기를 촉발한 주요 원인은?",
    hint: "주택 관련 금융상품",
    answer: "서브프라임 모기지",
    explanation: "서브프라임 모기지 사태가 2008년 글로벌 금융위기의 주요 원인이었습니다.",
    newsLink: "https://www.sedaily.com",
  }
]

export default function G1TestClientPage() {
  const { quiz, loading, error, refresh } = useRealtimeQuiz('BlackSwan', 30000)
  
  const questions: Question[] = quiz?.data?.questions || TEST_QUIZ
  const useTestQuiz = !quiz

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#102C55]/60 via-[#1E3A8A]/50 to-[#2B4B8A]/60" />

        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
          }}
        />
        {/* Dark overlay for better text readability */}
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
        {/* Dark overlay for better text readability */}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">블랙스완</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
          </div>
          <p className="text-gray-600">
            {useTestQuiz ? "테스트 모드" : "실시간 업데이트 (30초)"}
          </p>
        </div>

        <SimpleQuizPlayer 
          questions={questions} 
          gameType="BlackSwan"
        />
      </div>
    </div>
  )
}
