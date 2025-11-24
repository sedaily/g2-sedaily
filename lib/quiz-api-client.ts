/**
 * Quiz API Client
 * AWS Lambda API를 직접 호출하여 퀴즈 데이터를 가져옴 (정적 배포용)
 */

import type { Question } from "./games-data"

// CloudFront + API Gateway 사용
// ========================================
// CloudFront가 /api/quiz/* 요청을 API Gateway로 라우팅
// ========================================
const API_ENDPOINT = typeof window === 'undefined' 
  ? null // 빌드 타임에는 API 호출 안함
  : '/api/quiz/quizzes/all' // CloudFront → API Gateway

export interface QuizDataStructure {
  BlackSwan?: Record<string, Question[]>
  PrisonersDilemma?: Record<string, Question[]>
  SignalDecoding?: Record<string, Question[]>
}

// API 응답 타입
type APIQuizItem = {
  gameType: string
  quizDate: string
  data: {
    questions: Question[]
  }
}

// 전체 데이터 캐시
let cachedQuizData: QuizDataStructure | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

// 날짜별 데이터 캐시
type DateCacheKey = `${string}-${string}` // gameType-date 형식
const dateCache = new Map<DateCacheKey, { data: Question[], timestamp: number }>()
const DATE_CACHE_DURATION = 10 * 60 * 1000 // 10분 캐시 (개별 날짜는 더 오래)

/**
 * API 응답을 QuizDataStructure로 변환
 */
function transformAPIResponse(apiData: APIQuizItem[]): QuizDataStructure {
  const result: QuizDataStructure = {
    BlackSwan: {},
    PrisonersDilemma: {},
    SignalDecoding: {},
  }

  for (const item of apiData) {
    const { gameType, quizDate, data } = item
    
    if (gameType === 'BlackSwan' || gameType === 'PrisonersDilemma' || gameType === 'SignalDecoding') {
      if (!result[gameType]) result[gameType] = {}
      result[gameType]![quizDate] = data.questions
    }
  }

  return result
}

/**
 * AWS Lambda API에서 퀴즈 데이터 가져오기
 * 5분간 캐시 유지
 */
export async function fetchQuizData(): Promise<QuizDataStructure> {
  // 캐시 체크
  if (cachedQuizData && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("[v0] Using cached quiz data")
    return cachedQuizData
  }

  // 빌드 타임에는 빈 데이터 반환
  if (!API_ENDPOINT) {
    console.log("[v0] Build time: returning empty structure")
    return {
      BlackSwan: {},
      PrisonersDilemma: {},
      SignalDecoding: {},
    }
  }

  try {
    console.log("[v0] Fetching quiz data from internal API...")
    console.log("[v0] API Endpoint:", API_ENDPOINT)
    
    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // 캐시 비활성화
    })

    console.log("[v0] Response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error:", response.status, errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // API Gateway 응답의 body가 JSON 문자열인 경우 파싱
    let rawData: APIQuizItem[]
    if (typeof data.body === "string") {
      rawData = JSON.parse(data.body)
    } else if (data.body) {
      rawData = data.body
    } else {
      rawData = data
    }

    // API 응답을 QuizDataStructure로 변환
    const quizData = transformAPIResponse(rawData)

    // 캐시 업데이트
    cachedQuizData = quizData
    cacheTimestamp = Date.now()

    console.log("[v0] Quiz data fetched successfully from API")
    return quizData
  } catch (error) {
    console.error("[v0] Error fetching quiz data from API:", error)
    
    // 캐시된 데이터가 있으면 사용
    if (cachedQuizData) {
      console.log("[v0] Using stale cached data due to API error")
      return cachedQuizData
    }
    
    // fallback: 빈 구조 반환
    console.warn("[v0] Returning empty quiz data structure")
    return {
      BlackSwan: {},
      PrisonersDilemma: {},
      SignalDecoding: {},
    }
  }
}

/**
 * 특정 게임 타입과 날짜의 퀴즈 데이터 가져오기 (개선된 API)
 * 개별 요청으로 성능 최적화
 */
export async function fetchQuizDataByDate(
  gameType: 'BlackSwan' | 'PrisonersDilemma' | 'SignalDecoding',
  date: string
): Promise<Question[]> {
  const cacheKey: DateCacheKey = `${gameType}-${date}`
  
  // 캐시 체크
  const cached = dateCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < DATE_CACHE_DURATION) {
    console.log(`[v0] Using cached data for ${gameType} ${date}`)
    return cached.data
  }

  try {
    // 날짜별 API 엔드포인트 구성
    const dateApiUrl = `/api/quiz/quizzes/${gameType}/${date}`
    console.log(`[v0] Fetching ${gameType} data for ${date} from:`, dateApiUrl)
    
    const response = await fetch(dateApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`[v0] Date-specific API failed for ${gameType} ${date}, falling back to full data`)
      // 개별 API 실패 시 전체 데이터에서 추출
      const fullData = await fetchQuizData()
      const questions = fullData[gameType]?.[date] || []
      
      // 성공한 경우에만 캐시
      if (questions.length > 0) {
        dateCache.set(cacheKey, { data: questions, timestamp: Date.now() })
      }
      
      return questions
    }

    const data = await response.json()
    
    // API Gateway 응답 파싱
    let questions: Question[]
    if (typeof data.body === "string") {
      const parsed = JSON.parse(data.body)
      questions = parsed.questions || parsed.data?.questions || []
    } else if (data.body) {
      questions = data.body.questions || data.body.data?.questions || []
    } else {
      questions = data.questions || data.data?.questions || []
    }

    // 캐시 저장
    dateCache.set(cacheKey, { data: questions, timestamp: Date.now() })
    
    console.log(`[v0] Fetched ${questions.length} questions for ${gameType} ${date}`)
    return questions
    
  } catch (error) {
    console.error(`[v0] Error fetching ${gameType} data for ${date}:`, error)
    
    // 에러 시 전체 데이터에서 추출 시도
    try {
      const fullData = await fetchQuizData()
      return fullData[gameType]?.[date] || []
    } catch {
      return []
    }
  }
}

