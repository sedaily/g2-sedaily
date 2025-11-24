import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import Image from "next/image"
import Link from "next/link"

interface ArchiveCardProps {
  gameType: "g1" | "g2" | "g3" | "quizlet"
  date: string // YYYY-MM-DD format
  questionCount: number
  isToday: boolean
  href: string
  tags?: string[] // 태그 배열 추가
  setName?: string // Quizlet용 세트 이름
}

const GAME_CONFIG = {
  g1: {
    image: "/images/g1-woodcut.webp",
    cardBg: "#3B82F6", // 블랙스완: 더 짙은 파랑으로 톤 정리
    listBg: "bg-[rgba(15,23,42,0.45)]", // 어두운 네이비 배경 (투명도 45%)
    textColor: "text-white", // 글자 흰색
    textSecondary: "text-white/80", // 보조 텍스트 회색 톤 흰색
    badgeText: "!text-white", // 뱃지 글자도 흰색
    badgeBg: "!bg-white/10", // 뱃지 배경: 투명 흰
    badgeBorder: "!border-white/30", // 뱃지 보더도 흰 계열
    focusColor: "#3B82F6",
    borderOpacity: "border-black/15",
    shadow: "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)]",
  },
  g2: {
    image: "/images/g2-woodcut.webp",
    cardBg: "#E7D9C3", // 죄수의 딜레마: 베이지
    listBg: "bg-[rgba(245,215,198,0.55)]", // 따뜻한 피치 베이스, 카드 대비 확보
    textColor: "text-gray-900",
    textSecondary: "text-gray-700",
    badgeText: "!text-gray-900",
    badgeBg: "!bg-gray-900/10",
    badgeBorder: "!border-gray-900/30",
    focusColor: "#8B5E3C",
    borderOpacity: "border-black/10",
    shadow: "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)]",
  },
  g3: {
    image: "/images/g3-woodcut.webp",
    cardBg: "#E56F5E", // 시그널 디코딩: 코랄
    listBg: "bg-[rgba(229,111,94,0.25)]", // 코랄 톤 다운, 부드럽고 따뜻한 느낌
    textColor: "text-gray-900",
    textSecondary: "text-gray-700",
    badgeText: "!text-gray-900",
    badgeBg: "!bg-gray-900/10",
    badgeBorder: "!border-gray-900/30",
    focusColor: "#22D3EE",
    borderOpacity: "border-black/10",
    shadow: "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)]",
  },
  quizlet: {
    image: "/images/g4-cards.webp",
    cardBg: "#8B5CF6",
    listBg: "bg-[rgba(139,92,246,0.15)]",
    textColor: "text-gray-900",
    textSecondary: "text-gray-700",
    badgeText: "!text-gray-900",
    badgeBg: "!bg-purple-100",
    badgeBorder: "!border-purple-300",
    focusColor: "#8B5CF6",
    borderOpacity: "border-purple-200",
    shadow: "shadow-[0_8px_24px_rgba(139,92,246,0.12)]",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(139,92,246,0.16)]",
  },
}

export function ArchiveCard({ gameType, date, questionCount, isToday, href, tags = [], setName }: ArchiveCardProps) {
  const config = GAME_CONFIG[gameType]

  const dateObj = new Date(date + "T00:00:00")
  const dayOfWeek = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Seoul",
  })
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  })

  // props로 받은 태그 사용
  const displayTags = tags.slice(0, 3)
  const remainingCount = Math.max(0, tags.length - 3)
  const hasTags = displayTags.length > 0

  return (
    <Link
      href={href}
      className={`group block rounded-2xl border ${config.borderOpacity} ${config.listBg} backdrop-blur-[2px] ${config.shadow} ${config.hoverShadow} hover:-translate-y-0.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{ outlineColor: config.focusColor }}
    >
      <div className="flex items-center gap-4 md:gap-5 p-6 md:p-7 min-h-[140px] md:min-h-40">
        <div
          className="shrink-0 relative w-20 h-[120px] md:w-[100px] md:h-[150px] rounded-[14px] overflow-hidden border border-black/25 shadow-sm woodcut-texture"
          style={{ backgroundColor: config.cardBg }}
        >
          <Image
            src={config.image || "/placeholder.svg"}
            alt={`${gameType} woodcut thumbnail`}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 80px, 100px"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          {isToday ? (
            <Badge
              className={`mb-2 md:mb-3 text-[11px] md:text-[12px] px-2.5 py-1 rounded-full ${config.badgeText} ${config.badgeBg} ${config.badgeBorder} font-sans`}
            >
              오늘의 퀴즈
            </Badge>
          ) : (
            <Badge
              className={`mb-2 md:mb-3 text-[11px] md:text-[12px] px-2.5 py-1 rounded-full border ${config.badgeText} ${config.badgeBg} ${config.badgeBorder} font-sans`}
            >
              {questionCount}문제
            </Badge>
          )}

          <h3
            className={`text-[18px] md:text-[21px] font-title font-semibold ${config.textColor} mb-1 md:mb-2 leading-[1.35] tracking-[-0.01em]`}
          >
            {gameType === 'quizlet' && setName ? setName : `${dayOfWeek}, ${formattedDate}`}
          </h3>

          <p className={`text-[12px] md:text-[13px] ${config.textSecondary} font-sans tracking-wide mb-2`}>
            BY SEOUL ECONOMIC DAILY
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {hasTags ? (
              <>
                {displayTags.map((tag, index) => (
                  <Tag key={index} variant={gameType}>
                    {tag}
                  </Tag>
                ))}
                {remainingCount > 0 && <Tag variant={gameType}>+{remainingCount}</Tag>}
              </>
            ) : (
              <Tag variant="other">기타</Tag>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
