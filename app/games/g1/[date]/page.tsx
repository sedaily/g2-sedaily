import { Suspense } from "react"
import DateQuizClient from "./client-page"
import { getAvailableDates } from "@/lib/games-data"

// 정적 export를 위한 경로 생성
export async function generateStaticParams() {
  const dates = await getAvailableDates("BlackSwan")
  return dates.map((date) => ({
    date: date.replace(/-/g, ''), // 2024-09-17 → 20240917
  }))
}

export default async function DateQuizPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DateQuizClient date={date} />
    </Suspense>
  )
}
