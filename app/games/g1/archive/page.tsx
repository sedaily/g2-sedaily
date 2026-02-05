"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp } from "lucide-react"
import { todayKST, getMonthNameKR } from "@/lib/date-utils"
import { getArchiveStructure, getQuestionsForDate, type ArchiveStructure } from "@/lib/games-data"
import { ArchiveCard } from "@/components/games/ArchiveCard"

export default function G1ArchivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [archiveData, setArchiveData] = useState<ArchiveStructure>({ years: [] })
  const [loading, setLoading] = useState(true)
  const [dateTags, setDateTags] = useState<Record<string, string[]>>({})
  const [dateQuestionCounts, setDateQuestionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadArchive() {
      try {
        const data = await getArchiveStructure("BlackSwan")
        setArchiveData(data)
        
        // 모든 날짜의 태그와 문제 개수를 한 번에 로드
        const tagsMap: Record<string, string[]> = {}
        const countsMap: Record<string, number> = {}
        for (const yearData of data.years) {
          for (const monthData of yearData.months) {
            for (const dateStr of monthData.dates) {
              const questions = await getQuestionsForDate("BlackSwan", dateStr)
              const uniqueTags = new Set<string>()
              questions.forEach(q => {
                if (q.tags) uniqueTags.add(q.tags)
              })
              tagsMap[dateStr] = Array.from(uniqueTags)
              countsMap[dateStr] = questions.length
            }
          }
        }
        setDateTags(tagsMap)
        setDateQuestionCounts(countsMap)
      } catch (error) {
        console.error("[v0] Failed to load archive:", error)
      } finally {
        setLoading(false)
      }
    }
    loadArchive()
  }, [])

  const hasData = archiveData.years.length > 0
  const availableYears = archiveData.years.map((y) => y.year)
  
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize from URL params once data is loaded
  useEffect(() => {
    if (!initialized && hasData) {
      const yearParam = searchParams.get("year")
      if (yearParam && yearParam !== "all") {
        const year = Number.parseInt(yearParam)
        const years = archiveData.years.map((y) => y.year)
        if (years.includes(year)) {
          setSelectedYear(year)
        }
      }
      
      const monthParam = searchParams.get("month")
      if (monthParam && monthParam !== "all") {
        setSelectedMonth(Number.parseInt(monthParam))
      }
      
      setInitialized(true)
    }
  }, [initialized, hasData, searchParams])

  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!initialized) return // Don't update URL until initialized
    
    const params = new URLSearchParams()
    if (selectedYear) {
      params.set("year", selectedYear.toString())
    } else {
      params.set("year", "all")
    }
    if (selectedMonth) {
      params.set("month", selectedMonth.toString())
    } else {
      params.set("month", "all")
    }
    const newUrl = `/games/g1/archive?${params.toString()}`
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (newUrl !== currentUrl) {
      window.history.replaceState({}, '', newUrl)
    }
  }, [selectedYear, selectedMonth, initialized])

  const allDates: Array<{ date: string; year: number; month: number }> = []
  for (const yearData of archiveData.years) {
    if (selectedYear && yearData.year !== selectedYear) continue
    for (const monthData of yearData.months) {
      if (selectedMonth && monthData.month !== selectedMonth) continue
      for (const dateStr of monthData.dates) {
        allDates.push({ date: dateStr, year: yearData.year, month: monthData.month })
      }
    }
  }

  const handleYearChange = (value: string) => {
    if (value === "all") {
      setSelectedYear(null)
    } else {
      setSelectedYear(Number.parseInt(value))
    }
  }

  const handleMonthChange = (value: string) => {
    if (value === "all") {
      setSelectedMonth(null)
    } else {
      setSelectedMonth(Number.parseInt(value))
    }
  }

  const clearFilters = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const today = todayKST()

  const availableMonths = selectedYear
    ? archiveData.years.find((y) => y.year === selectedYear)?.months.map((m) => m.month) || []
    : Array.from(new Set(archiveData.years.flatMap((y) => y.months.map((m) => m.month)))).sort((a, b) => b - a)

  // 로딩 중일 때 로딩 UI 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg text-muted-foreground">로딩 중...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // 로딩 완료 후 데이터가 없을 때만 표시
  if (!hasData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">아카이브 데이터가 없습니다.</p>
            <Button onClick={() => router.back()}>돌아가기</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/g1-swan-water.webp')",
        }}
      />
  <div className="absolute inset-0 bg-linear-to-b from-[#213B69]/85 via-[#1B3156]/85 to-[#182B49]/85" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-white/20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">ARCHIVE</h1>
            <p className="text-blue-100">블랙스완 퀴즈</p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedYear?.toString() || "all"} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="모든 연도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 연도</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth?.toString() || "all"} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="모든 월" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 월</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthNameKR(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedYear || selectedMonth) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  필터 해제 ✕
                </Button>
              )}
            </div>

            {/* Active filters display */}
            {(selectedYear || selectedMonth) && (
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <span>선택된 필터:</span>
                {selectedYear && (
                  <Badge variant="secondary" className="bg-blue-600/80 text-white">
                    {selectedYear}년
                  </Badge>
                )}
                {selectedMonth && (
                  <Badge variant="secondary" className="bg-blue-600/80 text-white">
                    {getMonthNameKR(selectedMonth)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Archive List */}
          <div className="space-y-5 md:space-y-6 mt-6 md:mt-8">
            {allDates.length === 0 ? (
              <Card className="p-12 text-center bg-white/10 backdrop-blur-sm border-white/20">
                <p className="text-lg text-white mb-4">선택한 필터에 해당하는 아카이브가 없습니다.</p>
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700">
                  필터 해제
                </Button>
              </Card>
            ) : (
              allDates.map(({ date }) => {
                const isToday = date === today
                const questionCount = dateQuestionCounts[date] || 2

                // Convert YYYY-MM-DD to YYYYMMDD for routing
                const shortDate = date.replace(/-/g, '')
                const fullUrl = `https://g2.sedaily.ai/games/g1/play/?date=${shortDate}`

                return (
                  <ArchiveCard
                    key={date}
                    gameType="g1"
                    date={date}
                    questionCount={questionCount}
                    isToday={isToday}
                    href={fullUrl}
                    tags={dateTags[date] || []}
                  />
                )
              })
            )}
          </div>

          {/* Back to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all z-50"
              aria-label="맨 위로 가기"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
              오늘의 퀴즈 하러가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
