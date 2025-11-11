"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ArchiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Archive error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold korean-heading">아카이브를 불러올 수 없습니다</h1>
          <p className="text-muted-foreground korean-text">과거 퀴즈 기록을 불러오는 중 문제가 발생했습니다.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-[#3B82F6] hover:bg-[#306fef] korean-text">
            다시 시도
          </Button>
          <Button asChild variant="outline" className="korean-text bg-transparent">
            <Link href="/games/g1">오늘의 퀴즈로</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
