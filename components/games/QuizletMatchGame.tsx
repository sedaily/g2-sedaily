'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchQuizDataByDate } from '@/lib/quiz-api-client';

interface GameCard {
  id: string;
  content: string;
  type: 'term' | 'definition';
  pairId: number;
  isMatched: boolean;
  isSelected: boolean;
}

interface EconomicTerm {
  id: number;
  term: string;
  definition: string;
  explanation?: string;
}

const economicTerms: EconomicTerm[] = [
  { id: 1, term: "GDP", definition: "국내총생산", explanation: "한 나라의 경제 규모를 나타내는 가장 중요한 지표입니다." },
  { id: 2, term: "CPI", definition: "소비자물가지수", explanation: "일반 소비자가 구입하는 상품과 서비스 가격의 변동을 측정합니다." },
  { id: 3, term: "기준금리", definition: "중앙은행 정책금리", explanation: "경제 전반의 금리 수준을 결정하는 기준이 됩니다." },
  { id: 4, term: "환율", definition: "외화 교환 비율", explanation: "국가 간 무역과 투자에 중요한 영향을 미칩니다." },
  { id: 5, term: "인플레이션", definition: "물가 상승 현상", explanation: "화폐 가치 하락과 구매력 감소를 의미합니다." },
  { id: 6, term: "디플레이션", definition: "물가 하락 현상", explanation: "경제 침체의 신호로 여겨지는 경우가 많습니다." },
  { id: 7, term: "경상수지", definition: "대외거래 수지", explanation: "국가의 대외 경제 건전성을 보여주는 지표입니다." },
  { id: 8, term: "실업률", definition: "실업자 비율", explanation: "경제 상황과 고용 시장의 건강도를 나타냅니다." },
  { id: 9, term: "M&A", definition: "기업 인수합병", explanation: "기업의 성장과 구조조정을 위한 전략입니다." },
  { id: 10, term: "IPO", definition: "기업공개", explanation: "비상장 기업이 주식을 처음 공개하는 것입니다." },
  { id: 11, term: "QE", definition: "양적완화", explanation: "중앙은행이 시중에 유동성을 공급하는 정책입니다." },
  { id: 12, term: "KOSPI", definition: "종합주가지수", explanation: "한국 주식시장의 대표 지수입니다." }
];

type Difficulty = 'easy' | 'normal' | 'hard';

const difficultySettings = {
  easy: { pairs: 4, gridCols: 4 },
  normal: { pairs: 6, gridCols: 4 },
  hard: { pairs: 8, gridCols: 4 }
};

