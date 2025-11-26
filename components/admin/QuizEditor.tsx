"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle, Trash2 } from "lucide-react"
import type { QuizQuestion, QuestionType } from "@/types/quiz"

type QuizEditorProps = {
  question: QuizQuestion
  validationErrors: string[]
  onUpdate: (updates: Partial<QuizQuestion>) => void
}

export function QuizEditor({ question, validationErrors, onUpdate }: QuizEditorProps) {
  const addChoice = () => {
    if (question.choices.length < 6) {
      onUpdate({ choices: [...question.choices, ""] })
    }
  }

  const removeChoice = (index: number) => {
    if (question.choices.length > 2) {
      const newChoices = question.choices.filter((_, i) => i !== index)
      onUpdate({
        choices: newChoices,
        correct_index: question.correct_index === index ? null : question.correct_index,
      })
    }
  }

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...question.choices]
    newChoices[index] = value
    onUpdate({ choices: newChoices })
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">문제 편집</h2>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive mb-1">저장할 수 없습니다</p>
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>게임 테마 *</Label>
          <Select
            value={question.theme || "SignalDecoding"}
            onValueChange={(value) => onUpdate({ theme: value as "BlackSwan" | "SignalDecoding" | "PrisonersDilemma" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BlackSwan">블랙스완 (Black Swan)</SelectItem>
              <SelectItem value="PrisonersDilemma">죄수의 딜레마 (Prisoner&apos;s Dilemma)</SelectItem>
              <SelectItem value="SignalDecoding">시그널 디코딩 (Signal Decoding)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>문제 유형 *</Label>
          <Select
            value={question.questionType}
            onValueChange={(value: QuestionType) => onUpdate({ questionType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="객관식">객관식</SelectItem>
              <SelectItem value="주관식">주관식</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">질문 내용 *</Label>
          <Textarea
            id="question"
            value={question.question_text}
            onChange={(e) => onUpdate({ question_text: e.target.value })}
            placeholder="질문을 입력하세요"
            rows={4}
          />
        </div>

        {question.questionType === "객관식" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>선택지 * (2~6개)</Label>
              <Button size="sm" variant="outline" onClick={addChoice} disabled={question.choices.length >= 6}>
                <Plus className="h-4 w-4 mr-1" />
                선택지 추가
              </Button>
            </div>
            <div className="space-y-2">
              {question.choices.map((choice, index) => (
                <div key={index} className="flex gap-2">
                  <Button
                    size="sm"
                    variant={question.correct_index === index ? "default" : "outline"}
                    onClick={() => onUpdate({ correct_index: index })}
                    className="shrink-0"
                  >
                    {String.fromCharCode(65 + index)}
                  </Button>
                  <Input
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    placeholder={`선택지 ${index + 1}`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeChoice(index)}
                    disabled={question.choices.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">정답 선택지를 클릭하여 정답을 지정하세요</p>
          </div>
        )}

        {question.questionType === "주관식" && (
          <div className="space-y-2">
            <Label htmlFor="answer">정답 *</Label>
            <Input
              id="answer"
              value={question.choices[0] || ""}
              onChange={(e) => {
                onUpdate({
                  choices: [e.target.value],
                  correct_index: null,
                })
              }}
              placeholder="정답을 입력하세요"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="explanation">해설</Label>
          <Textarea
            id="explanation"
            value={question.explanation || ""}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="정답 해설을 입력하세요"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>관련 기사</Label>
          <Input
            value={question.related_article?.title || ""}
            onChange={(e) =>
              onUpdate({
                related_article: {
                  ...question.related_article,
                  title: e.target.value,
                  snippet: question.related_article?.snippet || "",
                  url: question.related_article?.url || "",
                },
              })
            }
            placeholder="기사 제목"
            className="mb-2"
          />
          <Textarea
            value={question.related_article?.snippet || ""}
            onChange={(e) =>
              onUpdate({
                related_article: {
                  ...question.related_article,
                  title: question.related_article?.title || "",
                  snippet: e.target.value,
                  url: question.related_article?.url || "",
                },
              })
            }
            placeholder="기사 발췌문 (excerpt)"
            rows={3}
            className="mb-2"
          />
          <Input
            value={question.related_article?.url || ""}
            onChange={(e) =>
              onUpdate({
                related_article: {
                  ...question.related_article,
                  title: question.related_article?.title || "",
                  snippet: question.related_article?.snippet || "",
                  url: e.target.value,
                },
              })
            }
            placeholder="기사 URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">태그</Label>
          <Input
            id="tags"
            value={question.tags || ""}
            onChange={(e) => onUpdate({ tags: e.target.value })}
            placeholder="태그 (예: 증권, 부동산)"
          />
        </div>
      </div>
    </div>
  )
}