/**
 * 클라이언트 사이드 퀴즈 데이터 캐싱
 * localStorage를 활용한 효율적인 캐싱 전략
 */

import type { Question } from "./games-data"

// 캐시 설정
const CACHE_PREFIX = 'g2-quiz-cache'
const CACHE_VERSION = 'v1'
const CLIENT_CACHE_DURATION = 15 * 60 * 1000 // 15분 클라이언트 캐시

interface CacheItem {
  data: Question[]
  timestamp: number
  version: string
}

interface DatesCacheItem {
  dates: string[]
  timestamp: number
  version: string
}

/**
 * 캐시 키 생성
 */
function getCacheKey(gameType: string, date: string): string {
  return `${CACHE_PREFIX}-${gameType}-${date}`
}

function getDatesCacheKey(gameType: string): string {
  return `${CACHE_PREFIX}-dates-${gameType}`
}

/**
 * localStorage에서 퀴즈 데이터 가져오기
 */
export function getCachedQuizData(gameType: string, date: string): Question[] | null {
  if (typeof window === 'undefined') return null // SSR 체크
  
  try {
    const cacheKey = getCacheKey(gameType, date)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const item: CacheItem = JSON.parse(cached)
    
    // 버전 체크
    if (item.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    // 만료 체크
    if (Date.now() - item.timestamp > CLIENT_CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    console.log(`[Cache] Using cached data for ${gameType} ${date}`)
    return item.data
    
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error)
    return null
  }
}

/**
 * localStorage에 퀴즈 데이터 저장
 */
export function setCachedQuizData(gameType: string, date: string, data: Question[]): void {
  if (typeof window === 'undefined') return // SSR 체크
  
  try {
    const cacheKey = getCacheKey(gameType, date)
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(item))
    console.log(`[Cache] Cached ${data.length} questions for ${gameType} ${date}`)
    
  } catch (error) {
    console.error('[Cache] Error writing to cache:', error)
    // localStorage 용량 초과 시 오래된 캐시 정리
    if (error instanceof DOMException && error.code === 22) {
      clearOldCache()
      // 재시도
      try {
        const cacheKey = getCacheKey(gameType, date)
        const item: CacheItem = {
          data,
          timestamp: Date.now(),
          version: CACHE_VERSION
        }
        localStorage.setItem(cacheKey, JSON.stringify(item))
      } catch {
        console.warn('[Cache] Failed to cache after cleanup')
      }
    }
  }
}

/**
 * localStorage에서 날짜 목록 가져오기
 */
export function getCachedDates(gameType: string): string[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cacheKey = getDatesCacheKey(gameType)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const item: DatesCacheItem = JSON.parse(cached)
    
    // 버전 체크
    if (item.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    // 만료 체크 (날짜 목록은 더 오래 캐시)
    if (Date.now() - item.timestamp > CLIENT_CACHE_DURATION * 2) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    console.log(`[Cache] Using cached dates for ${gameType}`)
    return item.dates
    
  } catch (error) {
    console.error('[Cache] Error reading dates from cache:', error)
    return null
  }
}

/**
 * localStorage에 날짜 목록 저장
 */
export function setCachedDates(gameType: string, dates: string[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheKey = getDatesCacheKey(gameType)
    const item: DatesCacheItem = {
      dates,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(item))
    console.log(`[Cache] Cached ${dates.length} dates for ${gameType}`)
    
  } catch (error) {
    console.error('[Cache] Error writing dates to cache:', error)
  }
}

/**
 * 오래된 캐시 정리
 */
export function clearOldCache(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_PREFIX)) continue
      
      try {
        const cached = localStorage.getItem(key)
        if (!cached) continue
        
        const item = JSON.parse(cached)
        
        // 버전이 다르거나 만료된 항목 제거
        if (item.version !== CACHE_VERSION || 
            Date.now() - item.timestamp > CLIENT_CACHE_DURATION) {
          keysToRemove.push(key)
        }
      } catch {
        // 파싱 실패한 항목도 제거
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`[Cache] Cleaned up ${keysToRemove.length} old cache items`)
    
  } catch (error) {
    console.error('[Cache] Error during cache cleanup:', error)
  }
}

/**
 * 특정 게임 타입의 모든 캐시 제거
 */
export function clearGameCache(gameType: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(`${CACHE_PREFIX}-${gameType}`)) continue
      keysToRemove.push(key)
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`[Cache] Cleared ${keysToRemove.length} cache items for ${gameType}`)
    
  } catch (error) {
    console.error('[Cache] Error clearing game cache:', error)
  }
}

/**
 * 모든 퀴즈 캐시 제거
 */
export function clearAllQuizCache(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_PREFIX)) continue
      keysToRemove.push(key)
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`[Cache] Cleared all ${keysToRemove.length} quiz cache items`)
    
  } catch (error) {
    console.error('[Cache] Error clearing all cache:', error)
  }
}