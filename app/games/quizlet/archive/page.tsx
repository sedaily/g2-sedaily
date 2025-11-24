"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, BookOpen } from "lucide-react"
import { getQuizletSets } from "@/lib/quiz-api-client"
import { ArchiveCard } from "@/components/games/ArchiveCard"

interface QuizletSet {
  id: string
  name: string
  termCount: number
  createdAt: string
  updatedAt: string
}

export default function QuizletArchivePage() {
  const router = useRouter()
  const [quizletSets, setQuizletSets] = useState<QuizletSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    async function loadQuizletSets() {
      try {
        const sets = await getQuizletSets()
        setQuizletSets(sets)
      } catch (error) {
        console.error("Failed to load Quizlet sets:", error)
      } finally {
        setLoading(false)
      }
    }
    loadQuizletSets()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">ARCHIVE</h1>
            </div>
            <p className="text-purple-600 font-medium">경제 용어 단어장</p>
          </div>

          {/* Archive List */}
          <div className="space-y-4">
            {quizletSets.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-4">저장된 단어장이 없습니다.</p>
                <Button onClick={() => router.push('/admin/quiz')} className="bg-purple-600 hover:bg-purple-700">
                  단어장 만들기
                </Button>
              </Card>
            ) : (
              quizletSets.map((set) => {
                const createdDate = new Date(set.createdAt)
                const formattedDate = createdDate.toISOString().split('T')[0] // YYYY-MM-DD format

                return (
                  <ArchiveCard
                    key={set.id}
                    gameType="quizlet"
                    date={formattedDate}
                    questionCount={set.termCount}
                    isToday={false}
                    href={`/games/quizlet?set=${set.id}`}
                    setName={set.name}
                    tags={[]}
                  />
                )
              })
            )}
          </div>

          {/* Back to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all z-50"
              aria-label="맨 위로 가기"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/games/quizlet')} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              단어장 게임 하러가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}