export default function QuizletMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [apiTerms, setApiTerms] = useState<EconomicTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setName, setSetName] = useState('');

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  // API에서 Quizlet 데이터 로드
  const loadQuizletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${process.env.NEXT_PUBLIC_QUIZ_API_URL?.replace('/all', '')}/Quizlet/${today}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.terms) {
          const formattedTerms = data.terms.map((term: any, index: number) => ({
            id: index + 1,
            term: term.term,
            definition: term.definition,
            explanation: term.explanation
          }));
          setApiTerms(formattedTerms);
          setSetName(data.setName || '경제 용어 세트');
          console.log(`Loaded ${formattedTerms.length} terms from API`);
        } else {
          console.log('No Quizlet data found, using default terms');
          setApiTerms(economicTerms);
          setSetName('기본 경제 용어');
        }
      } else {
        console.log('API request failed, using default terms');
        setApiTerms(economicTerms);
        setSetName('기본 경제 용어');
      }
    } catch (error) {
      console.error('Error loading Quizlet data:', error);
      setApiTerms(economicTerms);
      setSetName('기본 경제 용어');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 게임 초기화
  const initializeGame = useCallback(() => {
    const { pairs } = difficultySettings[difficulty];
    const availableTerms = apiTerms.length > 0 ? apiTerms : economicTerms;
    const selectedTerms = availableTerms.slice(0, Math.min(pairs, availableTerms.length));
    
    const gameCards: GameCard[] = [];
    
    selectedTerms.forEach((term) => {
      gameCards.push({
        id: `term-${term.id}`,
        content: term.term,
        type: 'term',
        pairId: term.id,
        isMatched: false,
        isSelected: false
      });
      
      gameCards.push({
        id: `def-${term.id}`,
        content: term.definition,
        type: 'definition',
        pairId: term.id,
        isMatched: false,
        isSelected: false
      });
    });
    
    // 카드 섞기
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setSelectedCards([]);
    setMatchedPairs(0);
    setGameStarted(false);
    setGameCompleted(false);
    setElapsedTime(0);
    setHintsUsed(0);
    setShowHint(null);
  }, [difficulty, apiTerms]);

  // 컴포넌트 마운트 시 API 데이터 로드
  useEffect(() => {
    loadQuizletData();
  }, [loadQuizletData]);

  // 게임 시작
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  // 카드 클릭 처리
  const handleCardClick = (clickedCard: GameCard) => {
    if (!gameStarted) startGame();
    if (isChecking || clickedCard.isMatched || clickedCard.isSelected) return;
    
    const newSelectedCards = [...selectedCards, clickedCard];
    setSelectedCards(newSelectedCards);
    
    // 카드 선택 상태 업데이트
    setCards(prev => prev.map(card => 
      card.id === clickedCard.id 
        ? { ...card, isSelected: true }
        : card
    ));
    
    // 두 장이 선택되면 매칭 검사
    if (newSelectedCards.length === 2) {
      setIsChecking(true);
      checkMatch(newSelectedCards);
    }
  };

  // 매칭 검사
  const checkMatch = (selectedPair: GameCard[]) => {
    const [first, second] = selectedPair;
    const isMatch = first.pairId === second.pairId;
    
    setTimeout(() => {
      if (isMatch) {
        // 정답 처리
        setCards(prev => prev.map(card => 
          selectedPair.some(selected => selected.id === card.id)
            ? { ...card, isMatched: true, isSelected: false }
            : { ...card, isSelected: false }
        ));
        
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        
        // 게임 완료 체크
        if (newMatchedPairs === difficultySettings[difficulty].pairs) {
          setGameCompleted(true);
          saveRecord();
        }
      } else {
        // 오답 처리
        setCards(prev => prev.map(card => ({ ...card, isSelected: false })));
      }
      
      setSelectedCards([]);
      setIsChecking(false);
    }, 800);
  };

  // 힌트 사용
  const useHint = () => {
    if (hintsUsed >= 3 || gameCompleted) return;
    
    const unmatchedCards = cards.filter(card => !card.isMatched);
    const availablePairs = new Set(unmatchedCards.map(card => card.pairId));
    const randomPairId = Array.from(availablePairs)[Math.floor(Math.random() * availablePairs.size)];
    
    setShowHint(randomPairId);
    setHintsUsed(prev => prev + 1);
    
    setTimeout(() => setShowHint(null), 2000);
  };

  // 기록 저장
  const saveRecord = () => {
    const records = JSON.parse(localStorage.getItem('quizlet-records') || '{}');
    const currentTime = elapsedTime;
    
    if (!records[difficulty] || currentTime < records[difficulty]) {
      records[difficulty] = currentTime;
      localStorage.setItem('quizlet-records', JSON.stringify(records));
    }
  };

  // 시간 포맷팅
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // 컴포넌트 마운트 시 게임 초기화
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const { gridCols } = difficultySettings[difficulty];
  const totalPairs = difficultySettings[difficulty].pairs;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Quizlet 데이터를 로드 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">{setName}</h1>
        <p className="text-center text-muted-foreground mb-4">
          총 {apiTerms.length}개 용어 • 매칭 게임
        </p>
        
        {/* 난이도 선택 */}
        <div className="flex justify-center gap-2 mb-4">
          {Object.keys(difficultySettings).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
              onClick={() => setDifficulty(level as Difficulty)}
              disabled={gameStarted && !gameCompleted}
            >
              {level === 'easy' ? '쉬움 (4쌍)' : 
               level === 'normal' ? '보통 (6쌍)' : '어려움 (8쌍)'}
            </Button>
          ))}
        </div>
        
        {/* 게임 상태 */}
        <div className="flex justify-center items-center gap-6 text-lg">
          <div>시간: {formatTime(elapsedTime)}</div>
          <div>진행률: {matchedPairs}/{totalPairs}</div>
          <div>힌트: {3 - hintsUsed}회 남음</div>
        </div>
      </div>

      {/* 게임 컨트롤 */}
      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={initializeGame} variant="outline">
          새 게임
        </Button>
        <Button 
          onClick={useHint} 
          disabled={hintsUsed >= 3 || gameCompleted || !gameStarted}
          variant="secondary"
        >
          힌트 사용
        </Button>
        <Button 
          onClick={loadQuizletData} 
          variant="outline"
          disabled={isLoading}
        >
          데이터 새로고침
        </Button>
        <Button 
          onClick={() => window.location.href = '/games/quizlet/archive'}
          variant="outline"
        >
          아카이브
        </Button>
      </div>

      {/* 게임 보드 */}
      <div 
        className={`grid gap-3 mx-auto max-w-4xl`}
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${Math.ceil(cards.length / gridCols)}, minmax(0, 1fr))`
        }}
      >
        {cards.map((card) => {
          const isHinted = showHint === card.pairId;
          const isWrongSelection = selectedCards.length === 2 && 
                                 selectedCards.some(selected => selected.id === card.id) &&
                                 selectedCards[0].pairId !== selectedCards[1].pairId;
          
          return (
            <Card
              key={card.id}
              className={`
                relative h-24 cursor-pointer transition-all duration-300 transform
                flex items-center justify-center text-center p-3
                ${card.isMatched ? 'bg-green-100 border-green-500 opacity-50 scale-95' : ''}
                ${card.isSelected ? 'bg-blue-100 border-blue-500 scale-105' : ''}
                ${isHinted ? 'bg-yellow-100 border-yellow-500 animate-pulse' : ''}
                ${isWrongSelection ? 'bg-red-100 border-red-500 animate-shake' : ''}
                hover:scale-105 hover:shadow-lg
              `}
              onClick={() => handleCardClick(card)}
            >
              <div className="text-sm font-medium leading-tight">
                {card.content}
              </div>
              
              {/* 카드 타입 표시 */}
              <div className={`
                absolute top-1 right-1 w-3 h-3 rounded-full
                ${card.type === 'term' ? 'bg-blue-400' : 'bg-purple-400'}
              `} />
            </Card>
          );
        })}
      </div>

      {/* 완료 모달 */}
      {gameCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 완료!</h2>
              <p className="text-lg mb-2">소요 시간: {formatTime(elapsedTime)}</p>
              <p className="text-sm text-gray-600 mb-4">
                난이도: {difficulty === 'easy' ? '쉬움' : difficulty === 'normal' ? '보통' : '어려움'}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                힌트 사용: {hintsUsed}회
              </p>
              <Button onClick={initializeGame} className="w-full">
                다시 하기
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}