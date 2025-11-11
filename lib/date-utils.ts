/**
 * Date utilities for KST (Korea Standard Time) timezone
 * Asia/Seoul is UTC+9
 */

/**
 * Get current date/time in KST timezone
 */
export function nowKST(): Date {
  const now = new Date()
  const KST_OFFSET = 9 * 60 // minutes
  return new Date(now.getTime() + KST_OFFSET * 60 * 1000)
}

/**
 * Get current year in KST
 */
export function currentYearKST(): number {
  return nowKST().getUTCFullYear()
}

/**
 * Get current month in KST (1-12)
 */
export function currentMonthKST(): number {
  return nowKST().getUTCMonth() + 1 // 1~12
}

/**
 * Get today's date in ISO format (YYYY-MM-DD) in KST
 */
export function todayKST(): string {
  const now = nowKST()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Format date string to Korean locale
 */
export function formatDateKR(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z")
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Get month name in Korean
 */
export function getMonthNameKR(month: number): string {
  return `${month}월`
}
