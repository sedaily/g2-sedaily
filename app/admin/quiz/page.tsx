"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PasswordModal } from "@/components/admin/PasswordModal"
import { QuizEditor } from "@/components/admin/QuizEditor"
import type { QuizQuestion } from "@/types/quiz"
import { validateQuestion, saveToLambda } from "@/lib/admin-utils"

export default function AdminQuizPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
      setShowPasswordDialog(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      initializeQuestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isAuthenticated])

  const initializeQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `${format(selectedDate, "yyyyMMdd")}-BS-${Date.now()}`,
      date: format(selectedDate, "yyyy-MM-dd"),
      theme: "BlackSwan",
      questionType: "객관식",
      question_text: "",
      choices: ["", ""],
      correct_index: null,
      creator: "",
      tags: "",
    }
    setQuestion(newQuestion)
    setValidationErrors([])
    setSaveStatus("idle")
  }

  const updateQuestion = (updates: Partial<QuizQuestion>) => {
    if (!question) return
    setQuestion({
      ...question,
      ...updates,
    })
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    if (!question) return

    const result = validateQuestion(question)
    if (result.status === "missing") {
      setValidationErrors(result.issues)
      setSaveStatus("error")
      return
    }

    setSaveStatus("saving")
    setValidationErrors([])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_QUIZ_SAVE_URL || ""

      const saveResult = await saveToLambda([question], format(selectedDate, "yyyy-MM-dd"), apiUrl)

      if (saveResult.success) {
        setSaveStatus("saved")
        setSaveMessage("문제가 성공적으로 추가되었습니다!")
        
        setTimeout(() => {
          setSaveStatus("idle")
          setSaveMessage("")
          // 저장 후 새 문제로 초기화 (같은 날짜, 같은 테마 유지)
          const currentTheme = question.theme
          initializeQuestion()
          // 테마 유지
          setQuestion((prev) => (prev ? { ...prev, theme: currentTheme } : null))
        }, 2000)
      } else {
        throw new Error(saveResult.error || "저장 실패")
      }
    } catch (err) {
      console.error("[Admin] Error saving to Lambda:", err)
      setSaveStatus("error")
      const message = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다"
      setValidationErrors([message])
    }
  }

  if (!isAuthenticated) {
    return <PasswordModal isOpen={showPasswordDialog} onAuthenticated={() => setIsAuthenticated(true)} />
  }

  if (!question) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">퀴즈 관리</h1>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "yyyy-MM-dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "saved" && (
              <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in duration-300">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{saveMessage || "저장 완료!"}</span>
              </div>
            )}
            {saveStatus === "error" && <span className="text-sm text-destructive">저장 실패</span>}
            <Button onClick={handleSave} disabled={saveStatus === "saving"}>
              <Save className="mr-2 h-4 w-4" />
              {saveStatus === "saving" ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <QuizEditor question={question} validationErrors={validationErrors} onUpdate={updateQuestion} />
      </div>
    </div>
  )
}
