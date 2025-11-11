import type { Metadata } from "next"
import G1ClientPage from "./client-page"

export const metadata: Metadata = {
  title: "오늘의 경제 퀴즈 | 서울경제 게임",
  description: "매일 새로운 경제 뉴스 퀴즈로 경제 상식을 키워보세요",
}

export default function G1Page() {
  return <G1ClientPage />
}
