import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "시그널 디코딩 | 서울경제 게임",
  description: "뉴스 속 숨은 신호를 찾아내는 시그널 디코딩 퀴즈",
}

export default function G3Page() {
  redirect("/games/g3/play")
}
