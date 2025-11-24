import QuizletMatchGame from '@/components/games/QuizletMatchGame';

export default function QuizletGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <QuizletMatchGame />
    </div>
  );
}

export const metadata = {
  title: '경제 용어 매칭 게임 | Seoul Economic AI Games',
  description: 'Quizlet 스타일의 경제 용어 카드 매칭 게임으로 경제 지식을 재미있게 학습하세요.',
};