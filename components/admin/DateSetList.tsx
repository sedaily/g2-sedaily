"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/types/quiz"

type DateSetListProps = {
  questions: QuizQuestion[]
  currentQuestionIndex: number
  onSelectQuestion: (index: number) => void
  onAddQuestion: () => void
}

export function DateSetList({ questions, currentQuestionIndex, onSelectQuestion, onAddQuestion }: DateSetListProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">문제 목록</h2>
        <Button size="sm" onClick={onAddQuestion}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(index)}
            className={cn(
              "w-full text-left p-3 rounded-md border transition-colors",
              currentQuestionIndex === index ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
            )}
          >
            <div className="font-medium text-sm">문제 {index + 1}</div>
            <div className="text-xs opacity-80 truncate">{q.question_text || "제목 없음"}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
