const STORAGE_KEY = "se-games.g1.progress"

export type QuizProgress = {
  [date: string]: {
    score: number
    completed: boolean
    timestamp: number
  }
}

/**
 * Get quiz progress from localStorage
 */
export function getQuizProgress(): QuizProgress {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save quiz progress to localStorage
 */
export function saveQuizProgress(date: string, score: number): void {
  if (typeof window === "undefined") return

  try {
    const progress = getQuizProgress()
    progress[date] = {
      score,
      completed: true,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("[v0] Failed to save quiz progress:", error)
  }
}

/**
 * Check if quiz is completed for a date
 */
export function isQuizCompleted(date: string): boolean {
  const progress = getQuizProgress()
  return progress[date]?.completed ?? false
}

/**
 * Get score for a specific date
 */
export function getQuizScore(date: string): number | null {
  const progress = getQuizProgress()
  return progress[date]?.score ?? null
}
