'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GameCard {
  id: string
  content: string
  type: 'term' | 'definition'
  pairId: number
  isMatched: boolean
  isSelected: boolean
}

interface CardPair {
  id: number
  term: string
  definition: string
  source?: string
}

const economicTerms: CardPair[] = [
  { id: 1, term: "GDP", definition: "국내총생산", source: "한국은행 경제용어" },
  { id: 2, term: "CPI", definition: "소비자물가지수", source: "통계청" },
  { id: 3, term: "기준금리", definition: "중앙은행이 정하는 정책금리", source: "한국은행" },
  { id: 4, term: "환율", definition: "외국 통화와의 교환 비율", source: "외환은행" },
  { id: 5, term: "인플레이션", definition: "물가가 지속적으로 상승하는 현상", source: "경제학 용어" },
  { id: 6, term: "디플레이션", definition: "물가가 지속적으로 하락하는 현상", source: "경제학 용어" },
  { id: 7, term: "경상수지", definition: "수출입 및 소득 수지의 합계", source: "한국은행" },
  { id: 8, term: "실업률", definition: "경제활동인구 중 실업자 비율", source: "통계청" }
]

type Difficulty = 'easy' | 'normal' | 'hard'

const difficultySettings = {
  easy: { pairs: 6, gridCols: 'grid-cols-3', name: '쉬움' },
  normal: { pairs: 8, gridCols: 'grid-cols-4', name: '보통' },
  hard: { pairs: 12, gridCols: 'grid-cols-4', name: '어려움' }
}

