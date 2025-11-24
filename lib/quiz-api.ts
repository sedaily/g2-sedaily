export type QuizItem = {
  question: string
  quizDate: string
  questionId: number
  options: string[]
  newsLink?: string
  answer: string
  explanation?: string
  hint?: string[]
}

export type QuizResponse = {
  questions?: QuizItem[]
}

/**
 * Convert Date to yymmdd format
 */
export function toYYMMDD(date: Date): string {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

/**
 * Convert yyyy-mm-dd to yymmdd format
 */
export function ymdToYYMMDD(ymd: string): string {
  return ymd.replaceAll("-", "").slice(2)
}

/**
 * Get today's date in KST timezone
 */
export function getTodayKST(): Date {
  const now = new Date()
  const kstOffset = 9 * 60 // KST is UTC+9
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + kstOffset * 60000)
}

/**
 * Fetch quiz data from new API
 */
export async function fetchQuizFromAPI(gameType: string, quizDate: string): Promise<QuizItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_QUIZ_SAVE_URL
  if (!apiUrl) {
    throw new Error('Quiz API URL not configured')
  }

  const response = await fetch(`${apiUrl}?gameType=${gameType}&quizDate=${quizDate}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      return [] // No quiz found for this date
    }
    throw new Error(`Failed to fetch quiz: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.success || !data.data?.questions) {
    return []
  }

  // Convert API format to QuizItem format
  return data.data.questions.map((q: any, index: number) => ({
    question: q.question,
    quizDate,
    questionId: index + 1,
    options: q.options || [],
    newsLink: q.newsLink,
    answer: q.answer,
    explanation: q.explanation,
    hint: q.hint ? [q.hint] : undefined
  }))
}
