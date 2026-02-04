/**
 * 퀴즈 상태 관리 훅
 * UniversalQuizPlayer에서 상태 로직 분리
 */

import { useState, useEffect, useCallback } from 'react'
import type { Question } from '@/lib/games-data'

export type QuestionState = {
  selectedAnswer: string | null
  userAnswer: string
  isAnswered: boolean
  isCorrect: boolean
  showHint: boolean
}

type UseQuizStateProps = {
  questions: Question[]
  gameType: string
  date: string
  disableSaveProgress?: boolean
}

export function useQuizState({ 
  questions, 
  gameType, 
  date, 
  disableSaveProgress = false 
}: UseQuizStateProps) {
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([])
  const [score, setScore] = useState(0)

  // 초기 상태 설정
  useEffect(() => {
    if (questions.length > 0 && questionStates.length === 0) {
      const initialStates = questions.map(() => ({
        selectedAnswer: null,
        userAnswer: "",
        isAnswered: false,
        isCorrect: false,
        showHint: false,
      }))
      setQuestionStates(initialStates)
    }
  }, [questions, questionStates.length])

  // 진행 상황 저장
  const saveProgress = useCallback((states: QuestionState[], currentScore: number, complete: boolean) => {
    if (disableSaveProgress) return

    const savedKey = `quiz-progress-${gameType}-${date}`
    localStorage.setItem(
      savedKey,
      JSON.stringify({
        questionStates: states,
        score: currentScore,
        isComplete: complete,
        timestamp: Date.now(),
      }),
    )
  }, [disableSaveProgress, gameType, date])

  // 객관식 답변 처리
  const handleMultipleChoiceAnswer = useCallback((questionIndex: number, option: string) => {
    if (!questionStates[questionIndex]) return

    const currentState = questionStates[questionIndex]
    if (currentState.isAnswered) return

    const question = questions[questionIndex]
    const isCorrect = option === question.answer
    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...currentState,
      userAnswer: option,
      isAnswered: true,
      isCorrect,
    }
    setQuestionStates(newStates)

    const correctCount = newStates.filter((state) => state.isCorrect).length
    setScore(correctCount)

    if (!disableSaveProgress) {
      saveProgress(newStates, correctCount, false)
    }
  }, [questionStates, questions, disableSaveProgress, saveProgress])

  // 주관식 답변 제출
  const handleShortAnswerSubmit = useCallback((questionIndex: number) => {
    if (!questionStates[questionIndex]) return

    const currentState = questionStates[questionIndex]
    if (currentState.isAnswered || !currentState.userAnswer.trim()) return

    const question = questions[questionIndex]
    const userAnswerNormalized = currentState.userAnswer.trim().toLowerCase()
    const correctAnswerNormalized = question.answer.toLowerCase()
    const isCorrect = userAnswerNormalized === correctAnswerNormalized

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...currentState,
      isAnswered: true,
      isCorrect,
    }

    const newScore = isCorrect ? score + 1 : score
    setQuestionStates(newStates)
    setScore(newScore)
    saveProgress(
      newStates,
      newScore,
      newStates.every((state) => state.isAnswered),
    )
  }, [questionStates, questions, score, saveProgress])

  // 힌트 토글
  const handleToggleHint = useCallback((questionIndex: number) => {
    if (!questionStates[questionIndex]) return

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...questionStates[questionIndex],
      showHint: !questionStates[questionIndex].showHint,
    }
    setQuestionStates(newStates)
  }, [questionStates])

  // 입력값 변경
  const handleInputChange = useCallback((questionIndex: number, value: string) => {
    if (!questionStates[questionIndex]) return

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...questionStates[questionIndex],
      userAnswer: value,
    }
    setQuestionStates(newStates)
  }, [questionStates])

  // 퀴즈 재시작
  const handleRestart = useCallback(() => {
    const resetStates = questions.map(() => ({
      selectedAnswer: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: false,
      showHint: false,
    }))
    setQuestionStates(resetStates)
    setScore(0)
    
    // localStorage 진행 상태 삭제
    if (!disableSaveProgress) {
      const savedKey = `quiz-progress-${gameType}-${date}`
      localStorage.removeItem(savedKey)
    }
  }, [questions, disableSaveProgress, gameType, date])

  // 계산된 값들
  const answeredCount = questionStates.filter((state) => state.isAnswered).length
  const isComplete = answeredCount === questions.length
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  // 타임아웃 처리 (시간 초과 시 오답 처리)
  const handleTimeout = useCallback((questionIndex: number) => {
    if (!questionStates[questionIndex]) return

    const currentState = questionStates[questionIndex]
    if (currentState.isAnswered) return

    const newStates = [...questionStates]
    newStates[questionIndex] = {
      ...currentState,
      isAnswered: true,
      isCorrect: false,
      userAnswer: currentState.userAnswer || '', // 입력한 답이 있으면 유지
    }
    setQuestionStates(newStates)

    const correctCount = newStates.filter((state) => state.isCorrect).length
    setScore(correctCount)

    if (!disableSaveProgress) {
      saveProgress(newStates, correctCount, false)
    }
  }, [questionStates, disableSaveProgress, saveProgress])

  return {
    questionStates,
    score,
    answeredCount,
    isComplete,
    accuracy,
    handleMultipleChoiceAnswer,
    handleShortAnswerSubmit,
    handleToggleHint,
    handleInputChange,
    handleRestart,
    handleTimeout,
  }
}