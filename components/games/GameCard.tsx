"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { GameMeta } from "@/lib/games-data"

interface GameCardProps {
  game: GameMeta
}

export function GameCard({ game }: GameCardProps) {
  const playHref = game.playUrl || `${game.slug}/2024-01-15`

  return (
    <article
      className="game-card mx-auto max-w-[460px] w-full flex flex-col rounded-2xl border-2 border-black p-6 md:p-8 transition-all duration-200 hover:translate-y-[-4px] hover:rotate-[-1.5deg] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] relative"
      style={{ backgroundColor: game.solidBgColor }}
    >
      <div className="pointer-events-none absolute inset-2 rounded-2xl border border-black/70"></div>

      {game.isNew && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 md:-top-3.5 rounded-full border border-black bg-white px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-semibold shadow-[2px_2px_0_#000] z-10 tracking-wide">
          NEW
        </span>
      )}

      <div className="aspect-[4/3] flex items-center justify-center mb-4">
        <Image
          src={game.image || "/placeholder.svg"}
          alt={`${game.title} illustration`}
          width={400}
          height={300}
          className="object-contain w-full h-full p-10 md:p-12"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        <h3
          className="text-2xl md:text-3xl font-title text-center tracking-[-0.01em] leading-tight mb-2 md:mb-3"
          style={{ color: "#0D2239" }}
        >
          {game.title}
        </h3>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            asChild
            className="w-full rounded-lg bg-black text-white py-3 font-semibold shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:bg-gray-900 transition-all"
            aria-label={`Play ${game.title}`}
          >
            <Link href={playHref}>Play</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-lg border-2 border-black bg-transparent py-3 font-medium hover:bg-black/5 transition-colors"
            aria-label={`View ${game.title} archive`}
          >
            <Link href={`${game.slug}/archive`}>Archive</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
