/**
 * Quiz API Client
 * AWS Lambda API를 직접 호출하여 퀴즈 데이터를 가져옴 (정적 배포용)
 */

import type { Question } from "./games-data"

// AWS Lambda API 엔드포인트
// ========================================
// AWS API Gateway (CORS 활성화됨)
// ========================================
const API_ENDPOINT = "https://zetqmdpbc1.execute-api.us-east-1.amazonaws.com/prod/quizzes/all"

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

let cachedQuizData: QuizDataStructure | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

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

  try {
    console.log("[v0] Fetching quiz data from AWS Lambda API...")
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
 * 캐시 초기화 (필요 시 사용)
 */
export function clearQuizDataCache(): void {
  cachedQuizData = null
  cacheTimestamp = null
  console.log("[v0] Quiz data cache cleared")
}
