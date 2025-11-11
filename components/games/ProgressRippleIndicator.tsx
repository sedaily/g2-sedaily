"use client"

import { motion } from "framer-motion"

interface ProgressRippleIndicatorProps {
  current: number
  total: number
  score: number
  progress: number
}

export function ProgressRippleIndicator({ current, total, score, progress }: ProgressRippleIndicatorProps) {
  return (
    <div className="sticky top-0 z-50 bg-linear-to-r from-[#0c4a6e] to-[#0891b2] text-white py-4 px-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold korean-text">
              문제 {current} / {total}
            </span>
            <span className="text-sm korean-text opacity-90">{Math.round(progress)}%</span>
          </div>
          <span className="text-sm font-semibold korean-text">점수: {score}</span>
        </div>

        <div className="h-2 bg-white/20 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-linear-to-r from-white to-[#e0f2fe] relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute right-0 top-0 h-full w-8 bg-white/50"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
