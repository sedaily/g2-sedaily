import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#3B82F6]" aria-hidden="true" />
          <p className="text-lg text-muted-foreground korean-text">로딩 중...</p>
        </div>
      </div>
    </div>
  )
}
