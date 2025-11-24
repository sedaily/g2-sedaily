"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, ExternalLink } from "lucide-react"
import type { QuizQuestion } from "@/types/quiz"

type QuizPreviewProps = {
  question: QuizQuestion
}

export function QuizPreview({ question }: QuizPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  if (!isVisible) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">미리보기</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            미리보기 보기
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">미리보기</h3>
          <Badge variant="secondary">{question.theme}</Badge>
          <Badge variant="outline">{question.questionType}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>

      {/* 질문 */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">문제</h4>
        <p className="text-foreground leading-relaxed">
          {question.question_text || "질문을 입력하세요..."}
        </p>
      </div>

      {/* 선택지 (객관식) */}
      {question.questionType === "객관식" && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">선택지</h4>
          <div className="space-y-2">
            {question.choices.map((choice, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedChoice === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${
                  question.correct_index === index
                    ? "ring-2 ring-green-500/20 bg-green-50 dark:bg-green-950/20"
                    : ""
                }`}
                onClick={() => setSelectedChoice(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    question.correct_index === index
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={choice.trim() ? "text-foreground" : "text-muted-foreground italic"}>
                    {choice.trim() || `선택지 ${index + 1}을 입력하세요...`}
                  </span>
                  {question.correct_index === index && (
                    <Badge variant="secondary" className="ml-auto text-xs">정답</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 정답 (주관식) */}
      {question.questionType === "주관식" && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">정답</h4>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <span className="text-green-700 dark:text-green-300 font-medium">
              {question.choices[0] || "정답을 입력하세요..."}
            </span>
          </div>
        </div>
      )}

      {/* 해설 */}
      {question.explanation && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">해설</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {/* 관련 기사 */}
      {question.related_article?.title && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">관련 기사</h4>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-sm mb-1">{question.related_article.title}</h5>
                {question.related_article.snippet && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {question.related_article.snippet}
                  </p>
                )}
              </div>
              {question.related_article.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={question.related_article.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 태그 */}
      {question.tags && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">태그:</span>
          <div className="flex flex-wrap gap-1">
            {question.tags.split(',').map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}