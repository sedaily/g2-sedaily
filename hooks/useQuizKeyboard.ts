/**
 * 퀴즈 키보드 네비게이션 훅
 * A, B, C, D 키로 객관식 답변 선택
 */

import { useEffect } from 'react'
import type { Question } from '@/lib/games-data'
import type { QuestionState } from './useQuizState'

type UseQuizKeyboardProps = {
  questions: Question[]
  questionStates: QuestionState[]
  answeredCount: number
  onMultipleChoiceAnswer: (questionIndex: number, option: string) => void
}

export function useQuizKeyboard({
  questions,
  questionStates,
  answeredCount,
  onMultipleChoiceAnswer,
}: UseQuizKeyboardProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 모든 문제가 답변된 경우 키보드 입력 무시
      if (answeredCount === questions.length) return

      const key = e.key.toUpperCase()
      if (!["A", "B", "C", "D"].includes(key)) return

      // 현재 답변하지 않은 첫 번째 문제 찾기
      const currentQuestionIndex = questionStates.findIndex((state) => !state.isAnswered)
      if (currentQuestionIndex === -1) return

      const question = questions[currentQuestionIndex]
      
      // 객관식이 아니거나 선택지가 없는 경우 무시
      if (question.questionType !== "객관식" || !question.options) return

      const optionIndex = key.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
      
      // 선택지 범위를 벗어나는 경우 무시
      if (optionIndex >= question.options.length) return

      // 답변 처리
      onMultipleChoiceAnswer(currentQuestionIndex, question.options[optionIndex])
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [questionStates, answeredCount, questions, onMultipleChoiceAnswer])
}