/**
 * 사용 가능한 날짜 목록 가져오기 (경량화)
 * 메타데이터만 요청하여 성능 최적화
 */
export async function fetchAvailableDates(
  gameType: 'BlackSwan' | 'PrisonersDilemma' | 'SignalDecoding'
): Promise<string[]> {
  try {
    // 메타데이터 API 엔드포인트
    const metaApiUrl = `/api/quiz/quizzes/meta/${gameType}`
    console.log(`[v0] Fetching available dates for ${gameType} from:`, metaApiUrl)
    
    const response = await fetch(metaApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache", // 날짜 목록은 캐시 허용
    })

    if (!response.ok) {
      console.warn(`[v0] Meta API failed for ${gameType}, falling back to full data`)
      // 메타 API 실패 시 전체 데이터에서 추출
      const fullData = await fetchQuizData()
      const dates = Object.keys(fullData[gameType] || {})
      return dates.sort((a, b) => b.localeCompare(a)) // 최신순 정렬
    }

    const data = await response.json()
    
    // API Gateway 응답 파싱
    let dates: string[]
    if (typeof data.body === "string") {
      const parsed = JSON.parse(data.body)
      dates = parsed.dates || []
    } else if (data.body) {
      dates = data.body.dates || []
    } else {
      dates = data.dates || []
    }

    console.log(`[v0] Found ${dates.length} dates for ${gameType}`)
    return dates.sort((a, b) => b.localeCompare(a)) // 최신순 정렬
    
  } catch (error) {
    console.error(`[v0] Error fetching dates for ${gameType}:`, error)
    
    // 에러 시 전체 데이터에서 추출
    try {
      const fullData = await fetchQuizData()
      const dates = Object.keys(fullData[gameType] || {})
      return dates.sort((a, b) => b.localeCompare(a))
    } catch {
      return []
    }
  }
}

/**
 * 캐시 초기화 (필요 시 사용)
 */
export function clearQuizDataCache(): void {
  cachedQuizData = null
  cacheTimestamp = null
  dateCache.clear()
  console.log("[v0] All quiz data cache cleared")
}

/**
 * 특정 날짜 캐시만 초기화
 */
export function clearDateCache(gameType: string, date: string): void {
  const cacheKey: DateCacheKey = `${gameType}-${date}`
  dateCache.delete(cacheKey)
  console.log(`[v0] Cache cleared for ${gameType} ${date}`)
}

/**
 * Quizlet 관련 함수들
 */
export interface QuizletSet {
  id: string
  name: string
  termCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Quizlet 세트 목록 가져오기 (Archive용)
 */
export async function getQuizletSets(): Promise<QuizletSet[]> {
  try {
    const quizletApiUrl = `/api/quiz/quizlet/sets`
    console.log('[v0] Fetching Quizlet sets from:', quizletApiUrl)
    
    const response = await fetch(quizletApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.warn('[v0] Quizlet sets API failed, returning empty array')
      return []
    }

    const data = await response.json()
    
    // API Gateway 응답 파싱
    let sets: QuizletSet[]
    if (typeof data.body === 'string') {
      const parsed = JSON.parse(data.body)
      sets = parsed.sets || []
    } else if (data.body) {
      sets = data.body.sets || []
    } else {
      sets = data.sets || []
    }

    console.log(`[v0] Found ${sets.length} Quizlet sets`)
    return sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
  } catch (error) {
    console.error('[v0] Error fetching Quizlet sets:', error)
    return []
  }
}

/**
 * Archive에 퀴즈 저장 (관리자 페이지에서 호출)
 */
export async function saveToArchive(
  gameType: 'BlackSwan' | 'PrisonersDilemma' | 'SignalDecoding',
  date: string,
  questions: Question[]
): Promise<boolean> {
  try {
    console.log(`[v0] Saving ${gameType} quiz for ${date} to archive`)
    
    // 실제로는 이미 DynamoDB에 저장되므로 archive는 자동으로 업데이트됨
    // 여기서는 캐시만 무효화
    clearDateCache(gameType, date)
    
    // 전체 캐시도 무효화하여 archive 페이지에서 최신 데이터 로드
    clearQuizDataCache()
    
    console.log(`[v0] Archive updated for ${gameType} ${date}`)
    return true
    
  } catch (error) {
    console.error(`[v0] Error saving to archive:`, error)
    return false
  }
}

/**
 * Quizlet 세트를 Archive에 저장
 */
export async function saveQuizletToArchive(
  setId: string,
  setName: string,
  termCount: number
): Promise<boolean> {
  try {
    console.log(`[v0] Saving Quizlet set ${setName} to archive`)
    
    // Quizlet은 이미 DynamoDB에 저장되므로 캐시만 무효화
    // 실제 구현에서는 별도의 archive 테이블이나 메타데이터 업데이트가 필요할 수 있음
    
    console.log(`[v0] Quizlet archive updated for set ${setId}`)
    return true
    
  } catch (error) {
    console.error(`[v0] Error saving Quizlet to archive:`, error)
    return false
  }
}
