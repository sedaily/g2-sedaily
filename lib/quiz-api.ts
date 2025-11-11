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