export default function CardMatchingGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [cards, setCards] = useState<GameCard[]>([])
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [showHint, setShowHint] = useState<number | null>(null)

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted, startTime])

  // 게임 초기화
  const initializeGame = useCallback(() => {
    const pairCount = difficultySettings[difficulty].pairs
    const selectedTerms = economicTerms.slice(0, pairCount)
    
    const gameCards: GameCard[] = []
    
    selectedTerms.forEach(pair => {
      gameCards.push({
        id: `term-${pair.id}`,
        content: pair.term,
        type: 'term',
        pairId: pair.id,
        isMatched: false,
        isSelected: false
      })
      gameCards.push({
        id: `def-${pair.id}`,
        content: pair.definition,
        type: 'definition',
        pairId: pair.id,
        isMatched: false,
        isSelected: false
      })
    })

    // 카드 섞기
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setSelectedCards([])
    setMatchedPairs(0)
    setGameStarted(false)
    setGameCompleted(false)
    setElapsedTime(0)
    setHintsRemaining(3)
    setShowHint(null)
  }, [difficulty])

  // 게임 시작
  const startGame = () => {
    setGameStarted(true)
    setStartTime(Date.now())
  }

  // 카드 클릭 처리
  const handleCardClick = (clickedCard: GameCard) => {
    if (isChecking || clickedCard.isMatched || clickedCard.isSelected) return
    
    if (!gameStarted) {
      startGame()
    }

    const newSelectedCards = [...selectedCards, clickedCard]
    setSelectedCards(newSelectedCards)

    // 카드 선택 상태 업데이트
    setCards(prev => prev.map(card => 
      card.id === clickedCard.id 
        ? { ...card, isSelected: true }
        : card
    ))

    // 두 번째 카드 선택 시 매칭 검증
    if (newSelectedCards.length === 2) {
      setIsChecking(true)
      
      setTimeout(() => {
        checkMatch(newSelectedCards)
      }, 500)
    }
  }

  // 매칭 검증
  const checkMatch = (selectedPair: GameCard[]) => {
    const [first, second] = selectedPair
    const isMatch = first.pairId === second.pairId

    if (isMatch) {
      // 정답 처리
      setCards(prev => prev.map(card => 
        card.pairId === first.pairId
          ? { ...card, isMatched: true, isSelected: false }
          : { ...card, isSelected: false }
      ))
      setMatchedPairs(prev => prev + 1)
      
      // 게임 완료 체크
      const totalPairs = difficultySettings[difficulty].pairs
      if (matchedPairs + 1 === totalPairs) {
        setGameCompleted(true)
        saveRecord()
      }
    } else {
      // 오답 처리
      setCards(prev => prev.map(card => ({
        ...card,
        isSelected: false
      })))
    }

    setSelectedCards([])
    setIsChecking(false)
  }

  // 힌트 사용
  const useHint = () => {
    if (hintsRemaining <= 0 || gameCompleted) return

    const unmatchedCards = cards.filter(card => !card.isMatched)
    if (unmatchedCards.length === 0) return

    // 첫 번째 매칭되지 않은 쌍 찾기
    const firstUnmatchedPair = unmatchedCards[0].pairId
    setShowHint(firstUnmatchedPair)
    setHintsRemaining(prev => prev - 1)

    setTimeout(() => {
      setShowHint(null)
    }, 2000)
  }

  // 기록 저장
  const saveRecord = () => {
    const finalTime = elapsedTime
    const key = `cardMatch_${difficulty}_bestTime`
    const currentBest = localStorage.getItem(key)
    
    if (!currentBest || finalTime < parseInt(currentBest)) {
      localStorage.setItem(key, finalTime.toString())
    }
  }

  // 최고 기록 가져오기
  const getBestTime = () => {
    const key = `cardMatch_${difficulty}_bestTime`
    const bestTime = localStorage.getItem(key)
    return bestTime ? parseInt(bestTime) : null
  }

  // 시간 포맷팅
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  // 초기화
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const bestTime = getBestTime()
  const totalPairs = difficultySettings[difficulty].pairs

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">경제 용어 매칭 게임</h1>
        <p className="text-gray-600">용어와 정의를 매칭하여 모든 쌍을 찾아보세요!</p>
      </div>

      {/* 난이도 선택 */}
      <div className="flex justify-center gap-2">
        {Object.entries(difficultySettings).map(([key, setting]) => (
          <Button
            key={key}
            variant={difficulty === key ? "default" : "outline"}
            onClick={() => setDifficulty(key as Difficulty)}
            disabled={gameStarted && !gameCompleted}
          >
            {setting.name} ({setting.pairs}쌍)
          </Button>
        ))}
      </div>

      {/* 게임 상태 */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-4">
          <Badge variant="secondary">
            시간: {formatTime(elapsedTime)}
          </Badge>
          <Badge variant="secondary">
            진행: {matchedPairs}/{totalPairs}
          </Badge>
          {bestTime && (
            <Badge variant="outline">
              최고기록: {formatTime(bestTime)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={useHint}
            disabled={hintsRemaining <= 0 || gameCompleted}
          >
            힌트 ({hintsRemaining})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
          >
            새 게임
          </Button>
        </div>
      </div>

      {/* 게임 보드 */}
      <div className={`grid ${difficultySettings[difficulty].gridCols} gap-3 max-w-3xl mx-auto`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`
              h-24 flex items-center justify-center text-center cursor-pointer
              transition-all duration-300 hover:shadow-md
              ${card.isMatched 
                ? 'bg-green-100 border-green-300 opacity-50 cursor-not-allowed' 
                : card.isSelected 
                  ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
                  : showHint === card.pairId
                    ? 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }
              ${card.type === 'term' ? 'font-semibold text-blue-900' : 'text-gray-700'}
            `}
            onClick={() => handleCardClick(card)}
          >
            <div className="p-2">
              <div className="text-sm font-medium">
                {card.content}
              </div>
              {card.type === 'term' && (
                <div className="text-xs text-blue-600 mt-1">용어</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* 게임 완료 */}
      {gameCompleted && (
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 게임 완료!</h2>
          <p className="text-green-700 mb-4">
            완료 시간: <span className="font-bold">{formatTime(elapsedTime)}</span>
          </p>
          {bestTime === elapsedTime && (
            <p className="text-green-600 font-semibold">🏆 새로운 최고 기록입니다!</p>
          )}
          <Button onClick={initializeGame} className="mt-4">
            다시 플레이
          </Button>
        </div>
      )}

      {/* 게임 설명 */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>💡 용어 카드(파란색)와 정의 카드를 클릭하여 매칭하세요</p>
        <p>⏱️ 최대한 빠른 시간 내에 모든 쌍을 찾는 것이 목표입니다</p>
        <p>💡 힌트를 사용하면 정답 쌍이 2초간 강조됩니다</p>
      </div>
    </div>
  )
}