"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlackSwanLakeHeaderProps {
  onSettingsClick?: () => void
}

export function BlackSwanLakeHeader({ onSettingsClick }: BlackSwanLakeHeaderProps) {
  return (
    <div className="relative bg-linear-to-br from-[#0c4a6e] via-[#0891b2] to-[#2563eb] text-white py-12 px-6 rounded-2xl mb-8 overflow-hidden">
      {/* Ripple pattern background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ripple" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
              <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="1" opacity="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ripple)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Swan logo */}
        <div className="text-6xl mb-4">🦢</div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 korean-heading">블랙스완 퀴즈</h1>

        <p className="text-lg md:text-xl text-white/90 korean-text mb-2">
          나비효과처럼 퍼지는 경제 연쇄반응을 체험하세요
        </p>

        <p className="text-sm md:text-base text-white/75 korean-text">
          작은 선택이 만드는 큰 변화, 경제 인과관계를 이해하고 뉴스 습관을 키워보세요
        </p>
      </div>

      {/* Settings button */}
      {onSettingsClick && (
        <Button
          onClick={onSettingsClick}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          aria-label="설정"
        >
          <Settings size={24} />
        </Button>
      )}
    </div>
  )
}
