"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ComingSoonProps {
  gameTitle: string
  gameIcon: string
}

export function ComingSoon({ gameTitle, gameIcon }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6">{gameIcon}</div>
        <h1 className="text-3xl font-bold korean-heading mb-4 text-foreground">{gameTitle}</h1>
        <p className="text-lg text-muted-foreground korean-text mb-8 leading-relaxed">
          곧 공개됩니다!
          <br />더 재미있는 게임으로 찾아뵙겠습니다.
        </p>
        <Button asChild className="btn-primary text-on-primary korean-text">
          <Link href="/games" aria-label="게임 허브로 돌아가기">
            게임 허브로 돌아가기
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
