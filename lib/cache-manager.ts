/**
 * 통합 캐시 관리자
 * 서버 사이드와 클라이언트 사이드 캐시를 통합 관리
 */

import { clearQuizDataCache, clearDateCache } from './quiz-api-client'
import { clearAllQuizCache, clearGameCache, clearOldCache } from './quiz-cache'

/**
 * 모든 캐시 초기화 (개발/디버깅용)
 */
export function clearAllCaches(): void {
  console.log('[CacheManager] Clearing all caches...')
  
  // 서버 사이드 캐시 초기화
  clearQuizDataCache()
  
  // 클라이언트 사이드 캐시 초기화
  clearAllQuizCache()
  
  console.log('[CacheManager] All caches cleared')
}

/**
 * 특정 게임의 모든 캐시 초기화
 */
export function clearGameCaches(gameType: string): void {
  console.log(`[CacheManager] Clearing caches for ${gameType}...`)
  
  // 클라이언트 사이드 캐시만 초기화 (서버 사이드는 자동 만료)
  clearGameCache(gameType)
  
  console.log(`[CacheManager] Caches cleared for ${gameType}`)
}

/**
 * 특정 날짜의 캐시 초기화
 */
export function clearDateCaches(gameType: string, date: string): void {
  console.log(`[CacheManager] Clearing caches for ${gameType} ${date}...`)
  
  // 서버 사이드 캐시 초기화
  clearDateCache(gameType, date)
  
  // 클라이언트 사이드는 개별 날짜 삭제 함수가 없으므로 게임 전체 초기화
  clearGameCache(gameType)
  
  console.log(`[CacheManager] Caches cleared for ${gameType} ${date}`)
}

/**
 * 오래된 캐시 정리 (정기적 실행 권장)
 */
export function cleanupOldCaches(): void {
  console.log('[CacheManager] Cleaning up old caches...')
  
  // 클라이언트 사이드 오래된 캐시 정리
  clearOldCache()
  
  console.log('[CacheManager] Old caches cleaned up')
}

/**
 * 캐시 상태 확인 (디버깅용)
 */
export function getCacheStatus(): {
  clientCacheSize: number
  clientCacheKeys: string[]
} {
  if (typeof window === 'undefined') {
    return { clientCacheSize: 0, clientCacheKeys: [] }
  }
  
  const cacheKeys: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('g2-quiz-cache')) {
      cacheKeys.push(key)
    }
  }
  
  return {
    clientCacheSize: cacheKeys.length,
    clientCacheKeys: cacheKeys
  }
}

/**
 * 앱 시작 시 캐시 초기화 (선택적)
 */
export function initializeCaches(): void {
  console.log('[CacheManager] Initializing caches...')
  
  // 오래된 캐시 정리
  cleanupOldCaches()
  
  console.log('[CacheManager] Caches initialized')
}