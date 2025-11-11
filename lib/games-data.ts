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
    color: "#2A50FF",
    bgColor: "from-blue-600 to-blue-700",
    icon: "🦢",
    status: "active",
    image: "/images/g1-woodcut.webp",
    solidBgColor: "#6CAEFF",
    isNew: true,
    playUrl: "/games/g1/play", // Custom play URL for Black Swan
  },
  {
    id: "g2",
    slug: "/games/g2",
    title: "죄수의 딜레마",
    subtitle: "",
    description: "",
    color: "#E7D9C3",
    bgColor: "from-stone-300 to-stone-400",
    icon: "⛓️",
    status: "active",
    image: "/images/g2-woodcut.webp",
    solidBgColor: "#E7D9C3",
    isNew: true,
    playUrl: "/games/g2/play", // Custom play URL for Prisoners Dilemma
  },
  {
    id: "g3",
    slug: "/games/g3",
    title: "시그널 디코딩",
    subtitle: "",
    description: "",
    color: "#E56F5E",
    bgColor: "from-orange-400 to-orange-500",
    icon: "🔍",
    status: "active",
    image: "/images/g3-woodcut.webp",
    solidBgColor: "#E56F5E",
    isNew: true,
    playUrl: "/games/g3/play", // Custom play URL for Signal Decoding
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

// Map game types to game IDs - Currently unused
// export const GAME_ID_MAP: Record<GameType, string> = {
//   BlackSwan: "g1",
//   PrisonersDilemma: "g2",
//   SignalDecoding: "g3",
// }

import { fetchQuizData, type QuizDataStructure } from "./quiz-api-client"

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
 * Get questions for a specific game and date
 */
export async function getQuestionsForDate(gameType: GameType, date: string): Promise<Question[]> {
  try {
    const data = await loadQuizData()
    console.log(`[v0] Getting questions for ${gameType} on ${date}`)

    if (!data || !data[gameType]) {
      console.error(`[v0] No data found for game type: ${gameType}`)
      return []
    }

    const questions = data[gameType]?.[date] || []
    console.log(`[v0] Found ${questions.length} questions for ${gameType} on ${date}`)
    return questions
  } catch (error) {
    console.error(`[v0] Error loading questions for ${gameType} on ${date}:`, error)
    return []
  }
}

/**
 * Get all available dates for a specific game type
 */
export async function getAvailableDates(gameType: GameType): Promise<string[]> {
  try {
    const data = await loadQuizData()
    console.log(`[v0] Getting available dates for ${gameType}`)

    if (!data || !data[gameType]) {
      console.error(`[v0] No data found for game type: ${gameType}`)
      return []
    }

    const dates = Object.keys(data[gameType] || {})
    console.log(`[v0] Found ${dates.length} dates for ${gameType}:`, dates)
    // Sort dates in descending order (newest first)
    return dates.sort((a, b) => b.localeCompare(a))
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
