"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { GameMeta } from "@/lib/games-data"
import { getMostRecentDate } from "@/lib/games-data"

interface GameCardProps {
  game: GameMeta
}

export function GameCard({ game }: GameCardProps) {
  const [playHref, setPlayHref] = useState(`${game.slug}/play`)

  useEffect(() => {
    async function loadLatestDate() {
      try {
        const latestDate = await getMostRecentDate(game.gameType)
        if (latestDate) {
          const shortDate = latestDate.replace(/-/g, '')
          setPlayHref(`${game.slug}/play?date=${shortDate}`)
        }
      } catch (err) {
        console.error("Error loading latest date:", err)
      }
    }
    loadLatestDate()
  }, [game.slug, game.gameType])

  return (
    <article
      className="game-card mx-auto max-w-[460px] w-full flex flex-col rounded-2xl border border-gray-200 p-6 md:p-8 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl relative bg-white overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5" style={{ backgroundColor: game.solidBgColor }}></div>

      <div className="aspect-[4/3] flex items-center justify-center mb-6 relative">
        <Image
          src={game.image || "/placeholder.svg"}
          alt={`${game.title} illustration`}
          width={400}
          height={300}
          className="object-contain w-full h-full p-4 md:p-6 relative z-10"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 relative z-10">
        <h3
          className="text-2xl md:text-3xl font-bold text-center tracking-tight leading-tight mb-2"
          style={{ color: game.solidBgColor }}
        >
          {game.title}
        </h3>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            asChild
            className="w-full rounded-lg text-white py-3 font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: game.solidBgColor }}
            aria-label={`Play ${game.title}`}
          >
            <Link href={playHref}>Play</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-lg py-3 font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: game.solidBgColor, color: game.solidBgColor }}
            aria-label={`View ${game.title} archive`}
          >
            <Link href={`${game.slug}/archive`}>Archive</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
