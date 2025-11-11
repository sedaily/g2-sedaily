"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Target, Zap } from "lucide-react"

interface QuizIntroScreenProps {
  totalQuestions: number
  onStart: () => void
}

export function QuizIntroScreen({ totalQuestions, onStart }: QuizIntroScreenProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-linear-to-br from-[#e0f2fe] to-white border-2 border-[#0891b2]/30">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌊</div>
          <p className="text-[#0891b2] korean-text text-lg">경제 연쇄반응의 세계로 떠나볼 준비가 되셨나요?</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 flex items-center justify-center shrink-0">
              <Target className="text-[#0891b2]" size={20} />
            </div>
            <div>
              <h3 className="font-semibold korean-text text-[#0c4a6e] mb-1">총 {totalQuestions}개 문제</h3>
              <p className="text-sm text-gray-600 korean-text">각 문제는 실제 경제 뉴스를 기반으로 합니다</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center shrink-0">
              <Zap className="text-[#2563eb]" size={20} />
            </div>
            <div>
              <h3 className="font-semibold korean-text text-[#0c4a6e] mb-1">연쇄 반응 학습</h3>
              <p className="text-sm text-gray-600 korean-text">
                하나의 경제 이벤트가 어떻게 다른 영역에 영향을 미치는지 배웁니다
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#0c4a6e]/10 flex items-center justify-center shrink-0">
              <Clock className="text-[#0c4a6e]" size={20} />
            </div>
            <div>
              <h3 className="font-semibold korean-text text-[#0c4a6e] mb-1">자유로운 속도</h3>
              <p className="text-sm text-gray-600 korean-text">시간 제한 없이 편안하게 풀어보세요</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onStart}
          className="w-full py-6 text-lg font-semibold korean-text bg-linear-to-r from-[#0891b2] to-[#2563eb] hover:opacity-90 transition-opacity"
          aria-label="퀴즈 시작하기"
        >
          퀴즈 시작하기 🦢
        </Button>
      </Card>
    </div>
  )
}
