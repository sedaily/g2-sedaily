"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] G2 Quiz error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-white flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-2xl font-bold">오류가 발생했습니다</h2>
        <p className="text-muted-foreground">퀴즈를 불러오는 중 문제가 발생했습니다.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button asChild variant="outline">
            <Link href="/games/g2">게임 홈</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
