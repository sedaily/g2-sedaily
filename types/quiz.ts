export type GameTheme = "BlackSwan" | "SignalDecoding" | "PrisonersDilemma"

export type QuestionType = "객관식" | "주관식"

export type QuizQuestion = {
  id: string
  date: string
  theme: GameTheme
  questionType: QuestionType
  card_type?: "question" | "answer"
  title?: string
  question_text: string
  choices: string[]
  correct_index: number | null
  explanation?: string
  hints?: string[]
  related_article?: {
    title: string
    snippet: string
    url: string
  }
  image?: string
  creator: string
  tags?: string
}
