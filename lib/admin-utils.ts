import type { QuizQuestion } from "@/types/quiz"

/**
 * Lambda가 기대하는 Question 형식
 */
export type LambdaQuestion = {
  id: string
  questionType: "객관식" | "주관식"
  question: string
  options?: string[] // 객관식만
  answer: string // 객관식: "1", "2", 주관식: 실제 답변 텍스트
  explanation: string
  newsLink: string
  tags?: string
  relatedArticle?: {
    title: string
    excerpt: string
  }
}

/**
 * Lambda POST 요청 Payload 형식
 */
export type LambdaPayload = {
  gameType: string
  quizDate: string
  data: {
    questions: LambdaQuestion[]
  }
}

/**
 * QuizQuestion을 Lambda 형식으로 변환
 */
export function convertToLambdaFormat(question: QuizQuestion): LambdaQuestion {
  const baseQuestion = {
    id: question.id,
    questionType: question.questionType,
    question: question.question_text,
    explanation: question.explanation || "",
    newsLink: question.related_article?.url || "https://www.sedaily.com/",
    tags: question.tags,
  }

  let answer = ""
  let options: string[] | undefined

  // 객관식
  if (question.questionType === "객관식") {
    options = question.choices
    // correct_index를 1부터 시작하는 문자열로 변환 (0 → "1", 1 → "2")
    answer = question.correct_index !== null ? String(question.correct_index + 1) : ""
  }
  // 주관식
  else {
    // 주관식은 choices[0]에 답이 저장됨
    answer = question.choices[0] || ""
    // options는 주관식에 없음
  }

  const lambdaQuestion: LambdaQuestion = {
    ...baseQuestion,
    answer,
    ...(options && { options }),
  }

  // relatedArticle (선택적)
  if (
    question.related_article &&
    (question.related_article.title || question.related_article.snippet || question.related_article.url)
  ) {
    lambdaQuestion.relatedArticle = {
      title: question.related_article.title || "",
      excerpt: question.related_article.snippet || "",
    }
  }

  return lambdaQuestion
}

/**
 * 문제 유효성 검사
 */
export function validateQuestion(question: QuizQuestion): { status: "ok" | "missing"; issues: string[] } {
  const errors: string[] = []

  if (!question.question_text.trim()) {
    errors.push("질문 내용이 비어있습니다")
  }

  if (question.questionType === "객관식") {
    if (question.choices.length < 2 || question.choices.length > 6) {
      errors.push("선택지는 2~6개여야 합니다")
    }

    if (question.correct_index === null) {
      errors.push("정답을 선택해주세요")
    }

    const hasEmptyChoice = question.choices.some((choice) => !choice.trim())
    if (hasEmptyChoice) {
      errors.push("빈 선택지가 있습니다")
    }
  } else if (question.questionType === "주관식") {
    if (!question.choices[0]?.trim()) {
      errors.push("주관식 정답을 입력해주세요")
    }
  }

  if (!question.tags?.trim()) {
    errors.push("태그를 입력해주세요")
  }

  return {
    status: errors.length === 0 ? "ok" : "missing",
    issues: errors,
  }
}

/**
 * Lambda API로 저장
 */
export async function saveToLambda(
  questions: QuizQuestion[],
  quizDate: string,
  apiUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 내부 API 사용
    const useInternalAPI = true

    // 게임 타입별로 그룹화
    const questionsByTheme: Record<string, QuizQuestion[]> = {
      BlackSwan: [],
      PrisonersDilemma: [],
      SignalDecoding: [],
    }

    for (const q of questions) {
      if (questionsByTheme[q.theme]) {
        questionsByTheme[q.theme].push(q)
      }
    }

    // 각 게임 타입별로 Lambda에 개별 저장
    const savePromises: Promise<Response>[] = []

    for (const [theme, themeQuestions] of Object.entries(questionsByTheme)) {
      if (themeQuestions.length === 0) continue

      // QuizQuestion → Lambda 형식으로 변환
      const lambdaQuestions = themeQuestions.map(convertToLambdaFormat)

      const payload: LambdaPayload = {
        gameType: theme,
        quizDate,
        data: {
          questions: lambdaQuestions,
        },
      }

      console.log(`[Admin] Saving ${theme}:`, payload)

      // CloudFront → API Gateway
      const promise = fetch('/api/admin/quizzes', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      savePromises.push(promise)
    }

    // 모든 저장 요청 병렬 실행
    const responses = await Promise.all(savePromises)

    // 응답 확인
    for (const response of responses) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `저장 실패: ${response.status}`)
      }
    }

    // 저장 성공 후 캐시 무효화
    if (typeof window !== 'undefined') {
      // 동적 import로 캐시 무효화 함수 호출
      import('./quiz-api-client').then(({ clearQuizDataCache, clearDateCache }) => {
        // 전체 캐시 초기화
        clearQuizDataCache()
        
        // 저장된 각 게임 타입별 날짜 캐시도 개별 초기화
        for (const [theme, themeQuestions] of Object.entries(questionsByTheme)) {
          if (themeQuestions.length > 0) {
            clearDateCache(theme, quizDate)
          }
        }
        
        console.log('[Admin] All quiz caches cleared after save')
      })
    }
    
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다"
    return { success: false, error: message }
  }
}
