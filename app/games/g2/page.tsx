import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "죄수의 딜레마 | 서울경제 게임",
  description: "경제 뉴스로 판단력을 키우는 죄수의 딜레마 퀴즈",
}

export default function G2Page() {
  redirect("/games/g2/play")
}
