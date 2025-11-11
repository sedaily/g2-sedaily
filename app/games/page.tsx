import type { Metadata } from "next"
import { GameHubGrid } from "@/components/games/GameHubGrid"
import Image from "next/image"

export const metadata: Metadata = {
  title: "게임 허브 | 서울경제 게임",
  description: "모든 퍼즐을 무료로 플레이하세요. 오늘의 경제 퀴즈, 뉴스 성향 테스트, 뉴스 단어 맞추기",
  openGraph: {
    title: "게임 허브 | 서울경제 게임",
    description: "모든 퍼즐을 무료로 플레이하세요",
  },
}

export default function GamesPage() {
  return (
    <section className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1240px] py-10 md:py-14">
      <div className="grid grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center mb-16 md:mb-20 lg:mb-24">
        {/* Left: Illustration */}
        <div className="col-span-12 md:col-span-6 flex justify-center md:justify-start">
          <div className="relative w-full max-w-[400px] md:max-w-[480px] lg:max-w-[560px] aspect-square">
            <span className="absolute inset-2 -z-10 rounded-lg bg-[rgba(250,248,240,0.36)] blur-[1px]" />
            <div className="relative w-full h-full rounded-xl overflow-hidden p-2">
              <Image
                src="/games/hero-main.png"
                alt="Seoul Economic News Games - Three interlocking gears representing Black Swan, Prisoner's Dilemma, and Signal Decoding"
                fill
                className="object-contain mx-auto opacity-95 brightness-95 contrast-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right: Text */}
        <div className="col-span-12 md:col-span-6 md:pl-4 lg:pl-8 lg:max-w-[600px] mx-auto md:mx-0">
          <h1
            className="text-3xl lg:text-4xl leading-tight tracking-[-0.01em] font-title uppercase mb-4 md:mb-5 text-center md:text-left"
            style={{ color: "#132333" }}
          >
            Seoul Economic News Games
          </h1>
          <p
            className="mt-4 text-[15px] leading-relaxed font-sans text-center md:text-left opacity-90"
            style={{ color: "#2A3A45" }}
          >
            <span className="font-bold">하루 5분</span>, 기사로 문해력과 판단력을 단련하고
            <br />
            지성을 다듬는 실전형 뉴스 퀴즈.
          </p>
        </div>
      </div>

      {/* Games grid - unchanged */}
      <GameHubGrid />
    </section>
  )
}
