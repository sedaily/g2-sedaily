"use client"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, XCircle, LinkIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestion, GameTheme } from "@/types/quiz"

type ReviewListProps = {
  questions: QuizQuestion[]
  currentQuestionIndex: number
  reviewFilter: "all" | "ok" | "missing"
  themeFilter: GameTheme | "all"
  onSelectQuestion: (index: number) => void
  onReviewFilterChange: (filter: "all" | "ok" | "missing") => void
  onThemeFilterChange: (theme: GameTheme | "all") => void
  validateQuestion: (question: QuizQuestion) => { status: "ok" | "missing"; issues: string[] }
}

export function ReviewList({
  questions,
  currentQuestionIndex,
  reviewFilter,
  themeFilter,
  onSelectQuestion,
  onReviewFilterChange,
  onThemeFilterChange,
  validateQuestion,
}: ReviewListProps) {
  const getFilteredQuestions = () => {
    return questions.filter((q) => {
      const status = validateQuestion(q)
      const matchesStatus = reviewFilter === "all" || status.status === reviewFilter
      const matchesTheme = themeFilter === "all" || q.theme === themeFilter
      return matchesStatus && matchesTheme
    })
  }

  const getStats = () => {
    const total = questions.length
    const ok = questions.filter((q) => validateQuestion(q).status === "ok").length
    const missing = total - ok
    return { total, ok, missing }
  }

  const themeColors = {
    BlackSwan: "bg-blue-100 text-blue-800",
    SignalDecoding: "bg-orange-100 text-orange-800",
    PrisonersDilemma: "bg-stone-100 text-stone-800",
  }

  const themeLabels = {
    BlackSwan: "블랙스완",
    SignalDecoding: "시그널",
    PrisonersDilemma: "죄수",
  }

  return (
    <div className="bg-card rounded-lg border sticky top-24">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-4">검수 리스트</h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-2xl font-bold">{getStats().total}</div>
            <div className="text-xs text-muted-foreground">전체</div>
          </div>
          <div className="text-center p-2 bg-success/10 rounded">
            <div className="text-2xl font-bold text-success">{getStats().ok}</div>
            <div className="text-xs text-muted-foreground">완료</div>
          </div>
          <div className="text-center p-2 bg-destructive/10 rounded">
            <div className="text-2xl font-bold text-destructive">{getStats().missing}</div>
            <div className="text-xs text-muted-foreground">오류</div>
          </div>
        </div>

        <div className="space-y-2">
          <Select value={reviewFilter} onValueChange={onReviewFilterChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="ok">완료</SelectItem>
              <SelectItem value="missing">오류</SelectItem>
            </SelectContent>
          </Select>

          <Select value={themeFilter} onValueChange={onThemeFilterChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 테마</SelectItem>
              <SelectItem value="BlackSwan">블랙 스완</SelectItem>
              <SelectItem value="SignalDecoding">시그널 디코딩</SelectItem>
              <SelectItem value="PrisonersDilemma">죄수의 딜레마</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        {getFilteredQuestions().map((question) => {
          const actualIndex = questions.indexOf(question)
          const status = validateQuestion(question)

          return (
            <div
              key={question.id}
              className={cn(
                "p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                currentQuestionIndex === actualIndex && "bg-muted",
              )}
              onClick={() => onSelectQuestion(actualIndex)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">#{actualIndex + 1}</span>
                  <Badge variant="outline" className={cn("text-xs", themeColors[question.theme])}>
                    {themeLabels[question.theme]}
                  </Badge>
                </div>
                {status.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
              </div>

              {question.creator && <div className="text-xs text-muted-foreground mb-1">by {question.creator}</div>}

              <div className="text-sm mb-2 line-clamp-2">
                {question.question_text || <span className="text-muted-foreground italic">질문 없음</span>}
              </div>

              <div className="space-y-1 mb-2">
                {question.choices.slice(0, 2).map((choice, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-xs px-2 py-1 rounded bg-muted/50",
                      question.correct_index === i && "font-semibold bg-success/10 text-success",
                    )}
                  >
                    {String.fromCharCode(65 + i)}. {choice || <span className="text-muted-foreground">비어있음</span>}
                  </div>
                ))}
                {question.choices.length > 2 && (
                  <div className="text-xs text-muted-foreground px-2">+{question.choices.length - 2}개 더</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {question.explanation && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>해설</span>
                  </div>
                )}
                {question.related_article?.url && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <LinkIcon className="h-3 w-3" />
                    <span>기사</span>
                  </div>
                )}
                {question.image && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    <span>이미지</span>
                  </div>
                )}
              </div>

              {status.status === "missing" && (
                <div className="mt-2 pt-2 border-t">
                  {status.issues.map((issue, i) => (
                    <div key={i} className="text-xs text-destructive flex items-start gap-1">
                      <span>•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {getFilteredQuestions().length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">필터와 일치하는 문제가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
