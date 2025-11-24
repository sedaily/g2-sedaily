"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMostRecentDate } from "@/lib/games-data"

export default function G3PlayPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectToLatest() {
      const latestDate = await getMostRecentDate("SignalDecoding")
      if (latestDate) {
        const formattedDate = latestDate.replace(/-/g, "")
        router.replace(`/games/g3/${formattedDate}`)
      } else {
        router.replace("/games/g3/archive")
      }
    }
    redirectToLatest()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">최신 퀴즈로 이동 중...</p>
      </div>
    </div>
  )
}
