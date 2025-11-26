"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Edit } from "lucide-react"
import { fetchAvailableDates, fetchQuizDataByDate } from "@/lib/quiz-api-client"
import type { Question } from "@/lib/games-data"
import type { QuizQuestion } from "@/types/quiz"

type GameType = "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"

type QuizListProps = {
  onEdit?: (questions: QuizQuestion[], date: string) => void
}

export function QuizList({ onEdit }: QuizListProps) {
  const [gameType, setGameType] = useState<GameType>("BlackSwan")
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadDates()
  }, [gameType])

  useEffect(() => {
    if (selectedDate) {
      loadQuestions()
    }
  }, [selectedDate])

  const loadDates = async () => {
    setLoading(true)
    try {
      const availableDates = await fetchAvailableDates(gameType)
      setDates(availableDates)
      if (availableDates.length > 0) {
        setSelectedDate(availableDates[0])
      }
    } catch (error) {
      console.error("Failed to load dates:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    if (!selectedDate) return
    setLoading(true)
    try {
      const data = await fetchQuizDataByDate(gameType, selectedDate)
      setQuestions(data)
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (!selectedDate || !onEdit) return

    // Lambda Question을 QuizQuestion 형식으로 변환
    const convertedQuestions: QuizQuestion[] = questions.map((q) => {
      const isMultipleChoice = q.questionType === "객관식"
      
      return {
        id: q.id,
        date: selectedDate,
        theme: gameType,
        questionType: q.questionType,
        question_text: q.question,
        choices: isMultipleChoice 
          ? q.options || []
          : [q.answer], // 주관식은 answer를 choices[0]에 저장
        correct_index: isMultipleChoice 
          ? (q.answer ? parseInt(q.answer) - 1 : null) // "1" -> 0, "2" -> 1
          : null,
        explanation: q.explanation,
        related_article: q.relatedArticle ? {
          title: q.relatedArticle.title,
          snippet: q.relatedArticle.excerpt,
          url: q.newsLink
        } : {
          title: "",
          snippet: "",
          url: q.newsLink
        },
        creator: "",
        tags: q.tags || ""
      }
    })

    onEdit(convertedQuestions, selectedDate)
  }

  const handleDelete = async () => {
    if (!selectedDate || !confirm(`${selectedDate} 퀴즈를 삭제하시겠습니까?`)) return

    setDeleting(true)
    try {
      const response = await fetch(
        `https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz/${gameType}/${selectedDate}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        // 캐시 자동 초기화
        const { clearQuizDataCache, clearDateCache } = await import("@/lib/quiz-api-client")
        clearQuizDataCache()
        clearDateCache(gameType, selectedDate)
        console.log('[Admin] Quiz cache cleared after deletion')
        
        alert("삭제 완료!")
        setSelectedDate(null)
        setQuestions([])
        loadDates()
      } else {
        alert("삭제 실패")
      }
    } catch (error) {
      alert("오류 발생")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">퀴즈 수정</h2>
        <p className="text-sm text-muted-foreground mb-4">
          저장된 퀴즈를 조회하고 수정 또는 삭제할 수 있습니다.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={gameType === "BlackSwan" ? "default" : "outline"}
              onClick={() => setGameType("BlackSwan")}
              size="sm"
            >
              블랙스완
            </Button>
            <Button
              variant={gameType === "PrisonersDilemma" ? "default" : "outline"}
              onClick={() => setGameType("PrisonersDilemma")}
              size="sm"
            >
              죄수의 딜레마
            </Button>
            <Button
              variant={gameType === "SignalDecoding" ? "default" : "outline"}
              onClick={() => setGameType("SignalDecoding")}
              size="sm"
            >
              시그널 디코딩
            </Button>
            <Button variant="ghost" size="sm" onClick={loadDates} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {dates.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">날짜 선택:</label>
              <select
                value={selectedDate || ""}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">저장된 퀴즈가 없습니다.</p>
          )}

          {selectedDate && questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{questions.length}개 문제</Badge>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit()}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? "삭제 중..." : "삭제"}
                  </Button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-muted rounded-md text-sm">
                    <span className="font-medium">Q{idx + 1}:</span> {q.question.substring(0, 50)}
                    {q.question.length > 50 && "..."}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
