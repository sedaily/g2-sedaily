"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global error:", error)
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
          <h1 className="text-2xl font-bold korean-heading">오류가 발생했습니다</h1>
          <p className="text-muted-foreground korean-text">페이지를 불러오는 중 문제가 발생했습니다.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-[#3B82F6] hover:bg-[#306fef] korean-text">
            다시 시도
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")} className="korean-text">
            홈으로 가기
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              개발자 정보
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
