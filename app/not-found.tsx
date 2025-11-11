import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-50 p-3">
            <FileQuestion className="h-8 w-8 text-[#3B82F6]" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold korean-heading">페이지를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground korean-text">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#3B82F6] hover:bg-[#306fef] korean-text">
            <Link href="/games">게임 둘러보기</Link>
          </Button>
          <Button asChild variant="outline" className="korean-text bg-transparent">
            <Link href="/">홈으로 가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
