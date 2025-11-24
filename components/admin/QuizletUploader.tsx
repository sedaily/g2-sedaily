"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, AlertCircle, CheckCircle, Trash2 } from "lucide-react"

interface QuizletTerm {
  id: number
  term: string
  definition: string
  explanation?: string
}

interface QuizletUploaderProps {
  onSave: (terms: QuizletTerm[], setName: string) => Promise<void>
  saveStatus: "idle" | "saving" | "saved" | "error"
  validationErrors: string[]
}

export function QuizletUploader({ onSave, saveStatus, validationErrors }: QuizletUploaderProps) {
  const [terms, setTerms] = useState<QuizletTerm[]>([])
  const [setName, setSetName] = useState("")
  const [csvText, setCsvText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvText(text)
      parseCSV(text)
    }
    reader.readAsText(file, 'utf-8')
  }

  // CSV 텍스트 파싱
  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n')
      const parsedTerms: QuizletTerm[] = []

      lines.forEach((line, index) => {
        const [term, definition, explanation] = line.split(',').map(cell => 
          cell.trim().replace(/^["']|["']$/g, '') // 따옴표 제거
        )

        if (term && definition) {
          parsedTerms.push({
            id: index + 1,
            term,
            definition,
            explanation: explanation || undefined
          })
        }
      })

      setTerms(parsedTerms)
      
      // 파일명에서 세트명 추출 (확장자 제거)
      if (fileInputRef.current?.files?.[0]) {
        const fileName = fileInputRef.current.files[0].name
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
        setSetName(nameWithoutExt)
      }
    } catch (error) {
      console.error('CSV 파싱 오류:', error)
      setTerms([])
    }
  }

  // 수동 CSV 텍스트 입력 처리
  const handleTextChange = (text: string) => {
    setCsvText(text)
    if (text.trim()) {
      parseCSV(text)
    } else {
      setTerms([])
    }
  }

  // 개별 용어 수정
  const updateTerm = (id: number, field: keyof QuizletTerm, value: string) => {
    setTerms(prev => prev.map(term => 
      term.id === id ? { ...term, [field]: value } : term
    ))
  }

  // 용어 삭제
  const deleteTerm = (id: number) => {
    setTerms(prev => prev.filter(term => term.id !== id))
  }

  // 용어 추가
  const addTerm = () => {
    const newId = Math.max(...terms.map(t => t.id), 0) + 1
    setTerms(prev => [...prev, { id: newId, term: "", definition: "" }])
  }

  // 저장 처리
  const handleSave = async () => {
    if (!setName.trim()) {
      alert('세트명을 입력해주세요.')
      return
    }
    
    if (terms.length === 0) {
      alert('최소 1개 이상의 용어를 입력해주세요.')
      return
    }

    const validTerms = terms.filter(term => term.term.trim() && term.definition.trim())
    if (validTerms.length === 0) {
      alert('유효한 용어가 없습니다.')
      return
    }

    await onSave(validTerms, setName)
  }

  // 샘플 CSV 다운로드
  const downloadSample = () => {
    const sampleCSV = `GDP,국내총생산,한 나라의 경제 규모를 나타내는 지표
CPI,소비자물가지수,일반 소비자가 구입하는 상품과 서비스 가격 변동 측정
기준금리,중앙은행 정책금리,경제 전반의 금리 수준을 결정하는 기준
환율,외화 교환 비율,국가 간 무역과 투자에 영향을 미치는 비율
인플레이션,물가 상승 현상,화폐 가치 하락과 구매력 감소를 의미`

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'quizlet_sample.csv'
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Quizlet 용어 세트 업로드</h2>
          <p className="text-sm text-muted-foreground">
            CSV 파일을 업로드하거나 직접 입력하여 경제 용어 세트를 만들어보세요.
          </p>
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

        {/* 세트명 입력 */}
        <div className="mb-6">
          <Label htmlFor="setName">세트명 *</Label>
          <Input
            id="setName"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            placeholder="예: 2025년 1월 경제용어"
            className="mt-1"
          />
        </div>

        {/* CSV 업로드 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label>CSV 파일 업로드</Label>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-4 w-4 mr-2" />
              샘플 다운로드
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              파일 선택
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            형식: 용어,정의,설명(선택) - 각 줄마다 하나의 용어
          </p>
        </div>

        {/* 직접 입력 */}
        <div className="mb-6">
          <Label htmlFor="csvText">또는 직접 입력</Label>
          <Textarea
            id="csvText"
            value={csvText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="GDP,국내총생산,한 나라의 경제 규모를 나타내는 지표
CPI,소비자물가지수,일반 소비자가 구입하는 상품과 서비스 가격 변동 측정"
            rows={6}
            className="mt-1 font-mono text-sm"
          />
        </div>
      </Card>

      {/* 파싱된 용어 목록 */}
      {terms.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              용어 목록 ({terms.length}개)
            </h3>
            <Button variant="outline" size="sm" onClick={addTerm}>
              용어 추가
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {terms.map((term) => (
              <div key={term.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">용어</Label>
                      <Input
                        value={term.term}
                        onChange={(e) => updateTerm(term.id, 'term', e.target.value)}
                        placeholder="용어 입력"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">정의</Label>
                      <Input
                        value={term.definition}
                        onChange={(e) => updateTerm(term.id, 'definition', e.target.value)}
                        placeholder="정의 입력"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTerm(term.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {term.explanation && (
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">설명</Label>
                    <Input
                      value={term.explanation}
                      onChange={(e) => updateTerm(term.id, 'explanation', e.target.value)}
                      placeholder="설명 입력 (선택사항)"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">저장 완료!</span>
                </div>
              )}
              {saveStatus === "error" && (
                <span className="text-sm text-destructive">저장 실패</span>
              )}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saveStatus === "saving" || terms.length === 0}
            >
              {saveStatus === "saving" ? "저장 중..." : "저장"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}