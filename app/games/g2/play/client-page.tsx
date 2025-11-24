"use client"

import { useEffect, useState } from "react"
import { SimpleQuizPlayer } from "@/components/games/SimpleQuizPlayer"
import { getQuestionsForDate, type Question } from "@/lib/games-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const TEST_QUIZ: Question[] = [
  {
    id: "test-1",
    questionType: "객관식",
    question: "죄수의 딜레마에서 최선의 결과는?",
    options: ["둘 다 협력", "둘 다 배신", "한 명만 협력", "무작위 선택"],
    answer: "둘 다 협력",
    explanation: "상호 협력이 가장 좋은 결과를 가져옵니다.",
    newsLink: "https://www.sedaily.com",
  }
]

export default function G2PlayPage() {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [useTestQuiz, setUseTestQuiz] = useState(false)

  useEffect(() => {
    async function loadQuiz() {
      try {
        const dates = await fetch(
          `${process.env.NEXT_PUBLIC_QUIZ_API_URL?.replace('/all', '')}/meta/PrisonersDilemma`
        ).then(r => r.json()).then(d => d.dates || [])
        
        if (dates.length > 0) {
          const quizData = await getQuestionsForDate("PrisonersDilemma", dates[0])
          if (quizData.length > 0) {
            setQuestions(quizData)
            setLoading(false)
            return
          }
        }
        
        setQuestions(TEST_QUIZ)
        setUseTestQuiz(true)
      } catch (err) {
        console.error("Error loading quiz:", err)
        setQuestions(TEST_QUIZ)
        setUseTestQuiz(true)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "퀴즈를 찾을 수 없습니다."}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">죄수의 딜레마</h1>
          <p className="text-gray-600">{useTestQuiz ? "테스트 모드" : "연습 모드"}</p>
        </div>

        <SimpleQuizPlayer 
          questions={questions} 
          gameType="PrisonersDilemma"
        />
      </div>
    </div>
  )
}
