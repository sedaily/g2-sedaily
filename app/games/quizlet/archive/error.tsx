'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-8">
            Quizlet 아카이브를 불러오는 중 문제가 발생했습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              돌아가기
            </Button>
            <Button onClick={reset}>
              다시 시도
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}