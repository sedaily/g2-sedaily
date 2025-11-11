"use client"

import { AIChatbot } from "@/components/games/AIChatbot"

export default function TestChatbotPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">AI 챗봇 테스트</h1>
      
      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">BlackSwan 테마</h2>
          <AIChatbot
            gameType="BlackSwan"
            questionIndex={0}
            questionText="테스트 질문입니다"
            isAnswered={true}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">PrisonersDilemma 테마</h2>
          <AIChatbot
            gameType="PrisonersDilemma"
            questionIndex={0}
            questionText="테스트 질문입니다"
            isAnswered={true}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">SignalDecoding 테마</h2>
          <AIChatbot
            gameType="SignalDecoding"
            questionIndex={0}
            questionText="테스트 질문입니다"
            isAnswered={true}
          />
        </div>
      </div>
    </div>
  )
}