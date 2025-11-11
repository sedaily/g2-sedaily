"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp } from "lucide-react"
import { todayKST, getMonthNameKR } from "@/lib/date-utils"
import { getArchiveStructure, type ArchiveStructure } from "@/lib/games-data"
import { ArchiveCard } from "@/components/games/ArchiveCard"

export default function G2ArchiveClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [archiveData, setArchiveData] = useState<ArchiveStructure>({ years: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArchive() {
      const data = await getArchiveStructure("PrisonersDilemma")
      setArchiveData(data)
      setLoading(false)
    }
    loadArchive()
  }, [])

  const hasData = archiveData.years.length > 0
  const availableYears = archiveData.years.map((y) => y.year)
  
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const yearParam = searchParams.get("year")
    if (yearParam && yearParam !== "all") {
      const year = Number.parseInt(yearParam)
      if (availableYears.includes(year)) return year
    }
    return null
  })

  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => {
    const monthParam = searchParams.get("month")
    if (monthParam && monthParam !== "all") {
      const month = Number.parseInt(monthParam)
      return month
    }
    return null
  })

  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
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
    router.replace(`/games/g2/archive?${params.toString()}`, { scroll: false })
  }, [selectedYear, selectedMonth, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/g2-silhouettes-clean.png')",
        }}
      />
  <div className="absolute inset-0 bg-linear-to-b from-[#EFEAE2]/90 to-[#E7DFD3]/90" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 pb-6 border-b border-[#8B5E3C]/20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#44403C] mb-2">ARCHIVE</h1>
            <p className="text-[#78716C]">죄수의 딜레마</p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedYear?.toString() || "all"} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[140px] bg-white/50 border-[#8B5E3C]/20 backdrop-blur-sm">
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
                <SelectTrigger className="w-[140px] bg-white/50 border-[#8B5E3C]/20 backdrop-blur-sm">
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
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#44403C] hover:bg-white/50">
                  필터 해제 ✕
                </Button>
              )}
            </div>

            {(selectedYear || selectedMonth) && (
              <div className="flex items-center gap-2 text-sm text-[#78716C]">
                <span>선택된 필터:</span>
                {selectedYear && (
                  <Badge variant="secondary" className="bg-[#8B5E3C]/80 text-white">
                    {selectedYear}년
                  </Badge>
                )}
                {selectedMonth && (
                  <Badge variant="secondary" className="bg-[#8B5E3C]/80 text-white">
                    {getMonthNameKR(selectedMonth)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5 md:space-y-6 mt-6 md:mt-8">
            {allDates.length === 0 ? (
              <Card className="p-12 text-center bg-white/50 backdrop-blur-sm border-[#8B5E3C]/20">
                <p className="text-lg text-[#78716C] mb-4">선택한 필터에 해당하는 아카이브가 없습니다.</p>
                <Button onClick={clearFilters} className="bg-[#8B5E3C] hover:bg-[#78523C]">
                  필터 해제
                </Button>
              </Card>
            ) : (
              allDates.map(({ date }) => {
                const isToday = date === today

                const [y, m, d] = date.split("-")
                const shortDate = `${y.slice(2)}${m}${d}`

                return (
                  <ArchiveCard
                    key={date}
                    gameType="g2"
                    date={date}
                    questionCount={4}
                    isToday={isToday}
                    href={`/games/g2/${shortDate}`}
                  />
                )
              })
            )}
          </div>

          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-[#8B5E3C] hover:bg-[#78523C] text-white rounded-full shadow-lg transition-all z-50"
              aria-label="맨 위로 가기"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          )}

          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => router.back()} className="bg-[#8B5E3C] hover:bg-[#78523C]">
              오늘의 퀴즈 하러가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
