"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PasswordModal } from "@/components/admin/PasswordModal"
import { Badge } from "@/components/ui/badge"
import { QuizEditor } from "@/components/admin/QuizEditor"
import { CacheManager } from "@/components/admin/CacheManager"
import { QuizPreview } from "@/components/admin/QuizPreview"
import { QuizletUploader } from "@/components/admin/QuizletUploader"
import { QuizList } from "@/components/admin/QuizList"

import type { QuizQuestion } from "@/types/quiz"
import { validateQuestion, saveToLambda } from "@/lib/admin-utils"

export default function AdminQuizPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [saveMessage, setSaveMessage] = useState("")
  const [quizletSaveStatus, setQuizletSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [quizletValidationErrors, setQuizletValidationErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"quiz" | "quizlet" | "manage" | "cache">("quiz")
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
      setShowPasswordDialog(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isEditMode) {
      initializeQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isAuthenticated, isEditMode])

  const initializeQuestions = () => {
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
    setQuestions([newQuestion])
    setCurrentQuestionIndex(0)
    setValidationErrors([])
    setSaveStatus("idle")
  }

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `${format(selectedDate, "yyyyMMdd")}-${questions[0]?.theme || "BS"}-${Date.now()}`,
      date: format(selectedDate, "yyyy-MM-dd"),
      theme: questions[0]?.theme || "BlackSwan",
      questionType: "객관식",
      question_text: "",
      choices: ["", ""],
      correct_index: null,
      creator: "",
      tags: "",
    }
    setQuestions([...questions, newQuestion])
    setCurrentQuestionIndex(questions.length)
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(Math.min(currentQuestionIndex, newQuestions.length - 1))
  }

  const updateQuestion = (updates: Partial<QuizQuestion>) => {
    const newQuestions = [...questions]
    newQuestions[currentQuestionIndex] = {
      ...newQuestions[currentQuestionIndex],
      ...updates,
    }
    setQuestions(newQuestions)
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    const allErrors: string[] = []
    for (let i = 0; i < questions.length; i++) {
      const result = validateQuestion(questions[i])
      if (result.status === "missing") {
        allErrors.push(`문제 ${i + 1}: ${result.issues.join(", ")}`)
      }
    }

    if (allErrors.length > 0) {
      setValidationErrors(allErrors)
      setSaveStatus("error")
      return
    }

    setSaveStatus("saving")
    setValidationErrors([])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_QUIZ_SAVE_URL || ""

      const saveResult = await saveToLambda(questions, format(selectedDate, "yyyy-MM-dd"), apiUrl)

      if (saveResult.success) {
        setSaveStatus("saved")
        setSaveMessage(`${questions.length}개 문제가 성공적으로 저장되었습니다!`)
        
        try {
          const { saveToArchive } = await import('../../../lib/quiz-api-client')
          await saveToArchive(
            questions[0].theme as 'BlackSwan' | 'PrisonersDilemma' | 'SignalDecoding',
            format(selectedDate, "yyyy-MM-dd"),
            questions
          )
          console.log('[Admin] Quiz saved to archive successfully')
        } catch (archiveError) {
          console.warn('[Admin] Failed to save to archive:', archiveError)
        }
        
        setTimeout(() => {
          setSaveStatus("idle")
          setSaveMessage("")
          setIsEditMode(false)
          const currentTheme = questions[0].theme
          initializeQuestions()
          setQuestions((prev) => [{ ...prev[0], theme: currentTheme }])
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

  // Quizlet 저장 처리
  const handleQuizletSave = async (terms: any[], setName: string) => {
    setQuizletSaveStatus("saving")
    setQuizletValidationErrors([])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_QUIZ_SAVE_URL || ""
      
      // Quizlet 데이터를 Lambda 형식으로 변환
      const quizletData = {
        gameType: "Quizlet",
        quizDate: format(selectedDate, "yyyy-MM-dd"),
        data: {
          setName,
          terms,
          createdAt: new Date().toISOString()
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizletData),
      })

      if (!response.ok) {
        throw new Error(`저장 실패: ${response.status}`)
      }

      setQuizletSaveStatus("saved")
      
      // Archive에 자동 저장 및 캐시 무효화
      if (typeof window !== 'undefined') {
        import('../../../lib/quiz-api-client').then(async ({ clearQuizDataCache, clearDateCache, saveQuizletToArchive }) => {
          // Archive에 저장
          try {
            await saveQuizletToArchive(
              `quizlet-${Date.now()}`,
              setName,
              terms.length
            )
            console.log('[Admin] Quizlet saved to archive successfully')
          } catch (archiveError) {
            console.warn('[Admin] Failed to save Quizlet to archive:', archiveError)
          }
          
          // 캐시 무효화
          clearQuizDataCache()
          clearDateCache("Quizlet", format(selectedDate, "yyyy-MM-dd"))
          console.log('[Admin] Quizlet cache cleared after save')
        })
      }
      
      setTimeout(() => {
        setQuizletSaveStatus("idle")
      }, 2000)
      
    } catch (err) {
      console.error("[Admin] Error saving Quizlet:", err)
      setQuizletSaveStatus("error")
      const message = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다"
      setQuizletValidationErrors([message])
    }
  }

  if (!isAuthenticated) {
    return <PasswordModal isOpen={showPasswordDialog} onAuthenticated={() => setIsAuthenticated(true)} />
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">관리자 패널</h1>
            {activeTab === "quiz" && (
              <>
                <span className="text-sm text-muted-foreground">
                  문제 {currentQuestionIndex + 1} / {questions.length}
                </span>
                {isEditMode && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    수정 모드
                  </Badge>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button 
                variant={activeTab === "quiz" ? "default" : "outline"}
                onClick={() => setActiveTab("quiz")}
                size="sm"
              >
                퀴즈 관리
              </Button>
              <Button 
                variant={activeTab === "quizlet" ? "default" : "outline"}
                onClick={() => setActiveTab("quizlet")}
                size="sm"
              >
                Quizlet 관리
              </Button>
              <Button 
                variant={activeTab === "manage" ? "default" : "outline"}
                onClick={() => setActiveTab("manage")}
                size="sm"
              >
                퀴즈 수정
              </Button>
              <Button 
                variant={activeTab === "cache" ? "default" : "outline"}
                onClick={() => setActiveTab("cache")}
                size="sm"
              >
                캐시 관리
              </Button>
            </div>
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
            {activeTab === "quiz" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  다음
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewQuestion}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  문제 추가
                </Button>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditMode(false)
                      initializeQuestions()
                    }}
                  >
                    새 문제 작성
                  </Button>
                )}
                {questions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(currentQuestionIndex)}
                  >
                    삭제
                  </Button>
                )}
              </>
            )}
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

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "quiz" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <QuizEditor question={currentQuestion} validationErrors={validationErrors} onUpdate={updateQuestion} />
            </div>
            <div>
              <QuizPreview question={currentQuestion} />
            </div>
          </div>
        ) : activeTab === "quizlet" ? (
          <QuizletUploader 
            onSave={handleQuizletSave}
            saveStatus={quizletSaveStatus}
            validationErrors={quizletValidationErrors}
          />
        ) : activeTab === "manage" ? (
          <QuizList 
            onEdit={(loadedQuestions, date) => {
              setQuestions(loadedQuestions)
              setSelectedDate(new Date(date))
              setCurrentQuestionIndex(0)
              setIsEditMode(true)
              setActiveTab("quiz")
            }}
          />
        ) : (
          <CacheManager />
        )}
      </div>
    </div>
  )
}
