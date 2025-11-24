export type GameMeta = {
  id: string
  slug: string
  title: string
  subtitle?: string
  description?: string
  color: string
  bgColor: string
  icon: string
  status: "active" | "coming-soon"
  component?: string
  image?: string
  solidBgColor?: string
  isNew?: boolean
  playUrl?: string // Added optional playUrl to override default routing
}

export const GAMES: GameMeta[] = [
  {
    id: "g1",
    slug: "/games/g1",
    title: "블랙 스완",
    subtitle: "",
    description: "",
    color: "#3B82F6",
    bgColor: "from-blue-500 to-blue-600",
    icon: "🦢",
    status: "active",
    image: "/images/g1-new.webp",
    solidBgColor: "#3B82F6",
    isNew: true,
    playUrl: "/games/g1/play",
  },
  {
    id: "g2",
    slug: "/games/g2",
    title: "죄수의 딜레마",
    subtitle: "",
    description: "",
    color: "#10B981",
    bgColor: "from-emerald-500 to-emerald-600",
    icon: "⛓️",
    status: "active",
    image: "/images/g2-new.webp",
    solidBgColor: "#10B981",
    isNew: true,
    playUrl: "/games/g2/play",
  },
  {
    id: "g3",
    slug: "/games/g3",
    title: "시그널 디코딩",
    subtitle: "",
    description: "",
    color: "#F59E0B",
    bgColor: "from-amber-500 to-amber-600",
    icon: "🔍",
    status: "active",
    image: "/images/g3-new.webp",
    solidBgColor: "#F59E0B",
    isNew: true,
    playUrl: "/games/g3/play",
  },
  {
    id: "quizlet",
    slug: "/games/quizlet",
    title: "카드 매칭",
    subtitle: "경제 용어 매칭 게임",
    description: "Quizlet 스타일의 경제 용어와 정의를 매칭하는 카드 게임",
    color: "#EC4899",
    bgColor: "from-pink-500 to-pink-600",
    icon: "🃏",
    status: "active",
    image: "/images/quizlet-new.webp",
    solidBgColor: "#EC4899",
    isNew: true,
    playUrl: "/games/quizlet",
  },
]

export function getGameById(id: string): GameMeta | undefined {
  return GAMES.find((game) => game.id === id)
}

export type QuestionType = "객관식" | "주관식"

export type RelatedArticle = {
  title: string // Headline
  excerpt: string // Article summary/lede
}

export type Question = {
  id: string
  questionType: QuestionType
  question: string
  options?: string[] // For multiple choice
  hint?: string | string[] // For short answer
  answer: string
  explanation: string
  newsLink: string
  tags?: string // Optional tag field for categorization
  relatedArticle?: RelatedArticle // Added optional newspaper article header
}

export type GameType = "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"

export type GameDataStructure = {
  [key in GameType]: {
    [date: string]: Question[]
  }
}

// Map game IDs to game types
export const GAME_TYPE_MAP: Record<string, GameType> = {
  g1: "BlackSwan",
  g2: "PrisonersDilemma",
  g3: "SignalDecoding",
}



import { fetchQuizData, fetchQuizDataByDate, fetchAvailableDates, type QuizDataStructure } from "./quiz-api-client"
import { getCachedQuizData, setCachedQuizData, getCachedDates, setCachedDates } from "./quiz-cache"

// 캐시된 퀴즈 데이터
let cachedTypedQuizData: QuizDataStructure | null = null

/**
 * 퀴즈 데이터 로드 (API 또는 캐시에서)
 */
async function loadQuizData(): Promise<QuizDataStructure> {
  if (cachedTypedQuizData) {
    return cachedTypedQuizData
  }

  try {
    const data = await fetchQuizData()
    cachedTypedQuizData = data
    
    console.log("[v0] Quiz data loaded:", {
      hasData: !!data,
      gameTypes: Object.keys(data || {}),
      blackSwanDates: Object.keys(data?.BlackSwan || {}),
      prisonersDilemmaDates: Object.keys(data?.PrisonersDilemma || {}),
      signalDecodingDates: Object.keys(data?.SignalDecoding || {}),
    })
    
    return data
  } catch (error) {
    console.error("[v0] Failed to load quiz data:", error)
    return {
      BlackSwan: {},
      PrisonersDilemma: {},
      SignalDecoding: {},
    }
  }
}

/**
 * Get questions for a specific game and date (최적화된 버전)
 * 다층 캐싱: localStorage → 날짜별 API → 전체 API
 */
