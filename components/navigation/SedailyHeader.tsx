"use client"

import Link from "next/link"
import Image from "next/image"
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
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:rounded"
            aria-label="서울경제 홈으로 이동 (새 창)"
          >
            {/* 데스크톱: 로고 이미지 */}
            <div className="hidden sm:block relative h-8 w-24">
              <Image
                src="/images/sedaily_logo.webp"
                alt="서울경제"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* 모바일: 텍스트 로고 */}
            <span className="sm:hidden text-[#111111] font-bold text-lg">
              서울경제
            </span>
            <ExternalLink className="w-4 h-4 text-[#666666]" aria-hidden="true" />
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

        <div className="flex items-center">
          <Link
            href="/admin/quiz"
            className="text-sm text-[#111111] hover:text-[#3B82F6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:rounded px-3 py-1 border border-neutral-300 rounded-md hover:border-[#3B82F6]"
            aria-label="관리자 로그인"
          >
            관리자
          </Link>
        </div>
      </div>
    </header>
  )
}
