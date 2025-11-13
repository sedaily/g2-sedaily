import CardMatchingGame from '@/components/games/CardMatchingGame'

export default function G4Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <CardMatchingGame />
      </div>
    </div>
  )
}

export const metadata = {
  title: '경제 용어 매칭 게임 | 서울경제 뉴스게임',
  description: 'Quizlet 스타일의 경제 용어 카드 매칭 게임. 용어와 정의를 빠르게 매칭하여 경제 지식을 향상시키세요.',
}