export async function getQuestionsForDate(gameType: GameType, date: string): Promise<Question[]> {
  try {
    console.log(`[v0] Getting questions for ${gameType} on ${date} (multi-layer cache)`)
    
    // 1단계: 클라이언트 캐시 확인
    const cachedData = getCachedQuizData(gameType, date)
    if (cachedData && cachedData.length > 0) {
      console.log(`[v0] Using client cache for ${gameType} on ${date}`)
      return cachedData
    }
    
    // 2단계: 날짜별 API 요청
    const questions = await fetchQuizDataByDate(gameType, date)
    
    // 성공시 클라이언트 캐시에 저장
    if (questions.length > 0) {
      setCachedQuizData(gameType, date, questions)
    }
    
    console.log(`[v0] Found ${questions.length} questions for ${gameType} on ${date}`)
    return questions
  } catch (error) {
    console.error(`[v0] Error loading questions for ${gameType} on ${date}:`, error)
    return []
  }
}

/**
 * Get all available dates for a specific game type (최적화된 버전)
 * 다층 캐싱: localStorage → 메타 API → 전체 API
 */
export async function getAvailableDates(gameType: GameType): Promise<string[]> {
  try {
    console.log(`[v0] Getting available dates for ${gameType} (multi-layer cache)`)
    
    // 1단계: 클라이언트 캐시 확인
    const cachedDates = getCachedDates(gameType)
    if (cachedDates && cachedDates.length > 0) {
      console.log(`[v0] Using client cache for ${gameType} dates`)
      return cachedDates
    }
    
    // 2단계: 메타데이터 API 요청
    const dates = await fetchAvailableDates(gameType)
    
    // 성공시 클라이언트 캐시에 저장
    if (dates.length > 0) {
      setCachedDates(gameType, dates)
    }
    
    console.log(`[v0] Found ${dates.length} dates for ${gameType}`)
    return dates
  } catch (error) {
    console.error(`[v0] Error loading dates for ${gameType}:`, error)
    return []
  }
}

/**
 * Archive structure type
 */
export type ArchiveStructure = {
  years: Array<{
    year: number
    months: Array<{
      month: number
      dates: string[]
    }>
  }>
}

/**
 * Get archive structure grouped by year and month
 * Returns { year, months: [ { month, dates: [...] } ] }
 */
export async function getArchiveStructure(gameType: GameType): Promise<ArchiveStructure> {
  const dates = await getAvailableDates(gameType)

  // Group dates by year and month
  const yearMap = new Map<number, Map<number, string[]>>()

  for (const dateStr of dates) {
    const [year, month] = dateStr.split("-").map(Number)

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }

    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) {
      monthMap.set(month, [])
    }

    monthMap.get(month)!.push(dateStr)
  }

  // Convert to array structure
  const years = Array.from(yearMap.entries())
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .map(([month, dates]) => ({
          month,
          dates: dates.sort((a, b) => b.localeCompare(a)), // Sort dates descending
        }))
        .sort((a, b) => b.month - a.month), // Sort months descending
    }))
    .sort((a, b) => b.year - a.year) // Sort years descending

  return { years }
}

/**
 * Check if a date has questions available for a game type
 */
export async function hasQuestionsForDate(gameType: GameType, date: string): Promise<boolean> {
  const questions = await getQuestionsForDate(gameType, date)
  return questions.length > 0
}

/**
 * Get the most recent date with questions for a game type
 */
export async function getMostRecentDate(gameType: GameType): Promise<string | null> {
  const dates = await getAvailableDates(gameType)
  const mostRecent = dates.length > 0 ? dates[0] : null
  console.log(`[v0] Most recent date for ${gameType}:`, mostRecent)
  return mostRecent
}

export const AVAILABLE_TAGS = ["증권", "부동산", "경제·금융", "산업", "정치", "사회", "국제", "오피니언"] as const

export type TagType = (typeof AVAILABLE_TAGS)[number]

/**
 * Get unique tags from questions for a specific date
 * Returns max 3 tags + count of remaining tags
 */
export async function getTagsForDate(gameType: GameType, date: string): Promise<{ displayTags: string[]; remainingCount: number }> {
  const questions = await getQuestionsForDate(gameType, date)

  // Collect unique tags
  const uniqueTags = new Set<string>()
  questions.forEach((q) => {
    if (q.tags) {
      uniqueTags.add(q.tags)
    }
  })

  const tagsArray = Array.from(uniqueTags)

  // Return first 3 tags and count of remaining
  if (tagsArray.length <= 3) {
    return { displayTags: tagsArray, remainingCount: 0 }
  } else {
    return {
      displayTags: tagsArray.slice(0, 3),
      remainingCount: tagsArray.length - 3,
    }
  }
}
