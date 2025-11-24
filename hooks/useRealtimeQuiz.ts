import { useState, useEffect, useCallback } from 'react';

interface QuizData {
  gameType: string;
  quizDate: string;
  data: any;
  updatedAt: string;
}

export function useRealtimeQuiz(gameType: string, pollInterval = 30000) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchLatest = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/latest?gameType=${gameType}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // 업데이트 시간이 변경되었을 때만 상태 업데이트
        if (data.updatedAt !== lastUpdate) {
          setQuiz(data.data);
          setLastUpdate(data.updatedAt);
          console.log(`[Realtime] Quiz updated for ${gameType}:`, data.updatedAt);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [gameType, lastUpdate]);

  useEffect(() => {
    fetchLatest();
    
    const interval = setInterval(fetchLatest, pollInterval);
    
    return () => clearInterval(interval);
  }, [fetchLatest, pollInterval]);

  return { quiz, loading, error, refresh: fetchLatest };
}
