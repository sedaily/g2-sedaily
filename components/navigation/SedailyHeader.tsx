"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

export function SedailyHeader() {
  return (
    <header role="banner" className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className="max-w-screen-xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="https://sedaily.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#111111] font-bold text-lg hover:text-[#3B82F6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:rounded flex items-center gap-1"
            aria-label="서울경제 홈으로 이동 (새 창)"
          >
            서울경제
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="https://sedaily.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#111111] hover:text-[#3B82F6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:rounded"
              aria-label="뉴스채널 페이지로 이동 (새 창)"
            >
              뉴스채널
            </Link>

            <Link
              href="/games"
              className="text-[#111111] hover:text-[#3B82F6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:rounded"
              aria-label="게임즈 페이지로 이동"
            >
              게임즈
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
